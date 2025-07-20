<template>
  <div class="virtual-card-container w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-gray-100 min-h-screen">
    
    <!-- Virtual Card Preview -->
    <div
      ref="cardElement"
      class="card-preview border rounded-lg w-full max-w-[650px] shadow-lg bg-white p-4 sm:p-6 mb-6"
    >
      <!-- Card Header -->
      <div class="card-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div class="logo-container flex-shrink-0 mb-2 sm:mb-0 sm:mr-4">
          <img class="h-6 sm:h-8 w-auto" src="~/assets/img/techhub logo.png" alt="TechHub Logo" />
        </div>
        <div class="text-right sm:text-right flex-1">
          <h3 class="text-sm sm:text-base font-bold text-blue-600 whitespace-nowrap">MEMBERSHIP CARD</h3>
          <p class="text-gray-500 text-xs sm:text-sm">Valid until {{ formatDate(expiry) }}</p>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body flex flex-col sm:flex-row">
        <!-- User Info -->
        <div class="user-info flex-1">
          <p class="text-xs sm:text-sm text-gray-500 mb-1">Member</p>
          <h4 class="text-lg sm:text-xl font-bold mb-3">{{ user.name }}</h4>

          <p class="text-xs sm:text-sm text-gray-500 mb-1">Member ID</p>
          <p class="font-mono font-medium mb-3">{{ user.uniqueId }}</p>

          <p class="text-xs sm:text-sm text-gray-500 mb-1">Membership Type</p>
          <p class="font-medium text-blue-600 capitalize mb-3">{{ user.membershipType }}</p>
        </div>

        <!-- User Picture / QR -->
        <div class="user-picture-container flex flex-col items-center sm:items-end mt-4 sm:mt-0 sm:ml-4">
          <div class="user-picture-wrapper border p-2 bg-white rounded">
            <!-- Replace with actual image if needed -->
            <qr-code-maker :userId="user._id" />
          </div>
          <p class="text-xs text-gray-500 mt-2 text-center">Passport</p>
        </div>
      </div>

      <!-- Card Footer -->
      <div class="card-footer mt-6 pt-4 border-t text-center text-xs text-gray-500 space-y-1">
        <p>This virtual card is the property of {{ companyName }}</p>
        <p>For support: {{ supportEmail }} | {{ supportPhone }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="card-actions flex flex-col sm:flex-row justify-center gap-4 w-full max-w-[650px]">
      <button
        @click="downloadCard"
        class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Card
      </button>

      <button
        @click="shareCard"
        class="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share Card
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import domtoimage from 'dom-to-image';
const config = useRuntimeConfig();
// Props
const props = defineProps({
    membershipExpiry: {
        type: Date,
        default: () => new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }
});



// Fetch user details from API
const user = ref({});
const expiry = ref('');

const fetchUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }
        
        const response = await axios.get(`${config.public.URL}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
            , 
  withCredentials: true, // if you use cookies or sessions

        });
        
        user.value = response.data;
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
        
    }
};
const endOfSession = async () => {
    try {
      
        const response = await axios.get(`${config.public.URL}/api/users/start-of-current-session`);
        
        expiry.value = response.data.data.endDate;
        console.log(response.data.data.endDate);
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
        
    }
};

onMounted(() => {
    fetchUserProfile();
    endOfSession()
});

// Refs
const cardElement = ref(null);
const qrCodeUrl = ref('');


// Company details
const companyName = 'TechhubEksu';
const supportEmail = 'techhubeksu@gmail.com';
const supportPhone = '+234 815 9360 009';

// Format date to human-readable format
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// Fetch QR code from API
// const fetchQrCode = async () => {
//     try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             throw new Error('No token found');
//         }

//         const response = await axios.get('https://techhub-eksu.onrender.com/api/users/qrcode', {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });

//         qrCodeUrl.value = response.data.qrCode;
//     } catch (error) {
//         console.error('Error fetching QR code:', error);
//     }
// };

// Download card as image using dom-to-image
// Download card as image using dom-to-image
const downloadCard = async () => {
    try {
        if (!cardElement.value) {
        
            return;
        }

        // Ensure QR code is loaded
        if (!qrCodeUrl.value) {
            await fetchQrCode();
        }

        const scale = 3; // Higher resolution for better quality
        const originalStyle = window.getComputedStyle(cardElement.value);

        // Capture the full card without clipping
        const dataUrl = await domtoimage.toPng(cardElement.value, {
            quality: 1,
            bgcolor: "#FFFFFF",
            width: cardElement.value.scrollWidth * scale, // Use scrollWidth to capture full content
            height: cardElement.value.scrollHeight * scale, // Use scrollHeight to capture full content
            style: {
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: `${cardElement.value.scrollWidth * scale}px`,
                height: `${cardElement.value.scrollHeight * scale}px`,
                backgroundColor: originalStyle.backgroundColor || "#FFFFFF"
            }
        });

        // Create and trigger download
        const downloadLink = document.createElement("a");
        downloadLink.href = dataUrl;
        downloadLink.download = `${user.value.uniqueId || "membership"}_card.png`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

    } catch (error) {
        console.error("Error downloading card:", error);

    }
};


// Share card functionality
const shareCard = async () => {
    try {
        if (!navigator.share) {

            return;
        }

        // Create image from the card element
        const dataUrl = await domtoimage.toBlob(cardElement.value, {
            quality: 0.95,
            bgcolor: '#FFFFFF'
        });

        // Create file for sharing
        const file = new File([dataUrl], `${user.value.uniqueId}_membership_card.png`, { type: 'image/png' });

        // Share the file
        await navigator.share({
            title: 'My Membership Card',
            text: `${companyName} Membership Card for ${user.value.name}`,
            files: [file]
        });

    } catch (error) {
        console.error('Error sharing card:', error);

        if (error.name !== 'AbortError') {
         
        }
    }
};

// Lifecycle hooks
// onMounted(() => {
//      fetchQrCode();
// });
</script>

<style scoped>
/* .virtual-card-container {
    margin: 2rem 0;
} */

.card-preview {
    transition: all 0.3s ease;
    background: url('../assets/img/bg.jpg');
    background-size: cover;
    background-position: center;
    background-color: rgba(255, 255, 255, 0.8);
    /* White background with reduced opacity */
    background-blend-mode: overlay;
    /* Blend the background image with the color */
}

.card-preview:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

@media print {
    .card-actions {
        display: none;
    }
}

@media (max-width: 640px) {
    .card-preview {
        font-size: 0.875rem;
        /* 14px */
    }


    .card-header p {
        font-size: 10px;
        /* 12px */
    }

    .card-body .user-info p {
        font-size: 0.75rem;
        /* 12px */
    }

    .card-body .user-info h4 {
        font-size: 1rem;
        /* 16px */
    }

    .card-footer p {
        font-size: 0.75rem;
        /* 12px */
    }
}
</style>
