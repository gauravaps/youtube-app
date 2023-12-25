import mongoose, { Schema } from "mongoose";

const subscriptionSchema=new Schema({

    subscriber:{
        type: Schema.Types.ObjectId, // one who is subscribing
        ref:'user',
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:'user', // one who subsriber is subscribing..
    },


},
{timestamps:true})

export const subscription=mongoose.model('subscription',subscriptionSchema)