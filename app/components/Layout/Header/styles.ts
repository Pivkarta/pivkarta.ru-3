import { styled } from '@linaria/react'
export const HeaderStyled = styled.header`
  border-bottom: 1px solid var(--line);
  .header-inner {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-height: 78px;
    gap: 12px;
  }
  .brand {
    font: bold 28px var(--serif);
    text-decoration: none;
    letter-spacing: -1px;
  }
  .menu-toggle {
    margin-left: auto;
    border: 0;
    background: none;
    color: inherit;
    width: 44px;
    height: 44px;
    font-size: 27px;
    cursor: pointer;
  }
  nav {
    display: none;
    flex-basis: 100%;
    padding-block: 8px 20px;
  }
  nav[data-open='true'] {
    display: grid;
  }
  nav a {
    text-decoration: none;
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .city {
    font-size: 14px;
  }
  @media (min-width: 900px) {
    .header-inner {
      min-height: 94px;
      gap: 64px;
      flex-wrap: nowrap;
    }
    .brand {
      font-size: 34px;
      white-space: nowrap;
    }
    .menu-toggle {
      display: none;
    }
    nav,
    nav[data-open='true'] {
      display: flex;
      align-items: center;
      gap: 36px;
      padding: 0;
      flex: 1;
    }
    nav a {
      font-family: var(--serif);
    }
    .city {
      margin-left: auto;
      font-family: Arial, sans-serif;
      white-space: nowrap;
    }
    .search {
      justify-content: center;
      width: 44px;
    }
  }
`
