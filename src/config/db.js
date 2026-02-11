const mongoose = require("mongoose");

async function connectDB() {
   try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('server conected');
    
   } catch (error) {
    console.log(error);
    process.exit(1)
    
   }
}
module.exports=connectDB