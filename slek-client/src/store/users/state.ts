import { User, UserStatus } from 'src/contracts'

export interface UsersStateInterface {
  users: { [userEmail: string]: User }
}

function state (): UsersStateInterface {
  return {
    users: {}
  }
}

export default state
