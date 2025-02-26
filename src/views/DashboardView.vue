<template>
  <div class="dashboard">
    <div class="header">
      <h1>Dashboard</h1>
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

const logout = async () => {
  await store.dispatch('auth/logout')
  router.push('/')
}

onMounted(async () => {
  if (!store.getters['auth/isAuthenticated']) {
    router.push('/')
  } else {
    await store.dispatch('user/fetchUserInfo', { email: 'homework@eva.guru' })
    await store.dispatch('sales/fetchDailySalesOverview', 30)
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
