import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/LoginView.vue'
import Dashboard from '@/views/DashboardView.vue'
import store from '@/store'
import type { RouteLocation, NavigationGuardNext } from 'vue-router'
const routes = [
  {
    path: '/',
    component: Login,
    beforeEnter: (to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) => {
      if (store.getters['auth/isAuthenticated']) {
        next('/dashboard')
      } else {
        next()
      }
    },
  },
  {
    path: '/login',
    component: Login,
    beforeEnter: (to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) => {
      if (store.getters['auth/isAuthenticated']) {
        next('/dashboard')
      } else {
        next()
      }
    },
  },
  {
    path: '/dashboard',
    component: Dashboard,
    beforeEnter: (to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) => {
      if (!store.getters['auth/isAuthenticated']) {
        next('/')
      } else {
        next()
      }
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
