export type LoginUser = {
  username: string
  display_name: string
}

export type Profile = {
  user_id: string
  username: string
  display_name: string
  role: 'admin' | 'view_only' | string
  is_active: boolean
}
