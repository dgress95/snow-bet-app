import { useState, useEffect } from "react";
import axios from "axios";
import "./snow.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function App() {
  const [name, setName] = useState("");
  const [inches, setInches] = useState("");
  const [bets, setBets] = useState([]);
  const [snowfall, setSnowfall] = useState(0);
  const [hoveredBet, setHoveredBet] = useState(null);
  const [hoveredSnowfall, setHoveredSnowfall] = useState(false);
  const [snowflakes, setSnowflakes] = useState([]);

  const maxSnowfall = 12;

  useEffect(() => {
    fetchBets();
    fetchSnowfall();
    const interval = setInterval(fetchSnowfall, 60000); // Refresh snowfall every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBets = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/bets`);

    const groupedBets = data.reduce((acc, bet) => {
      if (!acc[bet.inches]) {
        acc[bet.inches] = [];
      }
      acc[bet.inches].push(bet.name);
      return acc;
    }, {});

    setBets(groupedBets);
  };

  const fetchSnowfall = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/snowfall`);
      setSnowfall(data.totalSnowfall);
      createSnowflakes();
      console.log(data.totalSnowfall);
    } catch (error) {
      console.error("Error fetching snowfall data:", error);
    }
  };

  const submitBet = async (e) => {
    e.preventDefault();
    if (!name || !inches) return;

    try {
      await axios.post(`${API_BASE_URL}/bets`, { name, inches });
      setName("");
      setInches("");
      fetchBets();

      createSnowflakes();
    } catch (error) {
      console.error("Error submitting bet:", error);
    }
  };

  const createSnowflakes = () => {
    const flakes = [];

    for (let i = 0; i < 20; i++) {
      flakes.push({
        id: Math.random(),
        left: Math.random() * 100 + "vw",
        animationDuration: Math.random() * 3 + 2 + "s",
      });
    }

    setSnowflakes(flakes);

    setTimeout(() => setSnowflakes([]), 5000);
  };

  return (
    <>
      <div className="container">
        <h2>How much snow will Chicago get?</h2>
        <div className="app-area">
          <div className="leaderboard">
            <h3>❄️ Current Snowfall ❄️</h3>
            <div>0.6 in</div>
            <h3>🏆 Leaderboard</h3>
            <ul className="top-bets">
              {Object.entries(bets)
                .map(([inches, names]) => ({
                  inches: parseFloat(inches),
                  names,
                  difference: Math.abs(snowfall - parseFloat(inches)), // Calculate closeness
                }))
                .sort((a, b) => a.difference - b.difference) // Sort by closest guess
                .slice(0, 5) // Take only the top 5 bets
                .map((bet, index) => (
                  <li key={index}>
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : "🏅"}{" "}
                    {bet.names.join(", ")} - {bet.inches}"
                  </li>
                ))}
            </ul>
          </div>

          <div
            id="ruler-area"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              height: "400px",
              width: "25%",
              position: "relative",
            }}
          >
            {/* Ruler */}
            <div
              style={{
                width: "50px",
                height: "100%",
                backgroundColor: "#eee",
                border: "2px solid black",
                borderBottom: "4px solid black",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {/* Inch Markers */}
              {[...Array(12)].map((_, i) => {
                const inch = i + 1;
                return (
                  <div
                    key={inch}
                    style={{
                      position: "absolute",
                      bottom: `${((inch - 0.6) / maxSnowfall) * 100}%`,
                      width: "95%",
                      borderTop: "2px solid black",
                      textAlign: "right",
                      paddingRight: "5px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {inch}"
                  </div>
                );
              })}
              {/* Snowfall Progress Marker */}
              <div
                style={{
                  width: "50px",
                  // height: `${(snowfall / maxSnowfall) * 100}%`,
                  height: "4.166%",
                  background: "rgba(0, 129, 173, 0.47)",
                  transition: "height 0.5s ease-in-out",
                  position: "relative",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredSnowfall(true)}
                onMouseLeave={() => setHoveredSnowfall(false)}
                onMouseDown={() => setHoveredSnowfall(true)}
                onMouseUp={() => setHoveredSnowfall(false)}
                onTouchStart={() => setHoveredSnowfall(true)}
                onTouchEnd={() => setHoveredSnowfall(false)}
              >
                {/* Tooltip for Snowfall */}
                {hoveredSnowfall && (
                  <div
                    style={{
                      position: "absolute",
                      left: "70px",
                      bottom: "50%",
                      backgroundColor: "white",
                      color: "black",
                      padding: "5px",
                      borderRadius: "5px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                      fontSize: "12px",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ❄️ {snowfall} inches
                  </div>
                )}
              </div>
            </div>

            {/* Bet Markers */}
            <div
              className="bet-markers"
              style={{
                position: "relative",
                height: "100%",
                width: "50%",
                marginLeft: "10px",
              }}
            >
              {Object.entries(bets).map(([inches, names], index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    bottom: `${(inches / maxSnowfall) * 100}%`,
                    left: "5px",
                    width: "50px",
                    height: "2px",
                    backgroundColor: "rgba(0, 129, 173, 1)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredBet({ inches, names })}
                  onMouseLeave={() => setHoveredBet(null)}
                  onMouseDown={() => setHoveredBet({ inches, names })}
                  onMouseUp={() => setHoveredBet(null)}
                  onTouchStart={() => setHoveredBet({ inches, names })}
                  onTouchEnd={() => setHoveredBet(null)}
                >
                  {/* Tooltip */}
                  {hoveredBet && hoveredBet.inches === inches && (
                    <div
                      style={{
                        position: "absolute",
                        left: "55px",
                        bottom: "0%",
                        backgroundColor: "white",
                        color: "black",
                        padding: "5px",
                        borderRadius: "5px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                        fontSize: "12px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {hoveredBet.names.join(", ")} ({hoveredBet.inches}")
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div id="snow-container">
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="snowflake"
              style={{
                left: flake.left,
                animationDuration: flake.animationDuration,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
