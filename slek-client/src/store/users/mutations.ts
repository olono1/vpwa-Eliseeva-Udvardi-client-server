import { User } from 'src/contracts'
import { MutationTree } from 'vuex'
import { UsersStateInterface } from './state'

const mutation: MutationTree<UsersStateInterface> = {
  CHANGE_STATUS (state, { userStatus, user }: { userStatus: 'offline' | 'online' | 'DND', user: User}) {
    state.users[user.email].userStatus = userStatus
  },
  NEW_USER (state, { userStatus, user }: { userStatus: 'offline'|'online'|'DND', user: User }) {
    const isCreated = state.users[user.email]
    if (isCreated === undefined) {
      userStatus ? user.userStatus = userStatus : user.userStatus = 'online'
      state.users[user.email] = user
    }
  }
}

export default mutation
