// backend/src/services/aiClient.js
export async function callAIService(shipmentData) {
  // Mock AI response
  return {
    compliant: true,
    risk_score: 15,
    risk_factors: ['No major issues detected'],
    penalty_estimate: '$0 - $5,000',
    legal_citations: ['CITES Article III', 'Local wildlife protection act'],
    suggested_actions: ['Maintain proper documentation', 'Ensure permits are valid'],
    requires_human_review: false
  }
}