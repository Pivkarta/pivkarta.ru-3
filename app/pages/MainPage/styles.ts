import { styled } from '@linaria/react'
export const MainPageStyled = styled.div`
  h2 {
    font-size: clamp(28px, 4.3vw, 54px);
    letter-spacing: -1.5px;
    line-height: 1.12;
  }
  .section-link {
    color: var(--accent);
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    font-family: var(--serif);
  }
`
