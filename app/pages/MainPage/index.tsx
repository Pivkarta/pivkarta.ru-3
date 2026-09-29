import type * as React from 'react'
import { Hero } from './Hero'
import { BeerSelection } from './BeerSelection'
import { Places } from './Places'
import { MainPageStyled } from './styles'
export const MainPage: React.FC = () => (
  <MainPageStyled>
    <Hero />
    <BeerSelection />
    <Places />
  </MainPageStyled>
)
