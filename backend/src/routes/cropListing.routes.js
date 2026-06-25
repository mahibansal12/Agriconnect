import { Router } from "express";
import {
    createListing,
    getAllListings,
    getListingById,
    getMyListings,
    updateListing,
    deleteListing,
    toggleWishlist,
} from "../controllers/cropListing.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public + Farmer Create 
router
    .route("/")
    .get(getAllListings)
    .post(verifyJWT, authorizeRoles("farmer"), upload.array("images", 5), createListing);

//  Farmer's Own Listings 
router
    .route("/farmer/my")
    .get(verifyJWT, authorizeRoles("farmer"), getMyListings);

//  Single Listing 
router
    .route("/:id")
    .get(getListingById)
    .put(verifyJWT, authorizeRoles("farmer"), upload.array("images", 5), updateListing)
    .delete(verifyJWT, authorizeRoles("farmer"), deleteListing);

//  Wishlist Toggle 
router
    .route("/:id/wishlist")
    .patch(verifyJWT, authorizeRoles("buyer"), toggleWishlist);

export default router;