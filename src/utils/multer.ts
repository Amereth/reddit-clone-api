import multer from 'multer'
import path, { dirname } from 'path'
import { replace } from 'rambda'
import { fileURLToPath } from 'url'
import { sanitizeString } from './sanitizeString.js'

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(
      null,
      path.join(
        dirname(fileURLToPath(import.meta.url)),
        '..',
        'public',
        'uploads',
      ),
    )
  },
  filename(req, file, callback) {
    callback(null, replace(/ /g, '_', sanitizeString(file.originalname)))
  },
})

export const uploads = multer({ storage })
