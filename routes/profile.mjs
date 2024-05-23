import jwtMiddleware from "../middlewares/jwt.middleware.mjs"
import express from 'express'
import upload from "../middlewares/multer.middleware.mjs"
import { updateAvatar } from "../controllers/profile.controller.mjs"
const router = express.Router()

router.post('/profile/updateAvatar',jwtMiddleware,upload.single('profileImg'),updateAvatar)
export default router