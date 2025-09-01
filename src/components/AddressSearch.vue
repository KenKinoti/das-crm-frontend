<template>
  <div class="address-search-container">
    <div class="form-group">
      <label :for="fieldId">{{ label }}</label>
      <div class="address-input-wrapper">
        <input
          :id="fieldId"
          v-model="searchQuery"
          type="text"
          class="form-input address-input"
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
  </div>
</template>

<script>
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
        if (this.searchQuery.length >= 3) {
          this.searchAddresses()
        } else {
          this.suggestions = []
          this.showDropdown = false
        }
      }, 300)
    },
    
    async searchAddresses() {
      if (!this.searchQuery.trim()) {
        return
      }
      
      this.isLoading = true
      
      try {
        // For demo purposes, using mock Australian addresses
        // In production, this would integrate with Google Places API or similar
        const mockSuggestions = this.getMockAustralianAddresses(this.searchQuery)
        
        setTimeout(() => {
          this.suggestions = mockSuggestions
          this.showDropdown = true
          this.isLoading = false
          this.selectedIndex = -1
        }, 500) // Simulate API delay
        
      } catch (error) {
        console.error('Address search error:', error)
        this.isLoading = false
        this.suggestions = []
      }
    },
    
    getMockAustralianAddresses(query) {
      const australianAddresses = [
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
          placeId: 'mock_1'
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
          placeId: 'mock_2'
        },
        {
          mainText: '789 Queen Street',
          secondaryText: 'Brisbane QLD 4000, Australia',
          fullAddress: '789 Queen Street, Brisbane QLD 4000',
          components: {
            street: '789 Queen Street',
            suburb: 'Brisbane',
            state: 'QLD',
            postcode: '4000',
            country: 'Australia'
          },
          placeId: 'mock_3'
        },
        {
          mainText: '321 King William Street',
          secondaryText: 'Adelaide SA 5000, Australia',
          fullAddress: '321 King William Street, Adelaide SA 5000',
          components: {
            street: '321 King William Street',
            suburb: 'Adelaide',
            state: 'SA',
            postcode: '5000',
            country: 'Australia'
          },
          placeId: 'mock_4'
        },
        {
          mainText: '654 Murray Street',
          secondaryText: 'Perth WA 6000, Australia',
          fullAddress: '654 Murray Street, Perth WA 6000',
          components: {
            street: '654 Murray Street',
            suburb: 'Perth',
            state: 'WA',
            postcode: '6000',
            country: 'Australia'
          },
          placeId: 'mock_5'
        }
      ]
      
      const lowerQuery = query.toLowerCase()
      return australianAddresses.filter(addr => 
        addr.mainText.toLowerCase().includes(lowerQuery) ||
        addr.secondaryText.toLowerCase().includes(lowerQuery)
      ).slice(0, 5)
    },
    
    selectAddress(address) {
      this.searchQuery = address.fullAddress
      this.showDropdown = false
      this.selectedIndex = -1
      
      // Emit address selection event with full address data
      this.$emit('address-selected', {
        fullAddress: address.fullAddress,
        components: address.components
      })
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
.address-search-container {
  position: relative;
}

.address-input-wrapper {
  position: relative;
}

.address-input {
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