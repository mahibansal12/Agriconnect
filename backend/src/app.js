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
import newsRoutes from "./routes/news.routes.js"
import schemeRoutes from "./routes/scheme.routes.js"
import pestRoutes from "./routes/pest.routes.js"
import shopRoutes from "./routes/shop.routes.js"
import donationRoutes from "./routes/donation.routes.js"
import  cropListingRouter from "./routes/cropListing.routes.js"
import weatherRoutes from "./routes/weather.routes.js"
import mandiRateRoutes from "./routes/mandiRate.routes.js"
import orderRouter from "./routes/order.routes.js"
import recommendationRouter from "./routes/recommendation.routes.js"
import aiRouter from "./routes/ai.routes.js"
import communityRoutes from "./routes/community.routes.js"
import adminRouter from "./routes/admin.routes.js"
import cropCalendarRoutes from "./routes/cropCalendar.routes.js"

app.use("/api/v1/crop-calendar", cropCalendarRoutes)
app.use("/api/v1/user", userRouter);
app.use("/api/v1/crop-knowledge", cropKnowledgeRoutes)
app.use("/api/v1/news", newsRoutes)
app.use("/api/v1/schemes", schemeRoutes)
app.use("/api/v1/pests", pestRoutes)
app.use("/api/v1/shops", shopRoutes)
app.use("/api/v1/donations", donationRoutes)
app.use("/api/v1/listing", cropListingRouter)
app.use("/api/v1/weather", weatherRoutes)
app.use("/api/v1/mandi", mandiRateRoutes)
app.use("/api/v1/orders",orderRouter)
app.use("/api/v1/recommend", recommendationRouter)
app.use("/api/v1/ai",aiRouter)
app.use("/api/v1/community", communityRoutes)
app.use("/api/v1/admin", adminRouter)

app.use(errorHandler); 


export  { app };