// backend/src/utils/audit.js
export async function createAuditLog({ user_id, action, entity_type, entity_id, old_data, new_data }) {
  console.log('Audit log:', { user_id, action, entity_type, entity_id, old_data, new_data })
  // In production, save to database
}