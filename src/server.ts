// DEPENDENCY
import 'dotenv/config'
import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'

// ROUTE
import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideoRoute } from './routes/upload-video'
import { createTranscriptionRoute } from './routes/create-transcrition'
import { generateAiResponseRoute } from './routes/generate-ai-response'

const app = fastify()

app.register(fastifyCors, {
  origin: '*',
})

app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generateAiResponseRoute)

app
  .listen({ host: '0.0.0.0', port: Number(process.env.PORT) ?? 3333 })
  .then(() => console.log('HTTP server running'))
