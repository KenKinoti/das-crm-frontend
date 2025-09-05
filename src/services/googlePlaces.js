class GooglePlacesService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
    this.isLoaded = false
    this.loadPromise = null
  }

  // Load Google Maps API script
  async loadGoogleMapsAPI() {
    if (this.isLoaded) {
      return Promise.resolve()
    }

    if (this.loadPromise) {
      return this.loadPromise
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        this.isLoaded = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        this.isLoaded = true
        resolve()
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'))
      }

      document.head.appendChild(script)
    })

    return this.loadPromise
  }

  // Get autocomplete suggestions for Australian addresses
  async getAddressSuggestions(query) {
    try {
      await this.loadGoogleMapsAPI()

      return new Promise((resolve, reject) => {
        const service = new window.google.maps.places.AutocompleteService()
        
        service.getPlacePredictions({
          input: query,
          componentRestrictions: { country: 'au' }, // Australia only
          types: ['address'], // Only return addresses
          fields: ['formatted_address', 'geometry', 'address_components']
        }, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions = predictions.map(prediction => ({
              mainText: prediction.structured_formatting.main_text,
              secondaryText: prediction.structured_formatting.secondary_text,
              fullAddress: prediction.description,
              placeId: prediction.place_id,
              components: null // Will be populated when address is selected
            }))
            resolve(suggestions)
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([])
          } else {
            console.error('Google Places API error:', status)
            reject(new Error(`Google Places API error: ${status}`))
          }
        })
      })
    } catch (error) {
      console.error('Error getting address suggestions:', error)
      throw error
    }
  }

  // Get detailed information about a specific place
  async getPlaceDetails(placeId) {
    try {
      await this.loadGoogleMapsAPI()

      return new Promise((resolve, reject) => {
        const service = new window.google.maps.places.PlacesService(
          document.createElement('div') // Dummy element
        )

        service.getDetails({
          placeId: placeId,
          fields: ['formatted_address', 'address_components', 'geometry']
        }, (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            // Parse address components into structured format
            const components = this.parseAddressComponents(place.address_components)
            
            resolve({
              fullAddress: place.formatted_address,
              components: components,
              geometry: place.geometry
            })
          } else {
            console.error('Error getting place details:', status)
            reject(new Error(`Place details error: ${status}`))
          }
        })
      })
    } catch (error) {
      console.error('Error getting place details:', error)
      throw error
    }
  }

  // Parse Google Places address components into our format
  parseAddressComponents(addressComponents) {
    const components = {
      street: '',
      suburb: '',
      state: '',
      postcode: '',
      country: 'Australia'
    }

    addressComponents.forEach(component => {
      const types = component.types

      if (types.includes('street_number')) {
        components.street = component.long_name + ' ' + components.street
      } else if (types.includes('route')) {
        components.street += component.long_name
      } else if (types.includes('subpremise')) {
        components.street = component.long_name + '/' + components.street
      } else if (types.includes('locality') || types.includes('suburb')) {
        components.suburb = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        components.state = component.short_name
      } else if (types.includes('postal_code')) {
        components.postcode = component.long_name
      } else if (types.includes('country')) {
        components.country = component.long_name
      }
    })

    // Clean up street address
    components.street = components.street.trim()

    return components
  }

  // Check if API key is configured
  isConfigured() {
    return this.apiKey && this.apiKey !== 'your-google-places-api-key-here'
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService()