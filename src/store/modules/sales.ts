import type { ActionContext } from 'vuex'
import api from '@/services/api'
import type { RootState } from '@/store/types'
import type { DailySalesOverviewData, DailySalesOverviewResponse } from '@/types/sales'
import type {
  DailySalesSkuListRequest,
  DailySalesSkuListResponse,
  DailySalesSkuListData,
  GetSkuRefundRateRequest,
  GetSkuRefundRateResponse,
} from '@/types/sku'

export interface SalesState {
  dailySalesData: DailySalesOverviewData | null
  skuListData: DailySalesSkuListData | null
  selectedDates: string[]
  loadingSkuList: boolean
  currentPage: number
  totalItems: number
  itemsPerPage: number
}

export default {
  namespaced: true,

  state: (): SalesState => ({
    dailySalesData: JSON.parse(localStorage.getItem('dailySalesData') || 'null'),
    skuListData: null,
    selectedDates: [],
    loadingSkuList: false,
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
  }),

  mutations: {
    SET_DAILY_SALES_DATA(state: SalesState, data: DailySalesOverviewData) {
      state.dailySalesData = data
      localStorage.setItem('dailySalesData', JSON.stringify(data))
    },
    CLEAR_SALES_DATA(state: SalesState) {
      state.dailySalesData = null
      localStorage.removeItem('dailySalesData')
    },
    SET_SKU_LIST_DATA(state: SalesState, data: DailySalesSkuListData) {
      try {
        const processedData = { ...data }

        if (processedData && processedData.item && processedData.item.skuList) {
          processedData.item.skuList = processedData.item.skuList.map((item) => {
            const refundRate =
              typeof item.refundRate !== 'undefined'
                ? item.refundRate
                : typeof item.refundPercantage !== 'undefined'
                  ? item.refundPercantage
                  : 0

            return {
              ...item,
              quantity: item.qty || 0,
              quantity2: item.qty2 || 0,
              salesAmount: item.amount || 0,
              salesAmount2: item.amount2 || 0,
              refundRate: refundRate,
            }
          })

          state.totalItems = processedData.item.skuList.length
        } else {
          console.warn('SKU list not found in API response or is empty:', processedData)
          state.totalItems = 0
        }

        state.skuListData = processedData
      } catch (error) {
        console.error('SKU data processing error:', error)
        state.skuListData = data
        state.totalItems = data?.item?.skuList?.length || 0
      }
    },
    SET_SELECTED_DATES(state: SalesState, dates: string[]) {
      state.selectedDates = dates.slice(0, 2)
    },
    SET_LOADING_SKU_LIST(state: SalesState, isLoading: boolean) {
      state.loadingSkuList = isLoading
    },
    SET_CURRENT_PAGE(state: SalesState, page: number) {
      state.currentPage = page
    },
    UPDATE_SKU_REFUND_RATES(state: SalesState, refundRates: { sku: string; refundRate: number }[]) {
      if (!state.skuListData || !state.skuListData.item || !state.skuListData.item.skuList) {
        console.warn('SKU List not found, refund rates cannot be applied')
        return
      }

      const skuList = state.skuListData.item.skuList

      refundRates.forEach((item) => {
        const skuItem = skuList.find((skuItem) => skuItem.sku === item.sku)
        if (skuItem) {
          skuItem.refundRate = item.refundRate
        }
      })

      if (skuList.length > 0) {
        console.log(
          'Güncellenmiş SKU verileri (ilk 2):',
          JSON.stringify(skuList.slice(0, 2), null, 2),
        )
      }
    },
  },

  actions: {
    async fetchDailySalesOverview(
      { commit, rootState }: ActionContext<SalesState, RootState>,
      day: number = 7,
    ) {
      try {
        const marketplace = rootState.user.userInfo?.store?.[0]?.marketplaceName
        const sellerId = rootState.user.userInfo?.store?.[0]?.storeId

        if (!marketplace || !sellerId) {
          console.warn('Marketplace or sellerId not found, sales data cannot be fetched')
          return
        }

        const payload = {
          marketplace: marketplace || 'Amazon',
          sellerId: sellerId || '',
          requestStatus: 0,
          day,
          excludeYoYData: true,
        }

        const response = await api.post<DailySalesOverviewResponse>(
          '/data/daily-sales-overview',
          payload,
        )

        if (response.data.ApiStatus) {
          commit('SET_DAILY_SALES_DATA', response.data.Data)
        } else {
          console.warn('API returned an unsuccessful status:', response.data)
        }
      } catch (error) {
        console.error('Failed to fetch daily sales overview:', error)
        commit('CLEAR_SALES_DATA')
      }
    },

    async fetchSkuList(
      { commit, rootState, state, dispatch }: ActionContext<SalesState, RootState>,
      params: {
        pageNumber?: number
        isDaysCompare?: boolean | number
        salesDate?: string
        salesDate2?: string
        pageSize?: number
      },
    ) {
      try {
        if (state.selectedDates.length === 0) {
          console.warn('No dates selected for SKU list')
          return
        }

        commit('SET_LOADING_SKU_LIST', true)
        commit('SET_CURRENT_PAGE', params.pageNumber || 1)

        const marketplace = rootState.user.userInfo?.store?.[0]?.marketplaceName
        const sellerId = rootState.user.userInfo?.store?.[0]?.storeId

        if (!marketplace || !sellerId) {
          console.warn('Marketplace or sellerId not found, SKU list cannot be fetched')
          return
        }

        const payload: DailySalesSkuListRequest = {
          marketplace: marketplace,
          sellerId: sellerId,
          salesDate: params.salesDate || state.selectedDates[0],
          pageSize: params.pageSize || 30,
          pageNumber: Math.ceil((params.pageNumber || 1) / 3),
          isDaysCompare:
            typeof params.isDaysCompare !== 'undefined'
              ? params.isDaysCompare === true
                ? 1
                : params.isDaysCompare === false
                  ? 0
                  : params.isDaysCompare
              : state.selectedDates.length === 2
                ? 1
                : 0,
        }

        if (params.salesDate2 || state.selectedDates.length === 2) {
          payload.salesDate2 = params.salesDate2 || state.selectedDates[1]
        }

        const response = await api.post<DailySalesSkuListResponse>(
          '/data/daily-sales-sku-list',
          payload,
        )

        if (response.data.ApiStatus && response.data.Data) {
          commit('SET_SKU_LIST_DATA', response.data.Data)

          if (
            response.data.Data.item &&
            response.data.Data.item.skuList &&
            response.data.Data.item.skuList.length > 0
          ) {
            const skuList = response.data.Data.item.skuList.map((item) => item.sku)
            await dispatch('fetchSkuRefundRates', { skuList })
          }
        } else {
          console.warn('API returned an unsuccessful status:', response.data)
        }
      } catch (error) {
        console.error('Failed to fetch SKU list:', error)
      } finally {
        commit('SET_LOADING_SKU_LIST', false)
      }
    },

    async fetchSkuRefundRates(
      { commit, rootState }: ActionContext<SalesState, RootState>,
      { skuList }: { skuList: string[] },
    ) {
      try {
        const marketplace = rootState.user.userInfo?.store?.[0]?.marketplaceName
        const sellerId = rootState.user.userInfo?.store?.[0]?.storeId

        if (!marketplace || !sellerId || !skuList || skuList.length === 0) {
          console.warn('Required parameters missing for SKU refund rates')
          return
        }

        const payload: GetSkuRefundRateRequest = {
          marketplace: marketplace,
          sellerId: sellerId,
          skuList,
        }

        const response = await api.post<GetSkuRefundRateResponse>(
          '/data/get-sku-refund-rate',
          payload,
        )

        if (response.data.ApiStatus && response.data.Data && response.data.Data.item) {
          commit('UPDATE_SKU_REFUND_RATES', response.data.Data.item)
        } else {
          console.warn('API returned an unsuccessful status:', response.data)
        }
      } catch (error) {
        console.error('Failed to fetch SKU refund rates:', error)
      }
    },

    setSelectedDates({ commit }: ActionContext<SalesState, RootState>, dates: string[]) {
      commit('SET_SELECTED_DATES', dates)
    },

    setCurrentPage({ commit, dispatch }: ActionContext<SalesState, RootState>, page: number) {
      commit('SET_CURRENT_PAGE', page)
      dispatch('fetchSkuList', { pageNumber: page })
    },
  },

  getters: {
    getDailySalesData: (state: SalesState) => state.dailySalesData,
    getSkuListData: (state: SalesState) => state.skuListData,
    getSelectedDates: (state: SalesState) => state.selectedDates,
    isLoadingSkuList: (state: SalesState) => state.loadingSkuList,
    getCurrentPage: (state: SalesState) => state.currentPage,
    getTotalPages: (state: SalesState) => Math.ceil(state.totalItems / state.itemsPerPage),
    getPaginatedSkuList: (state: SalesState) => {
      if (!state.skuListData || !state.skuListData.item || !state.skuListData.item.skuList) {
        return []
      }

      const startIndex = ((state.currentPage - 1) % 3) * state.itemsPerPage
      const endIndex = startIndex + state.itemsPerPage

      return state.skuListData.item.skuList.slice(startIndex, endIndex)
    },
    getTotalItems: (state: SalesState) => state.totalItems,
    getItemsPerPage: (state: SalesState) => state.itemsPerPage,
  },
}
