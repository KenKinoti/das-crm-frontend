<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="modal-title-section">
          <div class="title-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div>
            <h2 class="modal-title">Create Incident Report</h2>
            <p class="modal-subtitle">Document and track incident details</p>
          </div>
        </div>
        <button type="button" class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="submitReport" class="modal-form">
        <div class="modal-body">
          <!-- Progress Steps -->
          <div class="progress-steps">
            <div class="step" :class="{ active: currentStep >= 1 }">
              <div class="step-number">1</div>
              <span>Basic Info</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 2 }">
              <div class="step-number">2</div>
              <span>People & Injuries</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 3 }">
              <div class="step-number">3</div>
              <span>Witnesses</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 4 }">
              <div class="step-number">4</div>
              <span>Response</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 5 }">
              <div class="step-number">5</div>
              <span>Documents</span>
            </div>
          </div>

          <!-- Step 1: Basic Information -->
          <div v-show="currentStep === 1" class="form-step">
            <div class="step-header">
              <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
              <p>Start by providing essential details about the incident</p>
            </div>
            
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="participant" class="form-label">
                  <i class="fas fa-user"></i>
                  Participant *
                </label>
                <select 
                  id="participant" 
                  v-model="form.participant_id" 
                  class="form-input" 
                  :class="{ 'error': errors.participant_id }"
                  required
                >
                  <option value="">Select a participant</option>
                  <option 
                    v-for="participant in participants" 
                    :key="participant.id" 
                    :value="participant.id"
                  >
                    {{ participant.first_name }} {{ participant.last_name }}
                  </option>
                </select>
                <div v-if="errors.participant_id" class="error-message">{{ errors.participant_id }}</div>
              </div>
              
              <div class="form-group">
                <label for="incident_date" class="form-label">
                  <i class="fas fa-calendar"></i>
                  Date *
                </label>
                <input 
                  id="incident_date" 
                  v-model="form.incident_date" 
                  type="date" 
                  class="form-input"
                  :class="{ 'error': errors.incident_date }"
                  required
                >
                <div v-if="errors.incident_date" class="error-message">{{ errors.incident_date }}</div>
              </div>
              
              <div class="form-group">
                <label for="incident_time" class="form-label">
                  <i class="fas fa-clock"></i>
                  Time *
                </label>
                <input 
                  id="incident_time" 
                  v-model="form.incident_time" 
                  type="time" 
                  class="form-input"
                  :class="{ 'error': errors.incident_time }"
                  required
                >
                <div v-if="errors.incident_time" class="error-message">{{ errors.incident_time }}</div>
              </div>
              
              <div class="form-group full-width">
                <label for="location" class="form-label">
                  <i class="fas fa-map-marker-alt"></i>
                  Location *
                </label>
                <input 
                  id="location" 
                  v-model="form.location" 
                  type="text" 
                  class="form-input"
                  :class="{ 'error': errors.location }"
                  placeholder="Where did the incident occur?"
                  required
                >
                <div v-if="errors.location" class="error-message">{{ errors.location }}</div>
              </div>
              
              <div class="form-group">
                <label for="incident_type" class="form-label">
                  <i class="fas fa-tag"></i>
                  Type *
                </label>
                <select 
                  id="incident_type" 
                  v-model="form.incident_type" 
                  class="form-input"
                  :class="{ 'error': errors.incident_type }"
                  required
                >
                  <option value="">Select type</option>
                  <option value="injury">Injury</option>
                  <option value="medication_error">Medication Error</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="property_damage">Property Damage</option>
                  <option value="missing_person">Missing Person</option>
                  <option value="near_miss">Near Miss</option>
                  <option value="other">Other</option>
                </select>
                <div v-if="errors.incident_type" class="error-message">{{ errors.incident_type }}</div>
              </div>
              
              <div class="form-group">
                <label for="severity" class="form-label">
                  <i class="fas fa-exclamation-triangle"></i>
                  Severity *
                </label>
                <select 
                  id="severity" 
                  v-model="form.severity" 
                  class="form-input"
                  :class="{ 'error': errors.severity }"
                  required
                >
                  <option value="">Select severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <div v-if="errors.severity" class="error-message">{{ errors.severity }}</div>
              </div>
            </div>
          </div>

          <!-- Step 2: Incident Details -->
          <div v-show="currentStep === 2" class="form-step">
            <div class="step-header">
              <h3><i class="fas fa-file-alt"></i> Incident Details</h3>
              <p>Provide detailed description and immediate actions taken</p>
            </div>
            
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="description" class="form-label">
                  <i class="fas fa-align-left"></i>
                  Description *
                </label>
                <textarea 
                  id="description" 
                  v-model="form.description" 
                  class="form-textarea"
                  :class="{ 'error': errors.description }"
                  rows="4"
                  placeholder="Describe what happened in detail..."
                  required
                ></textarea>
                <div v-if="errors.description" class="error-message">{{ errors.description }}</div>
              </div>
              
              <div class="form-group full-width">
                <label for="immediate_action" class="form-label">
                  <i class="fas fa-first-aid"></i>
                  Immediate Action Taken
                </label>
                <textarea 
                  id="immediate_action" 
                  v-model="form.immediate_action" 
                  class="form-textarea"
                  rows="3"
                  placeholder="What immediate actions were taken?"
                ></textarea>
              </div>
              
              <div class="form-group full-width">
                <label for="injuries_description" class="form-label">
                  <i class="fas fa-heartbeat"></i>
                  Injuries Description
                </label>
                <textarea 
                  id="injuries_description" 
                  v-model="form.injuries_description" 
                  class="form-textarea"
                  rows="3"
                  placeholder="Describe any injuries sustained..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 2: People Involved & Injuries -->
          <div v-show="currentStep === 2" class="form-step">
            <div class="step-header">
              <h3><i class="fas fa-users"></i> People Involved & Injuries</h3>
              <p>Track all people involved and any injuries sustained</p>
            </div>
            
            <div class="people-section">
              <div class="section-header">
                <h4>People Involved</h4>
                <button type="button" class="add-button" @click="addPersonInvolved">
                  <i class="fas fa-plus"></i> Add Person
                </button>
              </div>
              
              <div v-for="(person, index) in form.people_involved" :key="index" class="person-card">
                <div class="person-header">
                  <h5>Person {{ index + 1 }}</h5>
                  <button type="button" class="remove-button" @click="removePerson(index)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Person Type *</label>
                    <select v-model="person.person_type" class="form-select" required>
                      <option value="">Select type</option>
                      <option value="participant">Participant</option>
                      <option value="staff">Staff Member</option>
                      <option value="visitor">Visitor</option>
                      <option value="family_member">Family Member</option>
                      <option value="contractor">Contractor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">Role in Incident *</label>
                    <select v-model="person.role_in_incident" class="form-select" required>
                      <option value="">Select role</option>
                      <option value="injured_party">Injured Party</option>
                      <option value="witness">Witness</option>
                      <option value="responding_staff">Responding Staff</option>
                      <option value="bystander">Bystander</option>
                      <option value="instigator">Instigator</option>
                    </select>
                  </div>
                  
                  <div v-if="person.person_type === 'participant'" class="form-group">
                    <label class="form-label">Participant</label>
                    <select v-model="person.participant_id" class="form-select">
                      <option value="">Select participant</option>
                      <option v-for="participant in participants" :key="participant.id" :value="participant.id">
                        {{ participant.first_name }} {{ participant.last_name }}
                      </option>
                    </select>
                  </div>
                  
                  <div v-if="person.person_type === 'staff'" class="form-group">
                    <label class="form-label">Staff Member</label>
                    <select v-model="person.staff_user_id" class="form-select">
                      <option value="">Select staff member</option>
                      <!-- Add staff options here -->
                    </select>
                  </div>
                  
                  <div v-if="!['participant', 'staff'].includes(person.person_type)" class="form-group">
                    <label class="form-label">First Name</label>
                    <input v-model="person.first_name" type="text" class="form-input" />
                  </div>
                  
                  <div v-if="!['participant', 'staff'].includes(person.person_type)" class="form-group">
                    <label class="form-label">Last Name</label>
                    <input v-model="person.last_name" type="text" class="form-input" />
                  </div>
                  
                  <div class="form-group full-width">
                    <label class="checkbox-item">
                      <input v-model="person.was_injured" type="checkbox" class="checkbox">
                      <span class="checkmark"></span>
                      <span class="checkbox-label">This person was injured</span>
                    </label>
                  </div>
                  
                  <div v-if="person.was_injured" class="injury-section full-width">
                    <div class="form-group">
                      <label class="form-label">Injury Severity</label>
                      <select v-model="person.injury_severity" class="form-select">
                        <option value="">Select severity</option>
                        <option value="minor">Minor</option>
                        <option value="moderate">Moderate</option>
                        <option value="serious">Serious</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    
                    <div class="form-group full-width">
                      <label class="form-label">Injury Description</label>
                      <textarea v-model="person.injury_description" class="form-textarea" rows="3" placeholder="Describe the injury..."></textarea>
                    </div>
                    
                    <div class="medical-attention-section">
                      <h5>Medical Response</h5>
                      <div class="checkbox-grid">
                        <label class="checkbox-item">
                          <input v-model="person.medical_attention_required" type="checkbox" class="checkbox">
                          <span class="checkmark"></span>
                          <span class="checkbox-label">Medical attention required</span>
                        </label>
                        
                        <label class="checkbox-item">
                          <input v-model="person.medical_attention_provided" type="checkbox" class="checkbox">
                          <span class="checkmark"></span>
                          <span class="checkbox-label">Medical attention provided</span>
                        </label>
                        
                        <label class="checkbox-item">
                          <input v-model="person.transported_to_hospital" type="checkbox" class="checkbox">
                          <span class="checkmark"></span>
                          <span class="checkbox-label">Transported to hospital</span>
                        </label>
                        
                        <label class="checkbox-item">
                          <input v-model="person.ambulance_called" type="checkbox" class="checkbox">
                          <span class="checkmark"></span>
                          <span class="checkbox-label">Ambulance called</span>
                        </label>
                      </div>
                      
                      <div v-if="person.medical_attention_provided" class="form-group full-width">
                        <label class="form-label">Medical Provider</label>
                        <input v-model="person.medical_provider" type="text" class="form-input" placeholder="Hospital, GP, First Aid Officer, etc." />
                      </div>
                      
                      <div v-if="person.transported_to_hospital" class="form-group full-width">
                        <label class="form-label">Hospital Name</label>
                        <input v-model="person.hospital_name" type="text" class="form-input" />
                      </div>
                      
                      <div class="form-group full-width">
                        <label class="form-label">Immediate Care Provided</label>
                        <textarea v-model="person.immediate_care_provided" class="form-textarea" rows="2" placeholder="Describe immediate care given..."></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Step 3: Witnesses -->
          <div v-show="currentStep === 3" class="form-step">
            <div class="step-header">
              <h3><i class="fas fa-eye"></i> Witnesses</h3>
              <p>Record witness information and statements</p>
            </div>
            
            <div class="witnesses-section">
              <div class="section-header">
                <h4>Witnesses</h4>
                <button type="button" class="add-button" @click="addWitness">
                  <i class="fas fa-plus"></i> Add Witness
                </button>
              </div>
              
              <div v-for="(witness, index) in form.witnesses" :key="index" class="witness-card">
                <div class="witness-header">
                  <h5>Witness {{ index + 1 }}</h5>
                  <button type="button" class="remove-button" @click="removeWitness(index)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Witness Type</label>
                    <select v-model="witness.witness_type" class="form-select">
                      <option value="">Select type</option>
                      <option value="staff">Staff</option>
                      <option value="participant">Participant</option>
                      <option value="family_member">Family Member</option>
                      <option value="visitor">Visitor</option>
                      <option value="contractor">Contractor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">First Name</label>
                    <input v-model="witness.first_name" type="text" class="form-input" />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">Last Name</label>
                    <input v-model="witness.last_name" type="text" class="form-input" />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">Contact Phone</label>
                    <input v-model="witness.contact_phone" type="tel" class="form-input" />
                  </div>
                  
                  <div class="form-group full-width">
                    <label class="form-label">Witness Statement</label>
                    <textarea v-model="witness.witness_statement" class="form-textarea" rows="4" placeholder="Record the witness statement..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Step 4: Response & Follow-up -->
          <div v-show="currentStep === 4" class="form-step">
            <div class="step-header">
              <h3><i class="fas fa-clipboard-check"></i> Response & Follow-up</h3>
              <p>Medical attention, notifications, and next steps</p>
            </div>
            
            <div class="form-grid">
              <div class="form-group full-width">
                <div class="checkbox-section">
                  <h4>Medical & Emergency Response</h4>
                  
                  <label class="checkbox-item">
                    <input 
                      id="medical_attention" 
                      v-model="form.medical_attention" 
                      type="checkbox"
                      class="checkbox"
                    >
                    <span class="checkmark"></span>
                    <span class="checkbox-label">Medical attention provided</span>
                  </label>
                  
                  <label class="checkbox-item">
                    <input 
                      id="emergency_services" 
                      v-model="form.emergency_services" 
                      type="checkbox"
                      class="checkbox"
                    >
                    <span class="checkmark"></span>
                    <span class="checkbox-label">Emergency services called</span>
                  </label>
                  
                  <label class="checkbox-item">
                    <input 
                      id="family_notified" 
                      v-model="form.family_notified" 
                      type="checkbox"
                      class="checkbox"
                    >
                    <span class="checkmark"></span>
                    <span class="checkbox-label">Family/guardian notified</span>
                  </label>
                </div>
              </div>
              
              <div v-if="form.medical_attention" class="form-group full-width">
                <label for="medical_details" class="form-label">
                  <i class="fas fa-notes-medical"></i>
                  Medical Details
                </label>
                <textarea 
                  id="medical_details" 
                  v-model="form.medical_details" 
                  class="form-textarea"
                  rows="3"
                  placeholder="Details of medical attention provided..."
                ></textarea>
              </div>
              
              <div v-if="form.emergency_services" class="form-group full-width">
                <label for="emergency_details" class="form-label">
                  <i class="fas fa-ambulance"></i>
                  Emergency Services Details
                </label>
                <textarea 
                  id="emergency_details" 
                  v-model="form.emergency_details" 
                  class="form-textarea"
                  rows="3"
                  placeholder="Which services were called and details..."
                ></textarea>
              </div>
              
              <div class="form-group full-width">
                <div class="checkbox-section">
                  <h4>Witnesses & Follow-up</h4>
                  
                  <label class="checkbox-item">
                    <input 
                      id="witnesses_present" 
                      v-model="form.witnesses_present" 
                      type="checkbox"
                      class="checkbox"
                    >
                    <span class="checkmark"></span>
                    <span class="checkbox-label">Witnesses present</span>
                  </label>
                  
                  <label class="checkbox-item">
                    <input 
                      id="follow_up_required" 
                      v-model="form.follow_up_required" 
                      type="checkbox"
                      class="checkbox"
                    >
                    <span class="checkmark"></span>
                    <span class="checkbox-label">Follow-up required</span>
                  </label>
                </div>
              </div>
              
              <div v-if="form.witnesses_present" class="form-group full-width">
                <label for="witness_details" class="form-label">
                  <i class="fas fa-eye"></i>
                  Witness Details
                </label>
                <textarea 
                  id="witness_details" 
                  v-model="form.witness_details" 
                  class="form-textarea"
                  rows="3"
                  placeholder="Names and contact details of witnesses..."
                ></textarea>
              </div>
              
              <div v-if="form.follow_up_required" class="form-group full-width">
                <label for="follow_up_details" class="form-label">
                  <i class="fas fa-tasks"></i>
                  Follow-up Details
                </label>
                <textarea 
                  id="follow_up_details" 
                  v-model="form.follow_up_details" 
                  class="form-textarea"
                  rows="3"
                  placeholder="What follow-up actions are needed?"
                ></textarea>
              </div>
              
              <div class="form-group full-width">
                <label for="preventive_measures" class="form-label">
                  <i class="fas fa-shield-alt"></i>
                  Preventive Measures
                </label>
                <textarea 
                  id="preventive_measures" 
                  v-model="form.preventive_measures" 
                  class="form-textarea"
                  rows="3"
                  placeholder="What can be done to prevent similar incidents?"
                ></textarea>
              </div>
            </div>
          </div>
          
          <!-- Step 5: Documents & Evidence -->
          <div v-show="currentStep === 5" class="form-step">
            <div class="step-header">
              <h3><i class="fas fa-paperclip"></i> Documents & Evidence</h3>
              <p>Upload photos, reports, and other supporting documents</p>
            </div>
            
            <div class="documents-section">
              <div class="upload-area" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
                <div class="upload-content">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <h4>Drag and drop files here</h4>
                  <p>or <button type="button" class="upload-button" @click="$refs.fileInput.click()">browse files</button></p>
                  <input ref="fileInput" type="file" multiple accept="image/*,.pdf,.doc,.docx" @change="handleFileSelect" style="display: none;">
                </div>
              </div>
              
              <div v-if="uploadedFiles.length > 0" class="uploaded-files">
                <h4>Uploaded Files</h4>
                <div class="file-list">
                  <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
                    <div class="file-icon">
                      <i :class="getFileIcon(file.type)"></i>
                    </div>
                    <div class="file-info">
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    </div>
                    <button type="button" class="remove-file-button" @click="removeFile(index)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="footer-actions">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              <i class="fas fa-times"></i>
              Cancel
            </button>
            
            <div class="step-navigation">
              <button 
                v-if="currentStep > 1" 
                type="button" 
                class="btn btn-outline-primary" 
                @click="previousStep"
              >
                <i class="fas fa-chevron-left"></i>
                Previous
              </button>
              
              <button 
                v-if="currentStep < 5" 
                type="button" 
                class="btn btn-primary" 
                @click="nextStep"
              >
                Next
                <i class="fas fa-chevron-right"></i>
              </button>
              
              <button 
                v-if="currentStep === 5" 
                type="submit" 
                class="btn btn-success" 
                :disabled="submitting"
              >
                <span v-if="submitting" class="spinner"></span>
                <i v-else class="fas fa-save"></i>
                {{ submitting ? 'Creating...' : 'Create Report' }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { incidentReportService } from '@/services/incidentReports'
import { showErrorNotification } from '@/utils/notifications'

export default {
  name: 'CreateIncidentReportModal',
  props: {
    participants: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'created'],
  setup(props, { emit }) {
    const submitting = ref(false)
    const errors = ref({})
    const currentStep = ref(1)
    
    const form = reactive({
      participant_id: '',
      incident_date: new Date().toISOString().split('T')[0],
      incident_time: '',
      location: '',
      incident_type: '',
      severity: '',
      description: '',
      immediate_action: '',
      environment_conditions: '',
      weather_conditions: '',
      contributing_factors: '',
      corrective_actions: '',
      people_involved: [],
      witnesses: [],
      management_notified: false,
      police_notified: false,
      police_reference: '',
      insurance_notified: false,
      insurance_reference: '',
      regulatory_body_notified: false,
      regulatory_reference: '',
      medical_attention: false,
      medical_details: '',
      emergency_services: false,
      emergency_details: '',
      family_notified: false,
      witnesses_present: false,
      witness_details: '',
      follow_up_required: false,
      follow_up_details: '',
      preventive_measures: '',
      timeline: [],
      risk_factors: [],
      follow_up_actions: []
    })

    const handleOverlayClick = (event) => {
      if (event.target === event.currentTarget) {
        emit('close')
      }
    }

    const nextStep = () => {
      if (currentStep.value < 5) {
        currentStep.value++
      }
    }

    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }
    
    const addPersonInvolved = () => {
      form.people_involved.push({
        person_type: '',
        participant_id: null,
        staff_user_id: null,
        first_name: '',
        last_name: '',
        role_in_incident: '',
        was_injured: false,
        injury_description: '',
        injury_severity: '',
        medical_attention_required: false,
        medical_attention_provided: false,
        medical_provider: '',
        transported_to_hospital: false,
        hospital_name: '',
        ambulance_called: false,
        immediate_care_provided: '',
        ongoing_care_required: false,
        ongoing_care_details: ''
      })
    }
    
    const removePerson = (index) => {
      form.people_involved.splice(index, 1)
    }
    
    const addWitness = () => {
      form.witnesses.push({
        witness_type: '',
        first_name: '',
        last_name: '',
        contact_phone: '',
        contact_email: '',
        relationship: '',
        witness_statement: '',
        statement_method: 'verbal',
        witness_credibility: 'high'
      })
    }
    
    const removeWitness = (index) => {
      form.witnesses.splice(index, 1)
    }
    
    // File handling
    const uploadedFiles = ref([])
    
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      uploadedFiles.value.push(...files)
    }
    
    const handleFileDrop = (event) => {
      event.preventDefault()
      const files = Array.from(event.dataTransfer.files)
      uploadedFiles.value.push(...files)
    }
    
    const removeFile = (index) => {
      uploadedFiles.value.splice(index, 1)
    }
    
    const getFileIcon = (fileType) => {
      if (fileType.startsWith('image/')) return 'fas fa-image'
      if (fileType.includes('pdf')) return 'fas fa-file-pdf'
      if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word'
      return 'fas fa-file'
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const submitReport = async () => {
      if (submitting.value) return
      
      try {
        submitting.value = true
        errors.value = {}
        
        // Prepare form data
        const reportData = {
          ...form,
          incident_date: new Date(form.incident_date + 'T00:00:00').toISOString(),
          // Clean up optional fields
          injuries_description: form.injuries_description || undefined,
          medical_details: form.medical_details || undefined,
          emergency_details: form.emergency_details || undefined,
          witness_details: form.witness_details || undefined,
          follow_up_details: form.follow_up_details || undefined,
          preventive_measures: form.preventive_measures || undefined
        }
        
        await incidentReportService.createIncidentReport(reportData)
        emit('created')
        
      } catch (error) {
        console.error('Error creating incident report:', error)
        
        if (error.response?.data?.error?.message) {
          showErrorNotification(error.response.data.error.message)
        } else {
          showErrorNotification('Failed to create incident report. Please try again.')
        }
        
        // Handle validation errors
        if (error.response?.status === 400) {
          // You can add specific field errors here if the backend provides them
        }
      } finally {
        submitting.value = false
      }
    }

    return {
      form,
      errors,
      submitting,
      currentStep,
      uploadedFiles,
      submitReport,
      handleOverlayClick,
      nextStep,
      previousStep,
      addPersonInvolved,
      removePerson,
      addWitness,
      removeWitness,
      handleFileSelect,
      handleFileDrop,
      removeFile,
      getFileIcon,
      formatFileSize
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1055;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 24px 24px 0 0;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  backdrop-filter: blur(10px);
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.modal-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  color: white;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.modal-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.progress-steps {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f1f5f9;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.1);
}

.step span {
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
}

.step.active span {
  color: #1e293b;
  font-weight: 600;
}

.form-step {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-header {
  margin-bottom: 2rem;
  text-align: center;
}

.step-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.step-header h3 i {
  color: #667eea;
}

.step-header p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #667eea;
  width: 16px;
}

.form-input,
.form-textarea {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.checkbox-section {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
}

.checkbox-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.checkbox-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.checkbox {
  display: none;
}

.checkmark {
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: white;
}

.checkbox:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.checkbox-label {
  font-weight: 500;
  color: #374151;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 2px solid #f1f5f9;
  background: #f8fafc;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.step-navigation {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-2px);
}

.btn-outline-primary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline-primary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dark theme support */
[data-theme="dark"] .modal-container {
  background: #1e293b;
  color: #f1f5f9;
}

[data-theme="dark"] .step-header h3 {
  color: #f1f5f9;
}

[data-theme="dark"] .step-header p {
  color: #94a3b8;
}

[data-theme="dark"] .form-label {
  color: #f1f5f9;
}

[data-theme="dark"] .form-input,
[data-theme="dark"] .form-textarea {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

[data-theme="dark"] .form-input:focus,
[data-theme="dark"] .form-textarea:focus {
  background: #334155;
  border-color: #667eea;
}

[data-theme="dark"] .checkbox-section {
  background: #334155;
  border-color: #475569;
}

[data-theme="dark"] .checkbox-section h4 {
  color: #f1f5f9;
}

[data-theme="dark"] .checkbox-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

[data-theme="dark"] .checkbox-label {
  color: #f1f5f9;
}

[data-theme="dark"] .checkmark {
  background: #475569;
  border-color: #64748b;
}

[data-theme="dark"] .modal-footer {
  background: #334155;
  border-color: #475569;
}

[data-theme="dark"] .progress-steps {
  border-color: #475569;
}

[data-theme="dark"] .step span {
  color: #94a3b8;
}

[data-theme="dark"] .step.active span {
  color: #f1f5f9;
}

/* Mobile responsiveness */
@media (max-width: 1024px) {
  .modal-container {
    max-width: 90vw;
    margin: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .checkbox-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .modal-container {
    border-radius: 16px;
    max-height: calc(100vh - 4rem);
    width: 100%;
    max-width: 100%;
    margin: 0;
  }
  
  .modal-header {
    padding: 1.25rem;
    border-radius: 16px 16px 0 0;
  }
  
  .modal-title {
    font-size: 1.375rem;
  }
  
  .modal-subtitle {
    font-size: 0.875rem;
  }
  
  .title-icon {
    width: 45px;
    height: 45px;
    font-size: 1.125rem;
  }
  
  .modal-body {
    padding: 1rem;
    max-height: calc(100vh - 12rem);
    overflow-y: auto;
  }
  
  .progress-steps {
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  
  .step {
    min-width: 100px;
    flex-shrink: 0;
  }
  
  .step-number {
    width: 30px;
    height: 30px;
    font-size: 0.875rem;
  }
  
  .step span {
    font-size: 0.75rem;
    white-space: nowrap;
  }
  
  .step-header h3 {
    font-size: 1.125rem;
  }
  
  .step-header p {
    font-size: 0.875rem;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .person-card,
  .witness-card {
    padding: 1rem;
    margin-bottom: 0.75rem;
    border-radius: 12px;
  }
  
  .section-header {
    margin-bottom: 0.75rem;
  }
  
  .section-header h4 {
    font-size: 1rem;
  }
  
  .add-button {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }
  
  .upload-area {
    padding: 1.5rem 1rem;
  }
  
  .upload-content h4 {
    font-size: 1rem;
  }
  
  .upload-content p {
    font-size: 0.8rem;
  }
  
  .file-item {
    padding: 0.625rem;
  }
  
  .footer-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .step-navigation {
    width: 100%;
    justify-content: space-between;
    order: 2;
  }
  
  .btn {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.95rem;
    justify-content: center;
  }
  
  .modal-footer {
    padding: 1rem;
    border-radius: 0 0 16px 16px;
  }
}

@media (max-width: 640px) {
  .modal-overlay {
    padding: 0.25rem;
    padding-top: 1rem;
  }
  
  .modal-container {
    max-height: calc(100vh - 2rem);
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-title-section {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .title-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
    margin: 0 auto;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .modal-body {
    padding: 0.875rem;
  }
  
  .progress-steps {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .step {
    min-width: 80px;
  }
  
  .step span {
    font-size: 0.7rem;
    line-height: 1.2;
  }
  
  .form-grid {
    gap: 0.875rem;
  }
  
  .form-group {
    margin-bottom: 0.875rem;
  }
  
  .form-label {
    font-size: 0.875rem;
    margin-bottom: 0.375rem;
  }
  
  .checkbox-section h4 {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
  
  .checkbox-item {
    padding: 0.625rem 0;
  }
  
  .checkbox-label {
    font-size: 0.875rem;
  }
  
  .person-card,
  .witness-card {
    padding: 0.875rem;
    border-radius: 8px;
  }
  
  .person-header,
  .witness-header {
    margin-bottom: 0.75rem;
  }
  
  .person-header h5,
  .witness-header h5 {
    font-size: 0.95rem;
  }
  
  .remove-button {
    padding: 0.25rem 0.375rem;
    font-size: 0.7rem;
  }
  
  .injury-section {
    padding: 0.75rem;
    margin-top: 0.75rem;
    border-radius: 8px;
  }
  
  .medical-attention-section h5 {
    font-size: 0.8rem;
  }
  
  .upload-area {
    padding: 1.25rem 0.75rem;
  }
  
  .upload-content i {
    font-size: 2rem;
  }
  
  .upload-content h4 {
    font-size: 0.95rem;
  }
  
  .file-list {
    gap: 0.5rem;
  }
  
  .file-item {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .file-icon {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
  
  .file-name {
    font-size: 0.8rem;
  }
  
  .file-size {
    font-size: 0.7rem;
  }
  
  .remove-file-button {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.125rem;
    padding-top: 0.5rem;
  }
  
  .modal-container {
    max-height: calc(100vh - 1rem);
    border-radius: 12px;
  }
  
  .modal-header {
    padding: 0.875rem;
    border-radius: 12px 12px 0 0;
  }
  
  .modal-title {
    font-size: 1.125rem;
  }
  
  .modal-subtitle {
    font-size: 0.8rem;
  }
  
  .close-button {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
  
  .modal-body {
    padding: 0.75rem;
  }
  
  .progress-steps {
    margin-bottom: 0.875rem;
    padding: 0 0.25rem;
  }
  
  .step {
    min-width: 70px;
  }
  
  .step-number {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
  
  .step span {
    font-size: 0.65rem;
  }
  
  .step-header {
    margin-bottom: 0.875rem;
  }
  
  .step-header h3 {
    font-size: 1rem;
  }
  
  .step-header p {
    font-size: 0.8rem;
  }
  
  .section-header h4 {
    font-size: 0.9rem;
  }
  
  .add-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .form-input,
  .form-select {
    padding: 0.625rem;
    font-size: 0.95rem;
  }
  
  .form-textarea {
    padding: 0.625rem;
    font-size: 0.95rem;
    min-height: 80px;
  }
  
  .modal-footer {
    padding: 0.75rem;
    border-radius: 0 0 12px 12px;
  }
  
  .btn {
    padding: 0.625rem;
    font-size: 0.9rem;
  }
  
  /* Very compact layout for smallest screens */
  .person-card,
  .witness-card {
    padding: 0.75rem;
  }
  
  .injury-section {
    padding: 0.625rem;
  }
  
  .upload-area {
    padding: 1rem 0.625rem;
  }
  
  .upload-content i {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
  
  .uploaded-files h4 {
    font-size: 0.875rem;
  }
}

/* People and Witnesses Cards */
.people-section, .witnesses-section, .documents-section {
  margin-top: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h4 {
  margin: 0;
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
}

.add-button {
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.add-button:hover {
  background: #047857;
}

.person-card, .witness-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
}

.person-header, .witness-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.person-header h5, .witness-header h5 {
  margin: 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.remove-button {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-button:hover {
  background: #b91c1c;
}

.injury-section {
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.medical-attention-section {
  margin-top: 1rem;
}

.medical-attention-section h5 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* File Upload Styles */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.upload-area:hover {
  border-color: #6366f1;
  background: #f0f9ff;
}

.upload-area.drag-over {
  border-color: #6366f1;
  background: #eff6ff;
}

.upload-content i {
  font-size: 2.5rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.upload-content h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
}

.upload-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.upload-button {
  background: none;
  border: none;
  color: #6366f1;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.upload-button:hover {
  color: #4f46e5;
}

.uploaded-files {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.uploaded-files h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  gap: 0.75rem;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #6366f1;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.file-name {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.remove-file-button {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: background 0.2s;
}

.remove-file-button:hover {
  background: #dc2626;
}

/* Dark theme for new components */
[data-theme="dark"] .person-card,
[data-theme="dark"] .witness-card {
  background: #374151;
  border-color: #4b5563;
}

[data-theme="dark"] .section-header h4,
[data-theme="dark"] .person-header h5,
[data-theme="dark"] .witness-header h5 {
  color: #f3f4f6;
}

[data-theme="dark"] .upload-area {
  background: #374151;
  border-color: #6b7280;
}

[data-theme="dark"] .upload-area:hover {
  background: #4b5563;
  border-color: #8b5cf6;
}

[data-theme="dark"] .uploaded-files {
  background: #374151;
  border-color: #4b5563;
}

[data-theme="dark"] .file-item {
  background: #4b5563;
  border-color: #6b7280;
}

[data-theme="dark"] .file-name {
  color: #f3f4f6;
}

[data-theme="dark"] .file-size {
  color: #9ca3af;
}
</style>