// backend/src/routes/shipments.js
import express from 'express'

const router = express.Router()

// Get all shipments
router.get('/', (req, res) => {
  res.json({ message: 'GET all shipments endpoint' })
})

// Get single shipment
router.get('/:id', (req, res) => {
  res.json({ message: `GET shipment ${req.params.id}` })
})

// Create shipment
router.post('/', (req, res) => {
  res.json({ message: 'POST create shipment', data: req.body })
})

// Update shipment
router.put('/:id', (req, res) => {
  res.json({ message: `PUT update shipment ${req.params.id}`, data: req.body })
})

// Delete shipment
router.delete('/:id', (req, res) => {
  res.json({ message: `DELETE shipment ${req.params.id}` })
})

export default router