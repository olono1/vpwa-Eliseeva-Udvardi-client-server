import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
import { DateTime } from 'luxon'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject(['Repositories/MessageRepository'])
export default class MessageController {
  constructor (private messageRepository: MessageRepositoryContract) {}

  public async loadMessages({ params }: WsContextContract) {
    console.log('loading messages params:')
    console.log(params)
    return this.messageRepository.getAll(params.name)
  }

  public async addMessage({ params, socket, auth }: WsContextContract, content: string) {

    console.log('Latest message')
    const latest_message = (await this.messageRepository.getAll(params.name)).pop()
    if(latest_message){
      const diff = DateTime.now().diff(DateTime.fromISO(latest_message!.createdAt), ['days']).days
      if (diff >= 0.0 && params.name !== 'general') {
        console.log('Deleting channel')
        const channel = await Channel.findByOrFail('name', params.name)
        const user = await User.findByOrFail('id', channel.owner_id)
        await channel.delete()
        await user.related('channels').detach([channel.id])
        return ''
      } else {
        console.log('No delete')
        const message = await this.messageRepository.create(params.name, auth.user!.id, content)
        // broadcast message to other users in channel
        socket.broadcast.emit('message', message)

        // return message to sender
        return message
      }
    } else {
      console.log('No delete')
      const message = await this.messageRepository.create(params.name, auth.user!.id, content)
      // broadcast message to other users in channel
      socket.broadcast.emit('message', message)

      // return message to sender
      return message
    }



  }


}
