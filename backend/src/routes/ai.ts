import express from 'express'
import multer from 'multer'
import { generateVariants, parseResumeText, improveExperience, generateSummary, suggestSkills, matchToJobDescription, scoreResume, optimizeForExport, getHeaderIntelligence, getTopicSummary } from '../services/aiClient'
import { parsePdfBuffer, parseDocxBuffer, extractStructuredResume } from '../services/parser'
import { supabase } from '../services/supabase'
import { authGuard } from '../middlewares/auth'
import { rateLimit } from '../middlewares/rateLimit'
import { supabaseStorage } from '../services/supabaseStorage'
import { createVirusScanMiddleware } from '../middlewares/virusScan'
import { imageCompressMiddleware } from '../middlewares/imageCompress'

const router = express.Router()

// Virus scanning middleware
const virusScanMiddleware = createVirusScanMiddleware()

// Streaming upload to Supabase for parse endpoint - with virus scanning
// Files are scanned BEFORE being stored in Supabase
const uploadStream = multer({
    storage: supabaseStorage({
        bucket: 'resumes',
        path: (req, file, cb) => {
            // Generate temporary path for parsing (not tied to a specific user)
            const tempId = Date.now().toString()
            const filePath = `temp/${tempId}-${file.originalname}`
                ; (req as any)._tempFilePath = filePath
            cb(null, filePath)
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ]
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Invalid file type. Only PDF, DOCX, and DOC files are allowed.'))
        }
    }
})

// AI generate endpoint: supports rewrite_bullet and generate_summary
router.post('/generate', authGuard, rateLimit(20, 60 * 60 * 1000), async (req, res) => {
    try {
        console.log('AI Generate Request:', JSON.stringify(req.body).substring(0, 200))
        const { type, input, resume_id } = req.body
        if (!type) return res.status(400).json({ error: 'type is required' })

        const userId = req.user!.id

        // create ai_job entry (running)
        const { data: jobData, error: jobErr } = await supabase.from('ai_jobs').insert({
            user_id: userId,
            type,
            input,
            status: 'running'
        }).select().single()

        if (jobErr) console.warn('Failed to create ai_job:', jobErr)

        const choices = await generateVariants(type, input, { id: userId, email: req.user!.email })

        // update job with result
        if (jobData) {
            await supabase.from('ai_jobs').update({ status: 'done', result: { choices } }).eq('id', jobData.id)
        }

        res.json({ choices })
    } catch (error: any) {
        console.error('AI generation failed', error)
        res.status(500).json({ error: 'AI generation failed', details: error?.message || 'Unknown error' })
    }
})

// Parse resume from uploaded file (one-off parser endpoint)
// Files are compressed (if images), scanned for viruses, then stored in Supabase
router.post('/parseResume', rateLimit(5, 60 * 60 * 1000), imageCompressMiddleware, virusScanMiddleware, uploadStream.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

        // File was streamed to Supabase, now download it for parsing
        const tempFilePath = (req as any)._tempFilePath || (req.file as any).path
        console.log(`Parsing file uploaded to: ${tempFilePath}`)

        const { data: fileData, error: downloadError } = await supabase.storage.from('resumes').download(tempFilePath)
        if (downloadError || !fileData) {
            console.error('Failed to download file for parsing:', downloadError?.message || downloadError)
            return res.status(500).json({ error: 'Failed to retrieve uploaded file' })
        }

        let text = ''
        const fileBuffer = Buffer.from(await fileData.arrayBuffer())
        const fileMime = req.file.mimetype

        if (fileMime === 'application/pdf') {
            const out = await parsePdfBuffer(fileBuffer)
            text = out.text
        } else if (fileMime.includes('word')) {
            const out = await parseDocxBuffer(fileBuffer)
            text = out.text
        }

        if (!text || !text.trim()) {
            // Clean up temp file
            try {
                await supabase.storage.from('resumes').remove([tempFilePath])
            } catch (e) {
                console.warn('Failed to cleanup temp file:', e)
            }
            return res.status(400).json({ error: 'Could not extract text from file' })
        }

        const { parsed: parsedData, confidence } = await extractStructuredResume(text, null, req.user ? { id: req.user.id, email: req.user.email } : undefined)

        // Clean up temp file after parsing
        try {
            await supabase.storage.from('resumes').remove([tempFilePath])
            console.log(`Cleaned up temp file: ${tempFilePath}`)
        } catch (e) {
            console.warn('Failed to cleanup temp file (non-fatal):', e)
        }

        res.json({ parsed: parsedData, confidence, extractedText: (text || '').substring(0, 500) + '...' })
    } catch (error) {
        console.error('Resume parsing failed', error)
        res.status(500).json({ error: 'Failed to parse resume' })
    }
})

