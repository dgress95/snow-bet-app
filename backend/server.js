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

// Endpoint to get snowfall
app.get("/snowfall", async (req, res) => {
  try {
    const agent = new https.Agent({ rejectUnauthorized: false });

    const response = await axios.get(
      `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=Chicago&days=1`,
      { httpsAgent: agent }
    );

    console.log("Weather API Response:", response.data);
    const formatTime = (timeStr) => {
      let [hour, minute] = timeStr.split(":").map(Number);
      let ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12; // Convert 0 to 12
      return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
    };

    const hourlyData = response.data.forecast.forecastday[0].hour.map(
      (hour) => ({
        time: formatTime(hour.time.split(" ")[1]), // Convert "14:00" → "2:00 PM"
        snowfall: hour.precip_in,
      })
    );

    res.json({ hourlyData });
  } catch (error) {
    console.error("Error fetching snowfall data:", error.message);
    res.status(500).json({ error: "Failed to fetch snowfall data" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
