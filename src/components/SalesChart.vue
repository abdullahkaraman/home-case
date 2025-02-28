<template>
  <div class="sales-chart-container">
    <div class="chart-controls">
      <div class="date-selector">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button class="dropdown-trigger">
              <span>{{ selectedDays }} Gün</span>
              <i class="dropdown-icon">▼</i>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              v-for="option in dayOptions"
              :key="option"
              @click="changeDateRange(option)"
              class="dropdown-item"
              :class="{ 'active-item': selectedDays === option }"
            >
              {{ option }} Gün
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div v-if="isLoading" class="loading">Yükleniyor...</div>
    </div>

    <highcharts :options="chartOptions" v-if="!isLoading && hasData"></highcharts>

    <div v-if="!isLoading && !hasData" class="no-data">Gösterilecek veri bulunamadı</div>
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
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık',
    ],
    shortMonths: [
      'Oca',
      'Şub',
      'Mar',
      'Nis',
      'May',
      'Haz',
      'Tem',
      'Ağu',
      'Eyl',
      'Eki',
      'Kas',
      'Ara',
    ],
    weekdays: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    loading: 'Yükleniyor...',
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
          text: 'Günlük Satış Grafiği',
        },
        subtitle: {
          text: `Son ${this.selectedDays} gün`,
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
              text: 'Satış Tutarı',
              style: {
                color: color1,
              },
            },
          },
          {
            title: {
              text: 'Sipariş Sayısı',
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
            name: 'Satış Tutarı',
            data: salesData,
            color: color1,
            tooltip: {
              valuePrefix: '₺ ',
              valueDecimals: 2,
            },
          },
          {
            type: 'column',
            name: 'Sipariş Sayısı',
            data: orderData,
            yAxis: 1,
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
        console.error('Satış verileri yüklenirken hata oluştu:', error)
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

<style scoped>
.sales-chart-container {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 20px;
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.date-selector {
  display: flex;
  gap: 10px;
  position: relative;
  z-index: 50;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-family: inherit;
  color: inherit;
  outline: none;
}

.dropdown-icon {
  font-size: 0.8em;
  opacity: 0.7;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.active-item {
  background-color: #e6f7ff;
  color: #1976d2;
  font-weight: 500;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}
</style>
