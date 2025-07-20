<template>
  <div
    class="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p class="text-gray-600 mt-2">Sign in to your TechHub account</p>
        </div>

        <form @submit.prevent="login" class="space-y-6">
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

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button 
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              :disabled="isSubmitting">
              <span v-if="isSubmitting">Signing in...</span>
              <span v-else>Sign in</span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <NuxtLink to="/register" class="font-medium text-primary-600 hover:text-primary-500">
              Register now
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
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { ref, reactive } from 'vue'
const config = useRuntimeConfig();
const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})



const errors = reactive({
  email: '',
  password: '',
  general: ''
})

const isSubmitting = ref(false)

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

const login = async () => {
  Object.keys(errors).forEach(key => errors[key] = '')
  isSubmitting.value = true

  try {
    schema.parse(form)

    const response = await axios.post(`${config.public.URL}/api/auth/login`, form, {
  withCredentials: true, // if you use cookies or sessions
})
    const user = response.data
    const token = user.token

    toast.success('Login successful')
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    const isActive = user?.subscription?.endDate &&
      new Date(user.subscription.endDate) > new Date()

    if (!user.hasPaid || !isActive) {
      router.push('/payment')
    } else if (!user.isOnboarded) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        if (err.path) errors[err.path[0]] = err.message
        toast.error(err.message)
      })
    } else if (error.response?.data) {
      errors.general = error.response.data.message || 'Invalid email or password'
      toast.error(errors.general)
    } else {
      toast.error('An error occurred during login')
      console.error('Login error:', error)
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
