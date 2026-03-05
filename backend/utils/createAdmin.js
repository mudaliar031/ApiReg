import User from "../models/User.js";
import bcrypt from "bcryptjs";

const createDefaultAdmin = async () => {
  // Always create/update admin for development
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.findOneAndUpdate(
    { role: "admin" },
    {
      fullName: "Super Admin",
      email: "admin@platform.com",
      password: hashedPassword,
      role: "admin",
      status: "active"
    },
    { upsert: true, new: true }
  );

  console.log("✅ Default admin created/updated: admin@platform.com / admin123");
};

export default createDefaultAdmin;
