<template>
  <div class="container mx-auto">
    <!-- Table Header with Search and Sort Bar -->
    <div class="sm:flex items-center justify-between mb-4">
      <h1 class="text-[20px] font-medium">Today Attendance ({{ data.length }})</h1>
      <div class="flex items-center space-x-4 mt-4 sm:mt-0">
        <!-- Search Bar -->
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <input type="search" id="default-search"
            class="block md:w-[400px] p-4 py-2.5 ps-10 text-sm text-gray-900 border border-gray-200 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
            placeholder='Search members' v-model="search" required />
        </div>
      </div>
    </div>

    <!-- Table Body -->
    <div class="overflow-x-auto">
      <table class="w-full rounded text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-100 w-full">
          <tr>
            <!-- Apply padding only to <th> to keep them spacious -->
            <th scope="col" class="px-6 py-4">ID</th>
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3">Phone</th>
            <th scope="col" class="px-6 py-3">Date</th>
            <th scope="col" class="px-6 py-3">Status</th>
            <th scope="col" class="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody class="w-full py-2">
          <tr v-for="(item, index) in filteredData" :key="item.id" class="bg-white text-gray-700 border-b">
            <!-- Reduce padding for <td> elements and apply text-overflow handling -->
            <td class="px-4 py-6 truncate">{{ index + 1 }}</td>
            <td class="px-4 py-6 truncate font-bold">{{ item.name }}</td>
            <td class="px-4 py-6 truncate">{{ item.email }}</td>
            <td class="px-4 py-6 truncate">
              {{ new Date(item.checkInTime).toLocaleString() }}
            </td>
            <td class="px-4 py-2">
              <span class="text-green-300 font-semibold">Checked In</span>
              <!-- <span v-else class="text-red-500">Checked Out</span> -->
            </td>
            <td class="px-4 py-2">
              <button v-if="item.checkedIn" @click="checkOut(item.uniqueId)"
                class="px-4 py-2 text-white bg-red-500 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <path d="M10 8V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2" />
                    <path d="M15 12H3l3-3m0 6l-3-3" />
                  </g>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, computed } from 'vue';

const search = ref('');
const data = ref([
  // { id: 1, username: 'John Doe', email: 'john@example.com', checkInTime: '2023-10-01T08:30:00', checkedIn: true, uniqueId: '1' },
  // { id: 2, username: 'Jane Smith', email: 'jane@example.com', checkInTime: '2023-10-01T09:00:00', checkedIn: false, uniqueId: '2' },
  // { id: 3, username: 'Bob Johnson', email: 'bob@example.com', checkInTime: '2023-10-01T09:30:00', checkedIn: true, uniqueId: '3' }
]);

       

const filteredData = computed(() => {
  return data.value.filter(item => item.name.toLowerCase().includes(search.value.toLowerCase()));
});

const checkOut = (uniqueId) => {
  const item = data.value.find(item => item.uniqueId === uniqueId);
  if (item) {
    item.checkedIn = false;
  }
};


onMounted(async()=>{
  const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }
   const {data:totalCheckedIn}=await axios.get(`http://localhost:5000/api/attendance/total-checkedin`,{
      headers: {
                Authorization: `Bearer ${token}`
            }
   })
   data.value= totalCheckedIn.users
console.log(totalCheckedIn.users);

})
</script>
