<template>
    <div>
        <!-- Single Button to Open the User Verification Input -->
        <button @click="openCheckInForm"
            class="bg-[#299293] text-white font-semibold py-2.5 px-6 rounded-md shadow-md mt-4 w-max z-50">
            Check-In User
        </button>

        <!-- Check-In Form Modal -->
        <div v-if="isCheckInFormOpen"
            class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div class="bg-white p-6 rounded-md shadow-md w-[90%] sm:w-[400px]">
                <h2 class="text-lg font-semibold mb-4">User Verification</h2>
                <input type="text" v-model="userNumber" class="w-full p-2 border border-gray-300 rounded-md mb-4"
                    placeholder="Enter user number" />
                <div class="flex justify-end gap-2">
                    <button @click="closeCheckInForm" class="bg-gray-300 text-black py-2 px-4 rounded">
                        Cancel
                    </button>
                    <button @click="verifyUser" class="bg-blue-500 text-white py-2 px-4 rounded" :disabled="isLoading">
                        {{ isLoading ? 'Verifying...' : 'Verify' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const isCheckInFormOpen = ref(false);
const userNumber = ref('');
const isLoading = ref(false);

const openCheckInForm = () => {
    isCheckInFormOpen.value = true;
};

const closeCheckInForm = () => {
    isCheckInFormOpen.value = false;
};

const verifyUser = async () => {
    isLoading.value = true;
    try {
        const response = await axios.post('http:localhost:5000/api/attendance/checkin', { uniqueId: userNumber.value });
        alert('User verified successfully!');
    } catch (error) {
        alert('Verification failed!');
    } finally {
        isLoading.value = false;
        closeCheckInForm();
    }
};
</script>

<style scoped>
.btn {
    background-color: #007bff;
    color: #fff;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.btn-secondary {
    background-color: #6c757d;
}

.btn-danger {
    background-color: #dc3545;
}

.btn-primary:hover {
    background-color: #0056b3;
}

.btn-secondary:hover {
    background-color: #5a6268;
}

.btn-danger:hover {
    background-color: #c82333;
}
</style>
