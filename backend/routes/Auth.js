import express from 'express'
import { upload } from '../middleware/Multer.js'
import { Register,Logout,Login,GetUser, AllUsers } from '../controllers/Auth.js'

const AuthRoutes=express.Router()

AuthRoutes.post('/register',upload.single('profile'),Register)
AuthRoutes.post('/login', Login)
AuthRoutes.get('/get_user', GetUser)
AuthRoutes.post('/logout',Logout)
AuthRoutes.get("/all_users", AllUsers);

export default AuthRoutes