import api from '@/services/api'
import type { Commit } from 'vuex'
import type { AxiosError } from 'axios'
interface LoginCredentials {
  Email: string
  Password: string
  GrantType: string
  Scope: string
  ClientId: string
  ClientSecret: string
  RedirectUri: string
}

interface AuthState {
  token: string | null
  loading: boolean
  error: string | null
}

export default {
  namespaced: true,

  state: (): AuthState => ({
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  mutations: {
    SET_TOKEN(state: AuthState, token: string) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_LOADING(state: AuthState, loading: boolean) {
      state.loading = loading
    },
    SET_ERROR(state: AuthState, error: string | null) {
      state.error = error
    },
  },

  actions: {
    async login({ commit }: { commit: Commit }, credentials: LoginCredentials) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      try {
        const response = await api.post('/oauth/token', credentials)
        commit('SET_TOKEN', response.data.Data.AccessToken)
      } catch (error) {
        const err = error as AxiosError<{ ApiStatusMessage?: string }>
        commit('SET_ERROR', err.response?.data?.ApiStatusMessage || 'Login failed')
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },

  getters: {
    isAuthenticated: (state: AuthState) => !!state.token,
    getToken: (state: AuthState) => state.token,
    getError: (state: AuthState) => state.error,
    isLoading: (state: AuthState) => state.loading,
  },
}
