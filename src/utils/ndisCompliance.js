/**
 * NDIS Compliance and Utility Functions
 * Provides helper functions for NDIS-specific calculations and compliance checks
 */

// NDIS Service Categories and Pricing
export const NDIS_CATEGORIES = {
  CORE_SUPPORTS: {
    name: 'Core Supports',
    code: 'CORE',
    subcategories: {
      ASSISTANCE_DAILY_LIFE: 'Assistance with Daily Life',
      TRANSPORT: 'Transport',
      CONSUMABLES: 'Consumables',
      ASSISTANCE_ACCESS_COMMUNITY: 'Assistance to Access Community, Social and Rec Activities'
    }
  },
  CAPACITY_BUILDING: {
    name: 'Capacity Building Supports',
    code: 'CB',
    subcategories: {
      SUPPORT_COORDINATION: 'Support Coordination',
      IMPROVED_LIVING_ARRANGEMENTS: 'Improved Living Arrangements',
      INCREASED_SOCIAL_COMMUNITY: 'Increased Social and Community Participation',
      FINDING_MAINTAINING_EMPLOYMENT: 'Finding and Maintaining Employment',
      IMPROVED_LEARNING: 'Improved Learning',
      IMPROVED_LIFE_CHOICES: 'Improved Life Choices',
      IMPROVED_HEALTH_WELLBEING: 'Improved Health and Wellbeing',
      IMPROVED_DAILY_LIVING: 'Improved Daily Living Skills'
    }
  },
  CAPITAL_SUPPORTS: {
    name: 'Capital Supports',
    code: 'CAPITAL',
    subcategories: {
      ASSISTIVE_TECHNOLOGY: 'Assistive Technology',
      HOME_VEHICLE_MODIFICATIONS: 'Home/Vehicle Modifications'
    }
  }
}

// NDIS Support Item Numbers (sample - would be comprehensive in real app)
export const NDIS_SUPPORT_ITEMS = {
  // Core Daily Personal Activities
  '01_011_0107_1_1': {
    name: 'Daily Personal Activities - Standard - Weekday Daytime',
    category: 'CORE',
    unit: 'Hour',
    rateCap: 60.48
  },
  '01_013_0107_1_1': {
    name: 'Daily Personal Activities - Standard - Public Holiday',
    category: 'CORE', 
    unit: 'Hour',
    rateCap: 90.72
  },
  // Support Coordination
  '07_001_0106_6_1': {
    name: 'Support Coordination',
    category: 'CB',
    unit: 'Hour',
    rateCap: 193.99
  },
  // Specialist Support Coordination
  '07_002_0106_6_1': {
    name: 'Specialist Support Coordination',
    category: 'CB',
    unit: 'Hour', 
    rateCap: 215.54
  }
}

// Plan Management Types
export const PLAN_MANAGEMENT_TYPES = {
  SELF_MANAGED: 'self_managed',
  PLAN_MANAGED: 'plan_managed',
  NDIA_MANAGED: 'ndia_managed'
}

// Participant Age Groups for pricing
export const AGE_GROUPS = {
  UNDER_7: 'under_7',
  '7_TO_14': '7_to_14', 
  '15_TO_17': '15_to_17',
  '18_TO_64': '18_to_64',
  '65_PLUS': '65_plus'
}

// Time of service delivery for pricing
export const SERVICE_TIMES = {
  WEEKDAY_DAYTIME: 'weekday_daytime', // Mon-Fri 6am-8pm
  WEEKDAY_EVENING: 'weekday_evening', // Mon-Fri 8pm-10pm
  WEEKDAY_NIGHT: 'weekday_night',     // Mon-Fri 10pm-6am
  SATURDAY: 'saturday',               // Sat 6am-8pm
  SATURDAY_EVENING: 'saturday_evening', // Sat 8pm-midnight
  SATURDAY_NIGHT: 'saturday_night',   // Sat midnight-6am
  SUNDAY: 'sunday',                   // Sun 6am-8pm
  SUNDAY_EVENING: 'sunday_evening',   // Sun 8pm-midnight
  SUNDAY_NIGHT: 'sunday_night',       // Sun midnight-6am
  PUBLIC_HOLIDAY: 'public_holiday'    // Public holidays
}

