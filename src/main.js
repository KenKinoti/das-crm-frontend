import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// Import FontAwesome icons
import '@fortawesome/fontawesome-free/css/all.css'

// Import unified Bootstrap theme and main CSS system
import './styles/bootstrap-theme.css'
import './assets/css/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth state
const authStore = useAuthStore()
authStore.checkAuth()

app.mount('#app')
