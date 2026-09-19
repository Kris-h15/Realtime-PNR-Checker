import { useState } from "react";

export default function Frontpage() {
  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const checkPNR = async () => {
    if (pnr.length !== 10) {
      setError("Please enter a valid 10-digit PNR");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/pnr/${pnr}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <h1>PNR Status Checker</h1>

        <p>Check your Indian Railway PNR status</p>

        {/* pnr details form */}
        <div className="pnr-form">
          <input
            type="text"
            placeholder="Enter 10 digit PNR"
            value={pnr}
            maxLength={10}
            onChange={(e) => setPnr(e.target.value.replace(/\D/g, ""))}
          />

          <button onClick={checkPNR}>
            {loading ? "Checking..." : "Check PNR"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <h2>PNR Details</h2>

            <p>
              <strong>PNR:</strong> {result.pnr}
            </p>

            <p>
              <strong>Status:</strong> {result.status}
            </p>
          </div>
        )}
      </div>
      ;
    </>
  );
}
