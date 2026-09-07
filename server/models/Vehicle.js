import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    model: {
      type: String,
      default: "EV-FIT Demo Vehicle",
    },
    batteryCapacity: {
      // kWh
      type: Number,
      default: 60,
    },
    batteryType: {
      type: String,
      default: "Li-ion NMC",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "CHARGING", "MAINTENANCE"],
      default: "ACTIVE",
    },
    dataSource: {
      // lets the frontend/backend know where telemetry is coming from.
      // "SIMULATOR" today, "ESP32" / "OBD2" once real hardware is wired in.
      type: String,
      enum: ["SIMULATOR", "ESP32", "OBD2"],
      default: "SIMULATOR",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
