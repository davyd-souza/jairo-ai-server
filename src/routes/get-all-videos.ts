// LIB
import { prisma } from '../lib/prisma'

// TYPE
import type { FastifyInstance } from 'fastify'

export async function getAllVideosRoute(app: FastifyInstance) {
  app.get('/videos', async () => {
    const videos = await prisma.video.findMany()

    return videos
  })
}
