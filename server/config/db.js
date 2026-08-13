import mongoose from "mongoose";
import dns from "dns";

// Node's built-in DNS resolver can fail on some networks when looking up
// the special SRV record that mongodb+srv:// URIs depend on, even though
// normal DNS lookups work fine. Pointing it at Google's public DNS avoids that.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