// Calculate appropriate rate based on service time
export function calculateNDISRate(baseRate, serviceTime, isHighIntensity = false) {
  const multipliers = {
    [SERVICE_TIMES.WEEKDAY_DAYTIME]: 1.0,
    [SERVICE_TIMES.WEEKDAY_EVENING]: 1.25,
    [SERVICE_TIMES.WEEKDAY_NIGHT]: 1.5,
    [SERVICE_TIMES.SATURDAY]: 1.25,
    [SERVICE_TIMES.SATURDAY_EVENING]: 1.5,
    [SERVICE_TIMES.SATURDAY_NIGHT]: 2.0,
    [SERVICE_TIMES.SUNDAY]: 1.5,
    [SERVICE_TIMES.SUNDAY_EVENING]: 1.75,
    [SERVICE_TIMES.SUNDAY_NIGHT]: 2.0,
    [SERVICE_TIMES.PUBLIC_HOLIDAY]: 2.0
  }
  
  const multiplier = multipliers[serviceTime] || 1.0
  let rate = baseRate * multiplier
  
  // High intensity support loading (additional 8%)
  if (isHighIntensity) {
    rate *= 1.08
  }
  
  return Math.round(rate * 100) / 100 // Round to 2 decimal places
}

// Determine service time based on date/time
export function getServiceTime(dateTime) {
  const date = new Date(dateTime)
  const day = date.getDay() // 0 = Sunday, 6 = Saturday
  const hour = date.getHours()
  
  // Check if it's a public holiday (simplified - would need comprehensive holiday data)
  if (isPublicHoliday(date)) {
    return SERVICE_TIMES.PUBLIC_HOLIDAY
  }
  
  // Sunday (0)
  if (day === 0) {
    if (hour >= 6 && hour < 20) return SERVICE_TIMES.SUNDAY
    if (hour >= 20 && hour < 24) return SERVICE_TIMES.SUNDAY_EVENING
    return SERVICE_TIMES.SUNDAY_NIGHT
  }
  
  // Saturday (6)
  if (day === 6) {
    if (hour >= 6 && hour < 20) return SERVICE_TIMES.SATURDAY
    if (hour >= 20 && hour < 24) return SERVICE_TIMES.SATURDAY_EVENING
    return SERVICE_TIMES.SATURDAY_NIGHT
  }
  
  // Weekdays (1-5)
  if (hour >= 6 && hour < 20) return SERVICE_TIMES.WEEKDAY_DAYTIME
  if (hour >= 20 && hour < 22) return SERVICE_TIMES.WEEKDAY_EVENING
  return SERVICE_TIMES.WEEKDAY_NIGHT
}

// Simple public holiday check (would be more comprehensive in real app)
export function isPublicHoliday(date) {
  const day = date.getDate()
  const month = date.getMonth() + 1
  
  // Major Australian public holidays
  const publicHolidays = [
    { day: 1, month: 1 },   // New Year's Day
    { day: 26, month: 1 },  // Australia Day
    { day: 25, month: 4 },  // ANZAC Day
    { day: 25, month: 12 }, // Christmas Day
    { day: 26, month: 12 }  // Boxing Day
  ]
  
  return publicHolidays.some(holiday => 
    holiday.day === day && holiday.month === month
  )
}

// Calculate total service cost
export function calculateServiceCost(supportItem, duration, serviceDateTime, isHighIntensity = false) {
  const item = NDIS_SUPPORT_ITEMS[supportItem]
  if (!item) {
    throw new Error(`Unknown support item: ${supportItem}`)
  }
  
  const serviceTime = getServiceTime(serviceDateTime)
  const hourlyRate = calculateNDISRate(item.rateCap, serviceTime, isHighIntensity)
  
  return {
    supportItem: supportItem,
    supportItemName: item.name,
    duration: duration,
    hourlyRate: hourlyRate,
    totalCost: Math.round(hourlyRate * duration * 100) / 100,
    serviceTime: serviceTime,
    isHighIntensity: isHighIntensity,
    breakdown: {
      baseRate: item.rateCap,
      timeMultiplier: getServiceTimeMultiplier(serviceTime),
      intensityLoading: isHighIntensity ? 1.08 : 1.0
    }
  }
}

