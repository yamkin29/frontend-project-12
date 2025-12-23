import { Formik } from 'formik'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import avatar from './assets/avatar.jpg'
import { addMessage, fetchChatData, setCurrentChannelId } from './slices/chatSlice'

function ChatPage() {
  const dispatch = useDispatch()
  const {
    channels,
    messages,
    currentChannelId,
    status,
    error,
  } = useSelector((state) => state.chat)
  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')
  const navigate = useNavigate()
  const [messageBody, setMessageBody] = useState('')
  const [sendStatus, setSendStatus] = useState('idle')
  const [sendError, setSendError] = useState(null)
  const messageInputRef = useRef(null)

  const currentChannel = channels.find((channel) => channel.id === currentChannelId)
  const channelMessages = messages.filter((message) => message.channelId === currentChannelId)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (token && status === 'idle') {
      dispatch(fetchChatData(token))
    }
  }, [dispatch, status, token])

  useEffect(() => {
    const socket = io()
    socket.on('newMessage', (payload) => {
      dispatch(addMessage(payload))
    })

    return () => {
      socket.disconnect()
    }
  }, [dispatch])

  useEffect(() => {
    if (currentChannelId) {
      messageInputRef.current?.focus()
    }
  }, [currentChannelId])

  const handleSendMessage = async (event) => {
    event.preventDefault()
    const trimmed = messageBody.trim()
    if (!trimmed || !currentChannelId || !token) {
      return
    }
    setSendStatus('sending')
    setSendError(null)
    try {
      const response = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: trimmed,
          channelId: currentChannelId,
          username,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      setMessageBody('')
    } catch (e) {
      setSendError('Не удалось отправить сообщение. Проверьте соединение.')
    } finally {
      setSendStatus('idle')
    }
  }

  return (
    <div className="h-100 bg-light">
      <div className="h-100" id="chat">
        <div className="d-flex flex-column h-100">
          <nav className="shadow-sm navbar navbar-expand-lg navbar-light bg-white">
            <div className="container">
              <Link className="navbar-brand" to="/">Hexlet Chat</Link>
              <button type="button" className="btn btn-primary" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </nav>
          <div className="container h-100 my-4 overflow-hidden rounded shadow">
            <div className="row h-100 bg-white flex-md-row">
              <div className="col-4 col-md-2 border-end px-0 bg-light flex-column h-100 d-flex">
                <div className="d-flex mt-1 justify-content-between mb-2 ps-4 pe-2 p-4">
                  <b>Каналы</b>
                  <button type="button" className="p-0 text-primary btn btn-group-vertical">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-plus-square"
                    >
                      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                    </svg>
                    <span className="visually-hidden">+</span>
                  </button>
                </div>
                <ul
                  id="channels-box"
                  className="nav flex-column nav-pills nav-fill px-2 mb-3 overflow-auto h-100 d-block"
                >
                  {channels.map((channel) => {
                    const buttonClass = channel.id === currentChannelId
                      ? 'w-100 rounded-0 text-start btn btn-secondary'
                      : 'w-100 rounded-0 text-start btn'
                    return (
                      <li className="nav-item w-100" key={channel.id}>
                        <button
                          type="button"
                          className={buttonClass}
                          onClick={() => dispatch(setCurrentChannelId(channel.id))}
                        >
                          <span className="me-1">#</span>
                          {channel.name}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="col p-0 h-100">
                <div className="d-flex flex-column h-100">
                  <div className="bg-light mb-4 p-3 shadow-sm small">
                    <p className="m-0">
                      <b>#{currentChannel?.name ?? ''}</b>
                    </p>
                    <span className="text-muted">{channelMessages.length} сообщений</span>
                  </div>
                  <div id="messages-box" className="chat-messages overflow-auto px-5">
                    {status === 'loading' && <div>Loading...</div>}
                    {status === 'failed' && <div className="text-danger">{error}</div>}
                    {status === 'succeeded' && channelMessages.map((message) => (
                      <div key={message.id} className="text-break mb-2">
                        <b>{message.username}</b>
                        {': '}
                        {message.body}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto px-5 py-3">
                    {sendError && <div className="alert alert-danger mb-2">{sendError}</div>}
                    <form noValidate className="py-1 border rounded-2" onSubmit={handleSendMessage}>
                      <div className="input-group has-validation">
                        <input
                          name="body"
                          aria-label="Новое сообщение"
                          placeholder="Введите сообщение..."
                          className="border-0 p-0 ps-2 form-control"
                          value={messageBody}
                          onChange={(event) => setMessageBody(event.target.value)}
                          ref={messageInputRef}
                        />
                        <button
                          type="submit"
                          disabled={!messageBody.trim() || sendStatus === 'sending' || !currentChannelId}
                          className="btn btn-group-vertical"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="bi bi-arrow-right-square"
                          >
                            <path
                              fillRule="evenodd"
                              d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"
                            />
                          </svg>
                          <span className="visually-hidden">Отправить</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="Toastify" />
      </div>
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  if (token) {
    return <Navigate to="/" replace />
  }

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
                            setStatus('Неверные имя пользователя или пароль')
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
                          <h1 className="text-center mb-4">Войти</h1>
                          {status && <div className="alert alert-danger">{status}</div>}
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
                          <button
                            type="submit"
                            className="w-100 mb-3 btn btn-outline-primary"
                            disabled={isSubmitting}
                          >
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

function ProtectedChatRoute() {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <ChatPage />
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ProtectedChatRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
