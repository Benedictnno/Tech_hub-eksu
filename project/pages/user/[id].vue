<template>
  <NuxtLayout name="default">
    <div class="max-w-xl mx-auto mt-20 bg-white p-6 rounded shadow space-y-4">
      <h1 class="text-xl font-bold">👤 User Profile</h1>

      <div v-if="user" class="space-y-2">
        <p><strong>Name:</strong> {{ user.fullName }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Semesters Registered:</strong> {{ user.semesterCount }}</p>
        <p><strong>Access Expires:</strong> {{ formatDate(user.subscription.endDate) }}</p>

        <div
          class="p-3 rounded font-semibold"
          :class="{
            'bg-green-100 text-green-700': isActive,
            'bg-red-100 text-red-700': !isActive
          }"
        >
          {{ isActive ? '✅ Active for this semester' : '❌ Access Expired' }}
        </div>
      </div>

      <p v-else>Loading user...</p>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const route = useRoute()
const user = ref(null)
const startDate = ref(null)

const isActive = computed(() => {
  if (!user.value?.subscription?.startDate || !user.value?.subscription?.endDate || !startDate.value) return false

  const now = new Date()
  const subStart = new Date(user.value.subscription.startDate)
  const subEnd = new Date(user.value.subscription.endDate)
  const sessionStart = new Date(startDate.value)

  return subEnd > now && subStart >= sessionStart
})


const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:5000/api/users/${route.params.id}`)
    const { data:start } = await axios.get(`http://localhost:5000/api/users/start-of-current-session`)

    if (data && start) {
      user.value = data
      startDate.value= start.data.startDate
    }
  } catch (err) {
    console.error('User fetch failed:', err)
  }
})
</script>

