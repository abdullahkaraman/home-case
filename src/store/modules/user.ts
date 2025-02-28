import type { Commit, Dispatch } from 'vuex'
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
    CLEAR_USER_INFO(state: UserState) {
      state.userInfo = null
    },
    SET_USER_EMAIL(state: UserState, email: string) {
      if (state.userInfo) {
        state.userInfo.email = email
      }
    },
  },

  actions: {
    async fetchUserInfo(
      { commit, dispatch }: { commit: Commit; dispatch: Dispatch },
      credentials: UserInformationCredentials,
    ) {
      try {
        const response = await api.post<UserInformationResponse>(
          '/user/user-information',
          credentials,
        )
        commit('SET_USER_INFO', response.data.Data.user)

        await dispatch('sales/fetchDailySalesOverview', 7, { root: true })

        return response.data.Data.user
      } catch (error) {
        console.error('Failed to fetch user information:', error)
        commit('CLEAR_USER_INFO')
        return null
      }
    },
  },

  getters: {
    getUserInfo: (state: UserState) => state.userInfo,
  },
}
