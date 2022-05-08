import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { AuthStateInterface } from './state'
import { authService, authManager, channelService, activityService } from 'src/services'
import { LoginCredentials, RegisterData } from 'src/contracts'

const actions: ActionTree<AuthStateInterface, StateInterface> = {
  async check ({ commit, dispatch }) {
    console.log('CHECK!')
    try {
      commit('AUTH_START')
      const user = await authService.me()
      try {
        const responseJoin = await channelService.getJoinedChannels()
        const responseInvites = await channelService.getInvitedChannels()
        console.log('TU')
        console.log(responseJoin)
        for (const x of responseJoin.data) {
          try {
            await dispatch('channels/join', x, { root: true })
          } catch (e) {
            console.log('Error while joining: ' + e)
          }
        }
        console.log(responseInvites)
        for (const x of responseInvites.data) {
          try {
            await dispatch('channels/getInvite', x, { root: true })
          } catch (e) {
            console.log('Error while adding invites: ' + e)
          }
        }
        commit('AUTH_SUCCESS', user)
        return user !== null
      } catch (e) {
        console.log(e)
        commit('AUTH_ERROR', e)
      }
    } catch (err) {
      commit('AUTH_ERROR', err)
      throw err
    }
  },
  async register ({ commit }, form: RegisterData) {
    try {
      commit('AUTH_START')
      const user = await authService.register(form)
      commit('AUTH_SUCCESS', null)
      return user
    } catch (err) {
      commit('AUTH_ERROR', err)
      throw err
    }
  },
  async login ({ commit }, credentials: LoginCredentials) {
    try {
      commit('AUTH_START')
      const apiToken = await authService.login(credentials)
      activityService.notifyStateChange('online')
      commit('AUTH_SUCCESS', null)
      // save api token to local storage and notify listeners
      authManager.setToken(apiToken.token)
      return apiToken
    } catch (err) {
      commit('AUTH_ERROR', err)
      throw err
    }
  },
  async logout ({ commit, dispatch }) {
    try {
      commit('AUTH_START')
      activityService.notifyStateChange('offline')
      await authService.logout()
      await dispatch('channels/leave', null, { root: true })
      commit('AUTH_SUCCESS', null)
      // remove api token and notify listeners
      authManager.removeToken()
    } catch (err) {
      commit('AUTH_ERROR', err)
      throw err
    }
  }
}

export default actions
