const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // ה-.env יושב באותה תיקייה שממנה אתה מריץ npm start (server)

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const orderRoutes = require("./routes/orders");
app.use("/api", orderRoutes);


// Health check
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// חיבור למסד + לוגים ברורים
(async () => {
  try {
    // נסה להתחבר
    await mongoose.connect(process.env.MONGO_URI);

    // לוג מצב חיבור
    console.log("✅ MongoDB connected");

    // האזנות אבחון נוספות (רשות אבל עוזר)
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error (event):", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.error("⚠️ MongoDB disconnected");
    });
  } catch (err) {
    console.error("❌ MongoDB connection error (catch):", err.message);
    process.exit(1); // עצור אם אין חיבור
  }
})();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
