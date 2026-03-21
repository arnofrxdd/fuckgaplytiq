import express from 'express'
import { generateResumeHTML } from '../utils/renderResume'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../services/supabase'
import { authGuard } from '../middlewares/auth'
import { rateLimit } from '../middlewares/rateLimit'
import { parsePdfBuffer, parseDocxBuffer, extractStructuredResume } from '../services/parser'
import { usageService } from '../services/usageService'
import { supabaseStorage } from '../services/supabaseStorage'
import { createScanningStorage } from '../services/scanningStorage'
import { createVirusScanMiddleware } from '../middlewares/virusScan'
import { imageCompressMiddleware } from '../middlewares/imageCompress'
import { careerDnaService } from '../services/careerDnaService'
import OpenAI from 'openai'

const router = express.Router()
// ── GET /api/resumes - List all resumes for the authenticated user ────────────
router.get('/', authGuard, async (req, res) => {
    try {
        const userId = req.user!.id
        const { data: resumes, error } = await supabase
            .from('resumes')
            .select('id, user_id, filename, title, template, style, visibility, download_count, status, started_at, completed_at, updated_at, created_at')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })

        if (error) {
            console.error('List resumes error:', error)
            return res.status(500).json({ error: 'Failed to fetch resumes' })
        }

        return res.json({ success: true, resumes })
    } catch (err) {
        console.error('List resumes error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})


// ── GET /api/resumes/ai-status ────────────────────────────────────────────────
// Lightweight pre-flight check: probe OpenAI quota before user tries Import with AI.
// Uses models.list() — zero tokens consumed, just checks if the API key is healthy.
// Returns 200 { available: true } or 429 { available: false, reason: '...' }
// MUST be placed BEFORE /:id routes so Express doesn't treat 'ai-status' as an ID.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/ai-status', async (req, res) => {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        // Use a real (but minimal) completion — same quota pool as extractStructuredResume
        await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'ok' }],
            max_tokens: 1,
        })
        return res.json({ available: true })
    } catch (err: any) {
        const status = err?.status ?? err?.response?.status ?? 0
        const message = err?.message || String(err)
        const isQuota =
            status === 429 ||
            /quota|rate.?limit|resource.?exhausted|exceeded/i.test(message)
        if (isQuota) {
            return res.status(429).json({
                available: false,
                reason: 'AI quota exceeded. Import with AI is temporarily unavailable.'
            })
        }
        // Any other error (network hiccup etc.) — don't block users
        console.warn('[ai-status] Non-quota probe error:', message)
        return res.json({ available: true })
    }
})


// ── GET /api/resumes/ai-upload-limit ───────────────────────────────────────
// Check how many AI resume uploads the user has left today on the Free plan.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/ai-upload-limit', authGuard, async (req, res) => {
    try {
        const userId = req.user!.id;
        const { data: profileRow } = await supabase.from('profiles').select('plan, ai_upload_count, ai_upload_last_date').eq('id', userId).single();
        const today = new Date().toISOString().split('T')[0];

        const plan = profileRow?.plan || 'Free';
        if (plan !== 'Free') {
            return res.json({ allowed: true, remaining: 999, limit: 999, plan });
        }

        let currentCount = profileRow?.ai_upload_count || 0;
        const lastDate = profileRow?.ai_upload_last_date;
        if (lastDate !== today) currentCount = 0;

        const limit = 2;
        const remaining = Math.max(0, limit - currentCount);

        return res.json({
            allowed: remaining > 0,
            remaining,
            limit,
            plan
        });
    } catch (err: any) {
        console.warn('[ai-upload-limit] check error:', err?.message || err);
        return res.json({ allowed: true, remaining: 2, limit: 2, plan: 'Free' }); // Fallback to allow if error
    }
})

// Virus scanning middleware instance
const virusScanMiddleware = createVirusScanMiddleware()

