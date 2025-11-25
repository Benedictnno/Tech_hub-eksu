<template>
    <div>
        <button @click="initiatePaystackPayment" class="pay-button">
            Pay Now
        </button>
    </div>
</template>
<script>
import axios from 'axios';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';



export default {
    props: {
        amount: {
            type: Number,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        subscriptionType: {
            type: String,
            required: true
        }
    },
    
    setup(props) {
        const router = useRouter();
        const config = useRuntimeConfig();



        const makePayment = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await axios.post(`${config.public.URL}/api/users/make-payment`, {
                    subscriptionType: props.subscriptionType,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log(response.data);
                return response.data;
            } catch (error) {
                console.error('Error updating tenant:', error?.response?.data || error.message);
                throw error;
            }
        };

        const initiatePaystackPayment = async () => {
            
            
            if (!import.meta.env.SSR) {
                const PaystackPop = window.PaystackPop;

                const handler = PaystackPop.setup({
                    key: config.public.PAYSTACK,
                    email: props.email,
                    amount: props.amount * 100,
                    callback: () => {
                        handlePaymentCallback();
                    },
                    onClose: () => {
                        toast.info('Payment window closed');
                    }
                });

                handler.openIframe();
            }
        };


        //    const logPayment = async (transactionId) => {
        //         try {
        //             const response = await axios.post('https://big-server-4oor.onrender.com/api/log-payment', {
        //                 transactionId,
        //                 email: this.email,
        //             });
        //             return response.data;
        //         } catch (error) {
        //             console.error('Error logging payment', error);
        //             throw error;
        //         }
        //     };


        const handlePaymentCallback = async () => {
            try {
                await makePayment();
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    user.hasPaid = true;
                    localStorage.setItem('user', JSON.stringify(user));
                }
                toast.success('Payment logged successfully!');
                router.push('/onboarding');
            }
            catch (error) {
                toast.error('Payment or tenant update failed. Please try again.');
            }
        };


        return {
            router,
            initiatePaystackPayment
        };
    }
};
</script>

<style scoped>
.pay-button {
    background-color: #10787e;
    /* bg-amber-600 */
    color: white;
    /* text-white */
    padding: 0.5rem 1rem;
    /* px-4 py-2 */
    border-radius: 0.25rem;
    /* rounded */
    transition: background-color 0.3s;
}

.pay-button:hover {
    background-color: #10787e;
    /* hover:bg-amber-700 */
}
</style>
