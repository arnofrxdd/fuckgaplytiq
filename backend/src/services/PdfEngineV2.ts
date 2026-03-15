import puppeteer from 'puppeteer';

/**
 * PdfEngineV2 — Clean, production-ready PDF engine.
 *
 * Two completely separate rendering paths:
 *  - PAGED:    format: A4, multi-page, strips inter-page margin, last page collapses if empty
 *  - SEAMLESS: custom height matching content exactly, no page breaks, no DOM manipulation
 *
 * PuppeteerService.ts is preserved untouched as reference / fallback.
 */
export class PdfEngineV2 {

    // ── Browser Launch ──────────────────────────────────────────────────────────
    private static async launchBrowser(): Promise<any> {
        let executablePath: string | undefined = process.env.PUPPETEER_EXECUTABLE_PATH;

        if (!executablePath && process.platform === 'linux') {
            const fs = require('fs');
            const candidates = [
                '/usr/bin/google-chrome',
                '/usr/bin/google-chrome-stable',
                '/usr/bin/chromium',
                '/usr/bin/chromium-browser',
                '/usr/lib/chromium/chromium',
            ];
            for (const p of candidates) {
                if (fs.existsSync(p)) { executablePath = p; break; }
            }
        }

        return puppeteer.launch({
            headless: true,
            executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--font-render-hinting=none',
            ],
        });
    }

    // ── Public Entry Point ──────────────────────────────────────────────────────
    public static async generatePdf(
        htmlContent: string,
        options: { format?: string; height?: string } = {}
    ): Promise<Buffer> {
        // Determine mode:
        //   options.height = 'auto'  →  seamless / full mode  (no page breaks)
        //   no height                →  paged mode            (multi-page A4)
        const isSeamless = !!options.height;

        const browser = await this.launchBrowser();
        try {
            const page = await browser.newPage();

            // Tall enough viewport for up to 5 A4 pages so content is never clipped
            await page.setViewport({ width: 794, height: 5615 });

            await page.setContent(htmlContent, { waitUntil: 'networkidle2', timeout: 45000 });
            await page.evaluateHandle('document.fonts.ready');

            if (isSeamless) {
                return await this.renderSeamless(page);
            } else {
                return await this.renderPaged(page);
            }
        } finally {
            await browser.close();
        }
    }

    // ── PAGED MODE ──────────────────────────────────────────────────────────────
    // Multi-page A4 PDF.  Each "page div" (height: 297mm) becomes one PDF page.
    // Fixes applied via JS (overrides all CSS safely):
    //   1. Force overflow: visible on html/body so all pages are reachable
    //   2. Strip preview-only inter-page margins / box-shadows from page divs
    //   3. Smart empty-last-page detection: hide the last page only if it contains
    //      no meaningful text content (truly blank page from pagination). If it has
    //      content (e.g. Languages, Interests), leave height: 297mm INTACT so sidebar
    //      backgrounds still fill the full page height correctly.
    private static async renderPaged(page: any): Promise<Buffer> {
        await page.evaluate(() => {
            const doc = (globalThis as any).document;

            // 1. Overflow + sizing on root elements
            doc.documentElement.style.setProperty('overflow', 'visible', 'important');
            doc.documentElement.style.setProperty('height', 'auto', 'important');
            doc.body.style.setProperty('overflow', 'visible', 'important');
            doc.body.style.setProperty('height', 'auto', 'important');
            doc.body.style.setProperty('margin', '0', 'important');
            doc.body.style.setProperty('padding', '0', 'important');

            // 2. Resume provider
            const provider = doc.querySelector('.resume-theme-provider');
            if (provider) {
                provider.style.setProperty('overflow', 'visible', 'important');
                provider.style.setProperty('height', 'auto', 'important');
                provider.style.setProperty('display', 'block', 'important');
            }

            // 3. Strip preview-only inter-page chrome from ALL 297mm divs
            doc.querySelectorAll('.resume-theme-provider div[style]').forEach((div: any) => {
                if ((div.getAttribute('style') || '').includes('297mm')) {
                    div.style.setProperty('margin', '0', 'important');
                    div.style.setProperty('box-shadow', 'none', 'important');
                }
            });

            // 4. Smart empty last-page detection.
            //
            //    WHY NOT height:auto?
            //    Setting height:auto on the last page breaks sidebar templates —
            //    sidebars (dark backgrounds) rely on the parent being height:297mm
            //    to fill the full page. With height:auto, the sidebar shrinks to
            //    just the content height, leaving a bare white gap below.
            //
            //    WHAT WE DO INSTEAD:
            //    Count the meaningful text characters inside the last page.
            //    - Truly empty page (just a "Page N" label, maybe ~10 chars) → hide with display:none
            //    - Page with real sections (Languages, Interests, etc.)       → leave height:297mm intact
            //
            //    Threshold: 40 characters. A "Page 3" label is ~6 chars. Any real content
            //    (even a single skill or a language name) will far exceed this.
            const pageDivs = Array.from(
                doc.querySelectorAll(
                    '.resume-theme-provider .resume-page, ' +
                    '.resume-theme-provider div[style*="297mm"]'
                )
            );

            if (pageDivs.length > 1) {
                const lastPage = pageDivs[pageDivs.length - 1] as any;
                const rawText = (lastPage.textContent || '').replace(/\s+/g, ' ').trim();
                const isEffectivelyEmpty = rawText.length < 40;

                if (isEffectivelyEmpty) {
                    // Genuine empty page — collapse it completely so the PDF page is not generated
                    lastPage.style.setProperty('display', 'none', 'important');
                    lastPage.style.setProperty('height', '0px', 'important');
                    lastPage.style.setProperty('overflow', 'hidden', 'important');
                    lastPage.style.setProperty('margin', '0', 'important');
                    lastPage.style.setProperty('padding', '0', 'important');
                }
                // else: has real content — leave height:297mm alone, sidebar fills correctly ✓
            }
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        });

        console.log('[PdfEngineV2][PAGED]    Buffer:', pdfBuffer.length, 'bytes');
        return Buffer.from(pdfBuffer);
    }

    // ── SEAMLESS / FULL MODE ────────────────────────────────────────────────────
    // Single-page PDF with a custom height that exactly matches the content.
    // The resume looks identical to the on-screen seamless preview.
    // JS fixes: overflow only — we do NOT touch page structure, margins, or heights.
    private static async renderSeamless(page: any): Promise<Buffer> {
        await page.evaluate(() => {
            const doc = (globalThis as any).document;

            // Only fix overflow — nothing else.
            doc.documentElement.style.setProperty('overflow', 'visible', 'important');
            doc.documentElement.style.setProperty('height', 'auto', 'important');
            doc.body.style.setProperty('overflow', 'visible', 'important');
            doc.body.style.setProperty('height', 'auto', 'important');
            doc.body.style.setProperty('margin', '0', 'important');
            doc.body.style.setProperty('padding', '0', 'important');

            const provider = doc.querySelector('.resume-theme-provider');
            if (provider) {
                provider.style.setProperty('overflow', 'visible', 'important');
                provider.style.setProperty('height', 'auto', 'important');
                provider.style.setProperty('display', 'block', 'important');
            }
            // Intentionally no further changes — let the seamless layout render as-is.
        });

        // Measure the exact rendered content height
        const contentHeight = await page.evaluate(() => {
            const doc = (globalThis as any).document;
            const provider = doc.querySelector('.resume-theme-provider');
            // Use scrollHeight so we get the full content including any overflow
            return provider ? provider.scrollHeight : doc.body.scrollHeight;
        }) as number;

        const safeHeight = Math.ceil(contentHeight) + 4; // +4px rounding safety

        const pdfBuffer = await page.pdf({
            width: '210mm',
            height: `${safeHeight}px`,
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        });

        console.log(`[PdfEngineV2][SEAMLESS] Content height: ${contentHeight}px → PDF height: ${safeHeight}px | Buffer: ${pdfBuffer.length} bytes`);
        return Buffer.from(pdfBuffer);
    }
}
