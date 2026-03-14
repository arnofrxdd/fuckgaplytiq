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
            const page = await browser.newPage();

            // Use networkidle2 instead of networkidle0 (more stable on server)
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle2',
                timeout: 45000
            });

            // Wait for all fonts to be fully loaded and ready
            await page.evaluateHandle('document.fonts.ready');

            const pdfOptions: any = {
                printBackground: true,
                margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
                preferCSSPageSize: true
            };

            if (options.height) {
                pdfOptions.width = '210mm';
                if (options.height === 'auto') {
                    // Measure content height
                    const height = await page.evaluate(() => {
                        // @ts-ignore
                        const provider = document.querySelector('.resume-theme-provider');
                        if (provider) {
                            return provider.getBoundingClientRect().height;
                        }
                        // @ts-ignore
                        return (document.documentElement as any).offsetHeight;
                    }) as number;
                    // Add a tiny buffer to prevent accidental overflow to a second page
                    pdfOptions.height = `${Math.ceil(height) + 2}px`;
                } else {
                    pdfOptions.height = options.height;
                }
            } else {
                pdfOptions.format = options.format || 'A4';
            }

            const pdfBuffer = await page.pdf(pdfOptions);

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('Puppeteer generation error:', error);
            throw error;
        } finally {
            await browser.close();
        }
    }
}
