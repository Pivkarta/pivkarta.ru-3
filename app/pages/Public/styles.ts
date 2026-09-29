import { styled } from '@linaria/react'

export const PublicPageStyled = styled.article`
  max-width: 64rem;
  margin-inline: auto;
  padding-block: 1rem 3rem;
  overflow-wrap: anywhere;
  h1 {
    margin-block: 1rem;
  }
  p {
    line-height: 1.65;
  }
  a {
    text-underline-offset: 0.2em;
  }
  a:focus-visible,
  button:focus-visible,
  input:focus-visible {
    outline: 3px solid #985c17;
    outline-offset: 3px;
  }
  section {
    margin-block: 2rem;
    scroll-margin-top: 6rem;
  }
  .content {
    max-width: 48rem;
    line-height: 1.75;
    overflow-x: auto;
  }
  .content img,
  .cover {
    max-width: 100%;
    max-height: 32rem;
    height: auto;
    object-fit: contain;
  }
  .cover {
    display: block;
    margin-block: 1rem 2rem;
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
  .entries {
    list-style: none;
    padding: 0;
  }
  .entries li {
    padding-block: 1rem;
    border-bottom: 1px solid #d9d1c8;
  }
  .entries a {
    font-size: 1.15rem;
    font-weight: 600;
  }
  .entries img {
    width: 5rem;
    height: 6rem;
    object-fit: contain;
    float: left;
    margin-right: 1rem;
  }
  .entries li::after {
    content: '';
    display: block;
    clear: both;
  }
  .entries p {
    margin-block: 0.5rem;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-block: 1rem;
  }
  nav a,
  button {
    padding: 0.6rem 0.9rem;
    min-height: 2.75rem;
  }
  form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block: 1rem 2rem;
  }
  label {
    flex-basis: 100%;
  }
  input {
    min-height: 2.75rem;
    max-width: 100%;
    flex: 1;
    padding: 0.6rem;
    border: 1px solid #918579;
  }
  button {
    cursor: pointer;
  }
  iframe {
    width: 100%;
    height: 24rem;
    border: 1px solid #ccc;
  }
  .notice {
    background: #f2ede5;
    padding: 1rem;
    border-radius: 0.3rem;
  }
  time {
    display: block;
    margin-top: 0.5rem;
    color: #62574b;
  }
`
