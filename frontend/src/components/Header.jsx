import { Link, useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login', { replace: true })
  }

  return (
    <nav className="shadow-sm navbar navbar-expand-lg navbar-light bg-white">
      <div className="container">
        <Link className="navbar-brand" to="/">Hexlet Chat</Link>
        {token && (
          <button type="button" className="btn btn-primary" onClick={handleLogout}>
            Выйти
          </button>
        )}
      </div>
    </nav>
  )
}

export default Header
