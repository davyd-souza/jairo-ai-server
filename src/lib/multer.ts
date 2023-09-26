// DEPENDENCY
import multer from 'fastify-multer'

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1_048_576 * 10 }, // 10mb
})
