import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check whether the Bearer token exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a Bearer token.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is missing.",
    });
  }

  let decoded;

  // Verify the JWT
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token has expired. Please log in again."
          : "Invalid authentication token.",
    });
  }

  try {
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found. Please log in again.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
      });
    }

    next();
  };
};
