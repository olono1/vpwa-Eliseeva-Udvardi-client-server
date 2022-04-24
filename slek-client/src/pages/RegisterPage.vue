<template>
<q-page class="row items-center justify-evenly">
  <q-card square style="width: 400px; padding:50px">
    <q-card-section>
      <div class="text-h6">
        Register
      </div>
    </q-card-section>

    <q-form ref="form" class="q-gutter-md">
      <q-card-section>
        <q-input
          :error="v$.form.email.$error"
          name="email"
          id="email"
          v-model.trim="form.email"
          type="email"
          label="Email"
          autofocus
        />
        <q-input
          :error="v$.form.password.$error"
          id="password"
          name="password"
          v-model="form.password"
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
        <q-input
          :error="v$.form.password.$error"
          id="password_confirmation"
          name="password_confirmation"
          v-model="form.passwordConfirmation"
          label="Confirm Password"
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
      </q-card-section>

      <q-card-actions align="between">
        <q-btn label="Login" size="sm" flat :to="{ name: 'login' }"></q-btn>
        <q-btn
          label="Register"
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
  minLength,
  required,
  helpers
} from '@vuelidate/validators'

export default defineComponent({
  name: 'RegisterPage',
  setup () {
    return { v$: useVuelidate({ $autoDirty: true }) }
  },
  validations () {
    return {
      form: {
        email: {
          required: helpers.withMessage('Zadajte e-mail', required)
        },
        password: {
          required: helpers.withMessage('Zadajte heslo', required),
          minLength: helpers.withMessage('Heslo musi mat minimalne 8 znakov', minLength(8))
        },
        passwordConfirmation: {
          required: helpers.withMessage('Potvrdte heslo', required)
        }
      }
    }
  },
  data () {
    return {
      form: { email: '', password: '', passwordConfirmation: '' },
      showPassword: false
    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return { name: 'login' }
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
        this.$store.dispatch('auth/register', this.form).then(() => this.$router.push(this.redirectTo))
      }
    }
  }
})
</script>
