function ChannelListItem({
  channel,
  currentChannelId,
  openDropdownId,
  onSelectChannel,
  onToggleDropdown,
  onRemoveChannel,
  onRenameChannel,
  t,
}) {
  const buttonClass = channel.id === currentChannelId
    ? 'w-100 rounded-0 text-start btn btn-secondary'
    : 'w-100 rounded-0 text-start btn'

  if (!channel.removable) {
    return (
      <li className="nav-item w-100">
        <button
          type="button"
          className={`${buttonClass} text-truncate`}
          onClick={() => onSelectChannel(channel.id)}
        >
          <span className="me-1">
            #
          </span>
          {' '}
          {channel.name}
        </button>
      </li>
    )
  }

  return (
    <li className="nav-item w-100">
      <div role="group" className="d-flex dropdown btn-group position-relative">
        <button
          type="button"
          className={`${buttonClass} flex-grow-1 text-truncate`}
          onClick={() => onSelectChannel(channel.id)}
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
          onClick={() => onToggleDropdown(channel.id)}
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
              onRemoveChannel(channel.id)
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
              onRenameChannel(channel.id)
            }}
          >
            {t('channels.rename')}
          </a>
        </div>
      </div>
    </li>
  )
}

export default ChannelListItem
