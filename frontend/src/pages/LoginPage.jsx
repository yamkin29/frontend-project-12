import { Formik } from 'formik'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import avatar from '../assets/avatar.jpg'
import Header from '../components/Header'

function LoginPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const loginInputRef = useRef(null)
  const { t } = useTranslation()

  if (token) {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    loginInputRef.current?.focus()
  }, [])

  return (
    <div className="h-100 bg-light">
      <div className="h-100" id="chat">
        <div className="d-flex flex-column h-100">
          <Header />
          <div className="container-fluid h-100">
            <div className="row justify-content-center align-content-center h-100">
              <div className="col-12 col-md-8 col-xxl-6">
                <div className="card shadow-sm">
                  <div className="card-body row p-5">
                    <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
                      <img src={avatar} className="rounded-circle" alt={t('auth.login')} />
                    </div>
                    <Formik
                      initialValues={{ username: '', password: '' }}
                      onSubmit={async (values, { setSubmitting, setStatus }) => {
                        setStatus(null)
                        try {
                          const response = await fetch('/api/v1/login', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(values),
                          })
                          if (!response.ok) {
                            setStatus(t('auth.loginError'))
                            return
                          }
                          const data = await response.json()
                          if (data?.token) {
                            localStorage.setItem('token', data.token)
                            if (data.username) {
                              localStorage.setItem('username', data.username)
                            }
                            navigate('/', { replace: true })
                          }
                        } finally {
                          setSubmitting(false)
                        }
                      }}
                    >
                      {({ handleChange, handleSubmit, isSubmitting, status, values }) => (
                        <form className="col-12 col-md-6 mt-3 mt-md-0" onSubmit={handleSubmit}>
                          <h1 className="text-center mb-4">{t('auth.login')}</h1>
                          {status && <div className="alert alert-danger">{status}</div>}
                          <div className="form-floating mb-3">
                            <input
                              name="username"
                              autoComplete="username"
                              required
                              placeholder={t('auth.nicknamePlaceholder')}
                              id="username"
                              className="form-control"
                              onChange={handleChange}
                              value={values.username}
                              ref={loginInputRef}
                            />
                            <label htmlFor="username">{t('auth.username')}</label>
                          </div>
                          <div className="form-floating mb-4">
                            <input
                              name="password"
                              autoComplete="current-password"
                              required
                              placeholder={t('auth.password')}
                              type="password"
                              id="password"
                              className="form-control"
                              onChange={handleChange}
                              value={values.password}
                            />
                            <label className="form-label" htmlFor="password">{t('auth.password')}</label>
                          </div>
                          <button
                            type="submit"
                            className="w-100 mb-3 btn btn-outline-primary"
                            disabled={isSubmitting}
                          >
                            {t('auth.login')}
                          </button>
                        </form>
                      )}
                    </Formik>
                  </div>
                  <div className="card-footer p-4">
                    <div className="text-center">
                      <span>{t('auth.noAccount')}</span>{' '}
                      <Link to="/signup">{t('auth.signup')}</Link>
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

export default LoginPage
