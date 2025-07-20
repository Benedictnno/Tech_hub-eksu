<template>
  <div class="min-h-screen bg-gray-50">

    <main>
      <div class="max-w-7xl mx-auto pt-20 py-6 sm:px-6 lg:px-8">
        <!-- Welcome Section -->
        <div class="px-4 py-6 sm:px-0 mb-6 flex flex-col md:flex-row md:justify-between md:items-center w-full">
          <div class="md:max-w-2xl flex justify-between md:mx-auto text-left">
            <h2 class="text-md md:text-2xl text-left text-black font-bold ">Welcome, {{ user?.name || 'Student' }}!</h2>

            <NuxtLink to="/profile"
              class="edit-profile-btn text-blue-600 rounded flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Go to Profile
            </NuxtLink>
          </div>
<!-- 
          <div class="mt-4">
            <span v-if="userData.isCheckedIn" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Checked In
            </span>
            <span v-else class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
              Not Checked In
            </span>
          </div>
        </div> -->
          <div class="mt-4">
             <NuxtLink to="/admin" v-if="userRole === 'admin'" class="px-5 py-2 bg-blue-100 text-green-800 rounded-md text-lg">
             Admin
             </NuxtLink>
      
          </div>
        </div>



        <!-- Virtual Card Component -->
        <VirtualCard :user="userData" :membership-expiry="userData.membershipExpiry" />

        <!-- Stats Section -->
        <!-- <div class="px-4 sm:px-0 mb-6">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Available Courses
                      </dt>
                      <dd>
                        <div class="text-lg font-medium text-gray-900">
                          12
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Upcoming Events
                      </dt>
                      <dd>
                        <div class="text-lg font-medium text-gray-900">
                          3
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Projects
                      </dt>
                      <dd>
                        <div class="text-lg font-medium text-gray-900">
                          5
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Community Members
                      </dt>
                      <dd>
                        <div class="text-lg font-medium text-gray-900">
                          128
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> -->

        <!-- Upcoming Events Section -->
        <!-- <div class="px-4 sm:px-0 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              <li>
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span class="text-primary-600 font-semibold">15</span>
                      </div>
                      <div class="ml-4">
                        <h3 class="text-sm font-medium text-primary-600">Web Development Workshop</h3>
                        <p class="text-sm text-gray-500">May 15, 2025 • 2:00 PM - 4:00 PM</p>
                      </div>
                    </div>
                    <div>
                      <button class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span class="text-primary-600 font-semibold">22</span>
                      </div>
                      <div class="ml-4">
                        <h3 class="text-sm font-medium text-primary-600">AI & Machine Learning Seminar</h3>
                        <p class="text-sm text-gray-500">May 22, 2025 • 10:00 AM - 12:00 PM</p>
                      </div>
                    </div>
                    <div>
                      <button class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span class="text-primary-600 font-semibold">30</span>
                      </div>
                      <div class="ml-4">
                        <h3 class="text-sm font-medium text-primary-600">Tech Hackathon</h3>
                        <p class="text-sm text-gray-500">May 30-31, 2025 • All Day</p>
                      </div>
                    </div>
                    <div>
                      <button class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div> -->

        <!-- Resources Section -->
        <!-- <div class="px-4 sm:px-0 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Learning Resources</h2>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">Web Development</h3>
                    <p class="mt-1 text-sm text-gray-500">Learn HTML, CSS, JavaScript and modern frameworks</p>
                  </div>
                </div>
                <div class="mt-4">
                  <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Access resources <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">Mobile App Development</h3>
                    <p class="mt-1 text-sm text-gray-500">Build iOS and Android apps with React Native</p>
                  </div>
                </div>
                <div class="mt-4">
                  <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Access resources <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">Cloud Computing</h3>
                    <p class="mt-1 text-sm text-gray-500">Learn AWS, Azure, and Google Cloud Platform</p>
                  </div>
                </div>
                <div class="mt-4">
                  <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Access resources <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">AI & Machine Learning</h3>
                    <p class="mt-1 text-sm text-gray-500">Explore Python, TensorFlow, and PyTorch</p>
                  </div>
                </div>
                <div class="mt-4">
                  <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Access resources <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">UI/UX Design</h3>
                    <p class="mt-1 text-sm text-gray-500">Master Figma, Adobe XD, and design principles</p>
                  </div>
                </div>
                <div class="mt-4">
                  <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Access resources <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">Cybersecurity</h3>
                    <p class="mt-1 text-sm text-gray-500">Learn ethical hacking and security principles</p>
                  </div>
                </div>
                <div class="mt-4">
                  <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Access resources <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
         -->

      </div>
    </main>
  </div>
</template>

<script setup>
import axios from 'axios';
const config = useRuntimeConfig();

const router = useRouter();
const user = ref(null);
const userRole= ref("")

// Check if user is authenticated and has completed onboarding
onMounted(async() => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    router.push('/login');
    return;
  }

  user.value = JSON.parse(storedUser);
  
  if (!user.value.isOnboarded) {
    router.push('/onboarding');
  }

   try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

        const response = await axios.get(`${config.public.URL}/api/users/current-user`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
            , 
  withCredentials: true, 

        });
        

        userRole.value = response.data.role;
    } catch (error) {
        console.error('Error fetching user:', error);
    
};
});


const userData = ref({
  fullName: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  memberId: 'HUB7890123',
  membershipType: 'Semester',
  memberSince: new Date('2024-05-15'),
  membershipExpiry: new Date('2025-05-15'),
  isCheckedIn: true,
  lastCheckIn: new Date('2025-02-26T09:30:00')
});

const logout = () => {
  localStorage.removeItem('user');
  router.push('/');
};
</script>