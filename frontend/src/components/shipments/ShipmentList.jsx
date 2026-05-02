import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function ShipmentList({ onViewShipment }) {
  const { profile } = useAuth()
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchShipments()
  }, [filter])

  async function fetchShipments() {
    try {
      let query = supabase
        .from('shipments')
        .select('*, compliance_validations(*)')
        .order('created_at', { ascending: false })

      if (!profile?.isOfficer) {
        query = query.eq('user_id', profile?.id)
      }

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setShipments(data || [])
    } catch (error) {
      console.error('Error fetching shipments:', error)
      toast.error('Failed to load shipments')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      compliant: 'bg-green-100 text-green-800',
      non_compliant: 'bg-red-100 text-red-800',
      needs_review: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
      validating: 'bg-blue-100 text-blue-800'
    }
    return badges[status] || badges.pending
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Shipments</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Shipments</option>
            <option value="pending">Pending</option>
            <option value="validating">Validating</option>
            <option value="compliant">Compliant</option>
            <option value="non_compliant">Non-Compliant</option>
            <option value="needs_review">Needs Review</option>
          </select>
          <button onClick={fetchShipments} className="btn-secondary">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading shipments...</div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No shipments found
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <li key={shipment.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {shipment.species_name}
                        </p>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                        <span>{shipment.quantity} {shipment.unit}</span>
                        <span>•</span>
                        <span>{shipment.origin_country} → {shipment.destination_country}</span>
                        <span>•</span>
                        <span>{format(new Date(shipment.shipment_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewShipment(shipment.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}