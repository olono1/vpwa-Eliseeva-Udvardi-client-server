import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import { userStatus } from 'App/Models/UserStatus'

export default class CommandsController {

  async cancel({ request }: HttpContextContract) {
    console.log('GOT CANCEL REQUEST')
    console.log(request.body())
    const channel = await Channel.findByOrFail('name', request.body().channel)
    console.log(channel)
    const user = await User.findByOrFail('id', request.body().user.id)
    const info = await Database.from('channel_users')
                    .where('user_id', user.id)
                    .andWhere('channel_id', channel.id)
    if (channel.owner_id == request.body().user.id){
      await channel.delete()
      await user.related('channels').detach([channel.id]) // funguje delete z DB
      return
    }
    console.log('Info')
    console.log(info)
    if (info.length > 0) {
      await Database.from('channel_users')
                    .where('user_id', user.id)
                    .andWhere('channel_id', channel.id)
                    .update('user_state', userStatus.LEFT)
    }
    // await user.related('channels').detach([channel.id]) // funguje delete z DB
  }

  async quit({ request }: HttpContextContract) {
    const channel = await Channel.findByOrFail('name', request.body().channel)
    // console.log(channel)
    if (channel.owner_id == request.body().user.id){
      await channel.delete()
    } else {
      return 'not owner'
    }
    // await user.related('channels').detach([channel.id]) // funguje delete z DB
  }

  public async getJoinedChannels({ request }: HttpContextContract) {
    console.log('GOT CHANNELS REQUEST')
    const filterChannels: string[] = []
    const response = await Database.from('channel_users')
                                  .where('user_id', request.body().user.id)
    for (const x of response) {
      console.log(x)
      if (x.user_state == 'member') {
        const channel = await Channel.findByOrFail('id', x.channel_id)
        filterChannels.push(channel.name)
      }
    }
    console.log(filterChannels)
    return filterChannels
  }
  
  public async getInvitedChannels({ request }: HttpContextContract) {
    console.log('GOT CHANNELS INVITES REQUEST')
    const filterChannels: string[] = []
    const response = await Database.from('channel_users')
                                  .where('user_id', request.body().user.id)
    for (const x of response) {
      console.log(x)
      if (x.user_state == 'invited') {
        const channel = await Channel.findByOrFail('id', x.channel_id)
        filterChannels.push(channel.name)
      }
    }
    console.log(filterChannels)
    return filterChannels
  }

  async join({ request }: HttpContextContract) {
    console.log("GOT JOIN REQUEST")
    // console.log(request.body())
    let channel = await Channel.findBy('name', request.body().params[0])
    const creatingNewChannel = (channel === null)
    if (channel == null){
      channel = await Channel.create({name: request.body().params[0] as string, owner_id: request.body().user.id as number, is_private: request.body().params[1].isPrivate})
    } 
    const user = await User.findByOrFail('id', request.body().user.id)
    const info = await Database.from('channel_users')
                    .where('user_id', user.id)
                    .andWhere('channel_id', channel.id)
    
    console.log('Info')
    console.log(info)
    if (info.length > 0) {
      await Database.from('channel_users')
                    .where('user_id', user.id)
                    .andWhere('channel_id', channel.id)
                    .update('user_state', userStatus.MEMBER)
      return {join: false, reason: 'User already in Channel', icon: 'done'}
    } else if (!channel.is_private || creatingNewChannel) {
      await user.related('channels').attach([channel.id]) // funguje insert do DB
      await Database.from('channel_users')
                    .where('user_id', user.id)
                    .andWhere('channel_id', channel.id)
                    .update('user_state', userStatus.MEMBER)
                    .update('kicks', 0)
      return {join: true, reason: 'Joined channel', icon: 'done'}
    }
    return {join: false, reason: 'Channel is private', icon: 'lock'}
  }
  
  async invite({ request }: HttpContextContract) {
    console.log('GOT INVITE REQUEST')
    // console.log(request)
    let channel = await Channel.findByOrFail('name', request.body().channel)
    const user = await User.findByOrFail('nickname', request.body().params[0])
    console.log(user)
    const info = await Database.from('channel_users')
                                .where('user_id', user.id)
                                .andWhere('channel_id', channel.id)
    
    console.log('Info')
    console.log(info)
    if (info.length > 0) {
      for (const c of info) {
        if (c.user_state == 'member') {
          return
        } else if (c.user_state == 'banned') {
          if (channel.owner_id != request.body().user.id) {
            return
          }
        }
      }
      await Database.from('channel_users')
                    .where('user_id', user.id)
                    .andWhere('channel_id', channel.id)
                    .update('user_state', userStatus.INVITED)
                    .update('kicks', 0)
    } else {
      await user.related('channels').attach([channel.id]) // funguje insert do DB
      await Database.from('channel_users')
                    .where('user_id', user.id)
                    .andWhere('channel_id', channel.id)
                    .update('user_state', userStatus.INVITED)
                    .update('kicks', 0)
    }
  }

  async list({request}: HttpContextContract) {
    console.log(request)
    const channel = await Channel.findBy('name', request.body().channel)
    if (channel != null){
      var channel_users = await Database.from('channel_users')
                      .select()
                      .where('channel_id', `${channel.id}`)
      let usernames: string[] = []
      for (let x of channel_users) {
        let user = await User.findByOrFail('id', x.user_id)
        usernames.push(user.nickname)
      }
      return usernames
    }
  }

  async getChannelOwner({request}: HttpContextContract){
    console.log(request)
    const channel = await Channel.findBy('name', request.body().channel)
    if (channel != null) {
      var channel_owner = await User.findByOrFail('id', channel.owner_id)
      return channel_owner

    }
    return ''

  }

}
