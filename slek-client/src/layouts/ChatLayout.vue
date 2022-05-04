<template>
  <div class="WAL position-relative bg-grey-4" :style="{ height: $q.screen.height + 'px' }">
    <q-layout view="lHh Lpr lFf" class="WAL__layout shadow-3" container>
      <q-header elevated>
        <q-toolbar class="bg-grey-3 text-black">
          <q-btn
            round
            flat
            icon="keyboard_arrow_left"
            class="WAL__drawer-open q-mr-sm"
            @click="leftDrawerOpen = !leftDrawerOpen"
          />

          <q-btn flat>
            <q-avatar color="primary" text-color="white">G</q-avatar>
            <q-menu auto-close :offset="[-30, 8]">
              <q-list style="min-width: 150px">
                <q-item clickable @click="inviteUserForm">
                  <q-item-section>Invite user...</q-item-section>
                </q-item>
                <q-item clickable @click="listMembers">
                  <q-item-section>List members</q-item-section>
                </q-item>
                <q-item clickable @click="showLeaveConfirmation">
                  <q-item-section>Leave Channel</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          <span class="q-subtitle-1 q-pl-md">
            {{ activeChannel }} <q-icon name="navigate_next"/>
          </span>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        :breakpoint="690"
      >
        <q-toolbar class="bg-grey-3">
          <q-avatar class="cursor-pointer">
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" />
          </q-avatar>

          <q-space />
          <q-btn flat icon="add_circle" @click="joinChannelForm" >
            Join
          </q-btn>
          <q-btn  flat icon="more_vert">
            <q-menu auto-close :offset="[110, 8]">
              <q-list style="min-width: 150px">
                <q-item clickable @click="logout">
                  <q-item-section>Logout</q-item-section>
                </q-item>
                <q-item clickable @click="offline">
                  <q-item-section>Go offline</q-item-section>
                </q-item>
                <q-item clickable @click="dndState">
                  <q-item-section>DND</q-item-section>
                </q-item>
                <q-item clickable @click="online">
                  <q-item-section>Go back online</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-dialog v-model="invite" persistent>
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-ml-sm">You got invite</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Do not accept" color="primary" @click="leaveInvite(activeChannel)" v-close-popup></q-btn>
                <q-btn flat label="Accept" color="primary" @click="joinInvite(activeChannel)" v-close-popup></q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="leaveConfirm" persistent>
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-ml-sm">Are you sure you want to Leave this channel?</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="primary" v-close-popup></q-btn>
                <q-btn flat label="Yes, leave channel" color="primary" @click="leaveChannel()" v-close-popup></q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="joinChannelFormDialog" persistent>
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-ml-sm">Enter the name of the channel:</span>
                <q-input outlined v-model="channelToJoin" label="Channel name"/>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="primary" v-close-popup></q-btn>
                <q-btn flat label="Create Channel" color="primary" @click="joinChannel()" v-close-popup></q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="inviteUserFormDialog" persistent>
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-ml-sm">Enter username to invite to this channel</span>
                <q-input outlined v-model="userToInvite" label="username"/>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="primary" v-close-popup></q-btn>
                <q-btn flat label="Invite" color="primary" @click="inviteUser()" v-close-popup></q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="alert">
            <q-card>
              <q-card-section>
                <div class="text-h6">Users of the channel</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-list>
                  <q-item
                    v-for="(user, index) in users"
                    :key="index"
                    v-ripple
                  >
                    <q-item-section>
                      <q-item-label lines="1">
                        {{ user }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="OK" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-btn
            round
            flat
            icon="close"
            class="WAL__drawer-close"
            @click="leftDrawerOpen = !leftDrawerOpen"
          />
        </q-toolbar>

        <q-scroll-area style="height: calc(100% - 100px)">
          <q-list>
            <q-item
              v-for="(invite_item, index) in invites"
              :key="index"
              clickable
              v-ripple
              @click="showInvite(invite_item)"
            >
              <q-item-section side >
                {{ invite_item }}
              </q-item-section>
            </q-item>
          </q-list>

          <q-list>
            <q-item
              v-for="(channel, index) in channels"
              :key="index"
              clickable
              v-ripple
              @click="setActiveChannel(channel)"
            >
              <q-item-section>
                <q-item-label lines="1">
                  {{ channel }}
                </q-item-label>
                <q-item-label class="conversation__summary" caption>
                  {{ lastMessageOf(channel)?.content || '' }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container class="bg-grey-2">
        <router-view />
      </q-page-container>

      <q-footer>
        <q-toolbar class="bg-grey-3 text-black row">
          <q-input v-model="message" :disable="loading" @keydown.enter.prevent="send" rounded outlined dense class="WAL__field col-grow q-mr-sm" bg-color="white" placeholder="Type a message" />
          <q-btn :disable="loading" @click="send" round flat icon="send" />
        </q-toolbar>
      </q-footer>
    </q-layout>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default defineComponent({
  name: 'ChatLayout',
  data () {
    return {
      leftDrawerOpen: false,
      message: '',
      loading: false,
      commands: ['/join', '/invite', '/revoke', '/kick', '/quit', '/cancel', '/list'],
      users: [],
      alert: ref(false),
      invite: ref(false),
      leaveConfirm: ref(false),
      joinChannelFormDialog: ref(false),
      channelToJoin: '',
      inviteUserFormDialog: ref(false),
      userToInvite: ''
    }
  },
  computed: {
    ...mapGetters('channels', {
      channels: 'joinedChannels',
      lastMessageOf: 'lastMessageOf'
    }),
    activeChannel () {
      return this.$store.state.channels.active
    },
    invites () {
      return this.$store.state.channels.invites
    }
  },
  methods: {
    async showInvite (channel: string) {
      this.setActiveChannel(channel)
      this.invite = true
    },
    async joinInvite (channel: string) {
      console.log('came to join invite on fe')
      if (this.invites != null) {
        this.acceptInvite(channel)
        const response = await this.sendCommand({ channel: channel, command: '/join', params: [channel] })
        if (response.status === 200) {
          this.join(channel)
        }
      }
    },
    async leaveInvite (channel: string) {
      this.leave(channel)
      if (this.invites != null) {
        this.removeInvite(channel)
        const response = await this.sendCommand({ channel: channel, command: '/cancel', params: [channel] })
        if (response.status === 200) {
          this.leave(channel)
        }
      }
    },
    async send () {
      this.loading = true
      const index = this.message.indexOf('/')
      console.log('Check')
      console.log(this.message)
      if (index === 0) {
        const params = this.message.split(' ')
        if (this.commands.includes(params[0])) {
          console.log('Command')
          const response = await this.sendCommand({ channel: this.activeChannel, command: params[0], params: params.slice(1) })
          console.log(response)
          if (response.status === 200 && params[0] === '/join') {
            this.join(params[1])
          }
          if (response.status === 200 && params[0] === '/cancel') {
            this.leave(params[1])
          }
          if (response.data && params[0] === '/list') {
            this.users = response.data
            this.alert = true
          }
        }
      } else {
        if (this.activeChannel != null) {
          console.log('Send')
          await this.addMessage({ channel: this.activeChannel, message: this.message })
        }
      }
      this.message = ''
      this.loading = false
    },
    inviteUserForm () {
      this.inviteUserFormDialog = true
    },
    async inviteUser () {
      if (this.userToInvite) {
        const response = await this.sendCommand({ channel: this.activeChannel, command: '/invite', params: [this.userToInvite] }).then(() => {
          this.$q.notify({
            color: 'green-4',
            icon: 'done',
            position: 'top-right',
            message: 'Invite sent!'
          })
          this.userToInvite = ''
        })
      }
    },
    joinChannelForm () {
      this.joinChannelFormDialog = true
    },
    async joinChannel () {
      if (this.channelToJoin) {
        const response = await this.sendCommand({ channel: this.activeChannel, command: '/join', params: [this.channelToJoin] })
        if (response.status === 200) {
          this.join(this.channelToJoin)
          this.channelToJoin = ''
        }
      } else {
        this.$q.notify({
          color: 'orange-4',
          icon: 'warn',
          position: 'top-right',
          message: 'Please enter a channel name'
        })
        this.channelToJoin = ''
      }
    },
    showLeaveConfirmation () {
      if (this.activeChannel === 'general') {
        this.$q.notify({
          color: 'blue-4',
          icon: 'info',
          position: 'top-right',
          message: 'You cannot leave the general channel. '
        })
      } else {
        this.leaveConfirm = true
      }
    },
    async leaveChannel () {
      const response = await this.sendCommand({ channel: this.activeChannel, command: '/cancel', params: [this.activeChannel] })
      if (response.status === 200) {
        this.leave(this.activeChannel)
      }
    },
    async listMembers () {
      console.log(this.activeChannel)
      const response = await this.sendCommand({ channel: this.activeChannel, command: '/list' })
      if (response.data) {
        this.users = response.data
        this.alert = true
      }
    },
    offline () {
      this.goOffline()
      this.loading = true
    },
    online () {
      this.goOnline()
      this.loading = false
    },
    dndState () {
      this.goDndState()
    },
    ...mapMutations('channels', {
      setActiveChannel: 'SET_ACTIVE'
    }),
    ...mapActions('auth', ['logout']),
    ...mapActions('channels', [
      'addMessage',
      'goOffline',
      'goOnline',
      'goDndState',
      'leave',
      'join',
      'sendCommand',
      'acceptInvite',
      'removeInvite'])
  }
})
</script>

<style lang="sass">
.WAL
  width: 100%
  height: 100%
  padding-top: 20px
  padding-bottom: 20px
  &:before
    content: ''
    height: 127px
    position: fixed
    top: 0
    width: 100%
    background-color: #009688
  &__layout
    margin: 0 auto
    z-index: 4000
    height: 100%
    width: 90%
    max-width: 950px
    border-radius: 5px
  &__field.q-field--outlined .q-field__control:before
    border: none
  .q-drawer--standard
    .WAL__drawer-close
      display: none
@media (max-width: 850px)
  .WAL
    padding: 0
    &__layout
      width: 100%
      border-radius: 0
@media (min-width: 691px)
  .WAL
    &__drawer-open
      display: none
.conversation__summary
  margin-top: 4px
.conversation__more
  margin-top: 0!important
  font-size: 1.4rem
</style>

function ref(arg0: boolean) {
  throw new Error('Function not implemented.')
}

function ref(arg0: boolean) {
  throw new Error('Function not implemented.')
}
