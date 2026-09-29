import { Link } from 'react-router'
import type * as React from 'react'
import { PlacesStyled } from './styles'
import illustration from './assets/cafe.webp'
export const Places: React.FC = () => (
  <PlacesStyled aria-labelledby="places-title">
    <div>
      <h2 id="places-title">От пива — к месту</h2>
      <p>Связанные заведения — на страницах пива.</p>
    </div>
    <img src={illustration} alt="" width={600} height={400} loading="lazy" />
    <Link className="section-link" to="/companies">
      Смотреть заведения <span aria-hidden="true">→</span>
    </Link>
  </PlacesStyled>
)
