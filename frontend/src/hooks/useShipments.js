import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { apiUrl } from '../lib/apiUrl'

export function useShipments() {
  const { user, isOfficer } = useAuth()
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchShipments = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('shipments')
        .select('*, compliance_validations(*)')
        .order('created_at', { ascending: false })

      if (!isOfficer) {
        query = query.eq('user_id', user?.id)
      }

      const { data, error } = await query

      if (error) throw error
      setShipments(data || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load shipments')
    } finally {
      setLoading(false)
    }
  }

  const createShipment = async (shipmentData) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert([{ ...shipmentData, user_id: user?.id, status: 'pending' }])
        .select()
        .single()

      if (error) throw error

      // Trigger AI validation
      await fetch(apiUrl(`/api/compliance/validate/${data.id}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      toast.success('Shipment created successfully')
      await fetchShipments()
      return data
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const getShipment = async (id) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*, compliance_validations(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      toast.error('Failed to load shipment details')
      throw err
    }
  }

  useEffect(() => {
    if (user) {
      fetchShipments()
    }
  }, [user])

  return {
    shipments,
    loading,
    error,
    fetchShipments,
    createShipment,
    getShipment
  }
}
