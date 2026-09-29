import { styled } from '@linaria/react'
export const BeerSelectionStyled = styled.section`
  border-top: 1px solid var(--line);
  padding-block: 18px 32px;
  .section-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 4px 14px;
    margin-bottom: 18px;
  }
  .section-heading .section-link {
    font-size: 14px;
  }
  .beer-grid {
    display: grid;
    gap: 14px;
  }
  article {
    border: 1px solid #ddd7cf;
    border-radius: 12px;
    background: #fffdfa;
    overflow: hidden;
    display: grid;
    grid-template-columns: 105px minmax(0, 1fr);
  }
  .photo {
    display: block;
    background: #eee9df;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 140px;
    object-fit: contain;
  }
  .card-copy {
    padding: 14px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  h3 {
    font-size: 19px;
    line-height: 1.2;
  }
  h3 a {
    text-decoration: none;
  }
  p {
    color: #625e58;
    font-size: 14px;
    margin-top: 8px;
  }
  .card-copy .section-link {
    margin-top: auto;
    padding-top: 8px;
    font-size: 15px;
  }
  @media (min-width: 760px) {
    padding-block: 22px 58px;
    .section-heading {
      margin-bottom: 24px;
    }
    .section-heading .section-link {
      font-size: 17px;
    }
    .beer-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 22px;
    }
    article {
      display: flex;
      flex-direction: column;
    }
    .photo {
      height: 285px;
    }
    img {
      padding: 12px;
    }
    .card-copy {
      flex: 1;
      padding: 20px;
      min-height: 156px;
    }
    h3 {
      font-size: 25px;
    }
    p {
      font-size: 16px;
    }
    .card-copy .section-link {
      font-size: 18px;
    }
  }
`
