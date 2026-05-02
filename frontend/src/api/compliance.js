import axios from 'axios';
import { apiUrl } from '../lib/apiUrl';

export async function getComplianceStats() {
  try {
    const res = await axios.get(apiUrl('/api/compliance/stats'));
    return res.data;
  } catch (err) {
    // Return a safe default so the UI can still render during local development
    console.warn('getComplianceStats failed, returning fallback:', err?.message || err);
    return {
      total_validations: 0,
      compliant_rate: 0,
      high_risk_count: 0,
      avg_risk_score: 0,
    };
  }
}

export async function getRecentValidations(limit = 10) {
  try {
    const res = await axios.get(apiUrl(`/api/compliance/recent?limit=${limit}`));
    return res.data;
  } catch (err) {
    console.warn('getRecentValidations failed, returning fallback:', err?.message || err);
    return [];
  }

}
