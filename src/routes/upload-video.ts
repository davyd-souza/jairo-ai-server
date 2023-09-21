// DEPENDENCY
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { fastifyMultipart } from '@fastify/multipart'
import admin from 'firebase-admin'
import type { FastifyInstance } from 'fastify'

// TYPE
import { prisma } from '../lib/prisma'

const pump = promisify(pipeline)

admin.initializeApp({
  credential: admin.credential.cert({
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    projectId: process.env.FIREBASE_APP_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  storageBucket: 'gs://jairo-ai.appspot.com/',
})

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fieldSize: 1_048_576 * 10, // 10mb
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

    const bucket = admin.storage().bucket()
    const file = bucket.file(fileUploadName)

    const writeStream = file.createWriteStream({
      metadata: {
        contentType: data.mimetype,
      },
      resumable: false,
    })

    await pump(data.file, writeStream)

    const fileUrl = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 300 * 24 * 60 * 60 * 1000, // 300 days
    })

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: fileUrl[0],
      },
    })

    return {
      video,
    }
  })
}
