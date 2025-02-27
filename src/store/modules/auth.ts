import api from '@/services/api'
import type { Commit } from 'vuex'
import type { AxiosError } from 'axios'

import type { TokenResponse, LoginCredentials, UserInfo } from '@/types/auth'

export interface AuthState {
  token: string | null
  loading: boolean
  error: string | null
  userInfo: UserInfo | null
  userEmail: string | null
}

export default {
  namespaced: true,

  state: (): AuthState => ({
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    userInfo: null,
    userEmail: null,
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
    SET_USER_EMAIL(state: AuthState, email: string) {
      state.userEmail = email
      localStorage.setItem('userEmail', email)
    },
    CLEAR_AUTH_DATA(state: AuthState) {
      state.token = null
      state.userEmail = null
      localStorage.removeItem('token')
      localStorage.removeItem('userEmail')
    },
  },

  actions: {
    async login({ commit }: { commit: Commit }, credentials: LoginCredentials) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      try {
        const response = await api.post<TokenResponse>('/oauth/token', credentials)

        commit('SET_TOKEN', response.data.Data.AccessToken)
        commit('SET_USER_EMAIL', credentials.Email)
      } catch (error) {
        const err = error as AxiosError<{ ApiStatusMessage?: string }>
        commit('SET_ERROR', err.response?.data?.ApiStatusMessage || 'Login failed')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async logout({ commit }: { commit: Commit }) {
      commit('SET_LOADING', true)
      try {
        await api.post('/user/logout')
        commit('CLEAR_AUTH_DATA')
      } catch (error) {
        console.error('Logout failed:', error)
        commit('CLEAR_AUTH_DATA')
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },

  getters: {
    isAuthenticated: (state: AuthState) => !!state.token,
    getToken: (state: AuthState) => state.token || localStorage.getItem('token'),
    getError: (state: AuthState) => state.error,
    isLoading: (state: AuthState) => state.loading,
    getUserEmail: (state: AuthState) => state.userEmail || localStorage.getItem('userEmail'),
  },
}
