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

          <q-btn round flat>
            <q-avatar color="primary" text-color="white">G</q-avatar>
          </q-btn>

          <span class="q-subtitle-1 q-pl-md">
            {{ activeChannel }}
          </span>
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

          <q-btn round flat icon="more_vert">
            <q-menu auto-close :offset="[110, 8]">
              <q-list style="min-width: 150px">
                <q-item clickable @click="logout">
                  <q-item-section>Logout</q-item-section>
                </q-item>
                <q-item clickable @click="offline">
                  <q-item-section>Go offline</q-item-section>
                </q-item>
                <q-item clickable @click="online">
                  <q-item-section>Go back online</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

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

              <q-item-section side>
                <!--q-item-label caption>
                  {{ channel }}
                </q-item-label-->
                <q-icon name="keyboard_arrow_down" />
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
      alert: ref(false)
    }
  },
  computed: {
    ...mapGetters('channels', {
      channels: 'joinedChannels',
      lastMessageOf: 'lastMessageOf'
    }),
    activeChannel () {
      return this.$store.state.channels.active
    }
  },
  methods: {
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
    offline () {
      this.goOffline()
      this.loading = true
    },
    online () {
      this.goOnline()
      this.loading = false
    },
    ...mapMutations('channels', {
      setActiveChannel: 'SET_ACTIVE'
    }),
    ...mapActions('auth', ['logout']),
    ...mapActions('channels', ['addMessage', 'goOffline', 'goOnline', 'leave', 'join', 'sendCommand'])
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
