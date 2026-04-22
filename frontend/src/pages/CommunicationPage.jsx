import { Check, CheckCheck, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { communicationService } from '../services/communicationService'
import { formatDateTime } from '../utils/formatters'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'sent', label: 'Sent' },
  { id: 'received', label: 'Received' },
]

const TIMELINE_STYLES = {
  email: 'bg-blue-50 text-blue-700 ring-blue-200',
  note: 'bg-blue-50 text-blue-700 ring-blue-200',
  interaction: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

const STATUS_STYLES = {
  sent: 'bg-slate-100 text-slate-700',
  delivered: 'bg-amber-50 text-amber-700',
  read: 'bg-emerald-50 text-emerald-700',
}

function MessageStatusIcon({ status, isSent }) {
  if (!isSent) {
    return null
  }

  if (status === 'read') {
    return <CheckCheck size={14} className="text-fuchsia-200" aria-label="read" />
  }

  if (status === 'delivered') {
    return <CheckCheck size={14} className="text-blue-100" aria-label="delivered" />
  }

  return <Check size={14} className="text-blue-100" aria-label="sent" />
}

function formatTimeOnly(dateString) {
  if (!dateString) {
    return '-'
  }

  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getCleanMessageText(message) {
  const rawText = String(message?.content ?? message?.text ?? message?.body ?? '')
  return rawText
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .trim()
}

function normalizeMessages(messages = []) {
  return messages
    .map((msg) => {
      const text = getCleanMessageText(msg)
      return {
        ...msg,
        content: text,
        text,
        direction: String(msg?.direction || 'received')
          .trim()
          .toLowerCase(),
        createdAt: msg?.createdAt || new Date().toISOString(),
      }
    })
    .filter((msg) => {
      if (!msg) {
        return false
      }
      const visibleText = String(msg.content || msg.text || '').replace(/\s/g, '')
      return visibleText.length > 0
    })
}

function CommunicationPage() {
  const [filter, setFilter] = useState('all')
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [activeConversation, setActiveConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    async function loadConversations() {
      const response = await communicationService.getCommunications({ filter })
      const list = response.data || []
      setConversations(list)

      if (!list.length) {
        setActiveConversationId(null)
        setActiveConversation(null)
        return
      }

      setActiveConversationId((previous) =>
        list.some((item) => item.id === previous) ? previous : list[0].id,
      )
    }

    loadConversations()
  }, [filter])

  useEffect(() => {
    async function loadConversationDetails() {
      if (!activeConversationId) {
        setActiveConversation(null)
        return
      }

      const response = await communicationService.getCommunicationById(activeConversationId)
      const details = response.data || null
      if (!details) {
        setActiveConversation(null)
        return
      }

      setActiveConversation({
        ...details,
        messages: normalizeMessages(details.messages || []),
      })
    }

    loadConversationDetails()
  }, [activeConversationId])

  const activeSummary = useMemo(
    () => conversations.find((item) => item.id === activeConversationId),
    [activeConversationId, conversations],
  )
  const validMessages = useMemo(() => {
    return normalizeMessages(activeConversation?.messages || [])
  }, [activeConversation])

  async function handleSendMessage(event) {
    event.preventDefault()
    const messageToSend = getCleanMessageText({ text: newMessage })
    if (!messageToSend || !activeConversationId) {
      return
    }

    const optimisticMessage = {
      id: `local_${Date.now()}`,
      direction: 'sent',
      content: messageToSend,
      text: messageToSend,
      body: messageToSend,
      createdAt: new Date().toISOString(),
      status: 'sent',
    }

    setActiveConversation((previous) => {
      if (!previous) {
        return previous
      }

      return {
        ...previous,
        messages: normalizeMessages([...(previous.messages || []), optimisticMessage]),
      }
    })

    setNewMessage('')

    await communicationService.sendCommunication({
      conversationId: activeConversationId,
      to: activeSummary?.contactName || '',
      subject: activeConversation?.subject || '',
      body: messageToSend,
    })
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Communication
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage lead/client conversations, engagement history, and email delivery status.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Inbox</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {conversations.length} conversation{conversations.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="border-b border-slate-200 p-4">
            <div className="flex gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === item.id
                    ? 'crm-gradient-soft'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
            </div>
          </div>

          <div className="max-h-[620px] overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveConversationId(conversation.id)}
                className={`block w-full rounded-xl border px-3 py-3 text-left transition ${
                  conversation.id === activeConversationId
                    ? 'border-violet-200 crm-gradient-soft shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {conversation.contactName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {conversation.subject}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-slate-400">
                    {formatTimeOnly(conversation.lastMessageAt)}
                  </span>
                </div>
              </button>
            ))}
            </div>
          </div>
        </aside>

        <div className="grid gap-4 2xl:grid-cols-[1fr_320px]">
          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 px-4 py-3 md:px-5 md:py-4">
              <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-slate-900">
                {activeConversation?.subject || 'Select a conversation'}
              </h2>
              <p className="text-sm text-slate-500">
                {activeSummary ? `Thread with ${activeSummary.contactName}` : 'No thread selected'}
              </p>
              </div>
            </header>

            <div className="h-[430px] overflow-y-auto bg-slate-50/60 px-4 py-4 md:px-5">
              <div className="flex flex-col gap-3">
                {validMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.direction === 'sent' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[65%] ${
                      message.direction === 'sent'
                        ? 'crm-gradient-bg rounded-br-md text-white shadow-sm'
                        : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div
                      className={`mt-1.5 flex items-center justify-end gap-1.5 text-[11px] ${
                        message.direction === 'sent' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      <span>{formatTimeOnly(message.createdAt)}</span>
                      <MessageStatusIcon
                        status={message.status}
                        isSent={message.direction === 'sent'}
                      />
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white px-4 py-3 md:px-5">
              <div className="flex w-full items-center gap-2">
                <input
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Write a reply..."
                  className="crm-focus-ring h-11 w-full min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:bg-white"
                />
                <button
                  type="submit"
                  className="crm-gradient-bg crm-gradient-bg-hover grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white transition"
                  aria-label="send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </article>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Activity Timeline</h3>
            <div className="mt-3 max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {(activeConversation?.timeline || []).map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold capitalize ring-1 ${TIMELINE_STYLES[event.type] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}
                    >
                      {event.type}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-medium capitalize ${STATUS_STYLES[event.status] || 'bg-slate-100 text-slate-700'}`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{event.description}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatDateTime(event.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default CommunicationPage
