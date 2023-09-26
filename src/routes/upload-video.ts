// DEPENDENCY
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'

// LIB
import { prisma } from '../lib/prisma'
import { s3 } from '../lib/s3'
import { upload } from '../lib/multer'

// TYPE
import type { FastifyInstance, FastifyRequest } from 'fastify'

type FileFastifyRequest = FastifyRequest & {
  file?: {
    buffer: Buffer
    encoding: string
    fieldname: string
    mimetype: string
    originalname: string
    size: number
  }
}

export async function uploadVideoRoute(app: FastifyInstance) {
  app.post(
    '/videos',
    { preHandler: upload.single('file') },
    async (req: FileFastifyRequest, reply) => {
      const file = req.file

      if (!file) {
        return reply.status(400).send({ error: 'Missing file input' })
      }

      const extension = path.extname(file.originalname)

      if (extension !== '.mp3') {
        return reply
          .status(400)
          .send({ error: 'Invalid file type, please upload a MP3.' })
      }

      const fileBasename = path.basename(file.originalname, extension)
      const fileUploadName = `${randomUUID()}-${fileBasename}${extension}`

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileUploadName,
        ContentType: file.mimetype,
        Body: file.buffer,
      })

      await s3.send(command)

      const video = await prisma.video.create({
        data: {
          name: file.originalname,
          path: fileUploadName,
        },
      })

      return {
        video,
      }
    },
  )
}
