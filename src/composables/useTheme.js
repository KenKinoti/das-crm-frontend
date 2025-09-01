import { ref, watch, onMounted, computed } from 'vue'

const theme = ref('light')

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  const applyTheme = (themeValue) => {
    document.documentElement.setAttribute('data-theme', themeValue)
    localStorage.setItem('theme', themeValue)
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      theme.value = savedTheme
    } else {
      // Auto-detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme(theme.value)
  }

  // Watch for theme changes
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })

  // Listen for system theme changes
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        theme.value = e.matches ? 'dark' : 'light'
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    // Initialize theme
    initTheme()
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  })

  return {
    theme: theme.value.readonly ? theme.value.readonly() : theme,
    toggleTheme,
    setTheme,
    isDark: computed(() => theme.value === 'dark')
  }
}