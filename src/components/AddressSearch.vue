<template>
  <div class="form-group">
    <label :for="fieldId">{{ label }}</label>
    <div class="address-input-wrapper">
      <input
        :id="fieldId"
        v-model="searchQuery"
        type="text"
        class="form-input"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="showDropdown = true"
        @blur="handleBlur"
        @keydown="handleKeydown"
        autocomplete="off"
      />
      <i v-if="isLoading" class="fas fa-spinner fa-spin loading-icon"></i>
      <i v-else class="fas fa-map-marker-alt address-icon"></i>
    </div>
      
      <!-- Address Suggestions Dropdown -->
      <div v-if="showDropdown && suggestions.length > 0" class="address-dropdown">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.placeId || index"
          class="address-suggestion"
          :class="{ active: selectedIndex === index }"
          @click="selectAddress(suggestion)"
          @mouseenter="selectedIndex = index"
        >
          <div class="suggestion-main">{{ suggestion.mainText }}</div>
          <div class="suggestion-secondary">{{ suggestion.secondaryText }}</div>
        </div>
        
        <!-- Manual Entry Option -->
        <div 
          class="address-suggestion manual-entry"
          :class="{ active: selectedIndex === suggestions.length }"
          @click="selectManualEntry"
          @mouseenter="selectedIndex = suggestions.length"
        >
          <div class="suggestion-main">
            <i class="fas fa-keyboard"></i>
            Enter address manually
          </div>
          <div class="suggestion-secondary">Type your own address</div>
        </div>
      </div>
      
      <!-- Manual Entry Mode -->
      <div v-if="manualEntryMode" class="manual-entry-fields">
        <div class="form-row">
          <div class="form-group">
            <input
              v-model="manualAddress.street"
              type="text"
              class="form-input"
              placeholder="Street Address"
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <input
              v-model="manualAddress.suburb"
              type="text"
              class="form-input"
              placeholder="Suburb"
            />
          </div>
          <div class="form-group">
            <input
              v-model="manualAddress.state"
              type="text"
              class="form-input"
              placeholder="State"
              maxlength="3"
            />
          </div>
          <div class="form-group">
            <input
              v-model="manualAddress.postcode"
              type="text"
              class="form-input"
              placeholder="Postcode"
              pattern="[0-9]*"
              maxlength="4"
            />
          </div>
        </div>
        <div class="manual-entry-actions">
          <button type="button" @click="applyManualEntry" class="btn btn-sm btn-primary">
            Apply Address
          </button>
          <button type="button" @click="cancelManualEntry" class="btn btn-sm btn-secondary">
            Cancel
          </button>
        </div>
      </div>
  </div>
</template>

<script>
import { googlePlacesService } from '../services/googlePlaces'

