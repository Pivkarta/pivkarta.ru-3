import { Link } from 'react-router'
import type * as React from 'react'
import barhatnoe from './assets/barhatnoe.jpeg'
import cernovar from './assets/cernovar.webp'
import kult from './assets/kult.webp'
import { BeerSelectionStyled } from './styles'
interface Beer {
  name: string
  image: string
  path: string
  description: string
}
const beers: readonly Beer[] = [
  {
    name: 'Бархатное (Томск)',
    image: barhatnoe,
    path: '/beer/715/tomskoe-barhatnoe/',
    description: 'Описание и фотографии пива.',
  },
  {
    name: 'Cernovar Svetle',
    image: cernovar,
    path: '/beer/8/cernovar-svetle/',
    description: 'Знакомство с чешским пивом.',
  },
  {
    name: 'Kult Пшеничное светлое',
    image: kult,
    path: '/beer/1564/kult-pshenichnoe-svetloe-krinica/',
    description: 'Пиво пивоварни «Криница».',
  },
]
export const BeerSelection: React.FC = () => (
  <BeerSelectionStyled aria-labelledby="selection-title">
    <div className="section-heading">
      <h2 id="selection-title">Открывайте пиво</h2>
      <Link className="section-link" to="/beer/showlist/">
        Весь каталог <span aria-hidden="true">→</span>
      </Link>
    </div>
    <div className="beer-grid">
      {beers.map((beer: Beer) => (
        <article key={beer.path}>
          <Link
            className="photo"
            to={beer.path}
            tabIndex={-1}
            aria-hidden="true"
          >
            <img
              src={beer.image}
              alt=""
              loading="lazy"
              width={400}
              height={300}
            />
          </Link>
          <div className="card-copy">
            <h3>
              <Link to={beer.path}>{beer.name}</Link>
            </h3>
            <p>{beer.description}</p>
            <Link
              className="section-link"
              to={beer.path}
              aria-label={`О пиве ${beer.name}`}
            >
              О пиве <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  </BeerSelectionStyled>
)
