import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import User from 'App/Models/User'

export default class ActivityController {
  private getUserRoom(user: User): string {
    return `user:${user.id}`
  }

  public async onConnected({ socket, auth, logger }: WsContextContract) {
    // all connections for the same authenticated user will be in the room
    const room = this.getUserRoom(auth.user!)
    const userSockets = await socket.in(room).allSockets()

    // this is first connection for given user
    if (userSockets.size === 0) {
      socket.broadcast.emit('user:online', auth.user)
    }

    // add this socket to user room
    socket.join(room)
    // add userId to data shared between Socket.IO servers
    // https://socket.io/docs/v4/server-api/#namespacefetchsockets
    socket.data.userId = auth.user!.id

    const allSockets = await socket.nsp.except(room).fetchSockets()
    const onlineIds = new Set<number>()

    for (const remoteSocket of allSockets) {
      onlineIds.add(remoteSocket.data.userId)
    }

    const onlineUsers = await User.findMany([...onlineIds])

    console.log("Sending online users")
    console.log(onlineUsers)

    socket.emit('user:list', onlineUsers)

    logger.info('new websocket connection')
  }

  // see https://socket.io/get-started/private-messaging-part-2/#disconnection-handler
  public async onDisconnected({ socket, auth, logger }: WsContextContract, reason: string) {
    const room = this.getUserRoom(auth.user!)
    const userSockets = await socket.in(room).allSockets()

    // user is disconnected
    if (userSockets.size === 0) {
      // notify other users
      socket.broadcast.emit('user:offline', auth.user)
    }

    logger.info('websocket disconnected', reason)
    socket.broadcast.emit('User changed state to offline', auth.user)
  }

  public async goOffline({ socket, auth, logger }: WsContextContract, reason: string) {
    console.log('offline backend initiated')
    const room = this.getUserRoom(auth.user!);
    const userSockets = await socket.in(room).allSockets()


    if(reason === 'offline') {
     
      socket.broadcast.emit('user:stateOffline', auth.user)
    }
    if (reason === 'online') {
      
      socket.broadcast.emit('user:stateOnline', auth.user)
    }
    if (reason === 'DND') {
      socket.broadcast.emit('user:stateDND', auth.user)
    }


    logger.info('User wentOffline', reason);

  }

  public async onChannelChange({ socket, auth, logger }: WsContextContract) {
    console.log('on channel change server')
    socket.nsp.emit('user:channels', auth.user)
  }

  public async onInvite({ socket, auth, logger }: WsContextContract, userNickname: string, channel: string) {
    // all connections for the same authenticated user will be in the room
    console.log('Dostal som, ze mam pozvat: ' + userNickname + ' Do channel: ' + channel)
    console.log('A ja sa volam: ' + auth.user?.nickname)

    if (userNickname === auth.user?.nickname) {
      console.error('POSIELAME POZVANKU ROVANKEMU USEROVI')
    }
    const user = await User.findBy('nickname', userNickname)
    const room = this.getUserRoom(user)
    // add this socket to user room
    socket.join(room)
    // add userId to data shared between Socket.IO servers
    // https://socket.io/docs/v4/server-api/#namespacefetchsockets
    socket.data.userId = user!.id

    const allSockets = await socket.broadcast.fetchSockets()

    for (const remoteSocket of allSockets) {
      console.log('PRECHDAZAM SOCKETMI')
      console.log(remoteSocket.data)
      console.log(user.id)
      if (remoteSocket.data.userId === user.id){
        remoteSocket.emit('user:invite', user, channel)
        console.log('NASIEL SOM SOCKET')
        break;
      }
    }
  }

  public async deleteChannel({ params, socket, auth }: WsContextContract, channel: string) {
    console.log('Got message to delete on BE')
    socket.broadcast.emit('deletedChannel', channel)
  }
}