export default {
  name: 'AddressSearch',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: 'Address'
    },
    placeholder: {
      type: String,
      default: 'Start typing an address...'
    },
    fieldId: {
      type: String,
      default: 'address-search'
    }
  },
  emits: ['update:modelValue', 'address-selected'],
  data() {
    return {
      searchQuery: this.modelValue,
      suggestions: [],
      showDropdown: false,
      selectedIndex: -1,
      isLoading: false,
      searchTimeout: null,
      manualEntryMode: false,
      manualAddress: {
        street: '',
        suburb: '',
        state: '',
        postcode: ''
      }
    }
  },
  watch: {
    modelValue(newValue) {
      if (newValue !== this.searchQuery) {
        this.searchQuery = newValue
      }
    },
    searchQuery(newValue) {
      this.$emit('update:modelValue', newValue)
    }
  },
  methods: {
    handleInput() {
      console.log('🔍 ADDRESS SEARCH: handleInput called, searchQuery:', this.searchQuery)
      // Clear existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      // Reset manual entry mode when typing
      if (this.manualEntryMode) {
        this.manualEntryMode = false
      }
      
      // Debounce search
      this.searchTimeout = setTimeout(() => {
        console.log('🔍 ADDRESS SEARCH: Search timeout triggered, query length:', this.searchQuery.length)
        if (this.searchQuery.length >= 3) {
          this.searchAddresses()
        } else {
          this.suggestions = []
          this.showDropdown = false
        }
      }, 300)
    },
    
    async searchAddresses() {
      console.log('🔍 ADDRESS SEARCH: searchAddresses called with query:', this.searchQuery)
      if (!this.searchQuery.trim()) {
        console.log('🔍 ADDRESS SEARCH: Empty query, returning early')
        return
      }
      
      this.isLoading = true
      console.log('🔍 ADDRESS SEARCH: Loading started')
      
      try {
        // Check if Google Places API is configured
        if (googlePlacesService.isConfigured()) {
          console.log('🔍 ADDRESS SEARCH: Using Google Places API')
          const suggestions = await googlePlacesService.getAddressSuggestions(this.searchQuery)
          console.log('🔍 ADDRESS SEARCH: Google Places suggestions:', suggestions.length, 'results')
          
          this.suggestions = suggestions
          this.showDropdown = true
          this.isLoading = false
          this.selectedIndex = -1
          console.log('🔍 ADDRESS SEARCH: Dropdown shown with', this.suggestions.length, 'suggestions')
        } else {
          console.log('🔍 ADDRESS SEARCH: Google Places API not configured, using mock data')
          // Fallback to mock data if API is not configured
          const mockSuggestions = this.getMockAustralianAddresses(this.searchQuery)
          console.log('🔍 ADDRESS SEARCH: Mock suggestions generated:', mockSuggestions.length, 'results')
          
          this.suggestions = mockSuggestions
          this.showDropdown = true
          this.isLoading = false
          this.selectedIndex = -1
          console.log('🔍 ADDRESS SEARCH: Dropdown shown with', this.suggestions.length, 'suggestions')
        }
        
      } catch (error) {
        console.error('🔍 ADDRESS SEARCH: Error in searchAddresses:', error)
        console.log('🔍 ADDRESS SEARCH: Falling back to mock data due to error')
        
        // Fallback to mock data on error
        try {
          const mockSuggestions = this.getMockAustralianAddresses(this.searchQuery)
          this.suggestions = mockSuggestions
          this.showDropdown = true
          console.log('🔍 ADDRESS SEARCH: Fallback mock data shown with', this.suggestions.length, 'suggestions')
        } catch (mockError) {
          console.error('🔍 ADDRESS SEARCH: Even mock data failed:', mockError)
          this.suggestions = []
        }
        
        this.isLoading = false
      }
    },
    
    getMockAustralianAddresses(query) {
      // Generate dynamic suggestions based on user input
      const suggestions = []
      const lowerQuery = query.toLowerCase().trim()
      
      // If query contains parts of an address, generate suggestions
      if (lowerQuery.length >= 3) {
        // Try to parse if it looks like a unit/street number pattern
        const unitMatch = lowerQuery.match(/^(\d+\/\d+|\d+)\s*(.*)/)
        
        if (unitMatch) {
          const numberPart = unitMatch[1]
          const streetPart = unitMatch[2] || ''
          
          // Generate suggestions based on the partial street name
          const streetSuggestions = this.generateStreetSuggestions(streetPart, numberPart)
          suggestions.push(...streetSuggestions)
        } else {
          // General text search - generate suggestions based on street or suburb names
          const generalSuggestions = this.generateGeneralSuggestions(lowerQuery)
          suggestions.push(...generalSuggestions)
        }
      }
      
      // Add some static popular addresses as fallback
      const staticAddresses = [
        {
          mainText: '123 Collins Street',
          secondaryText: 'Melbourne VIC 3000, Australia',
          fullAddress: '123 Collins Street, Melbourne VIC 3000',
          components: {
            street: '123 Collins Street',
            suburb: 'Melbourne',
            state: 'VIC',
            postcode: '3000',
            country: 'Australia'
          },
          placeId: 'static_1'
        },
        {
          mainText: '456 George Street',
          secondaryText: 'Sydney NSW 2000, Australia',
          fullAddress: '456 George Street, Sydney NSW 2000',
          components: {
            street: '456 George Street',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
            country: 'Australia'
          },
          placeId: 'static_2'
        }
      ]
      
      // Filter static addresses that match
      const matchingStatic = staticAddresses.filter(addr => 
        addr.mainText.toLowerCase().includes(lowerQuery) ||
        addr.secondaryText.toLowerCase().includes(lowerQuery)
      )
      
      suggestions.push(...matchingStatic)
      
      return suggestions.slice(0, 5)
    },
    
    generateStreetSuggestions(streetPart, numberPart) {
      const suggestions = []
      const streetNames = [
        'BROUGHTON AVENUE', 'BROUGHTON STREET', 'BROUGHTON ROAD', 'BROUGHTON PLACE',
        'BRIDGE STREET', 'BRIDGE ROAD', 'BRICK STREET', 'BROADWAY',
        'BROWN STREET', 'BRUNSWICK STREET', 'BURKE STREET', 'BURNLEY STREET'
      ]
      
      const suburbs = [
        { name: 'Adelaide', state: 'SA', postcode: '5000' },
        { name: 'North Adelaide', state: 'SA', postcode: '5006' },
        { name: 'Norwood', state: 'SA', postcode: '5067' },
        { name: 'Prospect', state: 'SA', postcode: '5082' },
        { name: 'Fitzroy', state: 'VIC', postcode: '3065' },
        { name: 'Richmond', state: 'VIC', postcode: '3121' }
      ]
      
      // Find streets that match the partial input
      const matchingStreets = streetNames.filter(street => 
        street.toLowerCase().includes(streetPart.toLowerCase()) ||
        streetPart.toLowerCase().includes(street.toLowerCase().substring(0, streetPart.length))
      )
      
      // Generate suggestions for matching streets
      matchingStreets.forEach((street, index) => {
        const suburb = suburbs[index % suburbs.length]
        const fullAddress = `${numberPart} ${street}`
        
        suggestions.push({
          mainText: fullAddress,
          secondaryText: `${suburb.name} ${suburb.state} ${suburb.postcode}, Australia`,
          fullAddress: `${fullAddress}, ${suburb.name} ${suburb.state} ${suburb.postcode}`,
          components: {
            street: fullAddress,
            suburb: suburb.name,
            state: suburb.state,
            postcode: suburb.postcode,
            country: 'Australia'
          },
          placeId: `generated_street_${index}`
        })
      })
      
      return suggestions
    },
    
    generateGeneralSuggestions(query) {
      const suggestions = []
      const commonAddresses = [
        { street: 'Main Street', numbers: [12, 45, 78, 123] },
        { street: 'High Street', numbers: [5, 23, 67, 89] },
        { street: 'Church Street', numbers: [15, 34, 56, 91] },
        { street: 'King Street', numbers: [8, 27, 49, 72] },
        { street: 'Queen Street', numbers: [11, 33, 55, 88] }
      ]
      
      const suburbs = [
        { name: 'Melbourne', state: 'VIC', postcode: '3000' },
        { name: 'Sydney', state: 'NSW', postcode: '2000' },
        { name: 'Brisbane', state: 'QLD', postcode: '4000' },
        { name: 'Adelaide', state: 'SA', postcode: '5000' },
        { name: 'Perth', state: 'WA', postcode: '6000' }
      ]
      
      // Generate suggestions based on query matching street names or suburb names
      commonAddresses.forEach((addressInfo, streetIndex) => {
        if (addressInfo.street.toLowerCase().includes(query)) {
          const suburb = suburbs[streetIndex % suburbs.length]
          const number = addressInfo.numbers[0]
          
          suggestions.push({
            mainText: `${number} ${addressInfo.street}`,
            secondaryText: `${suburb.name} ${suburb.state} ${suburb.postcode}, Australia`,
            fullAddress: `${number} ${addressInfo.street}, ${suburb.name} ${suburb.state} ${suburb.postcode}`,
            components: {
              street: `${number} ${addressInfo.street}`,
              suburb: suburb.name,
              state: suburb.state,
              postcode: suburb.postcode,
              country: 'Australia'
            },
            placeId: `generated_general_${streetIndex}`
          })
        }
      })
      
      // Also check suburbs
      suburbs.forEach((suburb, suburbIndex) => {
        if (suburb.name.toLowerCase().includes(query)) {
          const addressInfo = commonAddresses[0]
          const number = addressInfo.numbers[suburbIndex % addressInfo.numbers.length]
          
          suggestions.push({
            mainText: `${number} ${addressInfo.street}`,
            secondaryText: `${suburb.name} ${suburb.state} ${suburb.postcode}, Australia`,
            fullAddress: `${number} ${addressInfo.street}, ${suburb.name} ${suburb.state} ${suburb.postcode}`,
            components: {
              street: `${number} ${addressInfo.street}`,
              suburb: suburb.name,
              state: suburb.state,
              postcode: suburb.postcode,
              country: 'Australia'
            },
            placeId: `generated_suburb_${suburbIndex}`
          })
        }
      })
      
      return suggestions
    },
    
    async selectAddress(address) {
      console.log('🔍 ADDRESS SEARCH: selectAddress called with:', address)
      this.searchQuery = address.fullAddress
      this.showDropdown = false
      this.selectedIndex = -1
      
      try {
        let addressData = {
          fullAddress: address.fullAddress,
          components: address.components
        }
        
        // If this is a Google Places result and we don't have components yet, fetch them
        if (googlePlacesService.isConfigured() && address.placeId && !address.components) {
          console.log('🔍 ADDRESS SEARCH: Fetching place details for:', address.placeId)
          const placeDetails = await googlePlacesService.getPlaceDetails(address.placeId)
          addressData = {
            fullAddress: placeDetails.fullAddress,
            components: placeDetails.components
          }
          console.log('🔍 ADDRESS SEARCH: Place details fetched:', placeDetails)
        }
        
        console.log('🔍 ADDRESS SEARCH: Emitting address-selected event with:', addressData)
        this.$emit('address-selected', addressData)
        
      } catch (error) {
        console.error('🔍 ADDRESS SEARCH: Error fetching place details:', error)
        // Still emit the basic address data even if details fetch fails
        const basicAddressData = {
          fullAddress: address.fullAddress,
          components: address.components || {
            street: address.fullAddress,
            suburb: '',
            state: '',
            postcode: '',
            country: 'Australia'
          }
        }
        console.log('🔍 ADDRESS SEARCH: Emitting basic address data due to error:', basicAddressData)
        this.$emit('address-selected', basicAddressData)
      }
    },
    
    selectManualEntry() {
      this.manualEntryMode = true
      this.showDropdown = false
      this.selectedIndex = -1
    },
    
    applyManualEntry() {
      const { street, suburb, state, postcode } = this.manualAddress
      const fullAddress = `${street}, ${suburb} ${state} ${postcode}`.replace(/,\s*,/g, ',').trim()
      
      this.searchQuery = fullAddress
      this.manualEntryMode = false
      
      this.$emit('address-selected', {
        fullAddress: fullAddress,
        components: {
          street: street,
          suburb: suburb,
          state: state,
          postcode: postcode,
          country: 'Australia'
        }
      })
    },
    
    cancelManualEntry() {
      this.manualEntryMode = false
      this.manualAddress = {
        street: '',
        suburb: '',
        state: '',
        postcode: ''
      }
    },
    
    handleKeydown(e) {
      if (!this.showDropdown) return
      
      const totalItems = this.suggestions.length + 1 // +1 for manual entry option
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          this.selectedIndex = Math.min(this.selectedIndex + 1, totalItems - 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          this.selectedIndex = Math.max(this.selectedIndex - 1, -1)
          break
        case 'Enter':
          e.preventDefault()
          if (this.selectedIndex === -1) return
          if (this.selectedIndex < this.suggestions.length) {
            this.selectAddress(this.suggestions[this.selectedIndex])
          } else {
            this.selectManualEntry()
          }
          break
        case 'Escape':
          this.showDropdown = false
          this.selectedIndex = -1
          break
      }
    },
    
    handleBlur() {
      // Delay hiding to allow click events on suggestions
      setTimeout(() => {
        this.showDropdown = false
        this.selectedIndex = -1
      }, 200)
    }
  }
}
</script>

