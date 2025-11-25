<template>
  <div
    class="min-h-screen py-28 flex flex-col justify-center items-center bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p class="text-gray-600 mt-2">Tell us more about yourself</p>
        </div>

        <div class="mb-6">
          <div class="flex justify-between mb-4">
            <div class="w-1/3 h-1 rounded-full bg-primary-500"></div>
            <div class="w-1/3 h-1 rounded-full bg-primary-500"></div>
            <div class="w-1/3 h-1 rounded-full bg-primary-500"></div>
          </div>
          <p class="text-center text-sm text-gray-500">Step 3 of 3: Student Details</p>
        </div>

        <form @submit.prevent="completeOnboarding" class="space-y-6">
          <!-- Profile Picture Upload -->
          <!-- <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div class="flex flex-col items-center">
              <div
                class="w-32 h-32 mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" alt="Profile Preview" />
                <span v-else class="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
              </div>
              <label for="profile-upload"
                class="cursor-pointer py-2 px-4 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Upload Photo
              </label>
              <input id="profile-upload" type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
              <p v-if="errors.profilePicture" class="mt-1 text-sm text-red-600">{{ errors.profilePicture }}</p>
              <p v-if="uploadStatus" class="mt-2 text-sm"
                :class="{ 'text-green-600': uploadStatus === 'Success', 'text-blue-600': uploadStatus === 'Uploading...', 'text-red-600': uploadStatus === 'Failed' }">
                {{ uploadStatus }}
              </p>
            </div>
          </div> -->

          <div>
            <label for="matricNumber" class="block text-sm font-medium text-gray-700">Matric Number</label>
            <input id="matricNumber" v-model="form.matricNumber" type="text" required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            <p v-if="errors.matricNumber" class="mt-1 text-sm text-red-600">{{ errors.matricNumber }}</p>
          </div>


          <div>
            <label for="department" class="block text-sm font-medium text-gray-700">Department</label>
            <select id="department" v-model="form.department" required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              <option value="" disabled>Select your department</option>

              <!-- Science and Technology -->
              <option value="Computer Science">Computer Science</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Biochemistry">Biochemistry</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Statistics">Statistics</option>

              <!-- Engineering -->
              <option value="Electrical Engineering">Electrical & Electronics Engineering</option>

              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Chemical Engineering">Computer Engineering</option>


              <!-- Medical and Health Sciences -->
              <option value="Medicine and Surgery">Medicine and Surgery</option>
              <option value="Nursing">Nursing</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Medical Laboratory Science">Medical Laboratory Science</option>
              <option value="Radiography">Radiography</option>
              <option value="Physiotherapy">Physiotherapy</option>
              <option value="Dentistry">Dentistry</option>
              <option value="Optometry">Optometry</option>
              <option value="Public Health">Public Health</option>
              <option value="Anatomy">Anatomy</option>
              <option value="Physiology">Physiology</option>

              <!-- Agriculture -->
              <option value="Agriculture">Agriculture</option>
              <option value="Agricultural Economics">Agricultural Economics</option>
              <option value="Animal Science">Animal Science</option>
              <option value="Crop Science">Crop Science</option>
              <option value="Fisheries">Fisheries</option>
              <option value="Forestry">Forestry</option>
              <option value="Soil Science">Soil Science</option>
              <option value="Food Science and Technology">Food Science and Technology</option>

              <!-- Arts and Humanities -->
              <option value="English Language">English Language</option>
              <option value="Linguistics">Linguistics</option>
              <option value="History">History</option>
              <option value="Religious Studies">Religious Studies</option>
              <option value="Philosophy">Philosophy</option>
              <option value="Fine Arts">Fine Arts</option>
              <option value="Music">Music</option>
              <option value="Theatre Arts">Theatre Arts</option>
              <option value="Languages (Yoruba)">Languages (Yoruba)</option>
              <option value="Languages (Igbo)">Languages (Igbo)</option>
              <option value="Languages (Hausa)">Languages (Hausa)</option>
              <option value="Languages (French)">Languages (French)</option>

              <!-- Social Sciences -->
              <option value="Economics">Economics</option>
              <option value="Political Science">Political Science</option>
              <option value="Sociology">Sociology</option>
              <option value="Psychology">Psychology</option>
              <option value="Geography">Geography</option>
              <option value="Mass Communication">Mass Communication</option>
              <option value="International Relations">International Relations</option>
              <option value="Peace and Conflict Studies">Peace and Conflict Studies</option>
              <option value="Social Work">Social Work</option>
              <option value="Criminology">Criminology</option>
              <option value="Demography and Social Statistics">Demography and Social Statistics</option>

              <!-- Business and Management -->
              <option value="Accounting">Accounting</option>
              <option value="Banking and Finance">Banking and Finance</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resource Management">Human Resource Management</option>
              <option value="Insurance">Insurance</option>
              <option value="Entrepreneurship">Entrepreneurship</option>
              <option value="Taxation">Taxation</option>
              <option value="Transport Management">Transport Management</option>
              <option value="Tourism and Hospitality Management">Tourism and Hospitality Management</option>

              <!-- Law and Legal Studies -->
              <option value="Law">Law</option>
              <option value="Private Law">Private Law</option>
              <option value="Public Law">Public Law</option>

              <!-- Education -->
              <option value="Education">Education</option>
              <option value="Educational Management">Educational Management</option>
              <option value="Guidance and Counselling">Guidance and Counselling</option>
              <option value="Adult Education">Adult Education</option>
              <option value="Physical Education">Physical Education</option>
              <option value="Science Education">Science Education</option>

              <!-- Environmental Sciences -->
              <option value="Architecture">Architecture</option>
              <option value="Building">Building</option>
              <option value="Quantity Surveying">Quantity Surveying</option>
              <option value="Estate Management">Estate Management</option>
              <option value="Urban and Regional Planning">Urban and Regional Planning</option>
              <option value="Surveying and Geoinformatics">Surveying and Geoinformatics</option>
              <option value="Environmental Management">Environmental Management</option>

              <option value="Other">Other</option>
            </select>
            <p v-if="errors.department" class="mt-1 text-sm text-red-600">{{ errors.department }}</p>
          </div>

          <div>
            <label for="level" class="block text-sm font-medium text-gray-700">Level</label>
            <select id="level" v-model="form.level" required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              <option value="" disabled>Select your level</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
            <p v-if="errors.level" class="mt-1 text-sm text-red-600">{{ errors.level }}</p>
          </div>

          <div>
            <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input id="phoneNumber" v-model="form.phoneNumber" type="tel" required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            <p v-if="errors.phoneNumber" class="mt-1 text-sm text-red-600">{{ errors.phoneNumber }}</p>
          </div>

          <div>
            <label for="skills" class="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
            <input id="skills" v-model="form.skills" type="text"
              placeholder="e.g. Programming, Design, Project Management"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
          </div>

          <div>
            <button type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              :disabled="isSubmitting">
              <span v-if="isSubmitting">Processing...</span>
              <span v-else>Complete Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { z } from 'zod';
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { toast } from 'vue3-toastify';
const config = useRuntimeConfig();
const router = useRouter();
const imagePreview = ref(null);
const uploadStatus = ref('');
const cloudinaryUrl = ref(null);

