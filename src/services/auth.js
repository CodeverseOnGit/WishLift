import { supabase } from './supabase'

export const authService = {
  async register({ name, email, password, role }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    // Insert profile immediately — before onAuthStateChange can fire and
    // try to load a profile row that doesn't exist yet.
    const { error: profileError } = await supabase
      .from('users')
      .insert({ id: data.user.id, name, email, role })
    if (profileError) throw profileError

    // Return the role alongside so AuthContext can set it directly
    // without needing a round-trip fetch.
    return { ...data, profile: { id: data.user.id, name, email, role } }
  },

  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }
}
