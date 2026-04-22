function Modal({ title, isOpen, onClose, children }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h3>{title}</h3>
          <button className="icon-button" type="button" onClick={onClose}>
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
