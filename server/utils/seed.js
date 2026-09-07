import Vehicle from "../models/Vehicle.js";

export async function ensureDefaultVehicle() {
  const existing = await Vehicle.findOne({ vehicleId: "EV-001" });
  if (existing) return existing;

  const vehicle = await Vehicle.create({
    vehicleId: "EV-001",
    model: "EV-FIT Demo Vehicle",
    batteryCapacity: 60,
    batteryType: "Li-ion NMC",
    status: "ACTIVE",
    dataSource: "SIMULATOR",
  });

  console.log(`[seed] Created default vehicle: ${vehicle.vehicleId}`);
  return vehicle;
}
