export default defineNuxtPlugin(() => {
  addRouteMiddleware('auth', () => {
    // This is just a placeholder to ensure the middleware is registered
    // The actual middleware logic is in middleware/auth.js
  }, { global: true });
});