import { Link, NavLink } from 'react-router'

export function Header() {
  return (
    <header className="site-header">
      <div className="site-container site-header__content">
        <Link className="site-brand" to="/" aria-label="HAIH home">
          HAIH
          <img src="/logo.png" alt="" width={32} height={32} />
        </Link>
        <nav aria-label="Main">
          <ul className="site-navigation">
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
