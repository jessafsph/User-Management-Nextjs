import mongoose from "mongoose";

const connectToDB = async () => {
  // Use test database URI if running tests, otherwise use production URI
  const url = process.env.MONGO_URI_TEST || process.env.MONGO_URI;

  if (!url) {
    console.error(
      "Database connection failed: Neither MONGO_URI nor MONGO_URI_TEST is configured"
    );
    throw new Error("Database URI not configured");
  }

  mongoose
    .connect(url)
    .then(() => {
      const dbType = process.env.MONGO_URI_TEST ? "test" : "production";
      console.log(`✅ Database connection is successful (${dbType})`);
    })
    .catch((e) => {
      console.error("❌ Database connection failed:", e);
      throw e;
    });
};

export default connectToDB;
