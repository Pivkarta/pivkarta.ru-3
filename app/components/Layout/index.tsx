import type * as React from 'react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { LayoutStyled } from './styles'

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { pathname, hash, key } = useLocation()
  const action = useNavigationType()
  const previous = useRef(pathname)

  useEffect(() => {
    if (previous.current !== pathname && action !== 'POP') {
      document
        .querySelector<HTMLElement>('#main-content h1')
        ?.focus({ preventScroll: true })
    }
    previous.current = pathname
  }, [pathname, action])

  useEffect(() => {
    if (!hash) {
      return
    }
    let id: string
    try {
      id = decodeURIComponent(hash.slice(1))
    } catch {
      return
    }
    let active = true
    const align = (): void => {
      if (active) {
        document.getElementById(id)?.scrollIntoView()
      }
    }
    const stop = (): void => {
      active = false
    }
    const main = document.getElementById('main-content')
    const frame = requestAnimationFrame(align)
    // Изображения старого контента могут загрузиться после начального перехода.
    main?.addEventListener('load', align, true)
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('pointerdown', stop)
    window.addEventListener('keydown', stop)
    return () => {
      cancelAnimationFrame(frame)
      main?.removeEventListener('load', align, true)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('pointerdown', stop)
      window.removeEventListener('keydown', stop)
    }
  }, [pathname, hash, key])

  return (
    <LayoutStyled>
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <Header />
      <main
        id="main-content"
        className="site-container site-main"
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
    </LayoutStyled>
  )
}
