import { styled } from '@linaria/react'
export const FooterStyled = styled.footer`
  color: #faf8f4;
  background: #242421;
  .footer-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 28px;
    padding-block: 22px;
  }
  .brand {
    font: bold 25px var(--serif);
    text-decoration: none;
  }
  nav {
    order: 3;
    display: flex;
    gap: 24px;
    width: 100%;
    font-size: 13px;
  }
  nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
  }
  .age {
    margin-left: auto;
    font: 22px var(--serif);
  }
  a:hover {
    color: #ffb183;
  }
  @media (min-width: 760px) {
    nav {
      order: 0;
      width: auto;
      margin-left: 20px;
    }
  }
`
