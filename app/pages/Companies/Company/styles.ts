import { styled } from '@linaria/react'

export const CompanyPageStyled = styled.article`
  max-width: 58rem;
  margin-inline: auto;
  overflow-wrap: anywhere;
  .content {
    line-height: 1.7;
    overflow-x: auto;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  .cover {
    max-height: 30rem;
    object-fit: contain;
  }
  .gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .gallery img {
    width: 12rem;
    height: 12rem;
    object-fit: contain;
  }
  section {
    scroll-margin-top: 6rem;
  }
  h1 {
    margin-block: 1.5rem 0.75rem;
  }
  section {
    margin-block: 2rem;
  }
  .notice {
    padding: 1rem;
    border: 1px solid currentColor;
    border-radius: 0.5rem;
  }
  dl {
    display: grid;
    gap: 0.5rem 1.5rem;
  }
  dt {
    font-weight: 600;
  }
  dd {
    margin: 0 0 0.75rem;
  }
  .description {
    white-space: pre-line;
  }
  .beers {
    list-style: none;
    padding: 0;
  }
  .beers li {
    display: grid;
    gap: 0.4rem;
    padding-block: 1rem;
    border-bottom: 1px solid #ddd;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-block: 1rem;
  }
  @media (min-width: 640px) {
    dl {
      grid-template-columns: 10rem 1fr;
    }
    .beers li {
      grid-template-columns: 2fr 1fr 1fr;
    }
  }
`
