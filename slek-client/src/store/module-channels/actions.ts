import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'
import { channelService, activityService } from 'src/services'
import { RawMessage } from 'src/contracts'

const actions: ActionTree<ChannelsStateInterface, StateInterface> = {
  async join ({ commit }, channel: string) {
    try {
      commit('LOADING_START')
      const messages = await channelService.join(channel).loadMessages()
      commit('LOADING_SUCCESS', { channel, messages })
    } catch (err) {
      commit('LOADING_ERROR', err)
      throw err
    }
  },
  async leave ({ getters, commit }, channel: string | null) {
    const leaving: string[] = channel !== null ? [channel] : getters.joinedChannels
    console.log('leaving all channels')
    console.log(leaving)
    leaving.forEach((c) => {
      channelService.leave(c)
      commit('CLEAR_CHANNEL', c)
    })
  },
  async addMessage ({ commit, getters }, { channel, message }: { channel: string, message: RawMessage }) {
    const newMessage = await channelService.in(channel)?.addMessage(message)
    console.log('recieved message response')
    console.log(newMessage)
    console.log(getters.joinedChannels)
    if (newMessage) {
      commit('NEW_MESSAGE', { channel, message: newMessage })
    } else {
      commit('CLEAR_CHANNEL', channel)
      activityService.broadcastChannelDelete(channel)
    }
  },
  async getInvite ({ commit }, channel: string) {
    try {
      console.log('commit get invite')
      console.log(channel)
      commit('GET_INVITE', channel)
    } catch (err) {
      commit('LOADING_ERROR', err)
      throw err
    }
  },
  async acceptInvite ({ commit }, channel: string) {
    try {
      commit('ACCEPT_INVITE', channel)
    } catch (err) {
      commit('LOADING_ERROR', err)
      throw err
    }
  },
  async removeInvite ({ commit }, channel: string) {
    try {
      commit('REMOVE_INVITE', channel)
    } catch (err) {
      commit('LOADING_ERROR', err)
      throw err
    }
  },
  async goOffline ({ getters }) {
    const leaving: string[] = getters.joinedChannels
    leaving.forEach((c) => {
      channelService.leave(c)
    })
    activityService.notifyStateChange('offline')
  },
  async goDndState () {
    activityService.notifyStateChange('DND')
  },
  async goOnline ({ getters, commit }) {
    console.log('GO ONLINE')
    try {
      const joining: string[] = getters.joinedChannels
      const selectedChannel: string = getters.activeChannel
      const leaving: string[] = getters.joinedChannels
      leaving.forEach((c) => {
        channelService.leave(c)
      })
      joining.forEach(async (c) => {
        commit('CLEAR_CHANNEL', c)
        commit('LOADING_START')
        const messages = await channelService.join(c).loadMessages()
        commit('LOADING_SUCCESS', { channel: c, messages })
      })
      commit('SET_ACTIVE', selectedChannel)
      activityService.notifyStateChange('online')
    } catch (err) {
      commit('LOADING_ERROR', err)
      throw err
    }
  },
  async sendCommand ({ commit }, { channel, command, params }: { channel: string, command: string, params: Array<string> }) {
    const response = await channelService.command(channel, command, params)
    if (response.status === 200 && command === '/invite') {
      console.log(response.data)
      activityService.notifyChannelChange(params[0], channel)
    }
    return response
  }
}

export default actions
