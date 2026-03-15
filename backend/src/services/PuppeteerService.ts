import puppeteer from 'puppeteer';

export class PuppeteerService {
    private static browser: any;

    public static async getBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        return this.browser;
    }

    public static async generatePdf(htmlContent: string, options: { format?: any, height?: string } = {}): Promise<Buffer> {
        // Always launch a new browser instance for now to avoid state issues, 
        // or effectively manage a pool. For low volume, launching per request is safer but slower.
        // Actually, Puppeteer launch is heavy. Let's try to reuse or just launch.
        // Given local dev, launching new is fine.
        let executablePath: string | undefined = process.env.PUPPETEER_EXECUTABLE_PATH;
        
        if (!executablePath && process.platform === 'linux') {
            const fs = require('fs');
            const paths = [
                '/usr/bin/google-chrome',
                '/usr/bin/google-chrome-stable',
                '/usr/bin/chromium',
                '/usr/bin/chromium-browser',
                '/usr/lib/chromium/chromium'
            ];
            
            for (const path of paths) {
                if (fs.existsSync(path)) {
                    executablePath = path;
                    break;
                }
            }
        }

        const browser = await puppeteer.launch({
            headless: true,
            executablePath: executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--font-render-hinting=none',
            ]
        });

        try {
            console.log('[PDF-DEBUG] ── Starting page creation');
            const page = await browser.newPage();

            // Set a viewport wide enough for A4 (793px at 96dpi) and tall enough
            // for at least 5 pages worth of content so Puppeteer never clips multi-page resumes.
            await page.setViewport({ width: 794, height: 5615 }); // 5615 ≈ 5 × 297mm at 96dpi
            console.log('[PDF-DEBUG] ── Viewport set: 794 × 5615px');
            console.log('[PDF-DEBUG] ── HTML content length:', htmlContent.length, 'bytes');
            console.log('[PDF-DEBUG] ── Options received from frontend:', JSON.stringify(options));

            // Use networkidle2 instead of networkidle0 (more stable on server)
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle2',
                timeout: 45000
            });
            console.log('[PDF-DEBUG] ── setContent complete (networkidle2 reached)');

            // Wait for all fonts to be fully loaded and ready
            await page.evaluateHandle('document.fonts.ready');
            console.log('[PDF-DEBUG] ── Fonts loaded (document.fonts.ready)');

            // ── NUCLEAR OVERFLOW FIX ──
            // Force overflow:visible on html/body via JS inline styles.
            // CSS !important can be overridden by cascade order (e.g. asynchronously-loaded
            // Next.js stylesheets load AFTER our inline overrides and win).
            // JS inline styles ALWAYS win — nothing in CSS can override element.style.
            await page.evaluate(() => {
                const doc = (globalThis as any).document;

                // 1. Fix html/body overflow and sizing
                doc.documentElement.style.setProperty('overflow', 'visible', 'important');
                doc.documentElement.style.setProperty('height', 'auto', 'important');
                doc.body.style.setProperty('overflow', 'visible', 'important');
                doc.body.style.setProperty('height', 'auto', 'important');
                doc.body.style.setProperty('margin', '0', 'important');
                doc.body.style.setProperty('padding', '0', 'important');

                // 2. Fix the resume provider container
                const provider = doc.querySelector('.resume-theme-provider');
                if (provider) {
                    provider.style.setProperty('overflow', 'visible', 'important');
                    provider.style.setProperty('height', 'auto', 'important');
                    provider.style.setProperty('display', 'block', 'important');
                }

                // 3. Strip inter-page margins and box-shadows from ALL page-height divs.
                //    These are preview-only chrome (spacing between floating page cards).
                //    In the PDF they just push content over A4 boundaries creating blank pages.
                const allDivsWithStyle = doc.querySelectorAll('.resume-theme-provider div[style]');
                allDivsWithStyle.forEach((div: any) => {
                    const style = div.getAttribute('style') || '';
                    if (style.includes('297mm')) {
                        div.style.setProperty('margin', '0', 'important');
                        div.style.setProperty('box-shadow', 'none', 'important');
                    }
                });

                // 4. KEY FIX: Make the LAST page div height:auto instead of 297mm.
                //    useAutoPagination sometimes generates an extra empty page at the end
                //    (e.g. when content fills pages 1 and 2 but the layout engine adds a 3rd).
                //    With height:auto, an empty last page collapses to 0 → no blank PDF page.
                //    With content, it naturally sizes to the content height.
                const pageDivs = Array.from(
                    doc.querySelectorAll('.resume-theme-provider .resume-page, .resume-theme-provider div[style*="297mm"]')
                );
                if (pageDivs.length > 0) {
                    const lastPage = pageDivs[pageDivs.length - 1] as any;
                    lastPage.style.setProperty('height', 'auto', 'important');
                    lastPage.style.setProperty('min-height', '0', 'important');
                    lastPage.style.setProperty('overflow', 'visible', 'important');
                }
            });
            console.log('[PDF-DEBUG] ── Nuclear overflow fix applied (overflow + page margins + last-page auto-height)');


            // ── DOM Diagnostics: measure what Puppeteer actually sees ──
            // NOTE: The callback runs in browser context — DOM types (document, window, etc.)
            //       exist at runtime even though TypeScript doesn't know about them here.
            const domDiagnostics = await page.evaluate(() => {
                /* eslint-disable no-undef */
                const doc = (globalThis as any).document;
                const win = (globalThis as any).window;
                const provider = doc.querySelector('.resume-theme-provider');
                const resumePages = doc.querySelectorAll('.resume-page');
                const body = doc.body;
                const html = doc.documentElement;

                const getComputedVal = (el: any, prop: string) =>
                    el ? win.getComputedStyle(el).getPropertyValue(prop) : 'ELEMENT NOT FOUND';

                return {
                    providerFound: !!provider,
                    providerScrollHeight: provider ? provider.scrollHeight : -1,
                    providerOffsetHeight: provider ? provider.offsetHeight : -1,
                    providerBoundingHeight: provider ? provider.getBoundingClientRect().height : -1,
                    providerDisplay: getComputedVal(provider, 'display'),
                    providerOverflow: getComputedVal(provider, 'overflow'),
                    bodyScrollHeight: body.scrollHeight,
                    bodyOffsetHeight: body.offsetHeight,
                    bodyOverflow: getComputedVal(body, 'overflow'),
                    htmlScrollHeight: html.scrollHeight,
                    htmlOverflow: getComputedVal(html, 'overflow'),
                    resumePageCount: resumePages.length,
                    resumePageHeights: Array.from(resumePages).map((p: any, i: number) => ({
                        index: i,
                        offsetHeight: p.offsetHeight,
                        scrollHeight: p.scrollHeight,
                        boundingHeight: p.getBoundingClientRect().height,
                        overflow: getComputedVal(p, 'overflow'),
                        pageBreakAfter: getComputedVal(p, 'page-break-after'),
                        breakAfter: getComputedVal(p, 'break-after'),
                    })),
                };
            });

            console.log('[PDF-DEBUG] ── DOM Diagnostics:');
            console.log('  providerFound        :', domDiagnostics.providerFound);
            console.log('  providerScrollHeight :', domDiagnostics.providerScrollHeight, 'px');
            console.log('  providerOffsetHeight :', domDiagnostics.providerOffsetHeight, 'px');
            console.log('  providerBoundingH    :', domDiagnostics.providerBoundingHeight, 'px');
            console.log('  providerDisplay      :', domDiagnostics.providerDisplay);
            console.log('  providerOverflow     :', domDiagnostics.providerOverflow);
            console.log('  body.scrollHeight    :', domDiagnostics.bodyScrollHeight, 'px');
            console.log('  body.overflow        :', domDiagnostics.bodyOverflow);
            console.log('  html.scrollHeight    :', domDiagnostics.htmlScrollHeight, 'px');
            console.log('  html.overflow        :', domDiagnostics.htmlOverflow);
            console.log('  resume-page count    :', domDiagnostics.resumePageCount);
            domDiagnostics.resumePageHeights.forEach((p: any) => {
                console.log(`  Page[${p.index}]: offsetH=${p.offsetHeight}px, scrollH=${p.scrollHeight}px, boundingH=${p.boundingHeight}px, overflow=${p.overflow}, break-after=${p.breakAfter}`);
            });

            const pdfOptions: any = {
                printBackground: true,
                margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
                // Note: do NOT use preferCSSPageSize here — it conflicts with format: 'A4'
                // and causes multi-page resumes to be clipped to a single page.
            };

            if (options.height) {
                pdfOptions.width = '210mm';
                if (options.height === 'auto') {
                    // Measure content height
                    const height = domDiagnostics.providerBoundingHeight > 0
                        ? domDiagnostics.providerBoundingHeight
                        : domDiagnostics.bodyScrollHeight;
                    // Add a tiny buffer to prevent accidental overflow to a second page
                    pdfOptions.height = `${Math.ceil(height) + 2}px`;
                    console.log('[PDF-DEBUG] ── full/auto mode: computed height =', pdfOptions.height);
                } else {
                    pdfOptions.height = options.height;
                    console.log('[PDF-DEBUG] ── custom height mode:', pdfOptions.height);
                }
            } else {
                // Paged A4 mode — always use A4 format so Puppeteer paginates correctly
                pdfOptions.format = 'A4';
                console.log('[PDF-DEBUG] ── paged A4 mode, format: A4');
            }

            console.log('[PDF-DEBUG] ── Final pdfOptions:', JSON.stringify(pdfOptions));
            const pdfBuffer = await page.pdf(pdfOptions);
            console.log('[PDF-DEBUG] ── PDF generated! Buffer size:', pdfBuffer.length, 'bytes', `(~${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('Puppeteer generation error:', error);
            throw error;
        } finally {
            await browser.close();
        }
    }
}
