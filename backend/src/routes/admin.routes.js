import { Router } from "express";
import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    toggleBanUser,
    deleteUser,
    getAllListings,
    approveListing,
    rejectListing,
    deleteListing,
    getAllOrders,
    getAllDonations,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// all admin routes need both middlewares
router.use(verifyJWT, authorizeRoles("admin"));

//  Dashboard 
router.route("/stats").get(getDashboardStats);

//  Users 
router.route("/users").get(getAllUsers);
router.route("/users/:id").get(getUserById).delete(deleteUser);
router.route("/users/:id/ban").patch(toggleBanUser);

//  Listings 
router.route("/listings").get(getAllListings);
router.route("/listings/:id/approve").patch(approveListing);
router.route("/listings/:id/reject").patch(rejectListing);
router.route("/listings/:id").delete(deleteListing);

//  Orders 
router.route("/orders").get(getAllOrders);

//  Donations 
router.route("/donations").get(getAllDonations);

export default router;