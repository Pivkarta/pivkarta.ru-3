import type * as React from 'react'
import { Link } from 'react-router'
import { FooterStyled } from './Footer/styles'
export const Footer: React.FC = () => (
  <FooterStyled>
    <div className="site-container footer-inner">
      <Link className="brand" to="/">
        Пивная карта
      </Link>
      <nav aria-label="Информация о сайте">
        <Link to="/map/">Карта</Link>
        <Link to="/profile/showlist/">Участники</Link>
        <Link to="/comments/">Комментарии</Link>
        <Link to="/contacts.html">Контакты</Link>
        <Link to="/places/create/">Для владельцев</Link>
      </nav>
      <span className="age" aria-label="Для лиц старше 18 лет">
        18+
      </span>
    </div>
  </FooterStyled>
)
