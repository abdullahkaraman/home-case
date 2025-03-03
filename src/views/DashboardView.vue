<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-5">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <div class="text-center mx-5" v-if="userInfo">
        <p class="my-1">Welcome {{ userInfo.firstName || '' }}</p>
        <p class="my-1">Email: {{ userInfo.email }}</p>
      </div>
      <button
        @click="logout"
        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>

    <SalesChart :selectedDates="selectedDates" />
    <SkuTable :selectedDates="selectedDates" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import SalesChart from '@/components/SalesChart.vue'
import SkuTable from '@/components/SkuTable.vue'
const store = useStore()
const router = useRouter()

const userInfo = computed(() => store.getters['user/getUserInfo'])
const userEmail = computed(() => store.getters['auth/getUserEmail'])
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const selectedDates = computed(() => store.getters['sales/getSelectedDates'])

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