// Check if user is registered and has paid
onMounted(() => {
  const user = localStorage.getItem('user');
  if (!user) {
    router.push('/register');
    return;
  }

  const userData = JSON.parse(user);
  if (!userData.hasPaid) {
    router.push('/payment');
  }
});

const form = reactive({
  matricNumber: '',
  department: '',
  level: '',
  phoneNumber: '',
  skills: '',
  profilePicture: '',
});

const errors = reactive({
  matricNumber: '',
  department: '',
  level: '',
  phoneNumber: '',
  profilePicture: ''
});

const isSubmitting = ref(false);

const schema = z.object({
  matricNumber: z.string().min(7, 'Matric number must be at least 7 characters'),
  department: z.string().min(1, 'Please select your department'),
  level: z.string().min(1, 'Please select your level'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  skills: z.string().optional(),
  profilePicture: z.string().optional()
});

// Function to generate the unique ID
const generateUniqueId = (matric) => {
  if (!matric || matric.length < 7) {
    return ''; // Avoid setting invalid IDs
  }

  const first4 = matric.slice(0, 4);
  const last3 = matric.slice(-3);

  return `TCH-${first4}${last3}`;
};

// // Watch for matric number changes and update the unique ID
// watch(() => form.matricNumber, (newVal) => {
//   form.uniqueId = generateUniqueId(newVal);
//   console.log('Generated Unique ID:', form.uniqueId);
// });


const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file
  if (!file.type.includes('image/')) {
    errors.profilePicture = 'Please upload a valid image file';
    return;
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    errors.profilePicture = 'Image size should be less than 5MB';
    return;
  }

  // Create image preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  // Upload to Cloudinary
  try {
    uploadStatus.value = 'Uploading...';

    const cloudName = 'dsaqsxtup'; // Replace with your Cloudinary cloud name
    const uploadPreset = 'ml_default'; // Replace with your upload preset

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();

    // Set the cloudinary URL
    cloudinaryUrl.value = data.secure_url;
    form.profilePicture = data.secure_url;
    uploadStatus.value = 'Success';
    errors.profilePicture = '';
  } catch (error) {
    console.error('Image upload error:', error);
    uploadStatus.value = 'Failed';
    errors.profilePicture = 'Failed to upload image. Please try again.';
  }
};

const completeOnboarding = async () => {
  console.log('Form:', form);
  Object.keys(errors).forEach(key => errors[key] = '');

  try {
    isSubmitting.value = true;

    // Validate form
    schema.parse(form);

    // Send data to API
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.put(`${config.public.URL}/api/users/profile`, {
      matric: form.matricNumber,
      department: form.department,
      level: form.level,
      phone: form.phoneNumber,
      profilePicture: cloudinaryUrl.value,
      skills: form.skills,
      uniqueId: generateUniqueId(form.matricNumber),
      isOnboarded: true
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
      ,
  withCredentials: true, // if you use cookies or sessions

    });

    console.log('User updated:', response.data);

    if (!response) {
      throw new Error('Failed to update user');
    }

    // Update user data
    const user = JSON.parse(localStorage.getItem('user'));
    user.isOnboarded = true;
    user.studentDetails = {
      matricNumber: form.matricNumber,
      department: form.department,
      level: form.level,
      phoneNumber: form.phoneNumber,
      skills: form.skills,
      profilePicture: cloudinaryUrl.value,
      uniqueId: generateUniqueId(form.matricNumber),
    };
    localStorage.setItem('user', JSON.stringify(user));

    toast.success('Profile updated successfully');

    // Navigate to dashboard
    router.push('/dashboard');
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
    } else {
      toast.error('Failed to update profile');
      console.error('Onboarding error:', error);
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>
