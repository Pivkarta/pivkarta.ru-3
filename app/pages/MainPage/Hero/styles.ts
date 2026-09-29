import { styled } from '@linaria/react'
export const HeroStyled = styled.section`
  position: relative;
  padding-top: 30px;
  .hero-copy {
    position: relative;
    z-index: 1;
  }
  h1 {
    font-size: clamp(36px, 6.1vw, 76px);
    line-height: 0.98;
    letter-spacing: -1.8px;
  }
  h1 span {
    display: block;
    font-size: 1.25em;
  }
  p {
    font-size: 17px;
    line-height: 1.4;
    max-width: 530px;
    margin-top: 22px;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;
    max-width: 590px;
  }
  .search-field {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #fff;
    border: 1px solid #cfcfcf;
    border-radius: 9px;
    padding-left: 16px;
    min-width: 0;
    flex: 1;
  }
  .search-field svg {
    flex-shrink: 0;
    color: #555;
  }
  input {
    width: 100%;
    min-width: 0;
    border: 0;
    background: transparent;
    padding: 13px 10px 13px 0;
    color: #201e1b;
    border-radius: 9px;
  }
  input::placeholder {
    color: #747474;
  }
  button {
    min-height: 48px;
    border: 0;
    border-radius: 9px;
    background: var(--accent);
    color: white;
    padding: 12px 28px;
    font-family: var(--serif);
    font-weight: bold;
    cursor: pointer;
  }
  button:hover {
    background: #943307;
  }
  figure {
    position: relative;
    margin: 0 -20px;
    height: 280px;
    overflow: hidden;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: right;
  }
  figcaption {
    position: absolute;
    right: 20px;
    bottom: 8px;
    color: #60594e;
    font-size: 12px;
  }
  @media (min-width: 600px) {
    form {
      flex-direction: row;
    }
    figure {
      height: 350px;
    }
  }
  @media (min-width: 900px) {
    min-height: 510px;
    padding-block: 65px 64px;
    display: flex;
    align-items: center;
    .hero-copy {
      width: 76%;
    }
    p {
      font-size: 22px;
      margin-top: 28px;
    }
    form {
      margin-top: 42px;
      max-width: 600px;
    }
    figure {
      position: absolute;
      inset: 0 -40px 0 30%;
      margin: 0;
      height: auto;
    }
    img {
      object-position: right center;
    }
    figure::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, #faf8f4, transparent 36%);
      pointer-events: none;
    }
    figcaption {
      z-index: 1;
      right: 40px;
    }
  }
`
