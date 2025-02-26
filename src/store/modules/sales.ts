import type { ActionContext } from 'vuex'
import api from '@/services/api'
import type { RootState } from '@/store/types'
import type { DailySalesOverviewData, DailySalesOverviewResponse } from '@/types/sales'

export interface SalesState {
  dailySalesData: DailySalesOverviewData | null
}

export default {
  namespaced: true,

  state: (): SalesState => ({
    dailySalesData: null,
  }),

  mutations: {
    SET_DAILY_SALES_DATA(state: SalesState, data: DailySalesOverviewData) {
      state.dailySalesData = data
    },
  },

  actions: {
    async fetchDailySalesOverview(
      { commit, rootState }: ActionContext<SalesState, RootState>,
      day: number,
    ) {
      try {
        const marketplace = rootState.auth.userInfo?.store?.[0]?.marketplaceName
        const sellerId = rootState.auth.userInfo?.store?.[0]?.storeId

        const payload = {
          marketplace: marketplace || 'Amazon',
          sellerId: sellerId || '',
          requestStatus: 0,
          day,
          excludeYoYData: true,
        }

        const response = await api.post<DailySalesOverviewResponse>(
          '/data/daily-sales-overview/',
          payload,
        )

        if (response.data.ApiStatus) {
          commit('SET_DAILY_SALES_DATA', response.data.Data)
        } else {
          console.warn('API returned an unsuccessful status:', response.data)
        }
      } catch (error) {
        console.error('Failed to fetch daily sales overview:', error)
      }
    },
  },

  getters: {
    getDailySalesData: (state: SalesState) => state.dailySalesData,
  },
}
