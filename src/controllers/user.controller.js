import { asynchandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { user } from "../model/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiResponse.js";
import Jwt  from "jsonwebtoken";


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

// user registraton here++++++


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

// refresh Token controller here****!!!!
const refreshAccessToken=asynchandler(async(req,res)=>{

  const incomingrefreshToken= await req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingrefreshToken){
   throw new apiError(401,'unauthorizes request')
  }

 try {
   const decodeToken= Jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
  const user1= user.findById(decodeToken?._id)
  
  if(!user1){
     throw new apiError(401,'invalid reffresh token')
  }
  
  if(incomingrefreshToken !==user1?.refreshToken){
     throw new apiError(401,'refresh token is expired or used')
  }
  const options={
     httpOnly:true,
     secure:true
  }
   
   const {accessToken,newrefreshtoken}= await generateAccessAndRefreshToken(user1._id)
  
   return res
   .status(200)
   .cookie('accessToken',accessToken,options)
   .cookie('refreshToken',newrefreshtoken,options)
   .json(
     new apiresponse(200,{accessToken,refreshToken:newrefreshtoken},'access refresh token')
   )
  
  
  
 } catch (error) {
   throw apiError(200,'refresh token not found')
   
 }

})

//password update....

const changeCurrentPasswors=asynchandler(async(req,res)=>{
   const {oldpassword,newpassword}=req.body;
   const user1=user.findById(req.user1?._id)
   const ispasswordCorrect=await user1.ispasswordCorrect(oldpassword)
   if(!ispasswordCorrect){
      throw new apiError(401,'invalid old password')
   }

   user1.password=newpassword
   await user1.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(new apiresponse(200,{},'password changed successfully'))


})

// get current user+++++

const getCurentuser=asynchandler(async(req,res)=>{
   return res.status(200).json(200,req.user1,'current user fetched successfully')
})

// update account detail/user account++++

const updateAccount=asynchandler(async(req,res)=>{

   const{fullName,email}=req.body

   if(!(fullName || email)){ 

      throw apiError(400,'All fields are required')
   }

   const user1=await user.findByIdAndUpdate(req.user1?._id,
      {$set:{fullName:fullName,email:email}},{new:true}).select('-password')

      return res.status(200)
      .json(new apiresponse(200,user1,'user updated successfully'))

})

//avatar update++++

const updatAvatar=asynchandler(async(req,res)=>{

   const avatarlocalpath=req.file?.path

   if(!avatarlocalpath){
      throw apiError(400,'not found avatar local path')
   }
   const avatar=await uploadonCloudinary(avatarlocalpath)
   if(!avatar){
      throw apiError(400,'error on uploading avatar')

   }
   const user1=await user.findByIdAndUpdate(req.user1?._id,{$set:{avatar:avatar.url}}
      ,{new:true}).select('-password')

      
   return res.status(200)
   .json(new apiresponse( 200,user1,'avatar image updated successfully'))


})

// update cover image+++

const updateCoverimage=asynchandler(async(req,res)=>{
   const coverImagelocalpath=req.file?.path
   if(!coverImagelocalpath){
      throw new apiError(400,'Not found cover image local path')
   }

   const coverImage=await uploadonCloudinary(coverImagelocalpath)
   if(!coverImage){
      throw new apiError(400,'error on uploading cover image')
   }

   const user1=user.findByIdAndUpdate(req.user1?._id,{$set:{coverImage:coverImage.url}},{new:true})

   return res.status(200)
   .json(new apiresponse( 200,user1,'cover image updated successfully'))


})




export{registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPasswors,
 getCurentuser,updateAccount,updatAvatar,updateCoverimage} 