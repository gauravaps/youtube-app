import mongoose, { Schema } from "mongoose";
import  Jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userschema=new Schema({

    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
        
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true

    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudnary url
        required:true


    },
    coverImage:{
        type:String, //cloudnary url

    },
    watchHistory:[{ 
        type:Schema.Types.ObjectId,
        ref:'video'
    }
    ],
    password:{
        type:String,
        required:[true,'password is required']
    },
    refreshToken:{
        type:String
    }
    
    
 },

 {
    timestamps:true
})
// password hassing here ..++++++

userschema.pre('save', async function (next){
    if(!this.isModified('password'))
    return next()

  this.password=await bcrypt.hash(this.password,10)
    next()

})
userschema.methods.ispasswordCorrect=async function(password){
     return await bcrypt.compare(password,this.password)
}

// generate access token here++++
userschema.methods.generateAccessToken=function(){
   return Jwt.sign({
        _id:this._id,
        email:this.email,
        userschema:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
    

}
// generate refresh token+++
userschema.methods.generateRefreshToken=function(){
    return Jwt.sign({
         _id:this._id,
         
     },
     process.env.REFRESH_TOKEN_SECRET,
     {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
     )
     
 
 }






export const user=mongoose.model('user',userschema) 