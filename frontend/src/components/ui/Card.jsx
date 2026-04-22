function Card({ title, children, action }) {
  return (
    <section className="card">
      {(title || action) && (
        <header className="card__header">
          {title ? <h3>{title}</h3> : <span />}
          {action}
        </header>
      )}
      <div>{children}</div>
    </section>
  )
}

export default Card
