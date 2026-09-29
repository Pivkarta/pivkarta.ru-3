import { styled } from '@linaria/react'
export const ContentStyled = styled.div`
  max-width: 48rem;
  line-height: 1.75;
  overflow-x: auto;
  overflow-wrap: anywhere;
  img {
    max-width: 100%;
    height: auto;
  }
  table {
    border-collapse: collapse;
  }
  th,
  td {
    padding: 0.5rem;
    border: 1px solid #cfc7bb;
  }
  blockquote {
    margin-inline: 0;
    padding-left: 1rem;
    border-left: 3px solid #cfc7bb;
  }
  pre {
    overflow-x: auto;
  }
`
