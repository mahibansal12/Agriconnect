import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser"
import {apiLimiter} from "./middlewares/rateLimiter.middleware.js"
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));

app.use(apiLimiter);
//app.use(express.json());
app.use(express.json({
    limit : '14kb'
}));

app.use(express.urlencoded({ extended: true, limit: '14kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import cropKnowledgeRoutes from "./routes/cropKnowledge.routes.js"

app.use("/api/v1/user", userRouter);
app.use("/api/v1/crop-knowledge", cropKnowledgeRoutes)


app.use(errorHandler); 


export  { app };