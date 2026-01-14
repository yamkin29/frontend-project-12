import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="h-100 bg-light">
      <div className="h-100" id="chat">
        <div className="d-flex flex-column h-100">
          <Header />
          <main className="container py-4">
            <h1>
              {t('notFound.title')}
            </h1>
            <p>
              {t('notFound.text')}
            </p>
            <Link to="/login">
              {t('notFound.toLogin')}
            </Link>
          </main>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
