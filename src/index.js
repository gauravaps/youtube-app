 
//require('dotenv').config({path:'./env'})
import dotenv from 'dotenv';
import connectdb from "./db/index.js";
import {app}  from './app.js';


 dotenv.config({path:'./env'}) 


  

connectdb() 
.then(() => {
    app.listen(8000, () => {
        console.log(`⚙️   Server is running at port numebr : ${process.env.PORT}`);
    }) 
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err); 
})




