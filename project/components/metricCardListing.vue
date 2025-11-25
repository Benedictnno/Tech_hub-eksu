<template>
  <main>
    <div class="metric mt-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4">
        <div class="col" v-for="item in metrics" :key="item.id">
          <metricCard :iconPath="item.iconPath" :iconSize="item.iconSize" :iconContainerClass="item.iconContainerClass"
            :subtitle="item.subtitle" :content="item.content" :borderColor="item.borderColor" />
        </div>
      </div>
    </div>
  </main>
</template>

<!-- <script >
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'
import metricCard from './metricCard.vue'
const users = ref(0)

export default {
  components: {
    metricCard
  },
  data() {
    return {
      metrics: [
        {
          id: 1,
          iconPath: 'tdesign:member',
          iconSize: '40',
          iconContainerClass: ' p-2 bg-[#229a93] rounded',
          subtitle: 'Total Members',
          content: users.value,
          borderColor: '#4cd4e4' // Add border color here
        },
        {
          id: 2,
          iconPath: 'solar:users-group-two-rounded-broken',
          iconSize: '0',
          iconContainerClass: 'p-2 bg-green-600 rounded',
          subtitle: 'Present Members',
          content: '0',
          borderColor: '#ff6f61' // Add border color here
        },
        {
          id: 3,
          iconPath: 'majesticons:community-line',
          iconSize: '40',
          iconContainerClass: 'p-2 bg-[#eaa100] rounded',
          subtitle: 'Communities',
          content: '0',
          borderColor: '#ffd700' // Add border color here
        },
        {
          id: 4,
          iconPath: 'mdi:events-check',
          iconSize: '40',
          iconContainerClass: 'p-2 bg-[#299293] rounded',
          subtitle: 'Events',
          content: '0',
          borderColor: '#90ee90' // Add border color here
        }
      ],
      users: [],
      community: [],
      event: [],
      presentUsers: [],
      currentUser: [],
      userRole: ''
    }
  },

}
onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:5000/api/users/all-users`)
console.log(data);

    // if (data) {
    //   users.value = data.users
      
    // }
  } catch (err) {
    console.error('User fetch failed:', err)
  }
})

</script> -->


<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import metricCard from './metricCard.vue'

// Reactive state
const users = ref([])
const presentUsers = ref([])
const community = ref([])
const event = ref([])

// Metrics (computed to reflect live state)
const metrics = computed(() => [
  {
    id: 1,
    iconPath: 'tdesign:member',
    iconSize: '40',
    iconContainerClass: 'p-2 bg-[#229a93] rounded',
    subtitle: 'Total Members',
    content: users.value,
    borderColor: '#4cd4e4'
  },
  {
    id: 2,
    iconPath: 'solar:users-group-two-rounded-broken',
    iconSize: '40',
    iconContainerClass: 'p-2 bg-green-600 rounded',
    subtitle: 'Present Members',
    content: presentUsers.value.length,
    borderColor: '#ff6f61'
  },
  {
    id: 3,
    iconPath: 'majesticons:community-line',
    iconSize: '40',
    iconContainerClass: 'p-2 bg-[#eaa100] rounded',
    subtitle: 'Communities',
    content: community.value.length,
    borderColor: '#ffd700'
  },
  {
    id: 4,
    iconPath: 'mdi:events-check',
    iconSize: '40',
    iconContainerClass: 'p-2 bg-[#299293] rounded',
    subtitle: 'Events',
    content: event.value.length,
    borderColor: '#90ee90'
  }
])

onMounted(async () => {
  try {

       const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

    const { data:allusers } = await axios.get(`http://localhost:5000/api/users/all-users`)
   const {data:totalCheckedIn}=await axios.get(`http://localhost:5000/api/attendance/total-checkedin`,{
      headers: {
                Authorization: `Bearer ${token}`
            }
   })
    
    if (allusers?.users && totalCheckedIn) {
      users.value = allusers.users
      presentUsers.value= totalCheckedIn.users
    }
    // Add logic here for presentUsers, communities, events, etc.
  } catch (err) {
    console.error('User fetch failed:', err)
  }
})
</script>

