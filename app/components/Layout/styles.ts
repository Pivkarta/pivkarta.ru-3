import { styled } from '@linaria/react'

export const HtmlStyled = styled.html`
  & {
    line-height: 1.6;
  }

  body {
    margin: 0;
  }
`

export const LayoutStyled = styled.div`
  &,
  & * {
    box-sizing: border-box;
  }

  & {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow-wrap: anywhere;
  }
`
