<template>
  <q-scroll-area ref="area" style="width: 100%; height: calc(100vh - 150px)">
    <div style="width: 100%; max-width: 400px; margin: 0 auto;">
      <q-chat-message v-for="message in messages"
        :key="message.id"
        :name="message.author.email + printStatus(message.author.email)"
        :text="[message.content]"
        :stamp="message.createdAt"
        :sent="isMine(message)"
        :abc="getStatus(message.author.email)"
      />
    </div>
  </q-scroll-area>
</template>

<script lang="ts">
import { QScrollArea } from 'quasar'
import { SerializedMessage } from '../contracts'
import { defineComponent, PropType } from 'vue'
import { mapActions } from 'vuex'

export default defineComponent({
  name: 'ChannelMessagesComponent',
  data () {
    return {
      messagesLoaded: this.messages
    }
  },
  props: {
    messages: {
      type: Array as PropType<SerializedMessage[]>,
      default: () => []
    }
  },
  watch: {
    messages: {
      handler () {
        this.$nextTick(() => this.scrollMessages())
        console.log(this.messages)
      },
      deep: true
    }
  },
  computed: {
    currentUser () {
      return this.$store.state.auth.user?.id
    },
    userStates () {
      return this.$store.state.users.users
    }
  },
  methods: {
    scrollMessages () {
      const area = this.$refs.area as QScrollArea
      area && area.setScrollPercentage('vertical', 1.3)
    },
    isMine (message: SerializedMessage): boolean {
      return message.author.id === this.currentUser
    },
    printStatus (email: string): string {
      if (this.userStates[email]) {
        return ' (' + this.userStates[email].userStatus + ')'
      } else {
        return ' (offline)'
      }
    },
    async getStatus (email: string): Promise<string> {
      const statusUser = await this.getMessageAuthorStatus(email)
      return statusUser
    },
    ...mapActions('users', ['getMessageAuthorStatus'])
  }
})
</script>
