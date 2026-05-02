import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import StatsCard from './StatsCard'
import ComplianceChart from './ComplianceChart'
import { Package, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    pending: 0
  })
  const [recentShipments, setRecentShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      let query = supabase
        .from('shipments')
        .select('*', { count: 'exact' })

      if (!profile?.isOfficer && profile?.id) {
        query = query.eq('user_id', profile.id)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      // Calculate stats from all shipments (need separate query for full count)
      const { data: allShipments, error: allError } = await supabase
        .from('shipments')
        .select('status')
      
      if (!allError && allShipments) {
        const compliant = allShipments.filter(s => s.status === 'compliant').length
        const nonCompliant = allShipments.filter(s => s.status === 'non_compliant').length
        const pending = allShipments.filter(s => s.status === 'pending' || s.status === 'validating').length
        
        setStats({
          total: allShipments.length,
          compliant,
          nonCompliant,
          pending
        })
      }

      setRecentShipments(data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Shipments',
      value: stats.total,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Compliant',
      value: stats.compliant,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Non-Compliant',
      value: stats.nonCompliant,
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {profile?.full_name || 'User'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Compliance Overview</h2>
          <ComplianceChart stats={stats} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Shipments</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-3">
              {recentShipments.map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{shipment.species_name}</p>
                    <p className="text-sm text-gray-600">{shipment.origin_country} → {shipment.destination_country}</p>
                    <p className="text-xs text-gray-500">{format(new Date(shipment.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      shipment.status === 'compliant' ? 'bg-green-100 text-green-800' :
                      shipment.status === 'non_compliant' ? 'bg-red-100 text-red-800' :
                      shipment.status === 'needs_review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {shipment.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentShipments.length === 0 && (
                <p className="text-center text-gray-500 py-8">No shipments found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}