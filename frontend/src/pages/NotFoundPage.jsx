import { Link } from 'react-router-dom'
import Header from '../components/Header'

function NotFoundPage() {
  return (
    <div className="h-100 bg-light">
      <div className="h-100" id="chat">
        <div className="d-flex flex-column h-100">
          <Header />
          <main className="container py-4">
            <h1>404</h1>
            <p>Page not found.</p>
            <Link to="/login">Go to login</Link>
          </main>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
