import { asynchandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { user } from "../model/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiResponse.js";



const generateAccessAndRefreshToken=async(userid)=>{
   try {
     const user1= await user.findById(userid)
   const accessToken=  user1.generateAccessToken()
   const refreshToken=  user1.generateRefreshToken()

   user1.refreshToken=refreshToken
   await user1.save({validateBeforeSave:false})

   return {accessToken,refreshToken}




      
   } catch (error) {
      throw new apiError(500,'something went wrong while generating access and refresh token')
      
   }
}

const registerUser=asynchandler(async(req,res)=>{

   const{username,email,fullName,password}=req.body
   
   if(
      [fullName,email,username,password].some((field)=>field?.trim()==='')
 
   ){
      throw new apiError(400,'All fields are required')
   }
   const existdUser=await user.findOne({
      $or:[{username},{email}]
   })

   if(existdUser){
      throw new apiError(409,'email or username already exists') 
   }
   console.log(req.files);
  const avatarlocalpath= req.files?.avatar[0]?.path
  const coverImagelocalpath=req.files?.coverImage[0]?.path

  if(!avatarlocalpath){
   throw new apiError(400,'Avatar file path is required')
  }
  const avatar= await uploadonCloudinary(avatarlocalpath)
  const coverImage=await uploadonCloudinary(coverImagelocalpath)
  
  if(!avatar){
   throw new apiError(400,'Avatart file is required ')
  }

 const User=await user.create({fullName,avatar:avatar.url,coverImage:coverImage?.url || '',email,password,
 username:username


})
const createUser=await user.findById(User._id).select("-password -refreshToken")

if(!createUser){
   throw new apiError(500,'something went wrong while registering the user')
}
return res.status(201).json(
   new apiresponse(200,createUser,'User registered successfully')
)
 
 




})

// Login User here*************

const loginUser=asynchandler(async(req,res)=>{

   const {username,email,password}=req.body;
   if(!(username || email)){
      throw new apiError(400,'username OR email required')
   }

  const user1=await user.findOne({$or:[{username},{email}]})

  if(!user1){
   throw new apiError(404,'user does not exist')
  }

 const ispasswordCorrectvalid=await  user1.ispasswordCorrect(password)

 if(!ispasswordCorrectvalid){
   throw new apiError(401,'invilid user credentials')
 }

const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user1._id)

const loggedInUser=await user.findById(user1._id).select('-password -refreshToken')

const options = {
   httpOnly: true,
   secure: true
}


return res.status(200)
.cookie('accessToken',accessToken,options)
.cookie('refreshToken',refreshToken,options)
.json(
   new apiresponse(
      200,{user1:loggedInUser, accessToken,refreshToken},'user loggenIn successfully'
   )
)

})

// logOut user/////

const logoutUser=asynchandler(async(req,res)=>{
   await user.findByIdAndUpdate(req.user1._id,
      {$set:{refreshToken:undefined}
   }
      ,
      {new:true}
      )

   const options = {
      httpOnly: true,
      secure: true
  }

return res.status(200)
.clearCookie('accessToken' ,options)
.clearCookie('refreshToken',options)
.json(new apiresponse(200,{},'user logout successfully'))
  



})

export{registerUser,loginUser,logoutUser} 