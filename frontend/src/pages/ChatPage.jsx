import { Formik } from 'formik'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'
import leoProfanity from '../profanity'
import * as yup from 'yup'
import { ToastContainer } from 'react-toastify'
import Header from '../components/Header'
import {
  addChannel,
  addMessage,
  fetchChatData,
  renameChannel,
  removeChannel,
  setCurrentChannelId,
} from '../slices/chatSlice'

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
  const { t } = useTranslation()
  const [messageBody, setMessageBody] = useState('')
  const [sendStatus, setSendStatus] = useState('idle')
  const [sendError, setSendError] = useState(null)
  const messageInputRef = useRef(null)
  const [isAddingChannel, setIsAddingChannel] = useState(false)
  const channelInputRef = useRef(null)
  const [removingChannelId, setRemovingChannelId] = useState(null)
  const [removeStatus, setRemoveStatus] = useState('idle')
  const [removeError, setRemoveError] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [renamingChannelId, setRenamingChannelId] = useState(null)
  const renameInputRef = useRef(null)
  const removeConfirmRef = useRef(null)

  const currentChannel = channels.find((channel) => channel.id === currentChannelId)
  const channelMessages = messages.filter((message) => message.channelId === currentChannelId)

  useEffect(() => {
    if (status === 'failed') {
      toast.error(t('chat.loadError'))
    }
  }, [status, t])

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
    socket.on('newChannel', (payload) => {
      dispatch(addChannel(payload))
    })
    socket.on('removeChannel', (payload) => {
      dispatch(removeChannel(payload.id))
    })
    socket.on('renameChannel', (payload) => {
      dispatch(renameChannel(payload))
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

  useEffect(() => {
    if (sendStatus === 'idle' && currentChannelId) {
      messageInputRef.current?.focus()
    }
  }, [currentChannelId, sendStatus])

  useEffect(() => {
    if (isAddingChannel) {
      channelInputRef.current?.focus()
    }
  }, [isAddingChannel])

  useEffect(() => {
    if (renamingChannelId) {
      renameInputRef.current?.focus()
    }
  }, [renamingChannelId])

  useEffect(() => {
    if (removingChannelId) {
      removeConfirmRef.current?.focus()
    }
  }, [removingChannelId])

  const handleSendMessage = async (event) => {
    event.preventDefault()
    const trimmed = leoProfanity.clean(messageBody.trim())
    if (!trimmed || !currentChannelId || !token) {
      return
    }
    setSendStatus('sending')
    setSendError(null)
    try {
      const response = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
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
    }
    catch {
      setSendError(t('chat.sendError'))
      toast.error(t('chat.sendError'))
    }
    finally {
      setSendStatus('idle')
    }
  }

  const toggleDropdown = (channelId) => {
    setOpenDropdownId((current) => (current === channelId ? null : channelId))
  }

  const handleRemoveChannel = async () => {
    if (!removingChannelId || !token) {
      return
    }
    setRemoveStatus('removing')
    setRemoveError(null)
    try {
      const response = await fetch(`/api/v1/channels/${removingChannelId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to remove channel')
      }
      dispatch(removeChannel(removingChannelId))
      toast.success(t('channels.removeSuccess'))
      setRemovingChannelId(null)
    }
    catch {
      setRemoveError(t('channels.removeError'))
      toast.error(t('channels.removeError'))
    }
    finally {
      setRemoveStatus('idle')
    }
  }

  const closeRemoveModal = () => {
    setRemovingChannelId(null)
    setRemoveError(null)
  }

  const channelNameSchemaBase = yup
    .string()
    .trim()
    .min(3, t('validation.nameLength'))
    .max(20, t('validation.nameLength'))
    .required(t('validation.required'))

  const addChannelSchema = channelNameSchemaBase.test(
    'unique',
    t('validation.uniqueChannel'),
    (value) => {
      if (!value) {
        return true
      }
      const normalized = value.trim().toLowerCase()
      return !channels.some((channel) => channel.name.toLowerCase() === normalized)
    },
  )

  const getRenameSchema = (channelId) => channelNameSchemaBase.test(
    'unique-except-current',
    t('validation.uniqueChannel'),
    (value) => {
      if (!value) {
        return true
      }
      const normalized = value.trim().toLowerCase()
      return !channels.some((channel) => (
        channel.id !== channelId && channel.name.toLowerCase() === normalized
      ))
    },
  )

  const closeRenameModal = () => {
    setRenamingChannelId(null)
  }

  return (
    <div className="h-100 bg-light">
      <div className="h-100" id="chat">
        <div className="d-flex flex-column h-100">
          <Header />
          <div className="container h-100 my-4 overflow-hidden rounded shadow">
            <div className="row h-100 bg-white flex-md-row">
              <div className="col-4 col-md-2 border-end px-0 bg-light flex-column h-100 d-flex">
                <div className="d-flex mt-1 justify-content-between mb-2 ps-4 pe-2 p-4">
                  <b>
                    {t('channels.title')}
                  </b>
                  <button
                    type="button"
                    className="p-0 text-primary btn btn-group-vertical"
                    onClick={() => setIsAddingChannel(true)}
                  >
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
                    <span className="visually-hidden">
                      +
                    </span>
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
                        {channel.removable
                          ? (
                            <div role="group" className="d-flex dropdown btn-group position-relative">
                              <button
                                type="button"
                                className={`${buttonClass} flex-grow-1 text-truncate`}
                                onClick={() => {
                                  dispatch(setCurrentChannelId(channel.id))
                                  setOpenDropdownId(null)
                                }}
                              >
                                <span className="me-1">
                                  #
                                </span>
                                {' '}
                                {channel.name}
                              </button>
                              <button
                                type="button"
                                id={`channel-controls-${channel.id}`}
                                className={`flex-grow-0 dropdown-toggle dropdown-toggle-split btn ${channel.id === currentChannelId ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                aria-expanded={openDropdownId === channel.id}
                                onClick={() => toggleDropdown(channel.id)}
                              >
                                <span className="visually-hidden">
                                  {t('channels.manage')}
                                </span>
                              </button>
                              <div
                                className={`dropdown-menu dropdown-menu-end position-absolute top-100 end-0 ${openDropdownId === channel.id ? 'show' : ''}`}
                                aria-labelledby={`channel-controls-${channel.id}`}
                              >
                                <a
                                  className="dropdown-item"
                                  role="button"
                                  tabIndex={0}
                                  href="#"
                                  onClick={(event) => {
                                    event.preventDefault()
                                    setRemoveError(null)
                                    setRemovingChannelId(channel.id)
                                    setOpenDropdownId(null)
                                  }}
                                >
                                  {t('channels.remove')}
                                </a>
                                <a
                                  className="dropdown-item"
                                  role="button"
                                  tabIndex={0}
                                  href="#"
                                  onClick={(event) => {
                                    event.preventDefault()
                                    setOpenDropdownId(null)
                                    setRenamingChannelId(channel.id)
                                  }}
                                >
                                  {t('channels.rename')}
                                </a>
                              </div>
                            </div>
                          )
                          : (
                            <button
                              type="button"
                              className={`${buttonClass} text-truncate`}
                              onClick={() => dispatch(setCurrentChannelId(channel.id))}
                            >
                              <span className="me-1">
                                #
                              </span>
                              {' '}
                              {channel.name}
                            </button>
                          )}
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="col p-0 h-100">
                <div className="d-flex flex-column h-100">
                  <div className="bg-light mb-4 p-3 shadow-sm small">
                    <p className="m-0 text-truncate">
                      <b>
                        #
                        {currentChannel?.name ?? ''}
                      </b>
                    </p>
                    <span className="text-muted">
                      {t('chat.messagesCount', { count: channelMessages.length })}
                    </span>
                  </div>
                  <div id="messages-box" className="chat-messages overflow-auto px-5">
                    {status === 'loading' && (
                      <div>
                        {t('common.loading')}
                      </div>
                    )}
                    {status === 'failed' && (
                      <div className="text-danger">
                        {error}
                      </div>
                    )}
                    {status === 'succeeded' && channelMessages.map((message) => (
                      <div key={message.id} className="text-break mb-2">
                        <b>
                          {message.username}
                        </b>
                        {': '}
                        {message.body}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto px-5 py-3">
                    {sendError && (
                      <div className="alert alert-danger mb-2">
                        {sendError}
                      </div>
                    )}
                    <form noValidate className="py-1 border rounded-2" onSubmit={handleSendMessage}>
                      <div className="input-group has-validation">
                        <input
                          name="body"
                          aria-label={t('chat.newMessage')}
                          placeholder={t('chat.messagePlaceholder')}
                          className="border-0 p-0 ps-2 form-control"
                          value={messageBody}
                          onChange={(event) => setMessageBody(event.target.value)}
                          ref={messageInputRef}
                          disabled={sendStatus === 'sending' || !currentChannelId}
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
                          <span className="visually-hidden">
                            {t('channels.send')}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isAddingChannel && (
          <>
            <div className="modal fade show d-block" role="dialog" aria-modal="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <Formik
                    initialValues={{ name: '' }}
                    validationSchema={yup.object({ name: addChannelSchema })}
                    onSubmit={async (values, { resetForm, setSubmitting, setStatus }) => {
                      setStatus(null)
                      try {
                        const response = await fetch('/api/v1/channels', {
                          method: 'POST',
                          headers: {
                            "Authorization": `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ name: leoProfanity.clean(values.name.trim()) }),
                        })
                        if (!response.ok) {
                          setStatus(t('channels.addError'))
                          toast.error(t('channels.addError'))
                          return
                        }
                        const data = await response.json()
                        dispatch(addChannel(data))
                        dispatch(setCurrentChannelId(data.id))
                        toast.success(t('channels.addSuccess'))
                        resetForm()
                        setIsAddingChannel(false)
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
                      <>
                        <div className="modal-header">
                          <div className="modal-title h4">
                            {t('channels.addTitle')}
                          </div>
                          <button
                            type="button"
                            aria-label="Close"
                            className="btn btn-close"
                            onClick={() => setIsAddingChannel(false)}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="modal-body">
                          <form onSubmit={handleSubmit}>
                            <div>
                              <input
                                name="name"
                                id="name"
                                className={`mb-2 form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                                value={values.name}
                                onChange={handleChange}
                                ref={channelInputRef}
                              />
                              <label className="visually-hidden" htmlFor="name">
                                {t('channels.nameLabel')}
                              </label>
                              {status && (
                                <div className="invalid-feedback d-block">
                                  {status}
                                </div>
                              )}
                              {touched.name && errors.name && (
                                <div className="invalid-feedback d-block">
                                  {errors.name}
                                </div>
                              )}
                              <div className="d-flex justify-content-end">
                                <button
                                  type="button"
                                  className="me-2 btn btn-secondary"
                                  onClick={() => setIsAddingChannel(false)}
                                  disabled={isSubmitting}
                                >
                                  {t('channels.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                  {t('channels.submit')}
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" />
          </>
        )}
        {removingChannelId && (
          <>
            <div className="modal fade show d-block" role="dialog" aria-modal="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <div className="modal-title h4">
                      {t('channels.removeTitle')}
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      className="btn btn-close"
                      onClick={closeRemoveModal}
                      disabled={removeStatus === 'removing'}
                    />
                  </div>
                  <div className="modal-body">
                    <p className="lead">
                      {t('channels.confirmRemove')}
                    </p>
                    {removeError && (
                      <div className="alert alert-danger">
                        {removeError}
                      </div>
                    )}
                    <div className="d-flex justify-content-end">
                      <button
                        type="button"
                        className="me-2 btn btn-secondary"
                        onClick={closeRemoveModal}
                        disabled={removeStatus === 'removing'}
                      >
                        {t('channels.cancel')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleRemoveChannel}
                        disabled={removeStatus === 'removing'}
                        ref={removeConfirmRef}
                      >
                        {t('channels.remove')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" />
          </>
        )}
        {renamingChannelId && (
          <>
            <div className="modal fade show d-block" role="dialog" aria-modal="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <Formik
                    initialValues={{
                      name: channels.find((channel) => channel.id === renamingChannelId)?.name ?? '',
                    }}
                    validationSchema={yup.object({ name: getRenameSchema(renamingChannelId) })}
                    onSubmit={async (values, { setSubmitting, setStatus }) => {
                      setStatus(null)
                      try {
                        const response = await fetch(`/api/v1/channels/${renamingChannelId}`, {
                          method: 'PATCH',
                          headers: {
                            "Authorization": `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ name: leoProfanity.clean(values.name.trim()) }),
                        })
                        if (!response.ok) {
                          setStatus(t('channels.renameError'))
                          toast.error(t('channels.renameError'))
                          return
                        }
                        const data = await response.json()
                        dispatch(renameChannel(data))
                        toast.success(t('channels.renameSuccess'))
                        closeRenameModal()
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
                      <>
                        <div className="modal-header">
                          <div className="modal-title h4">
                            {t('channels.renameTitle')}
                          </div>
                          <button
                            type="button"
                            aria-label="Close"
                            className="btn btn-close"
                            onClick={closeRenameModal}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="modal-body">
                          <form onSubmit={handleSubmit}>
                            <div>
                              <input
                                name="name"
                                id="name"
                                className={`mb-2 form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                                value={values.name}
                                onChange={handleChange}
                                ref={renameInputRef}
                              />
                              <label className="visually-hidden" htmlFor="name">
                                {t('channels.nameLabel')}
                              </label>
                              {status && (
                                <div className="invalid-feedback d-block">
                                  {status}
                                </div>
                              )}
                              {touched.name && errors.name && (
                                <div className="invalid-feedback d-block">
                                  {errors.name}
                                </div>
                              )}
                              <div className="d-flex justify-content-end">
                                <button
                                  type="button"
                                  className="me-2 btn btn-secondary"
                                  onClick={closeRenameModal}
                                  disabled={isSubmitting}
                                >
                                  {t('channels.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                  {t('channels.submit')}
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" />
          </>
        )}
        <ToastContainer />
      </div>
    </div>
  )
}

export default ChatPage
