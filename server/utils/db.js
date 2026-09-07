import mongoose from "mongoose";

const MAX_RETRIES = 5;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is not set. Check your .env file (see .env.example).");
    process.exit(1);
  }

  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(uri);
      console.log(`[db] Connected to MongoDB at ${maskUri(uri)}`);
      return;
    } catch (err) {
      attempt += 1;
      console.error(`[db] Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt >= MAX_RETRIES) {
        console.error("[db] Could not connect to MongoDB after multiple attempts. Exiting.");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
}

function maskUri(uri) {
  // avoid printing credentials if a connection string contains them
  return uri.replace(/\/\/(.*):(.*)@/, "//****:****@");
}

mongoose.connection.on("disconnected", () => {
  console.warn("[db] MongoDB disconnected.");
});

mongoose.connection.on("error", (err) => {
  console.error(`[db] MongoDB error: ${err.message}`);
});
