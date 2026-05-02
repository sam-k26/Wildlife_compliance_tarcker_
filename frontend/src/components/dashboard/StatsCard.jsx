import React from 'react'

export default function StatsCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full text-white`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}