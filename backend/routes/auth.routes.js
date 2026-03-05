import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin registers users/admins
router.post("/register", protect, authorize(["admin"]), registerUser);

// Login
router.post("/login", loginUser);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password", resetPassword);

export default router;
