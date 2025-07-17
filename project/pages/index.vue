<template>
  <div class="min-h-screen flex flex-col p-4 md:p-0 justify-center items-center bg-gradient-to-br from-primary-500 to-secondary-500">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
      <div class="p-8">
        <div class="text-center mb-8">
          <div class="flex items-center flex-shrink-0 px-4">
            
            <img class="w-auto h-8 mt-2"
              src="~/assets/img/techhub logo.png" alt="" />
            
          </div>
          <p class="text-gray-600 mt-4">Your gateway to tech innovation on campus</p>
        </div>
        
        <div class="space-y-4">
          <NuxtLink to="/login" class="block w-full py-3 px-4 text-center bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition duration-200">
            Login
          </NuxtLink>
          
          <NuxtLink to="/register" class="block w-full py-3 px-4 text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition duration-200">
            Register
          </NuxtLink>
        </div>
        
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500">
            Join our community of tech enthusiasts and innovators
          </p>
        </div>
      </div>
    </div>
<!--     
    <div class="mt-8 text-center text-white">
      <p class="text-sm opacity-80">
        © {{ new Date().getFullYear() }} Campus TechHub. All rights reserved.
      </p>
    </div> -->
  </div>
</template>