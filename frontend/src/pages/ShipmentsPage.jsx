import React, { useState } from 'react'
import ShipmentForm from '../components/shipments/ShipmentForm'
import ShipmentList from '../components/shipments/ShipmentList'
import ShipmentDetail from '../components/shipments/ShipmentDetail'

export default function ShipmentsPage() {
  const [view, setView] = useState('list') // list, form, detail
  const [selectedShipmentId, setSelectedShipmentId] = useState(null)

  const handleViewShipment = (shipmentId) => {
    setSelectedShipmentId(shipmentId)
    setView('detail')
  }

  const handleFormSuccess = () => {
    setView('list')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
        {view === 'list' && (
          <button
            onClick={() => setView('form')}
            className="btn-primary"
          >
            New Shipment
          </button>
        )}
        {view !== 'list' && (
          <button
            onClick={() => {
              setView('list')
              setSelectedShipmentId(null)
            }}
            className="btn-secondary"
          >
            Back to List
          </button>
        )}
      </div>

      {view === 'list' && (
        <ShipmentList onViewShipment={handleViewShipment} />
      )}
      {view === 'form' && (
        <ShipmentForm onSuccess={handleFormSuccess} />
      )}
      {view === 'detail' && selectedShipmentId && (
        <ShipmentDetail 
          shipmentId={selectedShipmentId} 
          onBack={() => {
            setView('list')
            setSelectedShipmentId(null)
          }}
        />
      )}
    </div>
  )
}