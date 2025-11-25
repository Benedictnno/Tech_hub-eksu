<template>
  <div
    class="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary-500 to-secondary-500 p-4 pt-20">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p class="text-gray-600 mt-2">Join the TechHub community</p>
        </div>

        <!-- Plan Selection -->
        <div class="mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-3">Select a Plan</h2>
          <div class="space-y-3">
            <!-- Semester Plan -->
            <div class="border rounded-lg p-4 cursor-pointer transition-all"
              :class="selectedPlan === 'semester' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'"
              @click="selectPlan('semester')">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium text-gray-900">Semester Plan</h3>
                  <p class="text-sm text-gray-500">Access for one semester</p>
                </div>
                <div class="text-lg font-bold text-primary-600">₦1,000</div>
              </div>
            </div>

            <!-- Session Plan -->
            <!-- <div class="border rounded-lg p-4 cursor-pointer transition-all"
              :class="selectedPlan === 'session' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'"
              @click="selectPlan('session')">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium text-gray-900">Session Plan</h3>
                  <p class="text-sm text-gray-500">Access for full session (2 semesters)</p>
                </div>
                <div class="text-lg font-bold text-primary-600">₦2,000</div>
              </div>
            </div> -->
          </div>
        </div>

        <!-- Plan Summary -->
        <div class="bg-gray-50 p-6 rounded-lg mb-6">
          <div class="flex justify-between items-center mb-4">
            <span class="text-gray-700 font-medium">{{ planName }} Membership</span>
            <span class="text-gray-900 font-bold">₦{{ planAmount }}</span>
          </div>
          <div class="border-t border-gray-200 pt-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-900 font-bold">Total</span>
              <span class="text-primary-600 font-bold text-xl">₦{{ planAmount }}</span>
            </div>
          </div>
        </div>

        <!-- Paystack Payment Component -->
        <PaystackPayment :email="email" :amount="planAmount" :subscriptionType="selectedPlan" />

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <NuxtLink to="/" class="text-white hover:underline">
        Cancel and return to home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PaystackPayment from '~/components/PaystackPayment.vue';

// Props to allow passing the initial plan from a parent component
const props = defineProps({
  initialPlan: {
    type: String,
    default: 'semester', // Default plan is 'semester'
  }
});

// Router for navigation
const router = useRouter();
const user = ref(null);
const email = computed(() => user.value?.email || '');

// Check if user is registered
onMounted(() => {
  if (process.client) {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/register');
        return;
      }
      user.value = JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/register');
    }
  }
});

// Reactive selected plan (can be 'semester' or 'session')
const selectedPlan = ref(props.initialPlan);

// Function to update selected plan
const selectPlan = (plan) => {
  selectedPlan.value = plan;
};

// Computed property for plan amount
const planAmount = computed(() => {
  return selectedPlan.value === 'semester' ? 1000 : 2000;
});

// Computed property for plan name
const planName = computed(() => {
  return selectedPlan.value === 'semester'
});

//  ? 'semester' : 'session';
</script>
