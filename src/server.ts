// DEPENDENCY
import 'dotenv/config'
import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import multer from 'fastify-multer'

// ROUTE
import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideoRoute } from './routes/upload-video'
import { createTranscriptionRoute } from './routes/create-transcrition'
import { generateAiResponseRoute } from './routes/generate-ai-response'
import { getAllVideosRoute } from './routes/get-all-videos'

const app = fastify()

app.register(multer.contentParser)

app.register(fastifyCors, {
  origin: '*',
  // origin: 'https://jairo-ai.vercel.app',
  credentials: true,
  allowedHeaders: '*',
  methods: ['GET', 'OPTIONS', 'PATCH', 'DELETE', 'POST', 'PUT'],
})

app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generateAiResponseRoute)
app.register(getAllVideosRoute)

app
  .listen({ host: '0.0.0.0', port: Number(process.env.PORT) ?? 3333 })
  .then(() => console.log('HTTP server running'))
