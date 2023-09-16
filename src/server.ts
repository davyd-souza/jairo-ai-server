// DEPENDENCY
import { fastify } from 'fastify'

// ROUTE
import { getAllPromptsRoute } from './routes/get-all-prompts'

const app = fastify()

app.register(getAllPromptsRoute)

app
  .listen({ port: 3333 })
  .then(() => console.log('HTTP server running on port 3333'))
