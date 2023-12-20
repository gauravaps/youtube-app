import  Jwt  from "jsonwebtoken"
import { apiError } from "../utils/apiError.js"
import { asynchandler } from "../utils/asyncHandler.js"
import { user } from "../model/user.model.js"


export const verifyJwt=asynchandler(async(req,res,next)=>{

try {
    
      const token=  req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ','')
    
      if(!token){
        throw new apiError(401,'Unauthorized request')
      }
    const decodeToken=  Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    const user1=await user.findById(decodeToken?._id).select('-password -refreshToken')
    
    if(!user1){
        throw new apiError(401,'invalid Access token')
    }
    
      req.user1=user1;
      next()

} catch (error) {
    throw new apiError(401,error?.message || 'invalid accestoken')
    
}

})