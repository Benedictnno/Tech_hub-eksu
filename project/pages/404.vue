<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
      <div class="p-8 text-center">
        <h1 class="text-9xl font-bold text-primary-600">404</h1>
        <h2 class="text-2xl font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p class="text-gray-600 mt-2">The page you are looking for doesn't exist or has been moved.</p>
        
        <div class="mt-8">
          <NuxtLink to="/" class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
            Go back home
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>