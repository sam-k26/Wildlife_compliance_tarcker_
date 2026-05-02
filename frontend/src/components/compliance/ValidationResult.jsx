import React from 'react'
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

export default function ValidationResult({ validations }) {
  if (!validations || validations.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-600">No validation results available yet</p>
          <p className="text-sm text-gray-500 mt-1">The AI validation is in progress</p>
        </div>
      </div>
    )
  }

  const latestValidation = validations[0]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Compliance Validation Results</h3>
      
      <div className={`card border-l-4 ${
        latestValidation.compliant ? 'border-green-500' : 'border-red-500'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {latestValidation.compliant ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <h4 className="text-xl font-bold">
                {latestValidation.compliant ? 'Compliant' : 'Non-Compliant'}
              </h4>
              <p className="text-sm text-gray-600">
                Validated on {format(new Date(latestValidation.created_at), 'PPP p')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Risk Score</p>
            <p className={`text-2xl font-bold ${
              latestValidation.risk_score < 30 ? 'text-green-600' :
              latestValidation.risk_score < 70 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {latestValidation.risk_score}/100
            </p>
          </div>
        </div>

        {latestValidation.risk_factors && latestValidation.risk_factors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <h5 className="font-semibold text-red-800 mb-2">Risk Factors</h5>
            <ul className="list-disc list-inside space-y-1">
              {latestValidation.risk_factors.map((factor, index) => (
                <li key={index} className="text-sm text-red-700">{factor}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h5 className="font-semibold text-yellow-800 mb-2">Estimated Penalty</h5>
          <p className="text-lg font-bold text-red-600">{latestValidation.penalty_estimate}</p>
        </div>

        {latestValidation.legal_citations && latestValidation.legal_citations.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-2">Legal Citations</h5>
            <ul className="list-disc list-inside space-y-1">
              {latestValidation.legal_citations.map((citation, index) => (
                <li key={index} className="text-sm text-blue-700">{citation}</li>
              ))}
            </ul>
          </div>
        )}

        {latestValidation.suggested_actions && latestValidation.suggested_actions.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h5 className="font-semibold text-green-800 mb-2">Recommended Actions</h5>
            <ul className="list-disc list-inside space-y-1">
              {latestValidation.suggested_actions.map((action, index) => (
                <li key={index} className="text-sm text-green-700">{action}</li>
              ))}
            </ul>
          </div>
        )}

        {latestValidation.requires_human_review && (
          <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
            <p className="text-sm text-orange-700">
              ⚠️ This shipment requires review by a compliance officer
            </p>
          </div>
        )}
      </div>

      {validations.length > 1 && (
        <div className="card">
          <h4 className="font-semibold mb-3">Validation History</h4>
          <div className="space-y-2">
            {validations.slice(1).map((validation) => (
              <div key={validation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className={`text-sm font-medium ${
                    validation.compliant ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validation.compliant ? 'Compliant' : 'Non-Compliant'}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    Risk Score: {validation.risk_score}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(validation.created_at), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}