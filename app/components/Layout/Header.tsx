import type * as React from 'react'
import { useCallback, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { HeaderStyled } from './Header/styles'

export const Header: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false)
  const { pathname } = useLocation()
  const closeMenu = useCallback((): void => setOpen(false), [])
  const toggleMenu = useCallback(
    (): void => setOpen((value: boolean) => !value),
    [],
  )
  const focusSearch = useCallback((): void => {
    setOpen(false)
    if (pathname === '/') {
      document.getElementById('beer-search')?.focus()
    }
  }, [pathname])
  return (
    <HeaderStyled>
      <div className="site-container header-inner">
        <Link className="brand" to="/" onClick={closeMenu}>
          Пивная карта
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={toggleMenu}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        >
          <span aria-hidden="true">{open ? '×' : '☰'}</span>
        </button>
        <nav
          id="main-navigation"
          aria-label="Основная навигация"
          data-open={open}
        >
          <Link to="/place/index/type/shop/" onClick={closeMenu}>
            Магазины
          </Link>
          <Link to="/place/index/type/bar/" onClick={closeMenu}>
            Бары
          </Link>
          <Link to="/place/index/type/brewery/" onClick={closeMenu}>
            Пивоварни
          </Link>
          <Link to="/beer/showlist/" onClick={closeMenu}>
            Пиво
          </Link>
          <Link to="/blog/showlist/" onClick={closeMenu}>
            Блоги
          </Link>
          <Link className="city" to="/city/" onClick={closeMenu}>
            Все города <span aria-hidden="true">⌄</span>
          </Link>
          <Link
            className="search"
            to="/#beer-search"
            aria-label="Перейти к поиску пива"
            onClick={focusSearch}
          >
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="7.5" />
              <path d="m16 16 6 6" />
            </svg>
          </Link>
        </nav>
      </div>
    </HeaderStyled>
  )
}
