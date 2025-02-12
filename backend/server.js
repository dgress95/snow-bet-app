const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Define Bet Schema
const BetSchema = new mongoose.Schema({
  name: String,
  inches: Number,
});

const Bet = mongoose.model("Bet", BetSchema);

// Endpoint to submit a bet
app.post("/bets", async (req, res) => {
  const bet = new Bet(req.body);
  await bet.save();
  res.json(bet);
});

// Endpoint to get all bets
app.get("/bets", async (req, res) => {
  const bets = await Bet.find();
  res.json(bets);
});

const https = require("https");

let totalSnowfall = 0; // Store accumulated snowfall

// Endpoint to get cumulative snowfall
app.get("/snowfall", async (req, res) => {
  try {
    const agent = new https.Agent({ rejectUnauthorized: false });

    const response = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=Chicago`,
      { httpsAgent: agent }
    );

    console.log("Weather API Current Data:", response.data);

    const currentSnowfall = response.data.current.precip_in;

    if (currentSnowfall > 0) {
      totalSnowfall += currentSnowfall;
    }

    console.log("Updated Total Snowfall:", totalSnowfall);

    res.json({ totalSnowfall });
  } catch (error) {
    console.error("Error fetching snowfall data:", error.message);
    res.status(500).json({ error: "Failed to fetch snowfall data" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
