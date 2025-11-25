<template>
    <div class="px-4 my-4 sm:px-0">
        <div class="flex justify-between items-center mb-4">
            <div class="flex justify-between w-full items-center mb-4">

                <h2 class="text-xl font-semibold text-gray-900 ml-2">Your Profile</h2>
                <NuxtLink to="/dashboard" class="text-primary-600 flex items-center gap-1 hover:text-primary-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to dashboard
                </NuxtLink>
            </div>
        </div>
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center gap-2 sm:gap-0">
                <div>
                    <h3 class="text-md sm:text-lg leading-6 font-medium text-gray-900">Student Information</h3>
                    <p class="mt-1 max-w-2xl text-xs sm:text-sm text-gray-500">Personal details and application.</p>
                </div>
                <button @click="openEditModal"
                    class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                    Edit Profile
                </button>
            </div>
            <div class="border-t border-gray-200">
                <dl>
                    <!-- <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Profile Picture</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <img v-if="user?.profilePicture" :src="user.profilePicture" alt="Profile Picture"
                                class="h-24 w-24 rounded-full object-cover" />
                            <span v-else
                                class="inline-block h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <span class="text-gray-500 text-xl">{{ user?.name ? user.name.charAt(0).toUpperCase() :
                                    'U' }}</span>
                            </span>
                        </dd>
                    </div> -->
                    <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Full name</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user?.name || 'Not available' }}
                        </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Email address</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user?.email || 'Not available'
                        }}</dd>
                    </div>
                    <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Matric number</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{
                            user?.studentDetails?.matricNumber || 'Not available' }}</dd>
                    </div>
                    <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Level</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user?.studentDetails?.level ||
                            'Not available' }}</dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Phone number</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{
                            user?.studentDetails?.phoneNumber || 'Not available' }}</dd>
                    </div>

                    <!-- <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-gray-500">Skills</dt>
                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div v-if="user?.studentDetails?.skills" class="flex flex-wrap gap-2">
                                <span v-for="skill in user.studentDetails.skills.split(',')" :key="skill"
                                    class="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                                    {{ skill.trim() }}
                                </span>
                            </div>
                            <span v-else>Not available</span>
                        </dd>
                    </div> -->
                </dl>
            </div>
        </div>

        <!-- Edit Profile Modal -->
        <div v-if="isEditModalOpen" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title"
            role="dialog" aria-modal="true">
            <div class="flex items-end md:justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <!-- Background overlay -->
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                    @click="closeEditModal"></div>

                <!-- Modal panel -->
                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl w-full transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form @submit.prevent="submitProfileEdit">
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="flex-start sm:flex sm:items-start">
                                <div class="mt-3 sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 class="text-lg text-left leading-6 font-medium text-gray-900" id="modal-title">
                                        Edit Profile
                                    </h3>
                                    <div class="mt-4 space-y-6">
                                        <!-- Profile Picture -->
                                        <!-- <div>
                                            <label for="profilePicture"
                                                class="block text-sm font-medium text-gray-700">Profile Picture</label>
                                            <div class="mt-2 flex items-center space-x-5">
                                                <img v-if="previewImage || user?.profilePicture"
                                                    :src="previewImage || user?.profilePicture" alt="Profile Picture"
                                                    class="h-20 w-20 rounded-full object-cover" />
                                                <span v-else
                                                    class="inline-block h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span class="text-gray-500 text-xl">{{ user?.name ?
                                                        user.name.charAt(0).toUpperCase() : 'U' }}</span>
                                                </span>
                                                <input type="file" id="profilePicture" ref="profilePictureInput"
                                                    @change="handleFileChange" class="hidden" accept="image/*" />
                                                <button type="button" @click="triggerFileInput"
                                                    class="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                                    Change
                                                </button>
                                            </div>
                                        </div> -->

                                        <!-- Phone Number -->
                                        <div>
                                            <label for="phoneNumber"
                                                class="block text-sm font-medium text-gray-700">Phone Number</label>
                                            <div class="mt-1">
                                                <input type="tel" id="phoneNumber" v-model="phoneNumber"
                                                    class="shadow-sm p-2 border focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 mb-2 px-4 py-3 sm:px-6 flex items-center gap-4">
                            <button type="submit"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">
                                <span v-if="isLoading">Saving...</span>
                                <span v-else>Save</span>
                            </button>
                            <button type="button" @click="closeEditModal"
                                class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';

// State
const user = ref(null);
const isEditModalOpen = ref(false);
const profilePicture = ref(null);
const phoneNumber = ref('');
const previewImage = ref(null);
const profilePictureInput = ref(null);
const isLoading = ref(false);
// Fetch user data
onMounted(() => {
    fetchCurrentUser();
});

const fetchCurrentUser = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/current-user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = response.data;
        console.log('User data:', data);

        user.value = {
            name: data.name,
            email: data.email,
            profilePicture: data.profilePicture,
            studentDetails: {
                matricNumber: data.matric,
                level: data.level,
                phoneNumber: data.phone,
                skills: [data.skills]
            }
        };
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

// Open modal and set default values
const openEditModal = () => {
    isEditModalOpen.value = true;
    phoneNumber.value = user.value?.studentDetails?.phoneNumber || '';
    previewImage.value = null;
};

// Close modal
const closeEditModal = () => {
    isEditModalOpen.value = false;
};

// Trigger file input click
const triggerFileInput = () => {
    profilePictureInput.value.click();
};

// Handle file selection
const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        profilePicture.value = file;
        previewImage.value = URL.createObjectURL(file);
    }
};

// Upload image to Cloudinary
const uploadImageToCloudinary = async (file) => {
    const uploadPreset = 'ml_default';
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset); // Replace with your Cloudinary upload preset

    const cloudName = 'dsaqsxtup';

    try {
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
        return response.data.secure_url; // Get uploaded image URL
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return null;
    }
};

// Submit profile edit
const submitProfileEdit = async () => {
    isLoading.value = true;
    try {
        let imageUrl = user.value?.profilePicture; // Keep existing profile picture if no new one is uploaded

        if (profilePicture.value) {
            const uploadedUrl = await uploadImageToCloudinary(profilePicture.value);
            if (!uploadedUrl) {
                console.error("Image upload failed.");
                return;
            }
            imageUrl = uploadedUrl;
        }

        // Payload for API request
        const payload = {
            phone: phoneNumber.value,
            profilePicture: imageUrl
        };

        const token = localStorage.getItem('token');
        const response = await axios.put('https://localhost:5000/api/users/profile', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Updated user:", response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
        user.value = response.data;
        isLoading.value = false;
        toast.success('Profile updated successfully');
        // Close modal
        closeEditModal();

        await fetchCurrentUser(); // Refresh user data
    } catch (error) {
        isLoading.value = false;
        toast.error('Error updating profile');
        console.error("Error updating profile:", error);
    }
};
</script>