// Streaming upload to Supabase with virus scanning
// Files are scanned BEFORE being stored in Supabase
const upload = multer({
    storage: supabaseStorage({
        bucket: 'resumes',
        path: (req, file, cb) => {
            // Generate unique path for the file
            const userId = req.user?.id || 'unknown'
            const resumeId = uuidv4()
            const filePath = `${userId}/${resumeId}-${file.originalname}`
                // Store resumeId in request for use in route handler
                ; (req as any)._resumeId = resumeId
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

router.post('/upload', authGuard, rateLimit(50, 60 * 60 * 1000), imageCompressMiddleware, virusScanMiddleware, upload.single('file'), async (req, res) => {
    // Upload route: robust error handling and guaranteed JSON response
    // Files are compressed (if images), scanned for viruses, then stored in Supabase
    try {
        const userId = req.user!.id

        // Check usage limit
        const limitCheck = await usageService.checkLimit(userId, 'resumeBuilds')
        if (!limitCheck.allowed) {
            return res.status(403).json({
                error: 'Plan limit reached',
                message: `You have reached the limit of ${limitCheck.limit} resume builds for your ${limitCheck.plan} plan. Please upgrade to continue.`
            })
        }

        console.log(`Upload started for user ${userId}, file: ${req.file?.originalname}, size: ${req.file?.size}`)

        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

        // resumeId was generated in the storage path function
        const resumeId = (req as any)._resumeId || uuidv4()
        const storagePath = (req.file as any).path || `${userId}/${resumeId}-${req.file.originalname}`

        // Ensure the user has a profiles row (resumes.user_id references profiles.id)
        // Check and enforce AI Upload daily limits for Free plan
        try {
            const { data: profileRow } = await supabase.from('profiles').select('id, plan, ai_upload_count, ai_upload_last_date').eq('id', userId).single()
            const today = new Date().toISOString().split('T')[0];

            if (!profileRow) {
                console.log(`Creating profile record for user ${userId} (upload route)`)
                const { error: createProfileError } = await supabase.from('profiles').insert({
                    id: userId,
                    created_at: new Date(),
                    ai_upload_count: 1,
                    ai_upload_last_date: today
                })
                if (createProfileError) {
                    console.warn('Failed to create profiles row (upload):', createProfileError)
                    // continue and let the insert error bubble if it still fails
                }
            } else {
                const plan = profileRow.plan || 'Free';
                if (plan === 'Free') {
                    let currentCount = profileRow.ai_upload_count || 0;
                    const lastDate = profileRow.ai_upload_last_date;

                    // If it's a new day, reset the count
                    if (lastDate !== today) {
                        currentCount = 0;
                    }

                    if (currentCount >= 2) {
                        return res.status(403).json({
                            error: 'Daily limit reached',
                            message: 'You have reached your daily limit of 2 AI resume uploads on the Free plan. Please try again tomorrow or upgrade your plan.'
                        });
                    }

                    // Increment the count for today
                    await supabase.from('profiles').update({
                        ai_upload_count: currentCount + 1,
                        ai_upload_last_date: today
                    }).eq('id', userId);
                }
            }
        } catch (profileCheckErr) {
            console.warn('Profiles check error (upload route, non-fatal):', (profileCheckErr as any)?.message || profileCheckErr)
        }

        // Insert into resumes table
        const uploadInsertPayload = {
            id: resumeId,
            user_id: userId,
            filename: req.file.originalname,
            storage_path: storagePath,
            visibility: 'private',
            status: 'started',
            started_at: new Date(),
            // Set display title as filename for uploaded files
            title: req.file.originalname
        }

        console.log('Inserting resume (upload) payload:', JSON.stringify({
            id: uploadInsertPayload.id,
            user_id: uploadInsertPayload.user_id,
            filename: uploadInsertPayload.filename,
            storage_path: uploadInsertPayload.storage_path,
            visibility: uploadInsertPayload.visibility
        }))

        const { error: insertError } = await supabase.from('resumes').insert(uploadInsertPayload)

        if (insertError) {
            console.error('Failed to insert resume record:', insertError)
            return res.status(500).json({ error: 'Failed to save resume metadata', details: insertError.message })
        }

        // Insert into ai_jobs table (parse job)
        const jobId = uuidv4()
        const { error: jobError } = await supabase.from('ai_jobs').insert({
            id: jobId,
            user_id: userId,
            type: 'parse_resume',
            input: { resume_id: resumeId },
            status: 'queued'
        })

        if (jobError) {
            console.error('Failed to create AI job:', jobError)
            return res.status(500).json({ error: 'Failed to queue parse job', details: jobError.message })
        }

        console.log(`Upload completed for user ${userId}, resume_id: ${resumeId}, job_id: ${jobId}`)
        console.log(`File streamed to Supabase: ${storagePath} (size: ${(req.file as any).size || 'unknown'} bytes)`)

            // Get file buffer from Supabase for immediate parse (download and parse)
            // Note: We'll download the file we just uploaded to avoid needing to buffer in memory initially
            ; (async () => {
                try {
                    // Mark job as running immediately
                    await supabase.from('ai_jobs').update({ status: 'running', updated_at: new Date() }).eq('id', jobId)

                    const { data: fileData, error: downloadError } = await supabase.storage.from('resumes').download(storagePath)
                    if (downloadError || !fileData) {
                        console.warn('Failed to download file for immediate parse:', downloadError?.message || downloadError)
                        await supabase.from('ai_jobs').update({ status: 'failed', last_error: { message: 'Failed to download file' } }).eq('id', jobId)
                        return
                    }

                    let text = ''
                    const fileBuffer = Buffer.from(await fileData.arrayBuffer())
                    const fileMime = req.file!.mimetype

                    let out: any = null;
                    if (fileMime === 'application/pdf') {
                        out = await parsePdfBuffer(fileBuffer)
                        text = out?.text || ''
                    } else if (fileMime.includes('word') || fileMime.includes('officedocument')) {
                        out = await parseDocxBuffer(fileBuffer)
                        text = out?.text || ''
                    }

                    if (text && text.trim().length > 0) {
                        try {
                            console.log(`🧠 Starting immediate AI parse for resume ${resumeId}...`);
                            const userContext = (req as any).user ? { id: (req as any).user.id, email: (req as any).user.email } : (userId ? { id: userId } : undefined);
                            const { parsed, confidence, isFallback } = await extractStructuredResume(text, out.meta, userContext)
                            
                            // Sanitizer: Remove null bytes (\u0000) which crash PostgreSQL
                            const sanitizeForPostgres = (obj: any): any => {
                                if (typeof obj === 'string') return obj.replace(/\u0000/g, '');
                                if (Array.isArray(obj)) return obj.map(sanitizeForPostgres);
                                if (obj !== null && typeof obj === 'object') {
                                    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitizeForPostgres(v)]));
                                }
                                return obj;
                            };

                            const safeText = text.replace(/\u0000/g, '');
                            const safeParsed = sanitizeForPostgres(parsed);

                            if (isFallback) {
                                console.warn(`⚠️ [AI PARSE] Fallback mode used for ${resumeId} due to parsing failure.`);
                            } else {
                                console.log(`✅ [AI PARSE] Success for ${resumeId} (Confidence: ${confidence})`);
                            }

                            // Update resume with parsed data AND set status to completed
                            const { error: updateError } = await supabase.from('resumes')
                                .update({
                                    parsed_text: safeText,
                                    parsed_json: safeParsed,
                                    status: 'completed',
                                    completed_at: new Date(),
                                    updated_at: new Date()
                                })
                                .eq('id', resumeId)

                            if (updateError) {
                                console.error('❌ Failed to save parsed data to Supabase (resumes):', updateError);
                                await supabase.from('ai_jobs').update({ status: 'failed', last_error: { message: 'Failed to update resumes table' } }).eq('id', jobId)
                            } else {
                                console.log(`💾 Resume ${resumeId} updated with parsed JSON.`);
                                
                                // NEW: Update the associated builder_resumes draft if provided
                                const builderId = req.body.builder_id;
                                const preSelectedName = req.body.pre_selected_name;
                                const preSelectedTemplate = req.body.pre_selected_template;

                                if (builderId) {
                                    console.log(`🔄 Syncing AI result to builder draft: ${builderId}`);
                                    
                                    // Fallback to name extraction if user didn't pre-provide one
                                    let finalTitle = preSelectedName && preSelectedName !== 'Untitled Resume' 
                                        ? preSelectedName 
                                        : (safeParsed.personal?.name ? `${safeParsed.personal.name}'s Resume` : "My Imported Resume");

                                    let updatePayload: any = {
                                        data: safeParsed,
                                        title: finalTitle,
                                        onboarding_metadata: { status: 'completed' },
                                        updated_at: new Date()
                                    };

                                    if (preSelectedTemplate && preSelectedTemplate !== 'null') {
                                        updatePayload.template_id = preSelectedTemplate;
                                    }

                                    await supabase.from('builder_resumes').update(updatePayload).eq('id', builderId);
                                }

                                // Mark job as done
                                await supabase.from('ai_jobs').update({
                                    status: 'done',
                                    result: { immediate_parse: true, confidence },
                                    updated_at: new Date()
                                }).eq('id', jobId)
                            }
                        } catch (aiErr) {
                            console.error('❌ Immediate AI parse failed:', (aiErr as any)?.message || aiErr)
                            await supabase.from('ai_jobs').update({ status: 'failed', last_error: { message: (aiErr as any)?.message } }).eq('id', jobId)
                        }
                    } else {
                        await supabase.from('ai_jobs').update({ status: 'failed', last_error: { message: 'No text extracted from file' } }).eq('id', jobId)
                        await supabase.from('resumes').update({ status: 'failed', updated_at: new Date() }).eq('id', resumeId)
                    }
                } catch (parseErr) {
                    console.warn('Immediate file text extraction failed:', (parseErr as any)?.message || parseErr)
                    await supabase.from('ai_jobs').update({ status: 'failed', last_error: { message: (parseErr as any)?.message } }).eq('id', jobId)
                    await supabase.from('resumes').update({ status: 'failed', updated_at: new Date() }).eq('id', resumeId)
                }
            })()

        return res.json({ success: true, resume_id: resumeId, job_id: jobId })
    } catch (error) {
        console.error('Upload error:', (error as any)?.message || error)
        return res.status(500).json({ error: 'Upload failed', message: (error as any)?.message || 'unknown' })
    }
})

// POST /api/resumes - create a new resume record from editor data (no file upload)
router.post('/', authGuard, rateLimit(20, 60 * 60 * 1000), async (req, res) => {
    try {
        const userId = req.user!.id

        // Check usage limit
        const limitCheck = await usageService.checkLimit(userId, 'resumeBuilds')
        if (!limitCheck.allowed) {
            return res.status(403).json({
                error: 'Plan limit reached',
                message: `You have reached the limit of ${limitCheck.limit} resume builds for your ${limitCheck.plan} plan. Please upgrade to continue.`
            })
        }

        const { parsed_json = {}, template, style, visibility = 'private', filename = null } = req.body

        const resumeId = uuidv4()

        // Ensure the user has a profiles row (resumes.user_id references profiles.id)
        try {
            const { data: profileRow } = await supabase.from('profiles').select('id').eq('id', userId).single()
            if (!profileRow) {
                console.log(`Creating profile record for user ${userId}`)
                const { error: createProfileError } = await supabase.from('profiles').insert({ id: userId, created_at: new Date() })
                if (createProfileError) {
                    console.warn('Failed to create profiles row:', createProfileError)
                    // proceed and rely on insert error to bubble back if still failing
                }
            }
        } catch (profileCheckErr) {
            console.warn('Profiles check error (non-fatal):', (profileCheckErr as any)?.message || profileCheckErr)
        }

        // Insert minimal resume row
        // Ensure filename & storage_path are non-null to satisfy DB schema
        const safeFilename = filename || `editor-${resumeId}.json`
        const safeStoragePath = filename ? `${userId}/${resumeId}-${filename}` : `editor/${userId}/${resumeId}.json`

        const editorTitle = (parsed_json && parsed_json.personal && parsed_json.personal.name) ? parsed_json.personal.name : safeFilename
        const { error: insertError } = await supabase.from('resumes').insert({
            id: resumeId,
            user_id: userId,
            filename: safeFilename,
            storage_path: safeStoragePath,
            parsed_json,
            title: editorTitle,
            template: template || null,
            style: style || null,
            visibility,
            status: parsed_json ? 'completed' : 'started',
            started_at: new Date(),
            completed_at: parsed_json ? new Date() : null
        })

        if (insertError) {
            console.error('Failed to create resume record:', insertError)
            const details = (insertError && (insertError.message || insertError.details)) || JSON.stringify(insertError)
            return res.status(500).json({ error: 'Failed to create resume', details })
        }

        // Save an initial version snapshot for edit history
        try {
            await supabase.from('resume_versions').insert({ resume_id: resumeId, snapshot_json: parsed_json })
        } catch (verErr) {
            // non-fatal
            console.warn('Failed to save initial resume version:', (verErr as any)?.message || verErr)
        }

        return res.json({ success: true, resume_id: resumeId })
    } catch (error) {
        console.error('Create resume error:', (error as any)?.message || error)
        res.status(500).json({ error: 'Failed to create resume' })
    }
})

// GET /api/resumes/:id - return resume data (parsed_json etc). Public read for now.
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { data: resume, error } = await supabase
            .from('resumes')
            .select('id, user_id, filename, parsed_json, template, style, visibility, download_count, status, started_at, completed_at')
            .eq('id', id)
            .single()

        if (error || !resume) return res.status(404).json({ success: false, error: 'Resume not found' })

        // Return resume row including parsed_json for backward compatibility
        return res.json({ success: true, ...resume })
    } catch (err) {
        console.error('Get resume error', err)
        res.status(500).json({ error: 'Failed to fetch resume' })
    }
})

