import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/jwtMiddlware.js";

const router = Router()

// api/v1/users

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/profile', verifyToken, UserController.profile) //ruta protegida

export default router;
