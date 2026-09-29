import { Content } from 'app/components/Content'
import { websiteUrl } from './websiteUrl'
import type React from 'react'
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
  useSearchParams,
} from 'react-router'
import type { CompanyPageData } from './load.server'
import { objectPath, pageLink } from '../../Public/paths'
import { CompanyPageStyled } from './styles'

export const CompanyPage: React.FC = () => {
  const { oldCompany: company, presentation } = useLoaderData<CompanyPageData>()
  const [params] = useSearchParams()
  const page = Number(params.get('page') ?? 1)
  if (!company) {
    return null
  }
  const website = websiteUrl(company.website)
  const kinds = [
    company.is_bar && 'Бар',
    company.is_shop && 'Магазин',
    company.is_brewery && 'Пивоварня',
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <CompanyPageStyled>
      <Link to="/companies">Все заведения</Link>
      <h1 tabIndex={-1}>{company.name || 'Заведение без названия'}</h1>
      {kinds && <p>{kinds}</p>}
      {company.active === false && (
        <p role="note">Заведение отмечено как неактивное.</p>
      )}
      <p className="notice">
        Часы работы, цены и наличие пива уточняйте у заведения.
      </p>
      {presentation.image && (
        <img
          src={presentation.image}
          alt={company.name || 'Заведение'}
          className="cover"
        />
      )}
      {(company.address ||
        company.metro ||
        company.phone ||
        company.email ||
        website ||
        company.work_hours) && (
        <section aria-labelledby="company-contacts">
          <h2 id="company-contacts">Контакты</h2>
          <dl>
            {company.address && (
              <>
                <dt>Адрес</dt>
                <dd>{company.address}</dd>
              </>
            )}
            {company.metro && (
              <>
                <dt>Метро</dt>
                <dd>{company.metro}</dd>
              </>
            )}
            {company.phone && (
              <>
                <dt>Телефон</dt>
                <dd>{company.phone}</dd>
              </>
            )}
            {company.email && (
              <>
                <dt>Электронная почта</dt>
                <dd>{company.email}</dd>
              </>
            )}
            {website && (
              <>
                <dt>Сайт</dt>
                <dd>
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    {company.website}
                  </a>
                </dd>
              </>
            )}
            {company.work_hours && (
              <>
                <dt>Часы работы</dt>
                <dd>{company.work_hours}</dd>
              </>
            )}
          </dl>
        </section>
      )}
      {(presentation.html || presentation.gallery.length > 0) && (
        <section aria-labelledby="company-description">
          <h2 id="company-description">О заведении</h2>
          {presentation.html && <Content html={presentation.html} />}
          <div className="gallery">
            {presentation.gallery.map((src, index) => (
              <a href={src} key={src}>
                <img
                  src={src}
                  alt={`Фото заведения ${index + 1}`}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </section>
      )}
      {company.beers.length > 0 && (
        <section id="beersBlock" aria-labelledby="company-beers">
          <h2 id="company-beers">Пиво в заведении ({company.beersCount})</h2>
          <p>Цены и наличие уточняйте у заведения.</p>
          {company.beers.length > 0 && (
            <ul className="beers">
              {company.beers.map((item) => (
                <li key={item.id}>
                  {item.Beer?.beer_id ? (
                    <Link
                      to={objectPath(
                        'beer',
                        item.Beer.beer_id,
                        item.Beer.url_name,
                      )}
                    >
                      {item.Beer.name || 'Пиво'}
                    </Link>
                  ) : null}
                  {item.Beer?.manufacturer && (
                    <span>{item.Beer.manufacturer}</span>
                  )}
                  {item.price !== null && item.price !== undefined && (
                    <span>{item.price.toLocaleString('ru-RU')} ₽</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {company.beersCount > 20 && (
            <nav aria-label="Страницы ассортимента">
              {page > 1 && (
                <Link to={pageLink(company.uri, params.toString(), page - 1)}>
                  Назад
                </Link>
              )}
              <span>Страница {page}</span>
              {page * 20 < company.beersCount && (
                <Link to={pageLink(company.uri, params.toString(), page + 1)}>
                  Далее
                </Link>
              )}
            </nav>
          )}
        </section>
      )}
      {presentation.sections
        .filter((section) => section.items.length > 0)
        .map((section) => (
          <section id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            {section.items.length > 0 && (
              <ul>
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path}>{item.name}</Link>
                    {item.description && <p>{item.description}</p>}
                    {item.authors?.map((author) => (
                      <p key={author.path}>
                        Автор: <Link to={author.path}>{author.name}</Link>
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            )}
            {(section.pages || 1) > 1 && (
              <nav aria-label="Страницы комментариев">
                {(section.page || 1) > 1 && (
                  <Link
                    to={pageLink(
                      company.uri,
                      params.toString(),
                      (section.page || 1) - 1,
                      section.parameter,
                    )}
                  >
                    Назад
                  </Link>
                )}
                <span>
                  Страница {section.page} из {section.pages}
                </span>
                {(section.page || 1) < (section.pages || 1) && (
                  <Link
                    to={pageLink(
                      company.uri,
                      params.toString(),
                      (section.page || 1) + 1,
                      section.parameter,
                    )}
                  >
                    Далее
                  </Link>
                )}
              </nav>
            )}
          </section>
        ))}
    </CompanyPageStyled>
  )
}

export const CompanyError: React.FC = () => {
  const error = useRouteError()
  const missing = isRouteErrorResponse(error) && error.status === 404
  return (
    <CompanyPageStyled>
      <h1 tabIndex={-1}>
        {missing ? 'Заведение не найдено' : 'Не удалось загрузить заведение'}
      </h1>
      <p>
        {missing
          ? 'Проверьте адрес или выберите заведение в каталоге.'
          : 'Попробуйте обновить страницу позже.'}
      </p>
      <Link to="/companies">Все заведения</Link>
    </CompanyPageStyled>
  )
}
