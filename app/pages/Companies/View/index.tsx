import type { OldCompanyNoNestingFragment } from 'app/gql/generated/OldCompanyNoNesting'
import { Link } from 'react-router'
import { CompaniesPageViewStyled } from './styles'

type CompaniesPageViewProps = {
  companies: OldCompanyNoNestingFragment[]
}

export const CompaniesPageView: React.FC<CompaniesPageViewProps> = ({
  companies,
}) => {
  return (
    <CompaniesPageViewStyled>
      {companies.map((n) => {
        return (
          <article key={n.id}>
            <h2>
              <Link to={n.uri}>{n.name || 'Заведение без названия'}</Link>
            </h2>
            {n.address && <p>{n.address}</p>}
          </article>
        )
      })}
    </CompaniesPageViewStyled>
  )
}