// GET /api/resumes/:id/preview-html - return rendered HTML for preview/export parity
router.get('/:id/preview-html', async (req, res) => {
    try {
        const { id } = req.params
        const { data: resume, error } = await supabase
            .from('resumes')
            .select('id, parsed_json, style, template')
            .eq('id', id)
            .single()

        if (error || !resume) return res.status(404).json({ error: 'Resume not found' })

        // Inline any candidate photo into parsed JSON so server-rendered preview
        // and exports will show the image even if it's stored in Supabase storage
        const parsed = resume.parsed_json || {}
        const style = resume.style || {}

        async function ensurePhotoInlined(p: any) {
            try {
                const candidate = p.photo || p.personal?.photo || p.personal?.photo_url || p.photo_url || p.personal?.image || null
                if (!candidate) return
                if (String(candidate).startsWith('data:')) return
                let photoUrl = String(candidate)
                if (!/^https?:\/\//i.test(photoUrl)) {
                    try {
                        const { data: signed } = await supabase.storage.from('resumes').createSignedUrl(photoUrl, 60)
                        if (signed && signed.signedUrl) photoUrl = signed.signedUrl
                    } catch (e) {
                        console.warn('Could not create signed URL for preview photo', photoUrl, e)
                    }
                }
                try {
                    const resp = await fetch(photoUrl)
                    if (!resp.ok) throw new Error('Failed to fetch photo: ' + resp.status)
                    const buf = Buffer.from(await resp.arrayBuffer())
                    const contentType = resp.headers.get('content-type') || 'image/jpeg'
                    const dataUrl = `data:${contentType};base64,${buf.toString('base64')}`
                    p.photo = dataUrl
                    if (!p.personal) p.personal = {}
                    p.personal.photo = dataUrl
                } catch (e) {
                    console.warn('Failed to fetch/inline photo for preview:', e)
                }
            } catch (err) {
                console.warn('ensurePhotoInlined(preview) error', err)
            }
        }

        await ensurePhotoInlined(parsed)

        const html = generateResumeHTML(parsed, style, resume.template)
        res.setHeader('Content-Type', 'text/html')
        res.send(html)
    } catch (err) {
        console.error('Preview HTML error', err)
        res.status(500).json({ error: 'Failed to generate preview HTML' })
    }
})

