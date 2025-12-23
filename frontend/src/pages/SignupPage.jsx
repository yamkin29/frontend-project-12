import { Formik } from 'formik'
import { useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import avatar from '../assets/avatar_1.jpg'
import Header from '../components/Header'

function SignupPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const signupInputRef = useRef(null)

  if (token) {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    signupInputRef.current?.focus()
  }, [])

  const signupSchema = yup.object({
    username: yup
      .string()
      .trim()
      .min(3, 'От 3 до 20 символов')
      .max(20, 'От 3 до 20 символов')
      .required('Обязательное поле'),
    password: yup
      .string()
      .min(6, 'Не менее 6 символов')
      .required('Обязательное поле'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Пароли должны совпадать')
      .required('Обязательное поле'),
  })

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
                      <img src={avatar} className="rounded-circle" alt="Регистрация" />
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
                            setStatus('Такой пользователь уже существует')
                            return
                          }
                          if (!response.ok) {
                            setStatus('Не удалось зарегистрироваться')
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
                      {({
                        errors,
                        handleChange,
                        handleSubmit,
                        isSubmitting,
                        status,
                        touched,
                        values,
                      }) => (
                        <form className="col-12 col-md-6 mt-3 mt-md-0" onSubmit={handleSubmit}>
                          <h1 className="text-center mb-4">Регистрация</h1>
                          {status && <div className="alert alert-danger">{status}</div>}
                          <div className="form-floating mb-3">
                            <input
                              name="username"
                              autoComplete="username"
                              required
                              placeholder="Ваш ник"
                              id="signup-username"
                              className={`form-control ${touched.username && errors.username ? 'is-invalid' : ''}`}
                              onChange={handleChange}
                              value={values.username}
                              ref={signupInputRef}
                            />
                            <label htmlFor="signup-username">Ваш ник</label>
                            {touched.username && errors.username && (
                              <div className="invalid-feedback">{errors.username}</div>
                            )}
                          </div>
                          <div className="form-floating mb-3">
                            <input
                              name="password"
                              autoComplete="new-password"
                              required
                              placeholder="Пароль"
                              type="password"
                              id="signup-password"
                              className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                              onChange={handleChange}
                              value={values.password}
                            />
                            <label htmlFor="signup-password">Пароль</label>
                            {touched.password && errors.password && (
                              <div className="invalid-feedback">{errors.password}</div>
                            )}
                          </div>
                          <div className="form-floating mb-4">
                            <input
                              name="confirmPassword"
                              autoComplete="new-password"
                              required
                              placeholder="Подтвердите пароль"
                              type="password"
                              id="signup-confirm"
                              className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                              onChange={handleChange}
                              value={values.confirmPassword}
                            />
                            <label htmlFor="signup-confirm">Подтвердите пароль</label>
                            {touched.confirmPassword && errors.confirmPassword && (
                              <div className="invalid-feedback">{errors.confirmPassword}</div>
                            )}
                          </div>
                          <button
                            type="submit"
                            className="w-100 mb-3 btn btn-outline-primary"
                            disabled={isSubmitting}
                          >
                            Зарегистрироваться
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
