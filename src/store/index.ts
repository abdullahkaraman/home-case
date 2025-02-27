import { createStore } from 'vuex'
import auth from './modules/auth'
import sales from './modules/sales'
import user from './modules/user'

const store = createStore({
  modules: {
    auth,
    sales,
    user,
  },
})

export default store