router.patch('/:id/template', authGuard, async (req, res) => {
    try {
        const { id } = req.params
        const { templateId } = req.body

        if (!templateId) {
            return res.status(400).json({ error: 'Template ID is required' })
        }

        // Verify the resume belongs to the user
        const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('id, user_id')
            .eq('id', id)
            .single()

        if (resumeError || !resume) {
            return res.status(404).json({ error: 'Resume not found' })
        }

        if (resume.user_id !== req.user!.id) {
            return res.status(403).json({ error: 'Unauthorized' })
        }

        // Update the template
        const { error: updateError } = await supabase
            .from('resumes')
            .update({
                template: templateId,
                updated_at: new Date()
            })
            .eq('id', id)

        if (updateError) {
            throw updateError
        }

        res.json({ success: true, template: templateId })
    } catch (error) {
        console.error('Template update error:', error)
        res.status(500).json({ error: 'Failed to update template' })
    }
})

// Partial resume update (autosave)
router.patch('/:id', authGuard, async (req, res) => {
    try {
        const { id } = req.params
        const { partial, title } = req.body

        if (!partial || typeof partial !== 'object') {
            return res.status(400).json({ error: 'Partial update is required' })
        }

        // fetch existing
        const { data: existing, error: fetchError } = await supabase
            .from('resumes')
            .select('id, user_id, parsed_json')
            .eq('id', id)
            .single()

        if (fetchError || !existing) return res.status(404).json({ error: 'Resume not found' })
        if (existing.user_id !== req.user!.id) return res.status(403).json({ error: 'Unauthorized' })

        const merged = { ...(existing.parsed_json || {}), ...(partial || {}) }

        const updatePayload: any = { parsed_json: merged, updated_at: new Date() }
        if (title && typeof title === 'string') updatePayload.title = title

        // update resume
        const { error: updateError } = await supabase
            .from('resumes')
            .update(updatePayload)
            .eq('id', id)

        if (updateError) throw updateError

        // insert version snapshot - REMOVED for performance (autosave shouldn't create versions)
        // await supabase.from('resume_versions').insert({ resume_id: id, snapshot_json: merged })

        res.json({ success: true })
    } catch (error) {
        console.error('Partial update error:', error)
        res.status(500).json({ error: 'Failed to apply partial update' })
    }
})

