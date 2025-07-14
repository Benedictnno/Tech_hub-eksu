<template>
  <div id="layout" class="flex">
    <div class="flex-1">
      <!-- Main content area -->
      <main class="overflow-y-auto">
        <!-- <HeaderLayout /> -->
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>




</script>

<style scoped>
/* Optional additional styling for layout */
main {
  background-color: #f9fafb;
}
</style>
