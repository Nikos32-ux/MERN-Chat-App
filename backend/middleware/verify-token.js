import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
 

const verifyToken = (req,res,next) => {
    const token = req.cookies?.token
    if(!token) return res.status(400).json({success:false,message:"No token"})
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload.id
        console.log("verifytoken middleare : ",req.user);
        
        next()  
    }catch(err){
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
}

export default verifyToken