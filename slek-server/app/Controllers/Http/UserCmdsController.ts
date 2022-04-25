import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class UserCmdsController {
    //Get all the users for a specified channel
    listUsers({request}: HttpContextContract){}
}
