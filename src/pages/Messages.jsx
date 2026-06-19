import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { messagesService } from '../services/messages'
import MessageBubble from '../components/MessageBubble'
import './Messages.css'

export default function Messages() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const subscriptionRef = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [user])

  useEffect(() => {
    if (conversationId && conversations.length) {
      const conv = conversations.find(c => c.id === conversationId)
      if (conv) selectConversation(conv)
    } else if (!activeConv && conversations.length) {
      selectConversation(conversations[0])
    }
  }, [conversationId, conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations() {
    if (!user) return
    try {
      const convs = await messagesService.getConversations(user.id)
      setConversations(convs)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function selectConversation(conv) {
    setActiveConv(conv)
    try {
      const msgs = await messagesService.getMessages(conv.id)
      setMessages(msgs)
    } catch (err) { console.error(err) }

    // Subscribe to realtime
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe()
    subscriptionRef.current = messagesService.subscribeToMessages(conv.id, payload => {
      setMessages(prev => [...prev, payload.new])
    })
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !activeConv) return
    setSending(true)
    const text = newMessage
    setNewMessage('')
    
    // Create optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConv.id,
      sender_id: user.id,
      message: text,
      created_at: new Date().toISOString(),
      users: { id: user.id, name: user.user_metadata?.name || user.email, avatar_url: user.user_metadata?.avatar_url }
    }
    
    // Add to UI immediately
    setMessages(prev => [...prev, optimisticMessage])
    
    try {
      await messagesService.sendMessage(activeConv.id, user.id, text)
    } catch (err) { 
      console.error(err)
      setNewMessage(text)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
    }
    finally { setSending(false) }
  }

  function getOtherUser(conv) {
    if (!conv) return null
    return conv.user_one === user?.id ? conv.user_two_profile : conv.user_one_profile
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-dark" />
    </div>
  )

  return (
    <div className="messages-page">
      <div className="container">
        <div className="messages-layout">
          {/* Sidebar */}
          <div className="conversations-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Messages</h2>
            </div>
            {conversations.length === 0 ? (
              <div className="sidebar-empty">
                <p>No conversations yet.</p>
                <p>Accept a contact request to start chatting.</p>
                <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>Go to Dashboard</Link>
              </div>
            ) : (
              <div className="conversations-list">
                {conversations.map(conv => {
                  const other = getOtherUser(conv)
                  return (
                    <button
                      key={conv.id}
                      className={`conversation-item ${activeConv?.id === conv.id ? 'active' : ''}`}
                      onClick={() => selectConversation(conv)}
                    >
                      <div className="conv-avatar">
                        {other?.avatar_url
                          ? <img src={other.avatar_url} alt={other.name} />
                          : <div className="conv-avatar-placeholder">{other?.name?.[0]?.toUpperCase()}</div>
                        }
                      </div>
                      <div className="conv-info">
                        <div className="conv-name">{other?.name}</div>
                        <div className="conv-preview">Tap to view conversation</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chat area */}
          <div className="chat-area">
            {!activeConv ? (
              <div className="chat-empty">
                <div style={{ fontSize: '3rem' }}>💬</div>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the sidebar to start chatting.</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="chat-header">
                  {(() => {
                    const other = getOtherUser(activeConv)
                    return (
                      <>
                        <div className="chat-header-avatar">
                          {other?.avatar_url
                            ? <img src={other.avatar_url} alt={other.name} />
                            : <div className="conv-avatar-placeholder">{other?.name?.[0]?.toUpperCase()}</div>
                          }
                        </div>
                        <div>
                          <div className="chat-header-name">{other?.name}</div>
                          <div className="chat-header-status">🟢 Connected</div>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Messages */}
                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <div className="chat-no-messages">
                      <p>No messages yet. Say hello! 👋</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user.id} />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-area" onSubmit={sendMessage}>
                  <input
                    className="chat-input"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    autoFocus
                  />
                  <button type="submit" className="btn btn-primary chat-send-btn" disabled={!newMessage.trim() || sending}>
                    {sending ? <span className="spinner" /> : '➤'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
