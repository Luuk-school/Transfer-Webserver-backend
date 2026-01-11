require("dotenv").config();
const express = require("express");

const authRoutes = require("./routes/auth");

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);


// Health check (handig!)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
