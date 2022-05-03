import { RawMessage, SerializedMessage } from 'src/contracts'
import { BootParams, SocketManager } from './SocketManager'
import { api } from 'src/boot/axios'
import { authService } from '.'
import { AxiosResponse } from 'axios'

// creating instance of this class automatically connects to given socket.io namespace
// subscribe is called with boot params, so you can use it to dispatch actions for socket events
// you have access to socket.io socket using this.socket
class ChannelSocketManager extends SocketManager {
  public subscribe ({ store }: BootParams): void {
    const channel = this.namespace.split('/').pop() as string

    this.socket.on('message', (message: SerializedMessage) => {
      store.commit('channels/NEW_MESSAGE', { channel, message })
    })
  }

  public addMessage (message: RawMessage): Promise<SerializedMessage> {
    return this.emitAsync('addMessage', message)
  }

  public loadMessages (): Promise<SerializedMessage[]> {
    return this.emitAsync('loadMessages')
  }
}

class ChannelService {
  private channels: Map<string, ChannelSocketManager> = new Map()

  public join (name: string): ChannelSocketManager {
    if (this.channels.has(name)) {
      throw new Error(`User is already joined in channel "${name}"`)
    }
    // connect to given channel namespace
    const channel = new ChannelSocketManager(`/channels/${name}`)
    this.channels.set(name, channel)
    return channel
  }

  public leave (name: string): boolean {
    const channel = this.channels.get(name)

    if (!channel) {
      return false
    }

    // disconnect namespace and remove references to socket
    channel.destroy()
    return this.channels.delete(name)
  }

  public in (name: string): ChannelSocketManager | undefined {
    return this.channels.get(name)
  }

  async getJoinedChannels (): Promise<AxiosResponse> {
    const user = await authService.me()
    const response = await api.post('joinedChannels', {
      user
    })
    console.log('!!!!!')
    return response
  }

  async getInvitedChannels (): Promise<AxiosResponse> {
    const user = await authService.me()
    const response = await api.post('invitedChannels', {
      user
    })
    console.log('!!!!!')
    return response
  }

  async command (channel: string, command: string, parameters: Array<string>): Promise<AxiosResponse> {
    const user = await authService.me()
    console.log(parameters)
    const response = await api.post('command' + command, {
      channel,
      user,
      params: parameters
    })
    console.log('!!!!!')
    return response
  }
}

export default new ChannelService()
