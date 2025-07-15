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

<script>
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
console.log(data.users);

    if (data) {
      users.value = data.users
      
    }
  } catch (err) {
    console.error('User fetch failed:', err)
  }
})

</script>