import { Formik } from 'formik'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import avatar from './assets/avatar.jpg'

function ChatPage() {
  return (
    <main>
      <h1>Chat</h1>
      <p>Welcome to the chat. Authorization is required to post messages.</p>
    </main>
  )
}

function LoginPage() {
  return (
    <div className="h-100 bg-light">
      <div className="h-100" id="chat">
        <div className="d-flex flex-column h-100">
          <nav className="shadow-sm navbar navbar-expand-lg navbar-light bg-white">
            <div className="container">
              <Link className="navbar-brand" to="/">Hexlet Chat</Link>
            </div>
          </nav>
          <div className="container-fluid h-100">
            <div className="row justify-content-center align-content-center h-100">
              <div className="col-12 col-md-8 col-xxl-6">
                <div className="card shadow-sm">
                  <div className="card-body row p-5">
                    <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
                      <img src={avatar} className="rounded-circle" alt="Войти" />
                    </div>
                    <Formik initialValues={{ username: '', password: '' }} onSubmit={() => {}}>
                      {({ handleChange, handleSubmit, values }) => (
                        <form className="col-12 col-md-6 mt-3 mt-md-0" onSubmit={handleSubmit}>
                          <h1 className="text-center mb-4">Войти</h1>
                          <div className="form-floating mb-3">
                            <input
                              name="username"
                              autoComplete="username"
                              required
                              placeholder="Ваш ник"
                              id="username"
                              className="form-control"
                              onChange={handleChange}
                              value={values.username}
                            />
                            <label htmlFor="username">Ваш ник</label>
                          </div>
                          <div className="form-floating mb-4">
                            <input
                              name="password"
                              autoComplete="current-password"
                              required
                              placeholder="Пароль"
                              type="password"
                              id="password"
                              className="form-control"
                              onChange={handleChange}
                              value={values.password}
                            />
                            <label className="form-label" htmlFor="password">Пароль</label>
                          </div>
                          <button type="submit" className="w-100 mb-3 btn btn-outline-primary">
                            Войти
                          </button>
                        </form>
                      )}
                    </Formik>
                  </div>
                  <div className="card-footer p-4">
                    <div className="text-center">
                      <span>Нет аккаунта?</span>{' '}
                      <Link to="/signup">Регистрация</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <main>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/login">Go to login</Link>
    </main>
  )
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
