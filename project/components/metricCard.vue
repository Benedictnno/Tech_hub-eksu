 <template>
  <div class="bg-white border sm:shadow-md rounded-lg px-4 py-3 flex items-center space-x-4">
    <!-- Icon Section -->
    <div :class="[iconContainerClass, borderColorClass]"
      class="w-12 h-12 rounded flex items-center justify-center">
      <Icon :icon="iconPath" class="text-2xl text-gray-100" />
    </div>

    <!-- Content Section -->
    <div>
      <p class="text-gray-500 text-md">{{ subtitle }}</p>
      <h2 class="text-xl font-bold text-gray-900">{{ content }}</h2>
    </div>
  </div>
</template>

<script>
import { Icon } from '@iconify/vue/dist/iconify.js';
export default {
  name: 'MetricCard',
  components: {
    Icon
  },
  props: {
    id: {
      type: Number,
      required: true
    },
    iconPath: {
      type: String,
      required: true,
    },
    iconSize: {
      type: String,
    },
    iconContainerClass: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    }
  },
  computed: {
    borderColorClass() {
      switch (this.id) {
        case 1:
          return 'border-blue-600';
        case 2:
          return 'border-green-500';
        case 3:
          return 'border-yellow-500';
        case 4:
          return 'border-red-500';
        default:
          return 'border-gray-300'; // default border color
      }
    }
  }
};
</script>

<style scoped>
/* Optional additional styles */
</style>
