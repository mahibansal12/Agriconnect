import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CropListing } from "../models/cropListing.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

// Create Listing 
// POST /api/v1/listings
// Private — farmer only
const createListing = asyncHandler(async (req, res) => {
    const {
        cropName,
        category,
        quantity,
        unit,
        pricePerUnit,
        qualityGrade,
        isOrganic,
        harvestDate,
        availableUntil,
        description,
        state,
        district,
        village,
        pincode,
    } = req.body;

    if (
        !cropName ||
        !category ||
        !quantity ||
        !pricePerUnit ||
        !harvestDate ||
        !state ||
        !district
    ) {
        throw new ApiError(
            400,
            "cropName, category, quantity, pricePerUnit, harvestDate, state and district are required"
        );
    }

    // req.files is array when using upload.array() in route
    const imageFiles = req.files || [];
    const uploadedImages = [];


    for (const file of imageFiles) {
        const uploaded = await uploadOnCloudinary(file.path);
        if (uploaded) {
            uploadedImages.push({
                url: uploaded.secure_url,
                public_id: uploaded.public_id,
            });
        }
    }

    const listing = await CropListing.create({
        farmer: req.user._id,
        cropName,
        category,
        quantity,
        unit,
        pricePerUnit,
        qualityGrade,
        isOrganic: isOrganic === "true" || isOrganic === true,
        images: uploadedImages,
        harvestDate,
        availableUntil,
        description,
        location: { state, district, village, pincode },
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                listing,
                "Listing created. Pending admin approval."
            )
        );
});

// Get All Listings (with filters + pagination)
// GET /api/v1/listings
// Public
const getAllListings = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 1000,
        cropName,
        category,
        state,
        district,
        isOrganic,
        qualityGrade,
        minPrice,
        maxPrice,
        sortBy = "createdAt",
        order = "desc",
    } = req.query;

    // only approved listings shown publicly
    const query = { status: "approved" };

    // text search on cropName using the text index
    if (cropName) query.$text = { $search: cropName };

    if (category) query.category = category;
    if (state) query["location.state"] = state;
    if (district) query["location.district"] = district;
    if (qualityGrade) query.qualityGrade = qualityGrade;

    if (isOrganic !== undefined) {
        query.isOrganic = isOrganic === "true";
    }

    if (minPrice || maxPrice) {
        query.pricePerUnit = {};
        if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
        if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // run both queries in parallel for performance
    const [listings, total] = await Promise.all([
        CropListing.find(query)
            .populate("farmer", "name phone state district")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(Number(limit)),
        CropListing.countDocuments(query),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                listings,
                total,
                totalPages: Math.ceil(total / Number(limit)),
                currentPage: Number(page),
            },
            "Listings fetched successfully"
        )
    );
});

// Get Single Listing 
// GET /api/v1/listings/:id
// Public
const getListingById = asyncHandler(async (req, res) => {
    const listing = await CropListing.findById(req.params.id).populate(
        "farmer",
        "name phone state district avatar"
    );

    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }

    // increment view count silently
    listing.views += 1;
    await listing.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, listing, "Listing fetched successfully"));
});

// Get Farmer's Own Listings 
// GET /api/v1/listings/my
// Private — farmer only
const getMyListings = asyncHandler(async (req, res) => {
    const listings = await CropListing.find({ farmer: req.user._id }).sort({
        createdAt: -1,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, listings, "Your listings fetched successfully")
        );
});

// Update Listing
// PUT /api/v1/listings/:id
// Private — farmer (own listing only)
const updateListing = asyncHandler(async (req, res) => {
    const listing = await CropListing.findById(req.params.id);

    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }

    // only the farmer who created it can update
    if (listing.farmer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this listing");
    }

    const {
        cropName,
        category,
        quantity,
        unit,
        pricePerUnit,
        qualityGrade,
        isOrganic,
        harvestDate,
        availableUntil,
        description,
        state,
        district,
        village,
        pincode,
    } = req.body;

    // if new images are uploaded, delete old ones and upload new ones
    const imageFiles = req.files || [];
    if (imageFiles.length > 0) {
        for (const img of listing.images) {
            await deleteFromCloudinary(img.public_id);
        }

        const uploadedImages = [];
        for (const file of imageFiles) {
            const uploaded = await uploadOnCloudinary(file.path);
            if (uploaded) {
                uploadedImages.push({
                    url: uploaded.secure_url,
                    public_id: uploaded.public_id,
                });
            }
        }
        listing.images = uploadedImages;
    }

    if (cropName) listing.cropName = cropName;
    if (category) listing.category = category;
    if (quantity) listing.quantity = quantity;
    if (unit) listing.unit = unit;
    if (pricePerUnit) listing.pricePerUnit = pricePerUnit;
    if (qualityGrade) listing.qualityGrade = qualityGrade;
    if (isOrganic !== undefined)
        listing.isOrganic = isOrganic === "true" || isOrganic === true;
    if (harvestDate) listing.harvestDate = harvestDate;
    if (availableUntil) listing.availableUntil = availableUntil;
    if (description) listing.description = description;

    if (state || district || village || pincode) {
        listing.location = {
            state: state || listing.location.state,
            district: district || listing.location.district,
            village: village || listing.location.village,
            pincode: pincode || listing.location.pincode,
        };
    }

    // reset to pending — admin must re-approve after any edit
    listing.status = "pending";

    await listing.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                listing,
                "Listing updated. Pending admin re-approval."
            )
        );
});

//  Delete Listing 
// DELETE /api/v1/listings/:id
// Private — farmer (own listing only)
const deleteListing = asyncHandler(async (req, res) => {
    const listing = await CropListing.findById(req.params.id);

    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }

    if (listing.farmer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this listing");
    }

    // delete all images from cloudinary before removing DB record
    for (const img of listing.images) {
        await deleteFromCloudinary(img.public_id);
    }

    await CropListing.findByIdAndDelete(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Listing deleted successfully"));
});

// Toggle Wishlist
// PATCH /api/v1/listings/:id/wishlist
// Private — buyer only
const toggleWishlist = asyncHandler(async (req, res) => {
    const listing = await CropListing.findById(req.params.id);

    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }

    const userId = req.user._id;
    const alreadyWishlisted = listing.wishlistedBy.some(
        (id) => id.toString() === userId.toString()
    );

    if (alreadyWishlisted) {
        // remove from wishlist
        listing.wishlistedBy = listing.wishlistedBy.filter(
            (id) => id.toString() !== userId.toString()
        );
    } else {
        // add to wishlist
        listing.wishlistedBy.push(userId);
    }

    await listing.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                alreadyWishlisted ? "Removed from wishlist" : "Added to wishlist"
            )
        );
});

export {
    createListing,
    getAllListings,
    getListingById,
    getMyListings,
    updateListing,
    deleteListing,
    toggleWishlist,
};