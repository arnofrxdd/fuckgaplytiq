import { Request, Response } from 'express';
// --- LEGACY ENGINES (Preserved for reference) ---
// import { PuppeteerService } from '../services/PuppeteerService';
// import { PdfEngineV2 } from '../services/PdfEngineV2';

// --- ACTIVE ENGINE ---
import { PdfEngineV3 } from '../services/PdfEngineV3';

export const generatePdf = async (req: Request, res: Response) => {
    try {
        let { html, options, score } = req.body;
        
        const mode = options?.height ? 'SEAMLESS' : 'PAGED';
        console.log(`[PdfEngineV3] Init: mode=${mode}, html_len=${html?.length}, score=${score}`);

        if (!html) {
            return res.status(400).json({ error: 'HTML content is required' });
        }

        // --- STEALTH WATERMARK LOGIC (Preserved from original) ---
        if (score !== undefined) {
            const bakedScore = parseInt(score);
            if (!isNaN(bakedScore)) {
                const secret = 0x7A;
                const encrypted = (bakedScore ^ secret).toString(16).toUpperCase().padStart(2, '0');
                const salt = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
                const watermark = `REF-${salt}-${encrypted}-B0`;

                if (html.includes('<head>')) {
                    html = html.replace(/<title>.*?<\/title>/gi, '');
                    html = html.replace('<head>', '<head><title>Resume</title>');
                }

                // Call the new V3 Engine
                let pdfBuffer = await PdfEngineV3.generatePdf(html, options);

                // --- STEALTH METADATA INJECTION & LAST PAGE PRUNER ---
                try {
                    const { PDFDocument } = require('pdf-lib');
                    const pdfDoc = await PDFDocument.load(pdfBuffer);
                    
                    // 1. Metadata Injection
                    pdfDoc.setTitle('Resume');
                    pdfDoc.setAuthor(watermark);
                    pdfDoc.setKeywords([watermark, 'Gaplytiq-Verified']);
                    pdfDoc.setSubject(watermark);
                    pdfDoc.setProducer('Gaplytiq V3 Engine');

                    // 2. NUCLEAR OPTION: Remove the trailing extra page
                    const pageCount = pdfDoc.getPageCount();
                    if (pageCount > 1) {
                        console.log(`[PDF-CONTROLLER] NUCLEAR OPTION: Removing trailing page (Count: ${pageCount} -> ${pageCount - 1})`);
                        pdfDoc.removePage(pageCount - 1);
                    }

                    const modifiedPdfBytes = await pdfDoc.save();
                    pdfBuffer = Buffer.from(modifiedPdfBytes);
                    console.log(`✅ [STEALTH] Deep Metadata Injected & Tail Pruned: ${watermark}`);
                } catch (metaError) {
                    console.error('❌ PDF modification error:', metaError);
                }

                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Length': pdfBuffer.length,
                    'Content-Disposition': 'attachment; filename="resume.pdf"',
                });
                return res.send(pdfBuffer);
            }
        }

        // Default path without score
        const pdfBuffer = await PdfEngineV3.generatePdf(html, options);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': 'attachment; filename="resume.pdf"',
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};
