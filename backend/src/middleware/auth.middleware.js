import  jwt  from "jsonwebtoken"
import prisma from "../lib/prisma.js"

export const protectRoute = async (req,res,next) =>{
    try {
        const token = req.cookies.jwt
        if(!token){
            return res.status(401).json({message:"Unauthorized - No Token Provided"})
        }
        // decode the token :
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        if(!decoded){
            return res.status(401).json({message:"Unauthorized - Token is Not valide"})
        }
        const user = await prisma.user.findUnique({
            where:{
                id:decoded.userId
            },select:{id:true,username:true,email:true}
        })
        
        if(!user){
            return res.status(404).json({message:"Unauthorized - User Not Found"})
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protectRout middleware", error.message);
        return res.status(500).json({message:"Internal Server Error"})
    }
}