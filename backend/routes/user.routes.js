import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { createApiRequest } from "../controllers/api.controller.js";
import ApiRequest from "../models/ApiRequest.js";

const router = express.Router();

/* =====================================================
   USER: Create API Request
   ===================================================== */
router.post("/request-api", protect, authorize(["user"]), createApiRequest);

/* =====================================================
   USER: Get All My Requests
   ===================================================== */
router.get(
  "/my-requests",
  protect,
  authorize(["user"]),
  async (req, res) => {
    try {
      const requests = await ApiRequest.find({
        user: req.user.id,
      }).sort({ createdAt: -1 });

      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   USER: Update API Request
   ===================================================== */
router.put(
  "/requests/:id",
  protect,
  authorize(["user"]),
  async (req, res) => {
    try {
      const { apiName, description, fields } = req.body;

      const apiRequest = await ApiRequest.findById(req.params.id);

      if (!apiRequest) {
        return res.status(404).json({ message: "API request not found" });
      }

      // Ensure user can only update their own requests
      if (apiRequest.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this request" });
      }

      // Only allow editing if request is pending or rejected
      // If rejected, allow editing and reset status to pending (resubmit)
      if (apiRequest.status !== "pending" && apiRequest.status !== "rejected") {
        return res.status(400).json({ message: "Can only edit pending or rejected requests" });
      }

      // Update fields
      if (apiName) apiRequest.apiName = apiName;
      if (description) apiRequest.description = description;
      if (fields && Array.isArray(fields)) {
        // Filter out empty fields
        apiRequest.fields = fields.filter(f => f.key && f.key.trim() !== "");
      }

      // If request was rejected, reset status to pending (resubmit) and clear feedback
      if (apiRequest.status === "rejected") {
        apiRequest.status = "pending";
        apiRequest.feedback = undefined; // Clear the old rejection feedback
      }

      await apiRequest.save();

      res.json({
        message: apiRequest.status === "pending" && req.body._previousStatus === "rejected" 
          ? "API request resubmitted successfully" 
          : "API request updated successfully",
        request: apiRequest,
      });
    } catch (error) {
      console.error("Error updating API request:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   USER: Delete API Request (Permanent)
   ===================================================== */
router.delete(
  "/requests/:id",
  protect,
  authorize(["user"]),
  async (req, res) => {
    try {
      const apiRequest = await ApiRequest.findById(req.params.id);

      if (!apiRequest) {
        return res.status(404).json({ message: "API request not found" });
      }

      // Ensure user can only delete their own requests
      if (apiRequest.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this request" });
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
