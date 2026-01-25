import { Formik } from 'formik'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import { ToastContainer } from 'react-toastify'
import ChannelList from '../components/ChannelList'
import Header from '../components/Header'
import MessageInput from '../components/MessageInput'
import MessagesPanel from '../components/MessagesPanel'
import leoProfanity from '../profanity'
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
  } = useSelector(state => state.chat)
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

  const currentChannel = channels.find(channel => channel.id === currentChannelId)
  const channelMessages = messages.filter(message => message.channelId === currentChannelId)

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
          'Authorization': `Bearer ${token}`,
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
    setOpenDropdownId(current => (current === channelId ? null : channelId))
  }

  const handleSelectChannel = (channelId) => {
    dispatch(setCurrentChannelId(channelId))
    setOpenDropdownId(null)
  }

  const handleRemoveChannelClick = (channelId) => {
    setRemoveError(null)
    setRemovingChannelId(channelId)
    setOpenDropdownId(null)
  }

  const handleRenameChannelClick = (channelId) => {
    setOpenDropdownId(null)
    setRenamingChannelId(channelId)
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
      return !channels.some(channel => channel.name.toLowerCase() === normalized)
    },
  )

  const getRenameSchema = channelId => channelNameSchemaBase.test(
    'unique-except-current',
    t('validation.uniqueChannel'),
    (value) => {
      if (!value) {
        return true
      }
      const normalized = value.trim().toLowerCase()
      return !channels.some(channel => (
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
              <ChannelList
                channels={channels}
                currentChannelId={currentChannelId}
                openDropdownId={openDropdownId}
                onAddChannel={() => setIsAddingChannel(true)}
                onSelectChannel={handleSelectChannel}
                onToggleDropdown={toggleDropdown}
                onRemoveChannel={handleRemoveChannelClick}
                onRenameChannel={handleRenameChannelClick}
                t={t}
              />
              <div className="col p-0 h-100">
                <div className="d-flex flex-column h-100">
                  <MessagesPanel
                    currentChannelName={currentChannel?.name ?? ''}
                    messagesCount={channelMessages.length}
                    messages={channelMessages}
                    status={status}
                    error={error}
                    t={t}
                  />
                  <MessageInput
                    value={messageBody}
                    onChange={event => setMessageBody(event.target.value)}
                    onSubmit={handleSendMessage}
                    inputRef={messageInputRef}
                    sendError={sendError}
                    isSending={sendStatus === 'sending'}
                    isInputDisabled={!currentChannelId}
                    isSubmitDisabled={!messageBody.trim() || !currentChannelId}
                    t={t}
                  />
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
                            'Authorization': `Bearer ${token}`,
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
                      name: channels.find(channel => channel.id === renamingChannelId)?.name ?? '',
                    }}
                    validationSchema={yup.object({ name: getRenameSchema(renamingChannelId) })}
                    onSubmit={async (values, { setSubmitting, setStatus }) => {
                      setStatus(null)
                      try {
                        const response = await fetch(`/api/v1/channels/${renamingChannelId}`, {
                          method: 'PATCH',
                          headers: {
                            'Authorization': `Bearer ${token}`,
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
