import handler from '../[...path].js'

export default function login(req, res) {
  req.query.path = ['auth', 'login']
  return handler(req, res)
}
