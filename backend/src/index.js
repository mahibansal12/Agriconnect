import dotenv from "dotenv";
dotenv.config({
    path: './.env'
})
import { createServer } from "http";  
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initSocket} from "./config/socket.js"
import dns from "dns";



dns.setServers(["8.8.8.8", "1.1.1.1"]);  
console.log(process.env.MONGO_URI);

const httpServer = createServer(app);
initSocket(httpServer);

connectDB()
.then(()=>{
   httpServer.listen(process.env.PORT || 4000, () => {  // app is replace by httpServer
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
    })
})
.catch((error) =>{
    console.error("Error connecting to the database:", error);
    process.exit(1);
})