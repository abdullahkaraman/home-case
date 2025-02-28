export interface DailySalesOverviewRequest {
  marketplace: string
  sellerId: string
  requestStatus: number
  day: number
  excludeYoYData: boolean
}

export interface DailySalesOverviewItem {
  date: string
  amount: number
  orderCount: number
  unitCount: number
  avgSalesPrev30Days: number
  prevYearDate: string
  prevYearAmount: number
  prevYearOrderCount: number
  prevYearUnitCount: number
  prevYearAvgSalesPrev30Days: number
  profit: number
  yoy30DailySalesGrowth: number
  acos: number
  fbaAmount: number
  fbmAmount: number
  fbaShippingAmount: number
}

export interface DailySalesOverviewData {
  Currency: string
  item: DailySalesOverviewItem[]
  isYoyExist: boolean
}

export interface DailySalesOverviewResponse {
  ApiStatus: boolean
  ApiStatusCode: string
  ApiStatusMessage: string
  Data: DailySalesOverviewData
}
