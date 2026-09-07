import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true,
    },
    issue: {
      // e.g. "Battery Cooling", "Electrical System"
      type: String,
      required: true,
    },
    risk: {
      // 0-100 %
      type: Number,
      required: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },
    recommendation: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

maintenanceSchema.index({ vehicleId: 1, createdAt: -1 });

export default mongoose.model("Maintenance", maintenanceSchema);