<style scoped>
.address-input-wrapper {
  position: relative;
}

.form-input {
  padding-right: 2.5rem;
}

.address-icon,
.loading-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-medium);
  pointer-events: none;
}

.loading-icon {
  color: var(--primary-color);
}

.address-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
}

.address-suggestion {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.address-suggestion:last-child {
  border-bottom: none;
}

.address-suggestion:hover,
.address-suggestion.active {
  background-color: rgba(102, 126, 234, 0.08);
}

.address-suggestion.manual-entry {
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.address-suggestion.manual-entry:hover,
.address-suggestion.manual-entry.active {
  background-color: rgba(59, 130, 246, 0.08);
}

.suggestion-main {
  font-weight: 500;
  color: var(--text-dark);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-secondary {
  font-size: 12px;
  color: var(--text-medium);
  margin-top: 2px;
}

.manual-entry-fields {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.manual-entry-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  justify-content: flex-end;
}

.form-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  flex: 1;
}

.form-group:last-child {
  flex: 0 0 120px; /* Fixed width for postcode */
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Dark mode support */
[data-theme="dark"] .address-dropdown {
  background: var(--gray-800);
  border-color: var(--gray-700);
}

[data-theme="dark"] .address-suggestion {
  border-bottom-color: var(--gray-700);
}

[data-theme="dark"] .address-suggestion:hover,
[data-theme="dark"] .address-suggestion.active {
  background-color: rgba(102, 126, 234, 0.15);
}

[data-theme="dark"] .manual-entry-fields {
  background: var(--gray-700);
  border-color: var(--gray-600);
}

[data-theme="dark"] .suggestion-main {
  color: var(--gray-100);
}

[data-theme="dark"] .suggestion-secondary {
  color: var(--gray-300);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group:last-child {
    flex: 1;
  }
  
  .manual-entry-actions {
    flex-direction: column;
  }
  
  .btn-sm {
    width: 100%;
  }
}
</style>