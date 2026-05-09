import handler from './[...path].js'

export default function validate(req, res) {
  req.query.path = ['validate']
  return handler(req, res)
}
