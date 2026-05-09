import handler from './[...path].js'

export default function shipments(req, res) {
  req.query.path = ['shipments']
  return handler(req, res)
}
