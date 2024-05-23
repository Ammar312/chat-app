import jwtMiddleware from "../middlewares/jwt.middleware.mjs"
import express from express
const router = express.Router()

router.post('/profile/updateAvatar',jwtMiddleware)
export default router