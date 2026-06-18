import { supabase } from './supabase'

export const wishesService = {
  async getWishes({ category, search, page = 0, limit = 12 } = {}) {
    let query = supabase
      .from('wishes')
      .select(`*, users(id, name, avatar_url)`)
      .eq('status', 'Open')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getWishById(id) {
    const { data, error } = await supabase
      .from('wishes')
      .select(`*, users(id, name, avatar_url, bio)`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async getUserWishes(userId) {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async createWish({ userId, title, description, category, location, imageFile }) {
    let image_url = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('wish-images')
        .upload(fileName, imageFile)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('wish-images')
        .getPublicUrl(fileName)
      image_url = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from('wishes')
      .insert({ user_id: userId, title, description, category, location, image_url })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateWishStatus(wishId, status) {
    const { data, error } = await supabase
      .from('wishes')
      .update({ status })
      .eq('id', wishId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteWish(wishId) {
    const { error } = await supabase.from('wishes').delete().eq('id', wishId)
    if (error) throw error
  },

  async saveWish(userId, wishId) {
    const { error } = await supabase
      .from('saved_wishes')
      .insert({ user_id: userId, wish_id: wishId })
    if (error && error.code !== '23505') throw error
  },

  async unsaveWish(userId, wishId) {
    const { error } = await supabase
      .from('saved_wishes')
      .delete()
      .eq('user_id', userId)
      .eq('wish_id', wishId)
    if (error) throw error
  },

  async getSavedWishes(userId) {
    const { data, error } = await supabase
      .from('saved_wishes')
      .select(`*, wishes(*, users(id, name, avatar_url))`)
      .eq('user_id', userId)
    if (error) throw error
    return data.map(d => d.wishes)
  },

  async reportWish(wishId, reporterId, reason) {
    const { error } = await supabase
      .from('wish_reports')
      .insert({ wish_id: wishId, reporter_id: reporterId, reason })
    if (error) throw error
  }
}
