import { User } from 'src/contracts'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { UsersStateInterface } from './state'

const actions: ActionTree<UsersStateInterface, StateInterface> = {
  someAction (/* context */) {
    // your code
  },
  async updateStateOrCreateUser ({ commit, dispatch }, { state, user }: { state: 'offline' | 'online' | 'DND', user: User }) {
    const isUserCreated = await dispatch('getMessageAuthorStatus', user.email)
    if (isUserCreated.length > 0) {
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
  },
  async updateChannelList ({ dispatch }) {
    console.log('in user')
    await dispatch('channels/leave', null, { root: true })
    await dispatch('auth/check', '', { root: true })
    // await dispatch('channels/getInvite', channel, { root: true })
  },
  async getInvite ({ dispatch }, { user, channel }: {user: User, channel: string}) {
    console.log('in user')
    // await dispatch('auth/check', '', { root: true })
    await dispatch('channels/getInvite', channel, { root: true })
    console.log(user)
    console.log(channel)
  }

}

export default actions
