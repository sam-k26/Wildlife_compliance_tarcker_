import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { apiUrl } from '../../lib/apiUrl'

export default function ShipmentForm({ onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    species_name: '',
    scientific_name: '',
    quantity: 1,
    unit: 'kg',
    origin_country: '',
    destination_country: '',
    permit_number: '',
    declaration_type: 'export',
    shipment_date: new Date().toISOString().split('T')[0]
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert([
          {
            ...formData,
            user_id: user.id,
            status: 'pending'
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Trigger AI validation via backend
      await fetch(apiUrl(`/api/compliance/validate/${data.id}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      onSuccess?.(data)
      
      // Reset form
      setFormData({
        species_name: '',
        scientific_name: '',
        quantity: 1,
        unit: 'kg',
        origin_country: '',
        destination_country: '',
        permit_number: '',
        declaration_type: 'export',
        shipment_date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error creating shipment:', error)
      alert('Failed to create shipment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Species Name *</label>
          <input
            type="text"
            name="species_name"
            required
            value={formData.species_name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Scientific Name</label>
          <input
            type="text"
            name="scientific_name"
            value={formData.scientific_name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity *</label>
          <input
            type="number"
            name="quantity"
            required
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Unit *</label>
          <select
            name="unit"
            required
            value={formData.unit}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="pieces">Pieces</option>
            <option value="live">Live Animals</option>
            <option value="skins">Skins</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Origin Country *</label>
          <input
            type="text"
            name="origin_country"
            required
            value={formData.origin_country}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destination Country *</label>
          <input
            type="text"
            name="destination_country"
            required
            value={formData.destination_country}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Permit Number</label>
          <input
            type="text"
            name="permit_number"
            value={formData.permit_number}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Declaration Type *</label>
          <select
            name="declaration_type"
            required
            value={formData.declaration_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="export">Export</option>
            <option value="import">Import</option>
            <option value="re-export">Re-export</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Shipment Date *</label>
          <input
            type="date"
            name="shipment_date"
            required
            value={formData.shipment_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Shipment'}
        </button>
      </div>
    </form>
  )
}
