<template>
<q-page class="row items-center justify-evenly">
  <q-card square style="width: 400px; padding:50px">
    <q-card-section>
      <div class="text-h6">
        Login
      </div>
    </q-card-section>

    <q-form ref="form" class="q-gutter-md">
      <q-card-section>
        <q-input
          :error="v$.credentials.email.$error"
          name="email"
          id="email"
          v-model.trim="credentials.email"
          type="email"
          label="Email"
          autofocus
        />
        <q-input
          :error="v$.credentials.password.$error"
          id="password"
          name="password"
          v-model="credentials.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          bottom-slots
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
        <q-checkbox
          id="rememberMe"
          v-model="credentials.remember"
          label="Remember me"
        />
      </q-card-section>

      <q-card-actions align="between">
        <q-btn label="Create account" size="sm" flat :to="{ name: 'register' }"></q-btn>
        <q-btn
          label="Login"
          color="primary"
          :loading="loading"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationRaw } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import {
  required,
  helpers
} from '@vuelidate/validators'

export default defineComponent({
  name: 'LoginPage',
  setup () {
    return { v$: useVuelidate({ $autoDirty: true }) }
  },
  validations () {
    return {
      credentials: {
        email: {
          required: helpers.withMessage('Zadajte e-mail', required)
        },
        password: {
          required: helpers.withMessage('Zadajte heslo', required)
        }
      }
    }
  },
  data () {
    return {
      credentials: { email: '', password: '', remember: false },
      showPassword: false
    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return (this.$route.query.redirect as string) || { name: 'home' }
    },
    loading (): boolean {
      return this.$store.state.auth.status === 'pending'
    }
  },
  methods: {
    async onSubmit () {
      const isFormValid = await this.v$.$validate()
      if (!isFormValid) {
        this.v$.$errors.map((e) =>
          this.$q.notify({
            color: 'red-4',
            icon: 'warning',
            position: 'bottom-right',
            message: e.$message.toString()
          })
        )
      } else {
        this.$store.dispatch('auth/login', this.credentials).then(() => this.$router.push(this.redirectTo))
      }
    }
  }
})
</script>
