import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

function App() {
  const [name, setName] = useState("");
  const [inches, setInches] = useState("");
  const [bets, setBets] = useState([]);
  const [snowfall, setSnowfall] = useState(0);
  const [hoveredBet, setHoveredBet] = useState(null);
  const [hoveredSnowfall, setHoveredSnowfall] = useState(false);
  const maxSnowfall = 12;

  useEffect(() => {
    fetchBets();
    fetchSnowfall();
  }, []);

  const fetchBets = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/bets`);

    // Group bets by inches of snowfall
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
      setSnowfall(data.hourlyData[data.hourlyData.length - 1].snowfall); // Get latest snowfall value
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
    } catch (error) {
      console.error("Error submitting bet:", error);
    }
  };

  return (
    <>
      <h2>How much snow will Chicago get?</h2>
      <div className="app-area">
        <div className="form-area">
          {/* Bet Submission Form */}
          <form onSubmit={submitBet}>
            <h3 id="form-title">Make your guess</h3>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Inches of Snow"
              value={inches}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (parseFloat(value) >= 0 && parseFloat(value) <= 12)
                ) {
                  setInches(value);
                }
              }}
              max="12"
              min="0"
              step="0.1"
              required
            />
            <button type="submit">Submit</button>
          </form>
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
          {/* Custom Styled Ruler */}
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
                height: `${(snowfall / maxSnowfall) * 100}%`,
                background: "rgba(0, 129, 173, 0.47)",
                transition: "height 0.5s ease-in-out",
                position: "relative",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredSnowfall(true)}
              onMouseLeave={() => setHoveredSnowfall(false)}
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
    </>
  );
}

export default App;
