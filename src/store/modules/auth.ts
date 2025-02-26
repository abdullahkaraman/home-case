import api from '@/services/api'
import type { Commit } from 'vuex'
import type { AxiosError } from 'axios'

import type { TokenResponse, LoginCredentials, UserInfo } from '@/types/auth'

export interface AuthState {
  token: string | null
  loading: boolean
  error: string | null
  userInfo: UserInfo | null
}

export default {
  namespaced: true,

  state: (): AuthState => ({
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    userInfo: null,
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
        const response = await api.post<TokenResponse>('/oauth/token', credentials)

        commit('SET_TOKEN', response.data.Data.AccessToken)
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

        localStorage.removeItem('token')
        commit('SET_TOKEN', null)
        commit('SET_USER_INFO', null)
      } catch (error) {
        console.error('Logout failed:', error)
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
