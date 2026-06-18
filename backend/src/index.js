import dotenv from "dotenv";
dotenv.config({
    path: './src/.env'
})
import connectDB from "./db/index.js";
import { app } from "./app.js";
import dns from "dns";



dns.setServers(["8.8.8.8", "1.1.1.1"]);  
console.log(process.env.MONGO_URI);

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
    })
})
.catch((error) =>{
    console.error("Error connecting to the database:", error);
    process.exit(1);
})