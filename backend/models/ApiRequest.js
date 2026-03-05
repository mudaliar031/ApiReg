import mongoose from "mongoose";

const apiRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    apiName: String,
    description: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "revoked"],
      default: "pending",
    },

    apiKey: {
      type: String,
    },

    // Configuration fields stored as array
    fields: [{
      key: { type: String },
      value: { type: String }
    }],

    feedback: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ApiRequest", apiRequestSchema);
