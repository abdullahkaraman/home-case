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

    <div v-if="dailySales">
      <h2>Daily Sales Overview</h2>
      <p>Currency: {{ dailySales.Currency }}</p>
      <p>Is YOY Exist?: {{ dailySales.isYoyExist }}</p>

      <div v-for="(item, index) in dailySales.item" :key="index" class="sales-item">
        <hr />
        <p>Date: {{ item.date }}</p>
        <p>Amount: {{ item.amount }}</p>
        <p>OrderCount: {{ item.orderCount }}</p>
        <p>UnitCount: {{ item.unitCount }}</p>
      </div>
    </div>
    <div v-else>
      <p>Loading daily sales data...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const dailySales = computed(() => store.getters['sales/getDailySalesData'])
const userInfo = computed(() => store.getters['user/getUserInfo'])
const userEmail = computed(() => store.getters['auth/getUserEmail'])
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

console.log('🔥 User Info:', userInfo.value)
console.log('🔥 User Email:', userEmail.value)

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
