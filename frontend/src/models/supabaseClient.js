// backend/src/models/supabaseClient.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:5432'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-key'

// Mock Supabase client for development if no credentials
export const supabase = {
  from: (table) => ({
    select: (columns) => ({
      eq: (field, value) => ({
        single: async () => ({ data: {}, error: null }),
        order: (column, options) => ({
          limit: async (limit) => ({ data: [], error: null })
        })
      }),
      order: (column, options) => ({
        limit: async (limit) => ({ data: [], error: null })
      })
    }),
    insert: (data) => ({
      select: () => ({
        single: async () => ({ data: { id: 'mock-id', ...data[0] }, error: null })
      })
    }),
    update: (data) => ({
      eq: (field, value) => ({
        select: () => ({
          single: async () => ({ data: { id: value, ...data }, error: null })
        })
      })
    }),
    delete: () => ({
      eq: (field, value) => ({
        select: () => ({
          single: async () => ({ data: {}, error: null })
        })
      })
    })
  }),
  auth: {
    getUser: async (token) => ({ data: { user: { id: 'mock-user' } }, error: null }),
    getSession: async () => ({ data: { session: { access_token: 'mock-token' } }, error: null })
  }
}

// Uncomment for real Supabase client
// export const supabase = createClient(supabaseUrl, supabaseKey)