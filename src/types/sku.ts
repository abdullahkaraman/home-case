export interface DailySalesSkuListRequest {
  marketplace: string
  sellerId: string
  salesDate: string
  salesDate2?: string
  pageSize: number
  pageNumber: number
  isDaysCompare: number
}

export interface SkuListItem {
  sku: string
  productName: string
  qty: number
  shippingAmount: number
  amount: number
  refundPercantage: number
  qty2?: number
  amount2?: number
  refundRate?: number
}

export interface DailySalesSkuListData {
  Currency: string
  item: {
    selectedDate: string
    TotalSale: number
    skuList: SkuListItem[]
    selectedDate2?: string
    TotalSale2?: number
  }
}

export interface DailySalesSkuListResponse {
  ApiStatus: boolean
  ApiStatusCode: string
  ApiStatusMessage: string
  Data: DailySalesSkuListData
}

export interface GetSkuRefundRateRequest {
  marketplace: string
  sellerId: string
  skuList: string[]
  requestedDay?: number
}

export interface SkuRefundRateItem {
  sku: string
  refundRate: number
}

export interface GetSkuRefundRateData {
  item: SkuRefundRateItem[]
}

export interface GetSkuRefundRateResponse {
  ApiStatus: boolean
  ApiStatusCode: string
  ApiStatusMessage: string
  Data: GetSkuRefundRateData
}