// New enhancement endpoints
router.post('/enhance-summary', authGuard, rateLimit(20, 60 * 60 * 1000), async (req, res) => {
    try {
        const { resumeText, targetRole } = req.body
        if (!resumeText) return res.status(400).json({ error: 'resumeText is required' })
        const summaries = await generateSummary(resumeText, targetRole, { id: req.user!.id, email: req.user!.email }) 
        res.json({ summaries })
    } catch (err) {
        console.error('enhance-summary failed', err)
        res.status(500).json({ error: 'Failed to enhance summary' })
    }
})

router.post('/enhance-experience', authGuard, rateLimit(30, 60 * 60 * 1000), async (req, res) => {
    try {
        const { bullets, role, company } = req.body
        if (!bullets || !Array.isArray(bullets)) return res.status(400).json({ error: 'bullets array required' })
        const improved = await improveExperience(bullets, role || '', company || '') // improveExperience doesn't log yet, but good to have
        res.json({ improved })
    } catch (err) {
        console.error('enhance-experience failed', err)
        res.status(500).json({ error: 'Failed to enhance experience' })
    }
})

router.post('/rewrite-bullets', authGuard, rateLimit(40, 60 * 60 * 1000), async (req, res) => {
    try {
        const { bullet, role, company } = req.body
        if (!bullet) return res.status(400).json({ error: 'bullet is required' })
        const variants = await generateVariants('rewrite_bullet', { bullet, role, company }, { id: req.user!.id, email: req.user!.email })
        res.json({ variants })
    } catch (err) {
        console.error('rewrite-bullets failed', err)
        res.status(500).json({ error: 'Failed to rewrite bullets' })
    }
})

router.post('/suggest-skills', authGuard, rateLimit(20, 60 * 60 * 1000), async (req, res) => {
    try {
        const { resumeText, industry } = req.body
        if (!resumeText) return res.status(400).json({ error: 'resumeText is required' })
        const skills = await suggestSkills(resumeText, industry)
        res.json({ skills })
    } catch (err) {
        console.error('suggest-skills failed', err)
        res.status(500).json({ error: 'Failed to suggest skills' })
    }
})

router.post('/job-match', authGuard, rateLimit(10, 60 * 60 * 1000), async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body
        if (!resumeData || !jobDescription) return res.status(400).json({ error: 'resumeData and jobDescription required' })
        const result = await matchToJobDescription(resumeData, jobDescription)
        res.json(result)
    } catch (err) {
        console.error('job-match failed', err)
        res.status(500).json({ error: 'Failed to match job description' })
    }
})

// Improve experience bullet points
router.post('/improveExperience', authGuard, rateLimit(30, 60 * 60 * 1000), async (req, res) => {
    try {
        const { bullets, role, company } = req.body
        if (!bullets || !Array.isArray(bullets)) {
            return res.status(400).json({ error: 'bullets array is required' })
        }

        const improved = await improveExperience(bullets, role || '', company || '')
        res.json({ improved })
    } catch (error) {
        console.error('Experience improvement failed', error)
        res.status(500).json({ error: 'Failed to improve experience' })
    }
})

// Generate professional summary
router.post('/generateSummary', authGuard, rateLimit(10, 60 * 60 * 1000), async (req, res) => {
    try {
        const { resumeText, targetRole } = req.body
        if (!resumeText) {
            return res.status(400).json({ error: 'resumeText is required' })
        }

        const summaries = await generateSummary(resumeText, targetRole, { id: req.user!.id, email: req.user!.email })
        res.json({ summaries })
    } catch (error) {
        console.error('Summary generation failed', error)
        res.status(500).json({ error: 'Failed to generate summary' })
    }
})

