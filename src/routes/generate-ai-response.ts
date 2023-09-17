// DEPENDENCY
import { z } from 'zod'

// LIB
import { prisma } from '../lib/prisma'
import { openai } from '../lib/openai'

// TYPE
import type { FastifyInstance } from 'fastify'

export async function generateAiResponseRoute(app: FastifyInstance) {
  app.post('/ai/response', async (req, reply) => {
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      template: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    })

    const { videoId, template, temperature } = bodySchema.parse(req.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    if (!video.transcription) {
      return reply
        .status(400)
        .send({ error: 'Video transcription was not generated yet.' })
    }

    const promptMessage = template.replace(
      '{transcription}',
      video.transcription,
    )

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature,
      messages: [{ role: 'user', content: promptMessage }],
    })

    return response
  })
}
