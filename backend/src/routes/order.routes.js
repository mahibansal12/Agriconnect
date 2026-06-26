import { Router } from "express";
import {
    createOrder,
    verifyPayment,
    getMyOrders,
    getFarmerOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Buyer Routes 
router
    .route("/")
    .post(verifyJWT, authorizeRoles("buyer"), createOrder);

router
    .route("/verify-payment")
    .post(verifyJWT, authorizeRoles("buyer"), verifyPayment);

router
    .route("/my")
    .get(verifyJWT, authorizeRoles("buyer"), getMyOrders);

// Farmer Routes 
router
    .route("/farmer")
    .get(verifyJWT, authorizeRoles("farmer"), getFarmerOrders);

// Shared — buyer or farmer of that order 
router
    .route("/:id")
    .get(verifyJWT, getOrderById);

//Farmer Updates Status 
router
    .route("/:id/status")
    .patch(verifyJWT, authorizeRoles("farmer"), updateOrderStatus);

//Buyer Cancels 
router
    .route("/:id/cancel")
    .patch(verifyJWT, authorizeRoles("buyer"), cancelOrder);

export default router;