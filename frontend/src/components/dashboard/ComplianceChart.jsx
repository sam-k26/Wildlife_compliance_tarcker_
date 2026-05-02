import React from 'react'

export default function ComplianceChart({ stats }) {
  const data = [
    { name: 'Compliant', value: stats.compliant, color: '#839958' },
    { name: 'Non-Compliant', value: stats.nonCompliant, color: '#D3968C' },
    { name: 'Pending', value: stats.pending, color: '#105666' }
  ].filter(item => item.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  // Simple bar chart representation
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span>{item.name}</span>
            <span>{Math.round((item.value / total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="h-4 rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / total) * 100}%`,
                backgroundColor: item.color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
