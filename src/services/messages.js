import { supabase } from './supabase'

export const messagesService = {
  async getContactRequests(userId, role) {
    let query = supabase
      .from('contact_requests')
      .select(`*, wishes(id, title, image_url), users!contact_requests_helper_id_fkey(id, name, avatar_url)`)
      .order('created_at', { ascending: false })

    if (role === 'recipient') {
      query = query.eq('recipient_id', userId)
    } else {
      query = query.eq('helper_id', userId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async sendContactRequest(wishId, helperId, recipientId, message) {
    const { data, error } = await supabase
      .from('contact_requests')
      .insert({ wish_id: wishId, helper_id: helperId, recipient_id: recipientId, message })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateContactRequest(requestId, status) {
    const { data, error } = await supabase
      .from('contact_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single()
    if (error) throw error

    if (status === 'Accepted') {
      const req = data
      await this.getOrCreateConversation(req.helper_id, req.recipient_id)
    }

    return data
  },

  async getOrCreateConversation(userOne, userTwo) {
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user_one.eq.${userOne},user_two.eq.${userTwo}),and(user_one.eq.${userTwo},user_two.eq.${userOne})`)
      .maybeSingle()

    if (existing) return existing

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_one: userOne, user_two: userTwo })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getConversations(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`*, user_one_profile:users!conversations_user_one_fkey(id, name, avatar_url), user_two_profile:users!conversations_user_two_fkey(id, name, avatar_url)`)
      .or(`user_one.eq.${userId},user_two.eq.${userId}`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, users(id, name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async sendMessage(conversationId, senderId, message) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, message })
      .select()
      .single()
    if (error) throw error
    return data
  },

  subscribeToMessages(conversationId, callback) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe()
  }
}
