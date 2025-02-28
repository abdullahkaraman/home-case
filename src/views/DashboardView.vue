<template>
  <div class="dashboard">
    <div class="header">
      <h1>Dashboard</h1>
      <div class="user-info" v-if="userInfo">
        <p>Welcome {{ userInfo.firstName || '' }}</p>
        <p>Email: {{ userInfo.email }}</p>
      </div>
      <button @click="logout" class="logout-btn">Çıkış Yap</button>
    </div>

    <SalesChart />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import SalesChart from '@/components/SalesChart.vue'

const store = useStore()
const router = useRouter()

const userInfo = computed(() => store.getters['user/getUserInfo'])
const userEmail = computed(() => store.getters['auth/getUserEmail'])
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

const logout = async () => {
  await store.dispatch('auth/logout')
  router.push('/')
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/')
  } else if (userEmail.value && !userInfo.value) {
    await store.dispatch('user/fetchUserInfo', { email: userEmail.value })
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-info {
  text-align: center;
  margin: 0 20px;
}

.user-info p {
  margin: 5px 0;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

.sales-item {
  margin-bottom: 1rem;
}
</style>
