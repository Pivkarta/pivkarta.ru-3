import type React from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { ContentStyled } from './styles'

/** html очищен серверным renderContent. Внутренние ссылки используют React Router. */
export const Content: React.FC<{ html: string }> = ({ html }) => {
  const navigate = useNavigate()
  const onClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      const target =
        event.target instanceof Element ? event.target.closest('a') : null
      if (!target || target.target || target.hasAttribute('download')) {
        return
      }
      const href = target.getAttribute('href')
      if (
        !href ||
        !href.startsWith('/') ||
        href.startsWith('//') ||
        /^\/(images|uploads|assets)\//.test(href) ||
        /\.(pdf|png|jpe?g|webp|gif)(?:[?#]|$)/i.test(href)
      ) {
        return
      }
      event.preventDefault()
      void navigate(href)
    },
    [navigate],
  )
  return (
    <ContentStyled
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
