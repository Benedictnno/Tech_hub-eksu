<template>
    <NuxtLayout name="admin">
      <!-- Page-specific content goes here -->
      <div class="sm:p-8 sm:pt-4 p-4 mt-20">

        <div class="py-6 space-y-2 flex justify-between w-full items-center">
          <div class="">
            <h1 class="text-2xl font-semibold">Hello </h1>
            <p class="text-sm text-gray-500">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          </div>
          <QrScanner />
        </div>
        <div class="">
          <metricCardListing />
        </div>

        <!-- <QrScanner /> -->

        <div class="metric-table mt-10">
          <metricTableVue />
        </div>
      </div>
    </NuxtLayout>
</template>


<script setup>
import metricTableVue from '~/components/metricTable.vue'
import metricCardListing from '../../components/metricCardListing.vue'
import QrScanner from '../components/QrScanner.vue'

definePageMeta({
  middleware: 'auth'
})
</script>