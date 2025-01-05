import express from 'express'
import { checkAuth, Login, Logout, Signup, updateProfile } from '../controllers/auth.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/signup', Signup)

router.post('/login', Login)

router.post('/logout', Logout)

router.put("/update-profile", protectRoute ,updateProfile)

router.get("/check",protectRoute ,checkAuth)

export default router