import mongoose from "mongoose";

const anomalySchema = new mongoose.Schema(
  {
    type: String,
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },
    risk: Number, // 0-100
    message: String,
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },
    safetyScore: {
      type: Number,
      required: true,
    },
    anomalies: [anomalySchema],
    predictions: [String],
    recommendations: [String],
  },
  { timestamps: true }
);

analysisSchema.index({ vehicleId: 1, createdAt: -1 });

export default mongoose.model("Analysis", analysisSchema);
