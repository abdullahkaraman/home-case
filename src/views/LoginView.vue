<template>
  <div class="flex justify-center items-center min-h-screen p-5">
    <form @submit.prevent="handleLogin" class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

      <div class="mb-4">
        <label for="email" class="block mb-2">E-mail:</label>
        <input
          type="email"
          id="email"
          v-model="credentials.Email"
          required
          class="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div class="mb-4">
        <label for="password" class="block mb-2">Password:</label>
        <input
          type="password"
          id="password"
          v-model="credentials.Password"
          required
          class="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div v-if="store.getters['auth/getError']" class="text-red-500 mb-4 text-center">
        {{ store.getters['auth/getError'] }}
      </div>

      <button
        type="submit"
        :disabled="store.state.auth.loading"
        class="w-full py-3 bg-green-500 text-white border-none rounded cursor-pointer hover:bg-green-600 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {{ store.state.auth.loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const credentials = reactive({
  Email: '',
  Password: '',
  GrantType: 'password',
  Scope: 'amazon_data',
  ClientId: import.meta.env.VITE_CLIENT_ID,
  ClientSecret: import.meta.env.VITE_CLIENT_SECRET,
  RedirectUri: import.meta.env.VITE_REDIRECT_URI,
})

const store = useStore()
const router = useRouter()

const handleLogin = async () => {
  try {
    await store.dispatch('auth/login', credentials)
    if (store.getters['auth/isAuthenticated']) {
      await router.push('/dashboard')
    }
  } catch (error) {
    console.error('Giriş hatası:', error)
  }
}
</script>
