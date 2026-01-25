function MessagesPanel({
  currentChannelName,
  messagesCount,
  messages,
  status,
  error,
  t,
}) {
  return (
    <>
      <div className="bg-light mb-4 p-3 shadow-sm small">
        <p className="m-0 text-truncate">
          <b>
            #
            {currentChannelName}
          </b>
        </p>
        <span className="text-muted">
          {t('chat.messagesCount', { count: messagesCount })}
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
        {status === 'succeeded' && messages.map(message => (
          <div key={message.id} className="text-break mb-2">
            <b>
              {message.username}
            </b>
            {': '}
            {message.body}
          </div>
        ))}
      </div>
    </>
  )
}

export default MessagesPanel
