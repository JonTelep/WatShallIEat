import '../styles/globals.css'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Check for dark mode preference on initial load
    if (localStorage.getItem('darkMode') === 'true' ||
        (!('darkMode' in localStorage) &&
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp