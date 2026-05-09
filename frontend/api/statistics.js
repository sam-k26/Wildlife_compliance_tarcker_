import handler from './[...path].js'

export default function statistics(req, res) {
  req.query.path = ['statistics']
  return handler(req, res)
}
