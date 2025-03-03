<template>
  <div v-if="selectedDates.length > 0" class="bg-white rounded-lg shadow-md p-4 mb-5">
    <h2 class="text-lg font-semibold mb-4">SKU List</h2>

    <div v-if="isLoading" class="w-full h-24 flex items-center justify-center">
      <div
        class="w-8 h-8 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"
      ></div>
    </div>

    <div v-else-if="!hasData" class="text-center py-6 text-gray-500">
      SKU data not found for selected dates
    </div>

    <div v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-1/6"
              >
                SKU
              </th>
              <th
                class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-1/4"
              >
                Product Name
              </th>

              <template v-if="selectedDates.length === 1">
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 tracking-wider border-b w-1/3"
                >
                  {{ formatDateDay(selectedDates[0]) }} <br />
                  {{ formatDate(selectedDates[0]) }} <br />
                  Sales / Units
                  <p>Avr. Selling Price</p>
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 tracking-wider border-b w-1/4"
                >
                  SKU Refund Rate
                </th>
              </template>

              <template v-else-if="selectedDates.length === 2">
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 tracking-wider border-b w-1/5"
                >
                  {{ formatDateDay(selectedDates[0]) }} <br />
                  {{ formatDate(selectedDates[0]) }} <br />Sales / Units
                  <p>Avr. Selling Price</p>
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 tracking-wider border-b w-1/5"
                >
                  {{ formatDateDay(selectedDates[1]) }} <br />
                  {{ formatDate(selectedDates[1]) }} <br />
                  Sales / Units
                  <p>Avr. Selling Price</p>
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 tracking-wider border-b w-1/5"
                >
                  SKU Refund Rate
                </th>
              </template>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(sku, index) in paginatedSkuList" :key="index" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-sm text-gray-900">{{ sku.sku }}</td>
              <td class="px-4 py-2 text-sm text-gray-900 truncate max-w-[60rem]">
                {{ sku.productName }}
              </td>

              <template v-if="selectedDates.length === 1">
                <td class="px-4 py-2 text-sm text-right text-blue-800 font-bold">
                  C${{ formatNumber(sku.salesAmount) }} / {{ sku.qty }}
                  <p>
                    {{ sku.qty ? 'C$' + formatNumber(sku.salesAmount / sku.qty) : '-' }}
                  </p>
                </td>
                <td class="px-4 py-2 text-sm text-right text-gray-900">
                  {{ formatNumber(sku.refundRate || 0) }}%
                </td>
              </template>

              <template v-else-if="selectedDates.length === 2">
                <td class="px-4 py-2 text-sm text-right text-blue-800 font-bold">
                  C${{ formatNumber(sku.salesAmount) }} / {{ sku.qty }}
                  <p>
                    {{ sku.qty ? 'C$' + formatNumber(sku.salesAmount / sku.qty) : '-' }}
                  </p>
                </td>
                <td class="px-4 py-2 text-sm text-right text-green-800 font-bold">
                  C${{ formatNumber(sku.salesAmount2 || 0) }} / {{ sku.qty2 }}
                  <p class="flex justify-end items-center">
                    {{ sku.qty2 ? 'C$' + formatNumber(sku.salesAmount2 / sku.qty2) : '-' }}
                    <span
                      v-if="shouldShowPriceComparisonArrow(sku)"
                      class="ml-1"
                      :class="getPriceComparisonClass(sku)"
                    >
                      {{ isPriceIncreased(sku) ? '↑' : '↓' }}
                    </span>
                  </p>
                </td>
                <td class="px-4 py-2 text-sm text-right text-gray-900">
                  {{ formatNumber(sku.refundRate || 0) }}%
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-700">
          Total <span class="font-medium">{{ totalItems }}</span> products
        </div>
        <div class="flex space-x-2">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm"
            :class="
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50'
            "
          >
            Previous
          </button>
          <span
            class="px-3 py-1 border border-gray-300 rounded-md bg-blue-50 text-blue-600 text-sm"
          >
            {{ currentPage }}
          </span>
          <button
            @click="nextPage"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm"
            :class="
              currentPage >= totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50'
            "
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from 'vuex'
import { computed, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { SkuListItem } from '@/types/sku'

interface SkuListParams {
  isDaysCompare: boolean | number
  salesDate: string
  salesDate2?: string
  pageNumber: number
  pageSize: number
}

interface SkuRefundParams {
  skuList: string[]
}

export default defineComponent({
  name: 'SkuTable',
  props: {
    selectedDates: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  setup(props) {
    const store = useStore()
    const isLoading = ref(false)

    const fetchSkuList = (params: SkuListParams) => store.dispatch('sales/fetchSkuList', params)
    const fetchSkuRefundRates = (params: SkuRefundParams) =>
      store.dispatch('sales/fetchSkuRefundRates', params)
    const setCurrentPage = (page: number) => store.dispatch('sales/setCurrentPage', page)

    const skuListData = computed(() => store.getters['sales/getSkuListData'])
    const currentPage = computed(() => store.getters['sales/getCurrentPage'])
    const totalPages = computed(() => store.getters['sales/getTotalPages'])
    const paginatedSkuList = computed(() => store.getters['sales/getPaginatedSkuList'])
    const totalItems = computed(() => store.getters['sales/getTotalItems'])

    const hasData = computed(() => {
      return paginatedSkuList.value && paginatedSkuList.value.length > 0
    })

    watch(
      () => props.selectedDates,
      async (newDates) => {
        if (newDates.length > 0) {
          isLoading.value = true
          try {
            const params = {
              isDaysCompare: newDates.length === 2 ? 1 : 0,
              salesDate: newDates[0],
              salesDate2: newDates.length > 1 ? newDates[1] : undefined,
              pageNumber: 1,
              pageSize: 30,
            }

            await fetchSkuList(params)

            if (
              skuListData.value &&
              skuListData.value.item &&
              skuListData.value.item.skuList &&
              skuListData.value.item.skuList.length > 0
            ) {
              const skuList = skuListData.value.item.skuList.map((item: SkuListItem) => item.sku)

              if (skuList && skuList.length > 0) {
                await fetchSkuRefundRates({ skuList })
              }
            }
          } catch (error) {
            console.error('Error fetching SKU data:', error)
          } finally {
            isLoading.value = false
          }
        }
      },
      { immediate: true },
    )

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        setCurrentPage(currentPage.value + 1)
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        setCurrentPage(currentPage.value - 1)
      }
    }

    const formatNumber = (value: number | null | undefined): string => {
      if (value === undefined || value === null) return '0.00'
      return Number(value).toFixed(2)
    }

    const formatDate = (dateStr: string): string => {
      try {
        const [year, month, day] = dateStr.split('-').map((num) => parseInt(num, 10))
        const date = new Date(year, month - 1, day)
        return date.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })
      } catch {
        return dateStr
      }
    }

    const formatDateDay = (dateStr: string): string => {
      try {
        const [year, month, day] = dateStr.split('-').map((num) => parseInt(num, 10))
        const date = new Date(year, month - 1, day)
        return date.toLocaleDateString('en-US', { weekday: 'long' })
      } catch {
        return dateStr
      }
    }

    const getAveragePrice = (
      salesAmount: number | null | undefined,
      qty: number | null | undefined,
    ) => {
      if (!salesAmount || !qty) return 0
      return salesAmount / qty
    }

    const isPriceIncreased = (sku: SkuListItem) => {
      if (sku.qty2 && sku.amount2 && (!sku.qty || !sku.amount)) return true

      const avgPrice1 = getAveragePrice(sku.amount, sku.qty)
      const avgPrice2 = getAveragePrice(sku.amount2, sku.qty2)

      return avgPrice2 > avgPrice1
    }

    const shouldShowPriceComparisonArrow = (sku: SkuListItem) => {
      if (!sku.qty || !sku.qty2 || !sku.amount || !sku.amount2) return true

      const avgPrice1 = getAveragePrice(sku.amount, sku.qty)
      const avgPrice2 = getAveragePrice(sku.amount2, sku.qty2)

      return avgPrice1 !== avgPrice2
    }

    const getPriceComparisonClass = (sku: SkuListItem) => {
      return {
        'text-green-600': isPriceIncreased(sku),
        'text-red-600': !isPriceIncreased(sku),
      }
    }

    onMounted(() => {
      setCurrentPage(1)
    })

    return {
      isLoading,
      skuListData,
      hasData,
      currentPage,
      totalPages,
      paginatedSkuList,
      totalItems,
      nextPage,
      prevPage,
      formatNumber,
      formatDate,
      formatDateDay,
      getAveragePrice,
      isPriceIncreased,
      shouldShowPriceComparisonArrow,
      getPriceComparisonClass,
    }
  },
})
</script>
