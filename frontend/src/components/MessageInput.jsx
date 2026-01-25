function MessageInput({
  value,
  onChange,
  onSubmit,
  inputRef,
  sendError,
  isSending,
  isInputDisabled,
  isSubmitDisabled,
  t,
}) {
  return (
    <div className="mt-auto px-5 py-3">
      {sendError && (
        <div className="alert alert-danger mb-2">
          {sendError}
        </div>
      )}
      <form noValidate className="py-1 border rounded-2" onSubmit={onSubmit}>
        <div className="input-group has-validation">
          <input
            name="body"
            aria-label={t('chat.newMessage')}
            placeholder={t('chat.messagePlaceholder')}
            className="border-0 p-0 ps-2 form-control"
            value={value}
            onChange={onChange}
            ref={inputRef}
            disabled={isInputDisabled || isSending}
          />
          <button
            type="submit"
            disabled={isSubmitDisabled || isSending}
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
  )
}

export default MessageInput
