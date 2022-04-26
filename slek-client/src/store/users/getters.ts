import { User, UserStatus } from 'src/contracts'
import { GetterTree } from 'vuex'
import { StateInterface } from '../index'
import { UsersStateInterface } from './state'

const getters: GetterTree<UsersStateInterface, StateInterface> = {
  someGetter (/* context */) {
    // your code
  },
  getUserStatus (context, user:User) {
    const userToReturn = context.users[user.email]
    if (userToReturn === undefined) {
      return null
    } else {
      return userToReturn.userStatus
    }
  },
  getUserStatusByEmail (context, email: string) {
    const userToReturn = context.users[email]
    if (userToReturn === undefined) {
      return ''
    } else {
      return userToReturn.userStatus
    }
  },
  getUsers (context): { [userEmail: string]: User } {
    return context.users
  }
}

export default getters
