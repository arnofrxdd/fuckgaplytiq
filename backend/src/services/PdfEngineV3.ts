import puppeteer from 'puppeteer';

/**
 * PdfEngineV3 — Advanced "Source of Truth" Engine.
 * 
 * Philosophy: 
 * Replicate the browser's "Finalize" dashboard rendering as faithfully as possible.
 * Instead of traditional print-media hacks, we emulate the 'screen' media type 
 * and capture the DOM exactly as it appears to the user, ensuring the "What You See 
 * Is What You Get" (WYSIWYG) experience.
 */
export class PdfEngineV3 {

    private static async launchBrowser() {
        let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        if (!executablePath && process.platform === 'linux') {
            const fs = require('fs');
            const candidates = [
                '/usr/bin/google-chrome',
                '/usr/bin/google-chrome-stable',
                '/usr/bin/chromium',
                '/usr/bin/chromium-browser',
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
                '--font-render-hinting=none',
                '--force-color-profile=srgb',
                '--disable-web-security'
            ],
            defaultViewport: {
                width: 794, // Standard A4 width at 96 DPI
                height: 1123,
                deviceScaleFactor: 2 // High-DPI for crisp text and graphics
            }
        });
    }

    public static async generatePdf(htmlContent: string, options: { format?: string; height?: string } = {}): Promise<Buffer> {
        const isSeamless = !!options.height;
        const browser = await this.launchBrowser();
        
        try {
            const page = await browser.newPage();
            
            // CRITICAL: Emulate 'screen' instead of 'print'.
            // This ensures the dashboard's CSS (which is mostly targeted at screens)
            // is exactly what is captured in the PDF.
            await page.emulateMediaType('screen');

            await page.setContent(htmlContent, { 
                waitUntil: ['networkidle2', 'load', 'domcontentloaded'], 
                timeout: 90000 
            });

            // Pipe browser logs to node console
            page.on('console', msg => {
                const text = msg.text();
                if (text.includes('[PdfEngineV3]')) {
                    console.log(text);
                }
            });

            // Wait for fonts
            await page.evaluateHandle('document.fonts.ready');

            // Apply "Universal Visibility" and "A4 Fidelity"
            await page.evaluate(() => {
                const doc = (globalThis as any).document;
                
                // 1. Inject minimal reset styles
                const style = doc.createElement('style');
                style.innerHTML = `
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    html, body {
                        height: auto !important;
                        display: block !important;
                        overflow: visible !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: transparent !important;
                    }
                    .resume-theme-provider {
                        height: auto !important;
                        overflow: visible !important;
                        display: block !important;
                        background: transparent !important;
                    }
                    /* Ensure page breaks are respected as sent by the frontend */
                    .resume-page {
                        page-break-after: always !important;
                        break-after: page !important;
                        position: relative !important;
                        box-sizing: border-box !important;
                    }
                    .resume-page:last-child {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }
                `;
                doc.head.appendChild(style);

                console.log('[PdfEngineV3] === Fidelity Check ===');
                
                // 2. Find pages. We trust the frontend's .resume-page class.
                // We also fallback to elements with the canonical A4 height style.
                const allMatched = Array.from(doc.querySelectorAll('.resume-page, .v3-confirmed-page, [style*="297mm"]'))
                    .filter((el: any) => !el.closest('.resume-measurer'));
                
                // 2. Filter out nested "pages". 
                // Some templates put '297mm' height on sidebars, which causes them to be 
                // over-matched. We only want the top-most page containers.
                const validPages = allMatched.filter(page => 
                    !allMatched.some((other: any) => other !== page && other.contains(page))
                );
                
                console.log(`[PdfEngineV3] Found ${allMatched.length} candidates, narrowed to ${validPages.length} valid top-level pages.`);

                validPages.forEach((page: any, i: number) => {
                    // Force the canonical A4 dimensions if not already set,
                    // but DON'T override padding/margin which might be template-specific.
                    page.style.width = '210mm';
                    page.style.height = '297mm';
                    page.style.minHeight = '297mm';
                    page.style.maxHeight = '297mm';
                    page.style.overflow = 'hidden';
                    page.style.position = 'relative';

                    if (i === validPages.length - 1) {
                        page.style.pageBreakAfter = 'avoid';
                    } else {
                        page.style.pageBreakAfter = 'always';
                    }
                });

                // 3. Document Length Safety (Anti-Ghosting)
                // If we have pages, we clamp the body to (PAGES * 1123)px - 1px.
                // This prevents Puppeteer from accidentally adding a blank trailing page.
                if (validPages.length > 0) {
                    const finalHeightPx = (validPages.length * 1123) - 1;
                    doc.body.style.height = `${finalHeightPx}px`;
                    doc.documentElement.style.height = `${finalHeightPx}px`;
                    doc.body.style.overflow = 'hidden';
                    console.log(`[PdfEngineV3] Applied Anti-Ghost Clamp: ${finalHeightPx}px for ${validPages.length} pages.`);
                }
            });

            if (isSeamless) {
                return await this.handleSeamless(page);
            } else {
                return await this.handlePaged(page);
            }
        } finally {
            await browser.close();
        }
    }

    private static async handlePaged(page: any): Promise<Buffer> {
        // Paged mode (A4)
        // We rely on the CSS 'page-break-after: always' sent by the frontend
        // to determine where pages start and end.
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            preferCSSPageSize: true
        });

        console.log(`[PdfEngineV3][PAGED] Export complete. Size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
        return Buffer.from(pdfBuffer);
    }

    private static async handleSeamless(page: any): Promise<Buffer> {
        // Seamless mode (Full length)
        // We measure the precision height of the content to create a custom PDF size.
        
        const contentMetrics = await page.evaluate(() => {
            const doc = (globalThis as any).document;
            const root = doc.querySelector('.resume-theme-provider') || doc.body;
            const rect = root.getBoundingClientRect();
            return {
                height: Math.ceil(root.scrollHeight || rect.height),
                width: Math.ceil(rect.width) || 794
            };
        });

        const pdfBuffer = await page.pdf({
            width: '210mm', // Fixed A4 width
            height: `${contentMetrics.height}px`,
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        console.log(`[PdfEngineV3][SEAMLESS] Captured at ${contentMetrics.height}px height. Size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
        return Buffer.from(pdfBuffer);
    }
}
