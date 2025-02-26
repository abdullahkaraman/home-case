import type { Commit } from 'vuex'
import api from '@/services/api'
import type { UserInfo, UserInformationCredentials, UserInformationResponse } from '@/types/auth'

export interface UserState {
  userInfo: UserInfo | null
}

export default {
  namespaced: true,

  state: (): UserState => ({
    userInfo: null,
  }),

  mutations: {
    SET_USER_INFO(state: UserState, userInfo: UserInfo) {
      state.userInfo = userInfo
    },
  },

  actions: {
    async fetchUserInfo({ commit }: { commit: Commit }, credentials: UserInformationCredentials) {
      try {
        const response = await api.post<UserInformationResponse>(
          '/user/user-information',
          credentials,
        )
        commit('SET_USER_INFO', response.data.Data.user)
        console.log('🔥 User Information:', response.data.Data)
      } catch (error) {
        console.error('Failed to fetch user information:', error)
      }
    },
  },

  getters: {
    getUserInfo: (state: UserState) => state.userInfo,
  },
}
