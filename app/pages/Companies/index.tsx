import { useOldCompaniesQuery } from 'app/gql/generated/oldCompanies'
import React from 'react'
import { CompaniesPageView } from './View'

export const CompaniesPage: React.FC = () => {
  const response = useOldCompaniesQuery({
    variables: {
      // TODO: добавить переиспользуемый компонент пагинации
      take: 10,
      skip: 0,
    },
  })

  return (
    <>
      <h1 tabIndex={-1}>Заведения</h1>
      {response.loading && <p role="status">Загрузка заведений…</p>}
      {response.error && (
        <p role="alert">
          Не удалось загрузить заведения. Обновите страницу, чтобы попробовать
          снова.
        </p>
      )}
      {!response.loading &&
        !response.error &&
        !response.data?.oldCompanies.length && <p>Заведения не найдены.</p>}
      <CompaniesPageView companies={response.data?.oldCompanies ?? []} />
    </>
  )
}
