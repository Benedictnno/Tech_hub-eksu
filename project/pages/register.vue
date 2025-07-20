<template>
  <div
    class="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create Account</h1>
          <p class="text-gray-600 mt-2">Join the Campus TechHub community</p>
        </div>

        <form  @submit.prevent="register" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
            <input id="name" v-model="form.name" type="text" required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
            <input id="email" v-model="form.email" type="email" required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>



          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" v-model="form.password" type="password" required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input id="confirmPassword" v-model="form.confirmPassword" type="password" required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <div>
            <button
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              :disabled="isSubmitting">
              <span v-if="isSubmitting">Processing...</span>
              <span v-else>Create Account</span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <NuxtLink to="/login" class="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <NuxtLink to="/" class="text-white hover:underline">
        Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>

import axios from 'axios';
import { toast } from 'vue3-toastify';
import { z } from 'zod';
const config = useRuntimeConfig();
const router = useRouter();
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const isSubmitting = ref(false);




const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});





const register = async () => {
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '');

  try {
    isSubmitting.value = true;

    // Validate form
    schema.parse(form);

    // Send data to API
    const response = await axios.post(`${config.public.URL}/api/auth/register`, form, {
      headers: {
        'Content-Type': 'application/json'
      },
  withCredentials: true, // if you use cookies or sessions

    });

    const data = response.data;

    // Store token in localStorage
    localStorage.setItem('token', data.token);
    // Store user data (in a real app, this would be a JWT token or similar)
    localStorage.setItem('user', JSON.stringify({
      name: form.name,
      email: form.email,
      isRegistered: true,
      hasPaid: false,
      isOnboarded: false
    }));

    toast.success('Account created successfully');
    // Navigate to payment page
    router.push('/payment');
  } catch (error) {
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      errors.general = errorData.message || 'Registration failed';
      toast.error(errors.general);
    } else if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      toast.error('Please fix the errors in the form');
    } else {
      console.error('Registration error:', error);
      errors.general = error.message;
      toast.error('Registration failed');
    }
  } finally {
    isSubmitting.value = false;
  }
};

// form.uniqueId = generateUniqueId();
</script>