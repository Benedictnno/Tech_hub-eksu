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

const isActive = computed(() => {
  if (!user.value?.endDate) return false
  return new Date(user.value.endDate) > new Date()
})

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
// const formatDate = (date) => {
//   if (!date) return 'N/A'
//   const d = new Date(date)
//   return isNaN(d) ? 'Invalid date' : d.toLocaleDateString(undefined, {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   })
// }


  onMounted(async () => {
  const {data} = await axios.get(`http://localhost:5000/api/users/${route.params.id}`)
  if (data) user.value = data
  console.log(user.value);
  
})
</script>
