import { HtmlStyled } from './components/Layout/styles'
import { SeoHeaders, unavailableSeoMeta } from './components/seo/SeoHeaders'

export const meta = unavailableSeoMeta
import type { ReactNode } from 'react'
import { Layout as SiteLayout } from './components/Layout'
import {
  Links,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router'
import { AppProviders } from './components/AppProviders'

const betterlyticsId = import.meta.env.BETTERLYTICS_SITE_ID

export function Layout({ children }: { children: ReactNode }) {
  return (
    <HtmlStyled lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <SeoHeaders />
        <Links />
        {betterlyticsId && (
          <script
            async
            src="https://panel.betterlytics.ru/analytics.js"
            data-site-id={betterlyticsId}
            data-server-url="https://panel.betterlytics.ru/event"
          />
        )}
      </head>
      <body>
        <AppProviders>
          <SiteLayout>{children}</SiteLayout>
        </AppProviders>
        <ScrollRestoration />
        <Scripts />
      </body>
    </HtmlStyled>
  )
}
export default function App() {
  return <Outlet />
}

export function ErrorBoundary() {
  const error = useRouteError()
  return (
    <>
      <h1 tabIndex={-1}>
        {isRouteErrorResponse(error)
          ? `${error.status} ${error.statusText}`
          : 'Не удалось загрузить страницу'}
      </h1>
      <p>Обновите страницу, чтобы попробовать ещё раз.</p>
      <a href="/">На главную</a>
    </>
  )
}
