<template>
  <div class="w-full bg-white rounded-lg shadow-md p-4 mb-5">
    <div class="flex justify-end items-center mb-4">
      <div class="relative z-50 flex justify-end w-full">
        <div
          v-if="isLoading"
          class="w-full h-[450px] bg-gray-100 rounded-lg flex items-center justify-center animate-pulse"
        >
          <div
            class="w-16 h-16 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"
          ></div>
        </div>
        <DropdownMenu v-if="!isLoading">
          <DropdownMenuTrigger asChild>
            <button
              class="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 text-sm font-medium transition-colors"
            >
              <span>{{ selectedDays }} Days</span>
              <i class="text-xs opacity-70">▼</i>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[120px]"
          >
            <DropdownMenuItem
              v-for="option in dayOptions"
              :key="option"
              @click="changeDateRange(option)"
              class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600 font-medium': selectedDays === option }"
            >
              {{ option }} Days
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <highcharts :options="chartOptions" v-if="!isLoading && hasData"></highcharts>

    <div v-if="!isLoading && !hasData" class="text-center py-10 text-gray-500 text-base">
      No data to show
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions } from 'vuex'
import Highcharts from 'highcharts'
import { Chart } from 'highcharts-vue'
import type { Options } from 'highcharts'
import type { DailySalesOverviewItem } from '@/types/sales'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

Highcharts.setOptions({
  lang: {
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    shortMonths: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    loading: 'Loading...',
    decimalPoint: ',',
    thousandsSep: '.',
  },
})

interface SalesDataPoint {
  x: number
  y: number
}

export default {
  name: 'SalesChart',
  components: {
    highcharts: Chart,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  },
  data() {
    return {
      selectedDays: 7,
      dayOptions: [7, 14, 30, 60],
      isLoading: false,
    }
  },
  computed: {
    ...mapGetters({
      salesData: 'sales/getDailySalesData',
    }),
    hasData() {
      return this.salesData && this.salesData.item && this.salesData.item.length > 0
    },
    chartOptions(): Options {
      if (!this.hasData) return {} as Options

      const parseDate = (dateString: string): number => {
        try {
          const parts = dateString.split(/[-/.]/)
          if (parts.length >= 3) {
            const year = parts[0].length === 4 ? parts[0] : new Date().getFullYear().toString()
            const month = parts[1].padStart(2, '0')
            const day = parts[2].padStart(2, '0')
            return new Date(`${year}-${month}-${day}T00:00:00`).getTime()
          }
          return new Date().getTime()
        } catch (e) {
          console.error('Tarih ayrıştırma hatası:', e)
          return new Date().getTime()
        }
      }

      const salesData: SalesDataPoint[] = this.salesData.item.map(
        (item: DailySalesOverviewItem) => ({
          x: parseDate(item.date),
          y: item.amount,
        }),
      )

      const orderData: SalesDataPoint[] = this.salesData.item.map(
        (item: DailySalesOverviewItem) => ({
          x: parseDate(item.date),
          y: item.orderCount,
        }),
      )

      const colors = Highcharts.getOptions().colors || []
      const color1 = colors[0] ? colors[0].toString() : '#7cb5ec'
      const color2 = colors[1] ? colors[1].toString() : '#434348'

      return {
        chart: {
          type: 'column',
          height: '450px',
          spacing: [10, 10, 15, 10],
          style: {
            fontFamily: 'inherit',
          },
        },
        title: {
          text: 'Daily Sales Chart',
        },
        subtitle: {
          text: `Last ${this.selectedDays} days`,
        },
        xAxis: {
          type: 'datetime',
          labels: {
            format: '{value:%d %b}',
            rotation: -45,
            align: 'right',
          },
          dateTimeLabelFormats: {
            day: '%e %b',
            week: '%e %b',
            month: "%b '%y",
            year: '%Y',
          },
          tickInterval: 24 * 3600 * 1000,
          tickPixelInterval: 70,
          startOnTick: true,
          endOnTick: true,
          showFirstLabel: true,
          showLastLabel: true,
          gridLineWidth: 1,
          gridLineColor: '#f0f0f0',
        },
        yAxis: [
          {
            title: {
              text: 'Sales Amount',
              style: {
                color: color1,
              },
            },
          },
          {
            title: {
              text: 'Order Count',
              style: {
                color: color2,
              },
            },
            opposite: true,
          },
        ],
        tooltip: {
          shared: true,
          useHTML: true,
          headerFormat: '<small>{point.key}</small><table>',
          pointFormat:
            '<tr><td style="color: {series.color}">{series.name}: </td>' +
            '<td style="text-align: right"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>',
          valueDecimals: 2,
        },
        legend: {
          enabled: true,
        },
        time: {
          timezone: 'Europe/Istanbul',
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            borderRadius: 3,
            pointPadding: 0.2,
            groupPadding: 0.1,
            borderWidth: 0,
            shadow: false,
          },
        },
        series: [
          {
            type: 'column',
            name: 'Sales Amount',
            data: orderData,
            color: color1,
            tooltip: {
              valuePrefix: '$ ',
              valueDecimals: 2,
            },
          },
          {
            type: 'column',
            name: 'Order Count',
            data: salesData,
            color: color2,
          },
        ],
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                legend: {
                  align: 'center',
                  verticalAlign: 'bottom',
                  layout: 'horizontal',
                },
                yAxis: [
                  {
                    title: {
                      text: null,
                    },
                  },
                  {
                    title: {
                      text: null,
                    },
                  },
                ],
                xAxis: {
                  labels: {
                    rotation: -90,
                  },
                },
              },
            },
          ],
        },
      }
    },
  },
  methods: {
    ...mapActions({
      fetchSalesData: 'sales/fetchDailySalesOverview',
    }),
    async changeDateRange(days: number) {
      this.selectedDays = days
      await this.loadData()
    },
    async loadData() {
      this.isLoading = true
      try {
        await this.fetchSalesData(this.selectedDays)
      } catch (error) {
        console.error('Error loading sales data:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
  mounted() {
    this.loadData()
  },
}
</script>
