import { STATUS_COLORS } from '../../constants/theme'

function Badge({ label, tone = 'neutral' }) {
  const mappedTone = STATUS_COLORS[label] || tone
  return <span className={`badge badge--${mappedTone}`}>{label}</span>
}

export default Badge