// Style update for customization
router.patch('/:id/style', authGuard, async (req, res) => {
    try {
        const { id } = req.params
        const { style, presetName } = req.body

        if (!style || typeof style !== 'object') {
            return res.status(400).json({ error: 'Style object is required' })
        }

        // Validate style inputs to prevent CSS injection
        const allowedKeys = ['primaryColor', 'accentColor', 'textColor', 'fontFamily', 'layoutDensity', 'margins', 'sectionOrder', 'sectionVisibility']
        const validatedStyle: any = {}
        for (const key of allowedKeys) {
            if (style[key] !== undefined) {
                if (key === 'primaryColor' || key === 'accentColor' || key === 'textColor') {
                    if (!/^#[0-9a-fA-F]{6}$/.test(style[key])) {
                        return res.status(400).json({ error: `Invalid color format for ${key}` })
                    }
                    validatedStyle[key] = style[key]
                } else if (key === 'fontFamily') {
                    const allowedFonts = ['Inter, sans-serif', 'Arial, sans-serif', 'Georgia, serif', 'Times New Roman, serif', 'Poppins, sans-serif', 'JetBrains Mono, monospace']
                    if (!allowedFonts.includes(style[key])) {
                        return res.status(400).json({ error: `Invalid font family: ${style[key]}` })
                    }
                    validatedStyle[key] = style[key]
                } else if (key === 'layoutDensity') {
                    if (!['compact', 'normal', 'spacious'].includes(style[key])) {
                        return res.status(400).json({ error: `Invalid layout density: ${style[key]}` })
                    }
                    validatedStyle[key] = style[key]
                } else if (key === 'margins') {
                    const margin = parseInt(style[key])
                    if (isNaN(margin) || margin < 0 || margin > 40) {
                        return res.status(400).json({ error: 'Margins must be between 0 and 40' })
                    }
                    validatedStyle[key] = margin
                } else if (key === 'sectionOrder' || key === 'sectionVisibility') {
                    if (!Array.isArray(style[key])) {
                        return res.status(400).json({ error: `${key} must be an array` })
                    }
                    validatedStyle[key] = style[key]
                }
            }
        }

        // Verify the resume belongs to the user
        const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('id, user_id')
            .eq('id', id)
            .single()

        if (resumeError || !resume) {
            return res.status(404).json({ error: 'Resume not found' })
        }

        if (resume.user_id !== req.user!.id) {
            return res.status(403).json({ error: 'Unauthorized' })
        }

        // Update the style in resumes table
        const { error: updateError } = await supabase
            .from('resumes')
            .update({
                style: validatedStyle,
                updated_at: new Date()
            })
            .eq('id', id)

        if (updateError) {
            throw updateError
        }

        // If presetName provided, save as user preset
        if (presetName) {
            await supabase.from('resume_styles').insert({
                resume_id: id,
                user_id: req.user!.id,
                style: validatedStyle,
                preset_name: presetName,
                is_preset: false
            })
        }

        res.json({ success: true, style: validatedStyle })
    } catch (error) {
        console.error('Style update error:', error)
        res.status(500).json({ error: 'Failed to update style' })
    }
})

