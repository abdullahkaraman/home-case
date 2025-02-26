import { createStore } from 'vuex'
import auth from './modules/auth'
import sales from './modules/sales'
import user from './modules/user'

export default createStore({
  modules: {
    auth,
    sales,
    user,
  },
})
