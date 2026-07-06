import mongoose from "mongoose";

const uri =
  "mongodb+srv://grzegorz96k_db_user:QazQwe_12@cluster0.7gomrlc.mongodb.net/centrum-db?appName=Cluster0";

try {
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
} catch (err) {
  console.error("❌ MongoDB error:", err);
}