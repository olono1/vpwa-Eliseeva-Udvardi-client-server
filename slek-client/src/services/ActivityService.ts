import { SerializedMessage, User } from 'src/contracts'
import { authManager } from '.'
import { BootParams, SocketManager } from './SocketManager'

class ActivitySocketManager extends SocketManager {
  public subscribe ({ store }: BootParams): void {
    this.socket.on('user:list', (onlineUsers: User[]) => {
      console.log('Online users list', onlineUsers)
    })
    this.socket.on('user:online', (user: User) => {
      console.log('User is online', user)
    })
    this.socket.on('user:offline', (user: User) => {
      console.log('User is offline', user)
    })
    this.socket.on('user:stateOffline', (user:User) => {
      store.dispatch('users/updateStateOrCreateUser', { state: 'offline', user })
      console.log('User went status offline', user)
      console.log(user.nickname)
    })
    this.socket.on('user:stateOnline', (user: User) => {
      store.dispatch('users/updateStateOrCreateUser', { state: 'online', user })
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
}

export default new ActivitySocketManager('/')
