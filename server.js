const app = require("./src/app");
const connectDB = require("./src/config/db");
require('dotenv').config()


connectDB()
app.listen(3000,()=>{
    console.log('server is running ');
    
})