// POST /api/resumes/:id/export - Export resume to PDF or DOCX
// Export calls can be heavier but still should be limited to prevent abuse.
// Make the export limit configurable via EXPORT_RATE_LIMIT (per user per window).
const EXPORT_RATE_LIMIT = Number(process.env.EXPORT_RATE_LIMIT || '20')
router.post('/:id/export', authGuard, rateLimit(EXPORT_RATE_LIMIT, 60 * 60 * 1000), async (req, res) => {
    try {
        const { id } = req.params
        const { format = 'pdf', paperSize = 'a4' } = req.query
        const userId = req.user!.id

        // Check usage limit
        const limitCheck = await usageService.checkLimit(userId, 'downloads')
        if (!limitCheck.allowed) {
            return res.status(403).json({
                error: 'Plan limit reached',
                message: `You have reached the limit of ${limitCheck.limit} downloads for your ${limitCheck.plan} plan. Please upgrade to continue.`
            })
        }

        // Verify resume ownership
        const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('id, parsed_json, template, style')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (resumeError || !resume) {
            return res.status(404).json({ error: 'Resume not found' })
        }

        // Create AI job for export processing
        const jobId = uuidv4()
        const { error: jobError } = await supabase
            .from('ai_jobs')
            .insert({
                id: jobId,
                user_id: userId,
                type: 'export_resume',
                input: {
                    resume_id: id,
                    format,
                    paper_size: paperSize,
                    template: resume.template,
                    style: resume.style
                }
            })

        if (jobError) {
            console.error('Export job creation error:', jobError)
            return res.status(500).json({ error: 'Failed to queue export job' })
        }

        res.json({
            job_id: jobId,
            message: 'Export job queued. Check status with GET /api/jobs/' + jobId
        })
    } catch (error) {
        console.error('Export error:', error)
        res.status(500).json({ error: 'Failed to start export', details: (error as any)?.message || String(error) })
    }
})

