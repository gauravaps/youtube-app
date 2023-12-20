import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'

const connectdb=async()=>{

    try {
     const connectioninstance=   await mongoose.connect(`${process.env.MONGOGB_URI}/${DB_NAME}`)
     console.log(`\n mongodb connection !! DB => host: ${connectioninstance.connection.host}`);
     console.log(process.env.MONGOGB_URI)
     console.log(process.env.PORT)
        
    } catch (error) {
        console.log('mongodb connction error',error);
        process.exit(1);
        
    }
}
export default connectdb; 