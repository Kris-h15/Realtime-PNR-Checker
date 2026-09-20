import { useState } from "react";

export default function Frontpage() {
  const [pnr, setPnr] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [alertOn, setAlertOn] = useState(false);

  const checkPNR = async () => {
    if (pnr.length !== 10) {
      setError("Please enter a valid 10-digit PNR");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    // Temporary data for frontend testing
    setTimeout(() => {
      setResult({
        pnr: pnr,
        status: "CONFIRMED",
        trainNumber: "12393",
        trainName: "Sampoorna Kranti Express",
        from: "New Delhi",
        to: "Patna Junction",
      });

      setLoading(false);
    }, 1000);
  };
  const setAlert = () => {
    setAlertOn(true);
    console.log("Alert enabled for PNR:", pnr);
  };

  const switchOffAlert = () => {
    setAlertOn(false);
    console.log("Alert disabled for PNR:", pnr);
  };

  return (
    <div className="container">
      <h1>PNR Status Checker</h1>
      <p>Check your Indian Railway PNR status</p>

      {/* PNR INPUT */}
      <div className="pnr-form">
        <input
          type="text"
          placeholder="Enter 10 digit PNR"
          value={pnr}
          maxLength={10}
          onChange={(e) => {
            setPnr(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
        />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={checkPNR} disabled={loading}>
          {loading ? "Checking..." : "Check PNR"}
        </button>
      </div>

      {/* ERROR */}
      {error && <div className="error">{error}</div>}

      {/* RESULT */}
      {result && (
        <div className="result">
          <h2>PNR Details</h2>
          <p>
            <strong>PNR:</strong> {result.pnr}
          </p>
          <p>
            <strong>Status:</strong> {result.status}
          </p>
          <p>
            <strong>Train:</strong> {result.trainNumber} - {result.trainName}
          </p>
          <p>
            <strong>From:</strong> {result.from}
          </p>
          <p>
            <strong>To:</strong> {result.to}
          </p>

          {/* ALERT BUTTONS Here*/}
          <div className="alert-buttons">
            <button className="set-alert" onClick={setAlert} disabled={alertOn}>
              🔔 Set Alert
            </button>

            <button
              className="off-alert"
              onClick={switchOffAlert}
              disabled={!alertOn}
            >
              🔕 Switch Off Alert
            </button>
          </div>

          {alertOn && (
            <p className="alert-message">🔔 Alert is ON for this PNR</p>
          )}
        </div>
      )}
    </div>
  );
}
