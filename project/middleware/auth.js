// middleware/auth.js
import { useUserStore } from '@/store/user';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server
  if (process.server) return;

 const userStore = useUserStore()

  // Check if user is already loaded
  if (!userStore.user) {
    await userStore.fetchProfile()
  }

  // If still not authenticated, redirect to login
  if (!userStore.isAuthenticated) {
    return navigateTo('/login')
  }
  
  // Only fetch profile if we don't have a user yet or we're coming from certain pages
  // that might have updated user state (like payment or onboarding)
  if (!userStore.user || ['/payment', '/onboarding'].includes(from.path)) {
    await userStore.fetchProfile();
    console.log('User:', userStore.user);
    
  }
  
  // Authentication check
  if (
    ['/dashboard', '/payment', '/onboarding'].includes(to.path) && 
    !userStore.isAuthenticated
  ) {
    return navigateTo('/login');
  }

  // Already logged in, trying to access login/register
  if (
    ['/login', '/register'].includes(to.path) && 
    userStore.isAuthenticated
  ) {
    return navigateTo('/dashboard');
  }

  // Registered but hasn't paid
  if (
    userStore.isAuthenticated && 
    userStore.isRegistered && 
    !userStore.hasPaid && 
    to.path !== '/payment' &&
    !['/login', '/register', '/'].includes(to.path)
  ) {
    return navigateTo('/payment');
  }
  
  // Has paid but hasn't completed onboarding
  if (
    userStore.isAuthenticated && 
    userStore.isRegistered && 
    userStore.hasPaid && 
    !userStore.isOnboarded && 
    to.path !== '/onboarding' &&
    !['/login', '/register', '/'].includes(to.path)
  ) {
    return navigateTo('/onboarding');
  }

  // Admin redirection
// Redirect authenticated admin users to /admin if they’re trying to access non-admin areas
if (
  userStore.isAuthenticated && 
  userStore.isAdmin && 
  !to.path.startsWith('/admin') && 
  ['/login', '/register', '/dashboard'].includes(to.path)
) {
  return navigateTo('/admin');
}

// Prevent non-admins from accessing any admin route
if (
  userStore.isAuthenticated && 
  !userStore.isAdmin && 
  to.path.startsWith('/admin')
) {
  return navigateTo('/dashboard');
}

});