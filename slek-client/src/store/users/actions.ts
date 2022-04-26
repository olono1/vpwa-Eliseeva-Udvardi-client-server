import { User, UserStatus } from 'src/contracts'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { UsersStateInterface } from './state'

const actions: ActionTree<UsersStateInterface, StateInterface> = {
  someAction (/* context */) {
    // your code
  },
  async updateStateOrCreateUser ({ commit, getters, dispatch }, { state, user }: { state: 'offline' | 'online' | 'DND', user: User }) {
    const isUserCreated: Promise<string> = await dispatch('getMessageAuthorStatus', user.email)
    if (await isUserCreated) {
      commit('CHANGE_STATUS', { userStatus: state, user })
    } else {
      commit('NEW_USER', { userStatus: state, user })
    }
  },
  async getMessageAuthorStatus ({ getters }, email:string) {
    const usersAll: { [userEmail: string]: User; } = getters.getUsers
    const userToReturn = usersAll[email]
    if (userToReturn === undefined) {
      return ''
    } else {
      return userToReturn.userStatus
    }
  }

}

export default actions
