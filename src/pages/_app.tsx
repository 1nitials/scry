import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { Pirata_One, Prata, Neuton } from 'next/font/google'

const pirataOne = Pirata_One({ 
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-pirata'
})
const prata = Prata({ 
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-prata'
})
const neuton = Neuton({ 
  weight: ['200', '300', '400', '700', '800'], 
  subsets: ['latin'],
  variable: '--font-neuton'
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${neuton.variable} ${pirataOne.variable} ${prata.variable}`}>
      <Component {...pageProps} />
    </main>
  )
}
