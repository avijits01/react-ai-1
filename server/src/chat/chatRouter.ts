import express from 'express'
import multer from 'multer'

import { gpt } from './gpt'
const upload = multer()

const router = express.Router()

router.post('/gpt', gpt)

export default router