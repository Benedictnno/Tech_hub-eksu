
<template>
  <!-- QR code will be rendered here -->
  <canvas ref="qrCanvas"></canvas>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import QRCode from 'qrcode'

// Runtime config (Nuxt 3)
const config = useRuntimeConfig()

// Props
const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

// Ref for canvas
const qrCanvas = ref(null)

// Function to generate QR code
function generateQRCode() {
  const url = `https://tech-hub-eksu.vercel.app/user/${props.userId}`
  // console.log("Generating QR for:", url)

  if (!qrCanvas.value) {
    console.error("Canvas not mounted yet.")
    return
  }

  QRCode.toCanvas(qrCanvas.value, url, { width: 200 }, (error) => {
    if (error) {
      console.error("QR generation failed:", error)
    } else {
      console.log("QR code generated for:", props.userId)
    }
  })
}

// Watch for userId and canvas availability
watch(
  () => props.userId,
  async (newVal) => {
    if (!newVal) return

    await nextTick() // wait for DOM to render canvas
    generateQRCode()
  },
  { immediate: true }
)
</script>





