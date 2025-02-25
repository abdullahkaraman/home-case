<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Login</h2>

      <div class="form-group">
        <label for="email">E-mail:</label>
        <input type="email" id="email" v-model="credentials.Email" required />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="credentials.Password" required />
      </div>

      <div v-if="store.getters['auth/getError']" class="error-message">
        {{ store.getters['auth/getError'] }}
      </div>

      <button type="submit" :disabled="store.state.auth.loading">
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

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #45a049;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
