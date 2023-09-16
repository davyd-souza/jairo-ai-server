import { fastify } from 'fastify'

const app = fastify()

app.get('/', () => ({
  hello: 'world',
}))

app
  .listen({ port: 3333 })
  .then(() => console.log('HTTP server running on port 3333'))
