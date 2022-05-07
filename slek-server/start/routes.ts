/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth')
  Route.get('me', 'AuthController.me').middleware('auth')
}).prefix('auth')

Route.group(() => {
  Route.post('cancel', 'CommandsController.cancel')
  Route.post('join', 'CommandsController.join')
  Route.post('list', 'CommandsController.list')
  Route.post('invite', 'CommandsController.invite')
  Route.post('quit', 'CommandsController.quit')
  Route.post('kick', 'CommandsController.kick')
}).prefix('command')

Route.post('joinedChannels', 'CommandsController.getJoinedChannels')
Route.post('invitedChannels', 'CommandsController.getInvitedChannels')
Route.post('channelOwner', 'CommandsCotroller.getChannelOwner')