// POST /api/resumes/:id/ai-review - Request AI review of resume
router.post('/:id/ai-review', authGuard, rateLimit(3, 60 * 60 * 1000), async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user!.id

        // Check usage limit
        const limitCheck = await usageService.checkLimit(userId, 'aiSuggestions')
        if (!limitCheck.allowed) {
            return res.status(403).json({
                error: 'Plan limit reached',
                message: `You have reached the limit of ${limitCheck.limit} AI suggestions for your ${limitCheck.plan} plan. Please upgrade to continue.`
            })
        }

        // Verify resume ownership
        const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('id, parsed_text, parsed_json')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (resumeError || !resume) {
            return res.status(404).json({ error: 'Resume not found' })
        }

        // Create AI job for review
        const jobId = uuidv4()
        const { error: jobError } = await supabase
            .from('ai_jobs')
            .insert({
                id: jobId,
                user_id: userId,
                type: 'review_resume',
                input: {
                    resume_id: id,
                    parsed_text: resume.parsed_text,
                    parsed_json: resume.parsed_json
                }
            })

        if (jobError) {
            console.error('AI review job creation error:', jobError)
            return res.status(500).json({ error: 'Failed to queue AI review job' })
        }

        res.json({
            job_id: jobId,
            message: 'AI review job queued. Check status with GET /api/jobs/' + jobId
        })
    } catch (error) {
        console.error('AI review error:', error)
        res.status(500).json({ error: 'Failed to start AI review' })
    }
})

