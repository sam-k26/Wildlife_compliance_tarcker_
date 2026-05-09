import handler from './[...path].js'

export default function health(req, res) {
  req.query.path = ['health']
  return handler(req, res)
}
