export interface ApiToken {
  type: 'bearer'
  token: string
  expires_at?: string
  expires_in?: number
}

export interface RegisterData {
  email: string
  fullname: string
  nickname: string
  password: string
  passwordConfirmation: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember: boolean
}

export interface Channel {
  id: number,
  name: string
}

export interface User {
  id: number
  email: string,
  nickname: string,
  fullname: string,
  channels: Array<Channel>,
  userStatus: 'online' | 'offline' | 'DND'
  createdAt: string,
  updatedAt: string
}

export interface UserStatus {
  email: string,
  userStatus: 'online' | 'offline' | 'DND'
}
