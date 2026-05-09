import handler from './[...path].js'

export default function test(req, res) {
  req.query.path = ['test']
  return handler(req, res)
}
