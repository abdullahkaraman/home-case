import type { AuthState } from '@/store/modules/auth'
import type { SalesState } from '@/store/modules/sales'
import type { UserState } from '@/store/modules/user'

export interface RootState {
  auth: AuthState
  sales: SalesState
  user: UserState
}
