<template>
    <NuxtLayout name="admin">
      <div class="sm:p-8 sm:pt-4 p-4 mt-20">
        <h1 class="text-2xl font-semibold mb-4">Academic Session Management</h1>
  
        <!-- Session Form -->
        <div class="bg-white p-4 rounded shadow space-y-4">
          <h2 class="text-lg font-semibold">
            {{ isEditing ? 'Edit Academic Session' : 'Create Academic Session' }}
          </h2>
  
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">Start Date</label>
              <input v-model="startDate" type="date" class="w-full p-2 border rounded" />
            </div>
            <div>
              <label class="text-sm text-gray-600">End Date</label>
              <input v-model="endDate" type="date" class="w-full p-2 border rounded" />
            </div>
          </div>
          <!--set active session -->
          <div class="col-span-2">
  <label class="flex items-center space-x-2">
    <input type="checkbox" v-model="isActive" />
    <span class="text-sm text-gray-600">Set as Active Session</span>
  </label>
</div>
<!-- end -->
          <button
            @click="saveSession"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {{ isEditing ? 'Update' : 'Save' }}
          </button>
        </div>
  
        <!-- Session Table -->
        <div class="mt-6 bg-white p-4 rounded shadow">
          <h3 class="text-md font-semibold mb-2">All Sessions</h3>
          <table class="min-w-full text-left text-sm">
            <thead>
              <tr class="border-b">
                <th class="p-2">Start</th>
                <th class="p-2">End</th>
                <th class="p-2">Actions</th>
                <th class="p-2">Active</th>

              </tr>
            </thead>
            <tbody>
              <tr
                v-for="session in sessions"
                :key="session._id"
                class="border-b hover:bg-gray-50 transition"
              >
                <td class="p-2">{{ session.startDate.slice(0, 10) }}</td>
                <td class="p-2">{{ session.endDate.slice(0, 10) }}</td>
                
                <td class="p-2 space-x-2">
                  <button @click="editSession(session)" class="text-blue-600 hover:underline">Edit</button>
                  <button @click="deleteSession(session._id)" v-if="!session.isActive" class="text-red-600 hover:underline">Delete</button>
                </td>
                <td class="p-2 text-green-600" v-if="session.isActive">Active</td>
        <td class="p-2 text-gray-400" v-else>-</td>
          
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </NuxtLayout>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  const config = useRuntimeConfig();
  definePageMeta({
  middleware: 'auth'
 })

  const isActive = ref(false)
  const sessions = ref([])
  const startDate = ref('')
  const endDate = ref('')
  const selectedSessionId = ref(null)
  const isEditing = ref(false)
  
  const API_BASE = `${config.public.URL}/api/admin`// Change this if deployed
  


  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sessions`)
      sessions.value = res.data
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }
  
  const saveSession = async () => {
    if (!startDate.value || !endDate.value) {
      alert('Start and end dates are required')
      return
    }
  
    try {
      if (isEditing.value) {
        await axios.put(`${API_BASE}/update-session/${selectedSessionId.value}`, {
          startDate: startDate.value,
          endDate: endDate.value,
          isActive: isActive.value

        }, {
  withCredentials: true, // if you use cookies or sessions
})
      } else {
        await axios.post(`${API_BASE}/set-session`, {
          startDate: startDate.value,
          endDate: endDate.value,
          isActive: isActive.value
        })
      }
  
      // Reset form
      startDate.value = ''
      endDate.value = ''
      selectedSessionId.value = null
      isEditing.value = false
      fetchSessions()
    } catch (err) {
      console.error('Save failed:', err)
    }
  }
  
  const editSession = (session) => {
    startDate.value = session.startDate.slice(0, 10)
    endDate.value = session.endDate.slice(0, 10)
    selectedSessionId.value = session._id
    isEditing.value = true
  }
  
  const deleteSession = async (id) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await axios.delete(`${API_BASE}/delete-session/${id}`)
        fetchSessions()
      } catch (err) {
        console.error('Delete error:', err)
      }
    }
  }
  
  onMounted(fetchSessions)
  </script>
  