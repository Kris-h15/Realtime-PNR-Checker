import { useState } from "react";

export default function Frontpage() {
  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [alertOn, setAlertOn] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  const checkPNR = async () => {
    if (pnr.length !== 10) {
      setError("Please enter a valid 10-digit PNR");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/pnr/${pnr}`);

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned:", text);

        throw new Error(
          "Backend is not returning JSON. Check that your backend is running on port 5000.",
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch PNR");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setAlert = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pnr,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to enable alert");
      }

      setAlertOn(true);
      setShowEmailInput(false);

      console.log(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const switchOffAlert = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/alert/off", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pnr,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to switch off alert");
      }

      setAlertOn(false);

      console.log(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>PNR Status Checker</h1>

      <p>Check your Indian Railway PNR status</p>

      <div className="pnr-form">
        <input
          type="text"
          placeholder="Enter 10 digit PNR"
          value={pnr}
          maxLength={10}
          onChange={(e) => setPnr(e.target.value.replace(/\D/g, ""))}
        />

        <button onClick={checkPNR} disabled={loading}>
          {loading ? "Checking..." : "Check PNR"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <h2>PNR Details</h2>

          <p>
            <strong>PNR:</strong> {result.data?.pnr || pnr}
          </p>

          <p>
            <strong>Train:</strong> {result.data?.train?.number} -{" "}
            {result.data?.train?.name}
          </p>

          <p>
            <strong>From:</strong> {result.data?.journey?.source?.name}
          </p>

          <p>
            <strong>To:</strong> {result.data?.journey?.destination?.name}
          </p>

          <h3>Passengers</h3>

          {result.data?.passengers?.map((passenger, index) => (
            <div key={index} className="passenger">
              <p>
                <strong>Passenger {index + 1}</strong>
              </p>

              <p>
                <strong>Booking Status:</strong> {passenger.booking?.details}
              </p>

              <p>
                <strong>Current Status:</strong> {passenger.current?.details}
              </p>
            </div>
          ))}

          {/* alert ON/OFF buttons */}
          <div className="alert-buttons">
            {!alertOn && !showEmailInput && (
              <button onClick={() => setShowEmailInput(true)}>
                🔔 Set Alert
              </button>
            )}

            {showEmailInput && (
              <div className="email-alert">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button onClick={setAlert}>Enable Alert</button>
              </div>
            )}

            {alertOn && (
              <button onClick={switchOffAlert}>🔕 Switch Off Alert</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
