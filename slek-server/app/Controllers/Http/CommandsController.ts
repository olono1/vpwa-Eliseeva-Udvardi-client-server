import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class CommandsController {

  async cancel({ request }: HttpContextContract) {
    const channel = await Channel.findByOrFail('name', request.body().params[0])
    // console.log(channel)
    const user = await User.findByOrFail('id', request.body().user.id)
    await user.related('channels').detach([channel.id]) // funguje delete z DB
    if (channel.owner_id == request.body().user.id){
      await channel.delete()
    }
  }

  async join({ request }: HttpContextContract) {
    console.log(request)
    let channel = await Channel.findBy('name', request.body().params[0])
    if (channel == null){
      channel = await Channel.create({name: request.body().params[0] as string, owner_id: request.body().user.id as number})
    } 
    const user = await User.findByOrFail('id', request.body().user.id)
    await user.related('channels').attach([channel.id]) // funguje insert do DB
    // console.log(channel)
  }
  
  async invite({ request }: HttpContextContract) {
    // console.log(request)
    let channel = await Channel.findBy('name', request.body().channel)
    const user = await User.findByOrFail('nickname', request.body().params[0])
    await user.related('channels').attach([channel.id]) // funguje insert do DB
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
}