function getServiceTimeMultiplier(serviceTime) {
  const multipliers = {
    [SERVICE_TIMES.WEEKDAY_DAYTIME]: 1.0,
    [SERVICE_TIMES.WEEKDAY_EVENING]: 1.25,
    [SERVICE_TIMES.WEEKDAY_NIGHT]: 1.5,
    [SERVICE_TIMES.SATURDAY]: 1.25,
    [SERVICE_TIMES.SATURDAY_EVENING]: 1.5,
    [SERVICE_TIMES.SATURDAY_NIGHT]: 2.0,
    [SERVICE_TIMES.SUNDAY]: 1.5,
    [SERVICE_TIMES.SUNDAY_EVENING]: 1.75,
    [SERVICE_TIMES.SUNDAY_NIGHT]: 2.0,
    [SERVICE_TIMES.PUBLIC_HOLIDAY]: 2.0
  }
  return multipliers[serviceTime] || 1.0
}

// Generate invoice line items for NDIS compliance
export function generateNDISInvoiceLineItems(shifts) {
  return shifts.map(shift => {
    const startDateTime = new Date(`${shift.date} ${shift.start_time}`)
    const serviceTime = getServiceTime(startDateTime)
    
    // Default to standard daily personal activities if no specific support item
    const supportItem = shift.support_item || '01_011_0107_1_1'
    const isHighIntensity = shift.is_high_intensity || false
    
    const cost = calculateServiceCost(
      supportItem, 
      shift.duration_hours, 
      startDateTime, 
      isHighIntensity
    )
    
    return {
      shiftId: shift.id,
      participantId: shift.participant_id,
      staffId: shift.staff_id,
      date: shift.date,
      startTime: shift.start_time,
      endTime: shift.end_time,
      duration: shift.duration_hours,
      supportItem: cost.supportItem,
      supportItemName: cost.supportItemName,
      unitPrice: cost.hourlyRate,
      quantity: cost.duration,
      totalAmount: cost.totalCost,
      serviceTime: cost.serviceTime,
      isHighIntensity: cost.isHighIntensity,
      notes: shift.notes
    }
  })
}

// Validate NDIS plan budget utilization
export function validateBudgetUtilization(carePlan, plannedExpenses) {
  const totalBudget = carePlan.budget_amount || 0
  const totalPlanned = plannedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  
  const utilization = totalBudget > 0 ? (totalPlanned / totalBudget) * 100 : 0
  
  return {
    totalBudget: totalBudget,
    totalPlanned: totalPlanned,
    remaining: totalBudget - totalPlanned,
    utilizationPercentage: Math.round(utilization * 100) / 100,
    isOverBudget: totalPlanned > totalBudget,
    warnings: generateBudgetWarnings(utilization, carePlan.end_date)
  }
}

function generateBudgetWarnings(utilizationPercentage, planEndDate) {
  const warnings = []
  const daysRemaining = Math.ceil((new Date(planEndDate) - new Date()) / (1000 * 60 * 60 * 24))
  
  if (utilizationPercentage > 100) {
    warnings.push({
      type: 'error',
      message: 'Plan budget exceeded. Review services or request plan variation.'
    })
  } else if (utilizationPercentage > 90) {
    warnings.push({
      type: 'warning', 
      message: 'Budget utilization over 90%. Monitor spending closely.'
    })
  } else if (utilizationPercentage < 50 && daysRemaining < 90) {
    warnings.push({
      type: 'info',
      message: 'Low budget utilization with less than 3 months remaining. Consider increasing services.'
    })
  }
  
  if (daysRemaining < 30) {
    warnings.push({
      type: 'warning',
      message: 'Plan expires in less than 30 days. Prepare for plan review.'
    })
  }
  
  return warnings
}

// Export utility object
export default {
  NDIS_CATEGORIES,
  NDIS_SUPPORT_ITEMS,
  PLAN_MANAGEMENT_TYPES,
  AGE_GROUPS,
  SERVICE_TIMES,
  calculateNDISRate,
  getServiceTime,
  isPublicHoliday,
  calculateServiceCost,
  generateNDISInvoiceLineItems,
  validateBudgetUtilization
}