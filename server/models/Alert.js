import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },
    parameter: {
      // e.g. "batteryTemperature", "voltage"
      type: String,
      required: true,
    },
    currentValue: Number,
    threshold: Number,
    recommendation: String,
    acknowledged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

alertSchema.index({ vehicleId: 1, createdAt: -1 });

export default mongoose.model("Alert", alertSchema);
