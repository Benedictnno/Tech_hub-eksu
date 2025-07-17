<template>
  <div>
    <header v-if="showHeader" class="bg-white shadow-sm fixed w-full z-10">
      <div class=" px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <div class="flex items-center flex-shrink-0">
              <NuxtLink to="/dashboard">
                            <img class="w-auto h-8 mt-2" src="~/assets/img/techhub logo.png" alt="" />

          </NuxtLink>
          

              </div>
            </div>
          </div>
          <div class="flex items-center">
            <button v-if="isAuthenticated" @click="logout" class="text-gray-600 hover:text-primary-600">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <main>
      <div class="">
        <slot />
      </div>
    </main>

    <footer class="bg-white mt-auto">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-gray-500 text-sm">
          © {{ new Date().getFullYear() }} TechHub Eksu. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const route = useRoute();
const showHeader = computed(() => !['/', '/register', '/login'].includes(route.path));
const isAuthenticated = ref(false);

// This would be replaced with actual auth logic
const logout = () => {
  isAuthenticated.value = false;
  navigateTo('/');
};

// Check if user is authenticated on page load
onMounted(() => {
  const user = localStorage.getItem('user');
  isAuthenticated.value = !!user;
});
</script>