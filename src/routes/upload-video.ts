// DEPENDENCY
import path from 'node:path'
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { fastifyMultipart } from '@fastify/multipart'

// TYPE
import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fieldSize: 1_048_576 * 25, // 25mb
    },
  })

  app.post('/videos', async (req, reply) => {
    const data = await req.file()

    if (!data) {
      return reply.status(400).send({ error: 'Missing file input' })
    }

    const extension = path.extname(data.filename)

    if (extension !== '.mp3') {
      return reply
        .status(400)
        .send({ error: 'Invalid file type, please upload a MP3.' })
    }

    const fileBasename = path.basename(data.filename, extension)
    const fileUploadName = `${fileBasename}-${randomUUID()}-${extension}`
    const uploadDestination = path.resolve(
      __dirname,
      '../../tmp',
      fileUploadName,
    )

    await pump(data.file, fs.createWriteStream(uploadDestination))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      },
    })

    return {
      video,
    }
  })
}
