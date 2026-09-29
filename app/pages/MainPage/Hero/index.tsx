import { Form } from 'react-router'
import type * as React from 'react'
import illustration from './assets/beer-still-life.webp'
import { HeroStyled } from './styles'
export const Hero: React.FC = () => (
  <HeroStyled aria-labelledby="hero-title">
    <div className="hero-copy">
      <h1 id="hero-title" tabIndex={-1}>
        <span>Пиво.</span>Есть что открыть.
      </h1>
      <p>
        Читайте о пиве, рассматривайте фотографии и находите связанные
        заведения.
      </p>
      <Form
        action="/beer/showlist/"
        method="get"
        role="search"
        aria-label="Поиск пива"
      >
        <div className="search-field">
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="7.5" />
            <path d="m16 16 6 6" />
          </svg>
          <input
            id="beer-search"
            type="search"
            name="name"
            placeholder="Название пива"
            aria-label="Название пива"
            required
            maxLength={200}
          />
        </div>
        <button type="submit">Найти пиво</button>
      </Form>
    </div>
    <figure>
      <img
        src={illustration}
        alt=""
        width={1536}
        height={1024}
        fetchPriority="high"
      />
      <figcaption>Иллюстрация</figcaption>
    </figure>
  </HeroStyled>
)
