import handler from '../[...path].js'

export default function register(req, res) {
  req.query.path = ['auth', 'register']
  return handler(req, res)
}
