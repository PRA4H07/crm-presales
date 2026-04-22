function Input({ label, id, ...props }) {
  return (
    <label className="input__wrapper" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <input id={id} className="input" {...props} />
    </label>
  )
}

export default Input
