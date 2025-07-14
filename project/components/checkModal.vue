<template>
  <main>
    <button @click="openModal" class="bg-blue-500 text-white py-2 px-4 rounded">
      Check In User
    </button>
  </main>
</template>

<script>
export default {
  data() {
    return {
      isModalOpen: false, // State to control modal visibility
      userNumber: '' // Input field for user number
    }
  },
  methods: {
    openModal() {
      this.isModalOpen = true // Open modal
    },
    closeModal() {
      this.isModalOpen = false // Close modal
      this.userNumber = '' // Clear input field
    },
    verifyUser() {
      // Handle verification logic here
      if (this.userNumber.trim() !== '') {
        console.log('Verifying user number:', this.userNumber)
        // You can add an API call here to verify the user number
        this.closeModal() // Close modal after verification
      } else {
        alert('Please enter a valid user number.')
      }
    }
  }
}
</script>

<style></style>
