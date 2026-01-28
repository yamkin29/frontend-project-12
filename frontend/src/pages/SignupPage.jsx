import { Formik } from 'formik'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import avatar from '../assets/avatar_1.jpg'
import Header from '../components/Header'
import createSignupSchema from '../validation/signupSchema'

function SignupPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const signupInputRef = useRef(null)
  const { t } = useTranslation()

  useEffect(() => {
    signupInputRef.current?.focus()
  }, [])

  if (token) {
    return <Navigate to="/" replace />
  }

  const signupSchema = createSignupSchema(t)

  return (
    <div className="h-100 bg-light">
      <div className="h-100" id="chat">
        <div className="d-flex flex-column h-100">
          <Header />
          <div className="container-fluid h-100">
            <div className="row justify-content-center align-content-center h-100">
              <div className="col-12 col-md-8 col-xxl-6">
                <div className="card shadow-sm">
                  <div className="card-body d-flex flex-column flex-md-row justify-content-around align-items-center p-5">
                    <div>
                      <img src={avatar} className="rounded-circle" alt={t('auth.signupTitle')} />
                    </div>
                    <Formik
                      initialValues={{ username: '', password: '', confirmPassword: '' }}
                      validationSchema={signupSchema}
                      onSubmit={async (values, { setSubmitting, setStatus }) => {
                        setStatus(null)
                        try {
                          const response = await fetch('/api/v1/signup', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              username: values.username.trim(),
                              password: values.password,
                            }),
                          })
                          if (response.status === 409) {
                            setStatus(t('auth.signupConflict'))
                            return
                          }
                          if (!response.ok) {
                            setStatus(t('auth.signupError'))
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
                        }
                        finally {
                          setSubmitting(false)
                        }
                      }}
                    >
                      {({
                        errors,
                        handleChange,
                        handleSubmit,
                        isSubmitting,
                        status,
                        touched,
                        values,
                      }) => (
                        <form className="w-50" onSubmit={handleSubmit}>
                          <h1 className="text-center mb-4">
                            {t('auth.signupTitle')}
                          </h1>
                          {status && (
                            <div className="alert alert-danger">
                              {status}
                            </div>
                          )}
                          <div className="form-floating mb-3 position-relative">
                            <input
                              name="username"
                              required
                              placeholder={t('auth.usernamePlaceholder')}
                              id="username"
                              className={`form-control ${touched.username && errors.username ? 'is-invalid' : ''}`}
                              onChange={handleChange}
                              value={values.username}
                              ref={signupInputRef}
                            />
                            <label className="form-label" htmlFor="username">
                              {t('auth.username')}
                            </label>
                            {touched.username && errors.username && (
                              <div className="invalid-tooltip">
                                {errors.username}
                              </div>
                            )}
                          </div>
                          <div className="form-floating mb-3 position-relative">
                            <input
                              name="password"
                              required
                              placeholder={t('auth.passwordPlaceholder')}
                              type="password"
                              id="password"
                              aria-describedby="passwordHelpBlock"
                              className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                              onChange={handleChange}
                              value={values.password}
                            />
                            <label className="form-label" htmlFor="password">
                              {t('auth.password')}
                            </label>
                            {touched.password && errors.password && (
                              <div className="invalid-tooltip">
                                {errors.password}
                              </div>
                            )}
                          </div>
                          <div className="form-floating mb-4 position-relative">
                            <input
                              name="confirmPassword"
                              required
                              placeholder={t('auth.confirmPasswordPlaceholder')}
                              type="password"
                              id="confirmPassword"
                              className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                              onChange={handleChange}
                              value={values.confirmPassword}
                            />
                            <label className="form-label" htmlFor="confirmPassword">
                              {t('auth.confirmPassword')}
                            </label>
                            {touched.confirmPassword && errors.confirmPassword && (
                              <div className="invalid-tooltip">
                                {errors.confirmPassword}
                              </div>
                            )}
                          </div>
                          <button
                            type="submit"
                            className="w-100 btn btn-outline-primary"
                            disabled={isSubmitting}
                          >
                            {t('auth.signupButton')}
                          </button>
                        </form>
                      )}
                    </Formik>
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

export default SignupPage
