import { ApiError } from "../utils/ApiError.js";

const authorizeRoles = (...allowedRoles) => {
    return (req, _, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError( 403,`Role '${req.user.role}' is not allowed to access this resource`);
        }
        
        next();
    };
};

export { authorizeRoles };