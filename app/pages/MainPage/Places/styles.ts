import { styled } from '@linaria/react'
export const PlacesStyled = styled.section`
  border-top: 1px solid var(--line);
  position: relative;
  padding-block: 24px;
  min-height: 160px;
  div {
    position: relative;
    z-index: 1;
    max-width: 80%;
  }
  h2 {
    font-size: clamp(28px, 4vw, 50px);
  }
  p {
    font-family: var(--serif);
    font-size: 17px;
    margin-top: 10px;
    max-width: 240px;
  }
  img {
    position: absolute;
    right: -20px;
    bottom: 10px;
    width: 145px;
    height: 115px;
    object-fit: cover;
    mix-blend-mode: multiply;
    opacity: 0.75;
  }
  .section-link {
    position: relative;
    z-index: 1;
    margin-top: 12px;
  }
  @media (min-width: 900px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    min-height: 185px;
    padding-block: 30px;
    p {
      max-width: none;
      font-size: 23px;
    }
    img {
      width: 260px;
      height: 170px;
      right: 22%;
      bottom: 0;
    }
    .section-link {
      margin-top: 0;
    }
  }
`
