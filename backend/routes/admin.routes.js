import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  approveRequest,
  rejectRequest,
} from "../controllers/api.controller.js";
import ApiRequest from "../models/ApiRequest.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/* =====================================================
   USER MANAGEMENT
   ===================================================== */

// Get all users
router.get(
  "/users",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      // Get API counts for each user
      const usersWithApiCount = await Promise.all(
        users.map(async (user) => {
          const apiCount = await ApiRequest.countDocuments({ user: user._id });
          return {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            apiCount,
          };
        })
      );

      res.json(usersWithApiCount);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Create new user (admin only)
router.post(
  "/users",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { fullName, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role: role || "user",
        status: "active",
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Suspend user
router.post(
  "/users/:id/suspend",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.status = "suspended";
      await user.save();

      res.json({ message: "User suspended successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Activate user
router.post(
  "/users/:id/activate",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.status = "active";
      await user.save();

      res.json({ message: "User activated successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Deactivate user
router.post(
  "/users/:id/deactivate",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.status = "deactivated";
      await user.save();

      res.json({ message: "User deactivated successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete user
router.delete(
  "/users/:id",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete all API requests by this user
      await ApiRequest.deleteMany({ user: req.params.id });

      await user.deleteOne();

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get user's APIs
router.get(
  "/users/:email/apis",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const apis = await ApiRequest.find({ user: user._id })
        .select("apiName description status apiKey feedback createdAt")
        .sort({ createdAt: -1 });

      const formattedApis = apis.map((api) => ({
        id: api._id,
        name: api.apiName || "Unnamed API",
        description: api.description || "No description",
        status: api.status === "approved" ? "active" : api.status,
        createdAt: api.createdAt,
        fields: api.apiKey
          ? [{ key: "API Key", value: api.apiKey }]
          : [],
      }));

      res.json(formattedApis);
    } catch (error) {
      console.error("Error fetching user APIs:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   API REQUEST MANAGEMENT
   ===================================================== */

router.get(
  "/requests",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const requests = await ApiRequest.find()
        .populate("user", "fullName email")
        .sort({ createdAt: -1 });

      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Approve API request
router.post(
  "/apis/:id/approve",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const crypto = await import("crypto");
      const request = await ApiRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Generate secure API key
      const apiKey = crypto.randomBytes(26).toString("hex").slice(0, 35);

      request.status = "approved";
      request.apiKey = apiKey;
      request.feedback = undefined;

      await request.save();

      res.json({
        message: "API approved successfully",
        request,
      });
    } catch (error) {
      console.error("Error approving API:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Reject API request
router.post(
  "/apis/:id/reject",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { feedback } = req.body;

      const request = await ApiRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      request.status = "rejected";
      request.feedback = feedback || "Request rejected by admin";
      request.apiKey = undefined;

      await request.save();

      res.json({
        message: "API rejected",
        request,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Revoke API access
router.post(
  "/apis/:id/revoke",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const request = await ApiRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Add revoked status - need to update schema first
      request.status = "revoked";
      request.apiKey = undefined;
      request.feedback = "API access revoked by admin";

      await request.save();

      res.json({
        message: "API access revoked",
        request,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Unrevoke API access (restore revoked API)
router.post(
  "/apis/:id/unrevoke",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const crypto = await import("crypto");
      const request = await ApiRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Only allow unrevoke for revoked APIs
      if (request.status !== "revoked") {
        return res.status(400).json({ message: "Can only restore revoked APIs" });
      }

      // Generate new API key and restore status
      const apiKey = crypto.randomBytes(26).toString("hex").slice(0, 35);
      request.status = "approved";
      request.apiKey = apiKey;
      request.feedback = undefined;

      await request.save();

      res.json({
        message: "API access restored successfully",
        request,
      });
    } catch (error) {
      console.error("Error unrevoking API:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/approve/:id",
  protect,
  authorize(["admin"]),
  approveRequest
);

router.put(
  "/reject/:id",
  protect,
  authorize(["admin"]),
  rejectRequest
);

/* =====================================================
   ADMIN: Delete API Request (Permanent)
   ===================================================== */
router.delete(
  "/requests/:id",
  protect,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const apiRequest = await ApiRequest.findById(req.params.id);

      if (!apiRequest) {
        return res.status(404).json({ message: "API request not found" });
      }

      // Permanently delete the request from database
      await ApiRequest.findByIdAndDelete(req.params.id);

      res.json({ message: "API request deleted successfully" });
    } catch (error) {
      console.error("Error deleting API request:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
