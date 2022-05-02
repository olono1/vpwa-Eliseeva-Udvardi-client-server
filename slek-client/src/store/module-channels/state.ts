import { SerializedMessage } from 'src/contracts'

export interface ChannelsStateInterface {
  loading: boolean,
  error: Error | null,
  messages: { [channel: string]: SerializedMessage[] },
  invites: string[] | null,
  active: string | null,
  offline: boolean | null
}

function state (): ChannelsStateInterface {
  return {
    loading: false,
    error: null,
    messages: {},
    invites: [],
    active: null,
    offline: false
  }
}

export default state
