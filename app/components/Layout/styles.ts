import { styled } from '@linaria/react'

export const HtmlStyled = styled.html`
  color: #201e1b;
  background: #faf8f4;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.5;
  body {
    margin: 0;
  }
`

export const LayoutStyled = styled.div`
  &,
  & * {
    box-sizing: border-box;
  }
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow-wrap: anywhere;
  --accent: #b7410b;
  --line: #d6d0c7;
  --serif: Georgia, 'Times New Roman', serif;
  a {
    color: inherit;
    text-underline-offset: 5px;
  }
  a:hover {
    color: var(--accent);
  }
  :focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 5px;
  }
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  h1,
  h2,
  h3 {
    font-family: var(--serif);
  }
  button,
  input {
    font: inherit;
  }
  .site-container {
    width: min(1200px, calc(100% - 40px));
    margin-inline: auto;
  }
  .site-main {
    flex: 1;
    min-width: 0;
  }
  .skip-link {
    position: fixed;
    top: -100px;
    left: 16px;
    z-index: 20;
    padding: 12px 20px;
    background: #fff;
  }
  .skip-link:focus {
    top: 12px;
  }
  @media (min-width: 760px) {
    .site-container {
      width: min(1200px, calc(100% - 80px));
    }
  }
`
