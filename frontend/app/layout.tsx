import type { Metadata } from 'next'
import './globals.css'
import './design-system.css'
import { AuthProvider } from '@/lib/authContext'
import { AriaProvider } from '@/lib/AriaContext'

import { AnalyticsProvider } from '@/lib/analytics'
import { 
    Plus_Jakarta_Sans, 
    Inter, 
    Outfit, 
    Montserrat, 
    Manrope, 
    Sora, 
    Urbanist, 
    Playfair_Display, 
    Lora, 
    Fraunces,
    Bricolage_Grotesque,
    Space_Grotesk,
    Instrument_Sans,
    Hanken_Grotesk,
    JetBrains_Mono,
    Work_Sans,
    DM_Sans,
    Poppins,
    Open_Sans,
    Roboto,
    Lato,
    Source_Sans_3,
    Merriweather,
    EB_Garamond,
    Libre_Baskerville,
    Cormorant_Garamond,
    Spectral,
    Crimson_Pro,
    Josefin_Sans, 
    Cinzel,
    DM_Serif_Display
} from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' })
const urbanist = Urbanist({ subsets: ['latin'], variable: '--font-urbanist', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' })
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' })
const instrument = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument', display: 'swap' })
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-hanken', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })
const work = Work_Sans({ subsets: ['latin'], variable: '--font-work', display: 'swap' })
const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm', display: 'swap' })
const poppins = Poppins({ weight: ['300', '400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins', display: 'swap' })
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans', display: 'swap' })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'], variable: '--font-roboto', display: 'swap' })
const lato = Lato({ weight: ['300', '400', '700'], subsets: ['latin'], variable: '--font-lato', display: 'swap' })
const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans', display: 'swap' })
const merriweather = Merriweather({ weight: ['300', '400', '700'], subsets: ['latin'], variable: '--font-merriweather', display: 'swap' })
const ebGaramond = EB_Garamond({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-eb-garamond', display: 'swap' })
const libreBaskerville = Libre_Baskerville({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-libre-baskerville', display: 'swap' })
const cormorant = Cormorant_Garamond({ weight: ['300', '400', '500', '600', '700'], subsets: ['latin'], variable: '--font-cormorant', display: 'swap' })
const spectral = Spectral({ weight: ['200', '300', '400', '500', '600', '700'], subsets: ['latin'], variable: '--font-spectral', display: 'swap' })
const crimson = Crimson_Pro({ weight: ['200', '300', '400', '500', '600', '700'], subsets: ['latin'], variable: '--font-crimson', display: 'swap' })
const josefin = Josefin_Sans({ subsets: ['latin'], variable: '--font-josefin', display: 'swap' })
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', display: 'swap' })
const dmSerif = DM_Serif_Display({ weight: ['400'], subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-dm-serif', display: 'swap' })

export const metadata: Metadata = {
    title: 'Resume Builder',
    description: 'AI-powered resume builder',
    icons: {
        icon: '/logo-icon.png',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const fontVariables = [
        jakarta.variable, inter.variable, outfit.variable, 
        montserrat.variable, manrope.variable, sora.variable, 
        urbanist.variable, playfair.variable, lora.variable, 
        fraunces.variable, bricolage.variable, space.variable,
        instrument.variable, hanken.variable, mono.variable,
        work.variable, dm.variable, poppins.variable,
        openSans.variable, roboto.variable, lato.variable,
        sourceSans.variable, merriweather.variable, ebGaramond.variable,
        libreBaskerville.variable, cormorant.variable, spectral.variable,
        crimson.variable, josefin.variable, cinzel.variable, dmSerif.variable
    ].join(' ')

    return (
        <html lang="en" className={fontVariables}>
            <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased font-sans">
                <AuthProvider>
                    <AriaProvider>
                        <AnalyticsProvider>
                            <div className="flex-1">{children}</div>
                        </AnalyticsProvider>
                    </AriaProvider>
                </AuthProvider>
            </body>
        </html>
    )
}