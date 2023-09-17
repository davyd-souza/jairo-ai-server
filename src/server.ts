// DEPENDENCY
import 'dotenv/config'
import { fastify } from 'fastify'

// ROUTE
import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideoRoute } from './routes/upload-video'
import { createTranscriptionRoute } from './routes/create-transcrition'
import { generateAiResponseRoute } from './routes/generate-ai-response'

const app = fastify()

app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generateAiResponseRoute)

app
  .listen({ port: 3333 })
  .then(() => console.log('HTTP server running on port 3333'))
