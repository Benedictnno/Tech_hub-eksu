<template>

    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-xl w-full bg-white p-6 rounded shadow space-y-4">
        <h1 class="text-xl font-bold">👤 User Profile</h1>

        <div v-if="isLoading">Loading user...</div>

        <div v-else-if="user" class="space-y-2">
          <p><strong>Name:</strong> {{ user.name }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Semesters Registered:</strong> {{ user.semesterCount }}</p>
          <p><strong>Access Expires:</strong> {{ formatDate(user.subscription?.endDate) }}</p>

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

        <p v-else class="text-red-500">Failed to load user profile.</p>
      </div>
    </div>
</template>


<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
const config = useRuntimeConfig();
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
    const { data: userData } = await axios.get(`${config.public.URL}/api/users/${route.params.id}`, {
  withCredentials: true, // if you use cookies or sessions
});
    const { data: sessionData } = await axios.get(`${config.public.URL}/api/users/start-of-current-session`, {
  withCredentials: true, // if you use cookies or sessions
});

    if (userData && sessionData) {
      user.value = userData;
      startDate.value = sessionData.data.startDate;

  if (user.value?.uniqueId) {
  try {
    const { data: attendanceRes } = await axios.post(`${config.public.URL}/api/attendance/checkin`, {
      id: route.params.id,
      uniqueId: user.value.uniqueId
    }, {
  withCredentials: true, // if you use cookies or sessions
  })

    console.log(attendanceRes.message) // ✅ this is fine
  } catch (err) {
    console.error("Check-in failed:", err.response?.data?.message || err.message)
  }

}
    }
  } catch (err) {
    console.error('User fetch failed:', err);
  }
});

</script>

