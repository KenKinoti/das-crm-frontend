import api from './api'

const careNotesAPI = {
  // Get care notes with filters
  getCareNotes: async (filters = {}) => {
    const params = new URLSearchParams()
    
    if (filters.participant_id) params.append('participant_id', filters.participant_id)
    if (filters.staff_id) params.append('staff_id', filters.staff_id)
    if (filters.note_type) params.append('note_type', filters.note_type)
    if (filters.priority) params.append('priority', filters.priority)
    if (filters.from_date) params.append('from_date', filters.from_date)
    if (filters.to_date) params.append('to_date', filters.to_date)
    if (filters.include_private) params.append('include_private', filters.include_private)
    if (filters.include_confidential) params.append('include_confidential', filters.include_confidential)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    
    const queryString = params.toString()
    const url = queryString ? `/care-notes?${queryString}` : '/care-notes'
    
    const response = await api.get(url)
    return response.data
  },

  // Get a specific care note by ID
  getCareNote: async (id) => {
    const response = await api.get(`/care-notes/${id}`)
    return response.data
  },

  // Create a new care note
  createCareNote: async (careNoteData) => {
    const response = await api.post('/care-notes', careNoteData)
    return response.data
  },

  // Update a care note
  updateCareNote: async (id, careNoteData) => {
    const response = await api.put(`/care-notes/${id}`, careNoteData)
    return response.data
  },

  // Delete a care note
  deleteCareNote: async (id) => {
    const response = await api.delete(`/care-notes/${id}`)
    return response.data
  },

  // Get care note statistics
  getCareNoteStats: async () => {
    const response = await api.get('/care-notes/stats')
    return response.data
  }
}

export default careNotesAPI