// POST /api/resumes/:id/share - Create shareable link
router.post('/:id/share', authGuard, async (req, res) => {
    try {
        const { id } = req.params
        const { expiresInHours = 168, password } = req.body // Default 7 days
        const userId = req.user!.id

        // Verify resume ownership
        const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (resumeError || !resume) {
            return res.status(404).json({ error: 'Resume not found' })
        }

        // Generate unique token
        const token = uuidv4().substring(0, 8)
        const expiresAt = expiresInHours ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000) : null

        // Hash password if provided
        let passwordHash = null
        if (password) {
            const bcrypt = require('bcrypt')
            passwordHash = await bcrypt.hash(password, 10)
        }

        // Create share record
        const { data: share, error: shareError } = await supabase
            .from('resume_shares')
            .insert({
                resume_id: id,
                user_id: userId,
                token,
                expires_at: expiresAt,
                password_hash: passwordHash
            })
            .select()
            .single()

        if (shareError) {
            console.error('Share creation error:', shareError)
            return res.status(500).json({ error: 'Failed to create share link' })
        }

        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${token}`

        res.json({
            share_id: share.id,
            share_url: shareUrl,
            token,
            expires_at: expiresAt
        })
    } catch (error) {
        console.error('Share error:', error)
        res.status(500).json({ error: 'Failed to create share link' })
    }
})

// POST /api/resumes/:id/increment-download - Increment download counter
router.post('/:id/increment-download', authGuard, async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user!.id

        // Verify resume ownership
        const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('id, download_count')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (resumeError || !resume) {
            return res.status(404).json({ error: 'Resume not found' })
        }

        // Increment download count
        const { data: updated, error: updateError } = await supabase
            .from('resumes')
            .update({ download_count: (resume.download_count || 0) + 1 })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single()

        if (updateError) {
            console.error('Download count update error:', updateError)
            return res.status(500).json({ error: 'Failed to update download count' })
        }

        res.json({
            success: true,
            download_count: updated.download_count
        })
    } catch (error) {
        console.error('Download increment error:', error)
        res.status(500).json({ error: 'Failed to increment download count' })
    }
})

// POST /api/resumes/:id/restore - Restore from version
router.post('/:id/restore', authGuard, async (req, res) => {
    try {
        const { id } = req.params
        const { versionId } = req.body
        const userId = req.user!.id

        // Verify resume ownership
        const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (resumeError || !resume) {
            return res.status(404).json({ error: 'Resume not found' })
        }

        // Get version data
        const { data: version, error: versionError } = await supabase
            .from('resume_versions')
            .select('snapshot_json')
            .eq('id', versionId)
            .eq('resume_id', id)
            .single()

        if (versionError || !version) {
            return res.status(404).json({ error: 'Version not found' })
        }

        // Update resume with version data
        const { error: updateError } = await supabase
            .from('resumes')
            .update({
                parsed_json: version.snapshot_json,
                updated_at: new Date()
            })
            .eq('id', id)

        if (updateError) {
            console.error('Restore error:', updateError)
            return res.status(500).json({ error: 'Failed to restore version' })
        }

        res.json({ success: true, message: 'Resume restored from version' })
    } catch (error) {
        console.error('Restore error:', error)
        res.status(500).json({ error: 'Failed to restore version' })
    }
})

// POST /api/resumes/:id/save-version - Save current state as version
router.post('/:id/save-version', authGuard, async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user!.id

        // Get current resume data
        const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('parsed_json')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (resumeError || !resume) {
            return res.status(404).json({ error: 'Resume not found' })
        }

        // Save version
        const { data: version, error: versionError } = await supabase
            .from('resume_versions')
            .insert({
                resume_id: id,
                snapshot_json: resume.parsed_json
            })
            .select()
            .single()

        if (versionError) {
            console.error('Version save error:', versionError)
            return res.status(500).json({ error: 'Failed to save version' })
        }

        res.json({
            version_id: version.id,
            message: 'Version saved successfully'
        })
    } catch (error) {
        console.error('Version save error:', error)
        res.status(500).json({ error: 'Failed to save version' })
    }
})

// DELETE /api/resumes/:id - Delete a resume
router.delete('/:id', authGuard, async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user!.id

        // Verify ownership and get storage path
        const { data: resume, error: fetchError } = await supabase
            .from('resumes')
            .select('id, user_id, storage_path')
            .eq('id', id)
            .single()

        if (fetchError || !resume) return res.status(404).json({ error: 'Resume not found' })
        if (resume.user_id !== userId) return res.status(403).json({ error: 'Unauthorized' })

        // Delete from storage if it exists
        if (resume.storage_path) {
            try {
                await supabase.storage.from('resumes').remove([resume.storage_path])
            } catch (storageErr) {
                console.warn('Failed to delete file from storage:', storageErr)
                // non-fatal, continue with DB deletion
            }
        }

        // Delete from database (versions and shares will likely be deleted via cascade if set up, 
        // but let's be safe if not)
        await supabase.from('resume_versions').delete().eq('resume_id', id)
        await supabase.from('resume_shares').delete().eq('resume_id', id)
        
        const { error: deleteError } = await supabase
            .from('resumes')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError

        res.json({ success: true, message: 'Resume deleted successfully' })
    } catch (error) {
        console.error('Delete resume error:', error)
        res.status(500).json({ error: 'Failed to delete resume' })
    }
})

export default router


// Debug route: GET /api/resumes/debug/count (authenticated) — returns count and sample rows
router.get('/debug/count', authGuard, async (req, res) => {
    try {
        const uid = req.user!.id
        const { data, error, count } = await supabase.from('resumes').select('id, user_id, filename, parsed_json IS NOT NULL as has_parsed, download_count, status, started_at, completed_at, created_at', { count: 'exact' }).eq('user_id', uid).order('created_at', { ascending: false }).limit(20)
        if (error) return res.status(500).json({ error: 'Failed to query resumes', details: error })
        return res.json({ count: typeof count === 'number' ? count : (data ?? []).length, rows: data ?? [] })
    } catch (err) {
        console.error('Debug count error:', err)
        return res.status(500).json({ error: 'Debug failed' })
    }
})