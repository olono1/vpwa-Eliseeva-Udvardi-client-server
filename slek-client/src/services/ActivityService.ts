import { SerializedMessage, User } from 'src/contracts'
import { authManager } from '.'
import { BootParams, SocketManager } from './SocketManager'

class ActivitySocketManager extends SocketManager {
  public subscribe ({ store }: BootParams): void {
    this.socket.on('user:list', (onlineUsers: User[]) => {
      console.log('Online users list', onlineUsers)
      for (const x of onlineUsers) {
        store.dispatch('users/updateStateOrCreateUser', { state: 'online', user: x })
      }
    })
    this.socket.on('user:channels', (user: User, channel: string) => {
      console.log('GOT UPDATE LIST')
      store.dispatch('users/updateChannelList', { user, channel })
    })
    this.socket.on('user:invite', (user: User, channel: string) => {
      console.log('GOT INVITE')
      store.dispatch('users/getInvite', { user, channel })
    })
    this.socket.on('user:online', (user: User) => {
      console.log('User is online', user)
      store.dispatch('users/updateStateOrCreateUser', { state: 'online', user })
    })
    this.socket.on('user:offline', (user: User) => {
      store.dispatch('users/updateStateOrCreateUser', { state: 'offline', user })
      console.log('User is offline', user)
    })
    this.socket.on('user:stateDND', (user:User) => {
      store.dispatch('users/updateStateOrCreateUser', { state: 'DND', user })
    })

    this.socket.on('deletedChannel', (channelName: string) => {
      store.commit('channels/CLEAR_CHANNEL', channelName)
      console.log('Lets delete this channel!')
      console.log(channelName)
    })

    authManager.onChange((token) => {
      if (token) {
        this.socket.connect()
      } else {
        this.socket.disconnect()
      }
    })
  }

  public notifyStateChange (newState: string): Promise<SerializedMessage> {
    return this.emitAsync('goOffline', newState)
  }

  public notifyChannelChange (): Promise<SerializedMessage> {
    return this.emitAsync('onChannelChange')
  }

  public notifyInvite (userNickname: string, channel: string): Promise<SerializedMessage> {
    console.log('Emmiting Async with username: ' + userNickname + 'and channel: ' + channel)
    return this.emitAsync('onInvite', userNickname, channel)
  }

  public broadcastChannelDelete (channel: string) {
    console.log('SENDING deletion request')
    return this.emitAsync('deleteChannel', channel)
  }
}

export default new ActivitySocketManager('/')
