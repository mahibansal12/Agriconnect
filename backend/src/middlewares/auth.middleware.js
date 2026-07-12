import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // IMPORTANT: check the Authorization header BEFORE the cookie.
        // The frontend caches a separate access token per role (farmer /
        // buyer) in localStorage and sends the *active* one as a Bearer
        // token on every request. The httpOnly cookie, on the other hand,
        // only ever holds whichever role logged in most recently — there's
        // only one cookie slot. If the cookie were checked first, switching
        // roles on the client would have no effect server-side: every
        // request would keep authenticating as the stale cookie's role.
        const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken" );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export { verifyJWT };