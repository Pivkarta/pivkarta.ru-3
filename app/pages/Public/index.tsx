import { Content } from 'app/components/Content'
import type React from 'react'
import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
  useSearchParams,
} from 'react-router'
import type { PublicLink, PublicPageData } from './types'
import { pageLink } from './paths'
import { PublicPageStyled } from './styles'

const Entries: React.FC<{ items: PublicLink[] }> = ({ items }) =>
  items.length ? (
    <ul className="entries">
      {items.map((item) => (
        <li key={item.path}>
          {item.image && <img src={item.image} alt="" loading="lazy" />}
          <Link to={item.path}>{item.name}</Link>
          {item.date && (
            <time dateTime={item.date}>
              {item.date.split('-').reverse().join('.')}
            </time>
          )}
          {item.description && <p>{item.description}</p>}
          {item.mapPath && <Link to={item.mapPath}>Показать на карте</Link>}
          {item.authors?.map((author) => (
            <p key={author.path}>
              Автор: <Link to={author.path}>{author.name}</Link>
            </p>
          ))}
        </li>
      ))}
    </ul>
  ) : (
    <p>Записей не найдено.</p>
  )

const Pagination: React.FC<{
  path: string
  query: string
  page: number
  pages: number
  parameter?: string
}> = ({ path, query, page, pages, parameter }) =>
  pages > 1 ? (
    <nav aria-label="Страницы выдачи">
      {page > 1 && (
        <Link to={pageLink(path, query, page - 1, parameter)}>Назад</Link>
      )}
      <span>
        Страница {page} из {pages}
      </span>
      {page < pages && (
        <Link to={pageLink(path, query, page + 1, parameter)}>Далее</Link>
      )}
    </nav>
  ) : null

export const PublicPage: React.FC = () => {
  const value = useLoaderData<PublicPageData>()
  const [params] = useSearchParams()
  const map = value.map
  const delta = map ? 180 / 2 ** Math.min(map.zoom, 19) : 0
  const bbox = map
    ? [
        Math.max(-180, map.lng - delta),
        Math.max(-85, map.lat - delta),
        Math.min(180, map.lng + delta),
        Math.min(85, map.lat + delta),
      ].join(',')
    : ''
  return (
    <PublicPageStyled>
      <h1 tabIndex={-1}>{value.title}</h1>
      {value.description && <p>{value.description}</p>}
      {value.city && (
        <p>
          Город: {value.city.name}. <Link to="/city/">Выбрать другой</Link>
        </p>
      )}
      {value.search && (
        <Form method="get" action={value.path} key={params.toString()}>
          <label htmlFor="catalog-search">
            {value.path.includes('beer')
              ? 'Название пива'
              : 'Название заведения'}
          </label>
          <input
            id="catalog-search"
            name="name"
            defaultValue={params.get('name') || params.get('search') || ''}
          />
          {[...params.entries()]
            .filter(([key]) => !['name', 'search', 'page'].includes(key))
            .map(([key, val]) => (
              <input key={key} type="hidden" name={key} value={val} />
            ))}
          <button type="submit">Найти</button>
        </Form>
      )}
      {value.image && (
        <img className="cover" src={value.image} alt={value.title} />
      )}
      {value.html && <Content html={value.html} />}
      {value.gallery?.length ? (
        <section aria-label="Фотографии" className="gallery">
          {value.gallery.map((src, index) => (
            <a href={src} key={src}>
              <img
                src={src}
                alt={`${value.title} — фото ${index + 1}`}
                loading="lazy"
              />
            </a>
          ))}
        </section>
      ) : null}
      {map && (
        <section aria-label="Карта">
          <iframe
            title="Карта OpenStreetMap"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik${map.marker ? `&marker=${map.lat},${map.lng}` : ''}`}
          />
          <p>
            ©{' '}
            <a href="https://www.openstreetmap.org/copyright">
              Участники OpenStreetMap
            </a>
            . Если карта не загрузилась, воспользуйтесь списком заведений ниже.
          </p>
        </section>
      )}
      {(value.search ||
        value.sections.some(
          (section) => section.id === 'places' && section.items.length > 0,
        )) && (
        <p className="notice">
          Наличие пива, цены и часы работы уточняйте у заведения.
        </p>
      )}
      {(value.items.length > 0 || value.pages > 1 || value.search) && (
        <Entries items={value.items} />
      )}
      <Pagination
        path={value.path}
        query={value.query}
        page={value.page}
        pages={value.pages}
      />
      {value.sections
        .filter((section) => section.items.length > 0 || section.html)
        .map((section) => (
          <section id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            {section.html && <Content html={section.html} />}
            {section.items.length > 0 && <Entries items={section.items} />}
            <Pagination
              path={value.path}
              query={value.query}
              page={section.page || 1}
              pages={section.pages || 1}
              parameter={section.parameter}
            />
          </section>
        ))}
    </PublicPageStyled>
  )
}
export const PublicError: React.FC = () => {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : 503
  return (
    <PublicPageStyled>
      <h1 tabIndex={-1}>
        {status === 404
          ? 'Страница не найдена'
          : status === 400
            ? 'Некорректный адрес'
            : 'Не удалось загрузить страницу'}
      </h1>
      <p>
        {status === 404
          ? 'Проверьте адрес или выберите раздел сайта.'
          : 'Проверьте параметры запроса или попробуйте обновить страницу позже.'}
      </p>
      <Link to="/">На главную</Link>
    </PublicPageStyled>
  )
}
