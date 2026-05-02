// backend/src/utils/validators.js
export function validateCITESPermit(permitNumber) {
  if (!permitNumber) return false
  const regex = /^CITES-\d{4}-\d{5}$/
  return regex.test(permitNumber)
}

export function validateCountry(country) {
  const validCountries = ['USA', 'CANADA', 'UK', 'GERMANY', 'FRANCE', 'CHINA', 'INDIA']
  return validCountries.includes(country.toUpperCase())
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.trim().replace(/[<>]/g, '')
}