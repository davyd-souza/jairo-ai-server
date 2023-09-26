// DEPENDENCY
import { z } from 'zod'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { toFile } from 'openai/uploads'

// LIB
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { s3 } from '@/lib/s3'

// TYPE
import type { FastifyInstance } from 'fastify'

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post('/videos/:videoId/transcription', async (req, reply) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    })

    const { videoId } = paramsSchema.parse(req.params)

    const bodySchema = z.object({
      prompt: z.string(),
    })

    const { prompt } = bodySchema.parse(req.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    const videoPath = video.path

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: videoPath,
    })

    const file = await s3.send(command)

    if (!file) {
      return reply.status(400).send({ error: 'File not found.' })
    }

    if (!file.Body) {
      return reply.status(400).send({ error: 'File body is missing.' })
    }

    const fileByteArray = await file.Body.transformToByteArray()
    const fileFull = await toFile(fileByteArray, 'audio.mp3')

    const response = await openai.audio.transcriptions.create({
      file: fileFull,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0,
      prompt,
    })

    const transcription = response.text

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        transcription,
      },
    })

    return {
      transcription,
    }
  })
}
