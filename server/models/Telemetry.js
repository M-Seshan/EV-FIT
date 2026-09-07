import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    soc: Number, // State of Charge %
    soh: Number, // State of Health %
    voltage: Number, // V
    current: Number, // A
    batteryTemperature: Number, // °C
    motorTemperature: Number, // °C
    speed: Number, // km/h
    chargingStatus: {
      type: Boolean,
      default: false,
    },
    power: Number, // kW, derived (voltage * current / 1000)
    estimatedRange: Number, // km
    chargingPower: Number, // kW
    batteryCycleCount: Number,
    acceleration: Number, // m/s^2
    latitude: Number,
    longitude: Number,
    mode: {
      // which simulator mode produced this reading (or "REAL" for hardware)
      type: String,
      default: "NORMAL",
    },
  },
  { timestamps: true }
);

// Compound index for efficient history queries per vehicle, sorted by time
telemetrySchema.index({ vehicleId: 1, timestamp: -1 });

export default mongoose.model("Telemetry", telemetrySchema);
