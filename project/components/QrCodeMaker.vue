<template>
  <div class="w-fit">
    <canvas ref="qrCanvas" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

console.log(props.userId);

const qrCanvas = ref(null)

onMounted(() => {
  const url = `https://1rz2s40q-3000.euw.devtunnels.ms/${props.userId}`
  QRCode.toCanvas(qrCanvas.value, url, { width: 200 }, (error) => {
    if (error) console.error(error)
  })
})
</script>