// Suggest skills
router.post('/suggestSkills', authGuard, rateLimit(10, 60 * 60 * 1000), async (req, res) => {
    try {
        const { resumeText, industry } = req.body
        if (!resumeText) {
            return res.status(400).json({ error: 'resumeText is required' })
        }

        const skills = await suggestSkills(resumeText, industry)
        res.json({ skills })
    } catch (error) {
        console.error('Skills suggestion failed', error)
        res.status(500).json({ error: 'Failed to suggest skills' })
    }
})

// Match to job description
router.post('/matchJD', authGuard, rateLimit(5, 60 * 60 * 1000), async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body
        if (!resumeData || !jobDescription) {
            return res.status(400).json({ error: 'resumeData and jobDescription are required' })
        }

        const result = await matchToJobDescription(resumeData, jobDescription)
        res.json(result)
    } catch (error) {
        console.error('JD matching failed', error)
        res.status(500).json({ error: 'Failed to match job description' })
    }
})

// Score resume
// In development, allow a much higher rate limit to avoid 429s during testing
const scoreRateLimit = rateLimit(10000, 60 * 60 * 1000)

router.post('/score', authGuard, scoreRateLimit, async (req, res) => {
    try {
        const { resumeData } = req.body
        if (!resumeData) {
            return res.status(400).json({ error: 'resumeData is required' })
        }

        const dataSize = JSON.stringify(resumeData).length
        console.log(`🔍 Starting resume scoring endpoint... Data size: ${dataSize} chars`)

        const scores = await scoreResume(resumeData)
        console.log('✅ Resume scoring endpoint completed')
        res.json(scores)
    } catch (error: any) {
        console.error('❌ Resume scoring failed', error?.message || error)
        console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            type: error?.type,
            status: error?.status
        })
        res.status(500).json({
            error: 'Failed to score resume',
            details: process.env.NODE_ENV === 'development' ? error?.message : undefined
        })
    }
})

// Optimize for export
router.post('/optimizeExport', authGuard, rateLimit(5, 60 * 60 * 1000), async (req, res) => {
    try {
        const { resumeData } = req.body
        if (!resumeData) {
            return res.status(400).json({ error: 'resumeData is required' })
        }

        const optimized = await optimizeForExport(resumeData)
        res.json({ optimized })
    } catch (error) {
        console.error('Export optimization failed', error)
        res.status(500).json({ error: 'Failed to optimize for export' })
    }
})

// Header Intelligence
router.post(['/header-intelligence', '/header-intelligence/'], rateLimit(50, 60 * 60 * 1000), async (req: any, res: any) => {
    try {
        const { type, value, context } = req.body;
        console.log(`🧠 [AI] Header Intelligence Request: type=${type}, value=${typeof value === 'string' ? value.slice(0, 50) : 'complex'}`);
        
        if (!type || value === undefined) {
            return res.status(400).json({ error: 'type and value are required' });
        }

        const user = (req as any).user ? { id: (req as any).user.id, email: (req as any).user.email } : undefined;
        const result = await getHeaderIntelligence(type, value, context, user);
        res.json({ result });
    } catch (error: any) {
        console.error('❌ [AI] Header Intelligence Critical Failure:', error);
        res.status(500).json({ 
            error: 'Failed to process intelligence', 
            details: error?.message || String(error),
            stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
        });
    }
});

// Topic Summary
router.post('/topic-summary', rateLimit(20, 60 * 60 * 1000), async (req: any, res: any) => {
    try {
        const { topic, context } = req.body;
        if (!topic) return res.status(400).json({ error: 'topic is required' });
        const user = (req as any).user ? { id: (req as any).user.id, email: (req as any).user.email } : undefined;
        const summary = await getTopicSummary(topic, context, user);
        res.json({ summary });
    } catch (err: any) {
        console.error('topic-summary failed', err);
        res.status(500).json({ error: 'Failed to generate summary', details: err?.message || 'Unknown error' });
    }
});

export default router