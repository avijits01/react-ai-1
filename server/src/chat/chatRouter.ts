import express from 'express'
import multer from 'multer'

import { gpt } from './gpt'
import { gemini } from './gemini'
import { claude } from './claude'
const upload = multer()

const router = express.Router()

router.post('/gpt', gpt)
router.post('/claude', claude)
router.post('/gemini', gemini)

export default router