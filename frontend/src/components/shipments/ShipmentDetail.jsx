import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ValidationResult from '../compliance/ValidationResult'
import { ArrowLeft, Download } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { apiUrl } from '../../lib/apiUrl'

export default function ShipmentDetail({ shipmentId, onBack }) {
  const [shipment, setShipment] = useState(null)
  const [validations, setValidations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShipmentDetails()
  }, [shipmentId])

  async function fetchShipmentDetails() {
    try {
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single()

      if (shipmentError) throw shipmentError
      setShipment(shipmentData)

      const { data: validationData, error: validationError } = await supabase
        .from('compliance_validations')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: false })

      if (validationError) throw validationError
      setValidations(validationData || [])
    } catch (error) {
      console.error('Error fetching shipment details:', error)
      toast.error('Failed to load shipment details')
    } finally {
      setLoading(false)
    }
  }

  async function handleRevalidate() {
    try {
      const response = await fetch(apiUrl(`/api/compliance/validate/${shipmentId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Re-validation failed')
      
      toast.success('Re-validation triggered successfully')
      await fetchShipmentDetails()
    } catch (error) {
      console.error('Error re-validating:', error)
      toast.error('Failed to re-validate shipment')
    }
  }

  async function downloadReport() {
    try {
      const response = await fetch(apiUrl(`/api/reports/shipment/${shipmentId}`), {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (!response.ok) throw new Error('Failed to generate report')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shipment_${shipmentId}_report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading shipment details...</div>
  }

  if (!shipment) {
    return <div className="text-center py-12 text-red-600">Shipment not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="btn-secondary flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Shipments</span>
        </button>
        <div className="flex space-x-2">
          <button onClick={handleRevalidate} className="btn-secondary">
            Re-validate
          </button>
          <button onClick={downloadReport} className="btn-primary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Shipment Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Species</p>
            <p className="font-medium">{shipment.species_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Scientific Name</p>
            <p className="font-medium">{shipment.scientific_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Quantity</p>
            <p className="font-medium">{shipment.quantity} {shipment.unit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Origin</p>
            <p className="font-medium">{shipment.origin_country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Destination</p>
            <p className="font-medium">{shipment.destination_country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Declaration Type</p>
            <p className="font-medium">{shipment.declaration_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Permit Number</p>
            <p className="font-medium">{shipment.permit_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Shipment Date</p>
            <p className="font-medium">{format(new Date(shipment.shipment_date), 'PPP')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-medium">{format(new Date(shipment.created_at), 'PPP')}</p>
          </div>
        </div>
      </div>

      <ValidationResult validations={validations} />
    </div>
  )
}
