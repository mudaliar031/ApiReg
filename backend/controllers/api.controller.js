import crypto from "crypto";
import nodemailer from "nodemailer";
import ApiRequest from "../models/ApiRequest.js";
import User from "../models/User.js";

// Email transporter configuration
// For production, use environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail", // Or use your email service
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASS || "your-app-password",
    },
  });
};

// Send API Key email to user
const sendApiKeyEmail = async (userEmail, userName, apiName, apiKey) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: userEmail,
      subject: `Your API Key for ${apiName} - Approved`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">API Request Approved! 🎉</h2>
          <p>Hi ${userName},</p>
          <p>Great news! Your API request for <strong>${apiName}</strong> has been approved.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #666;">Your API Key:</p>
            <code style="font-size: 18px; color: #2563eb; word-break: break-all;">${apiKey}</code>
          </div>
          <p style="color: #666; font-size: 14px;">
            Keep this key safe! You'll need it to authenticate your API requests.
          </p>
          <p style="color: #666; font-size: 14px;">
            Example usage:<br>
            <code>Authorization: Bearer ${apiKey}</code>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't request this API, please contact support.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`API Key email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

/* =====================================================
   USER: Create API Request
   ===================================================== */
export const createApiRequest = async (req, res) => {
  try {
    const { apiName, description, fields } = req.body;

    if (!apiName || !description) {
      return res.status(400).json({ message: "API name and description are required" });
    }

    // Check if user already has pending request for same API
    const existingRequest = await ApiRequest.findOne({
      user: req.user.id,
      apiName,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request for this API",
      });
    }

    // Filter out empty fields
    const validFields = fields && Array.isArray(fields) 
      ? fields.filter(f => f.key && f.key.trim() !== "")
      : [];

    const request = await ApiRequest.create({
      user: req.user.id,
      apiName,
      description,
      fields: validFields,
    });

    res.status(201).json({
      message: "API request submitted successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   ADMIN: Approve Request
   ===================================================== */
export const approveRequest = async (req, res) => {
  try {
    const request = await ApiRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already processed",
      });
    }

    // Generate secure 35 character API key
    const apiKey = crypto.randomBytes(26).toString("hex").slice(0, 35);

    request.status = "approved";
    request.apiKey = apiKey;
    request.feedback = undefined;

    await request.save();

    // Get user info to send email notification
    const user = await User.findById(request.user);
    if (user && user.email) {
      // Send email asynchronously (don't wait for it to complete)
      sendApiKeyEmail(user.email, user.fullName, request.apiName, apiKey);
    }

    res.json({
      message: "Request approved successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   ADMIN: Reject Request
   ===================================================== */
export const rejectRequest = async (req, res) => {
  try {
    const { feedback } = req.body;

    const request = await ApiRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already processed",
      });
    }

    request.status = "rejected";
    request.feedback = feedback || "Request rejected by admin";
    request.apiKey = undefined;

    await request.save();

    res.json({
      message: "Request rejected",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};