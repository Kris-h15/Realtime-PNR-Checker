import { useState } from "react";
import Frontpage from "./components/Frontpage";
import "./App.css";

function App() {
  // const [pnr, setPnr] = useState("");
  // const [loading, setLoading] = useState(false);
  // const [result, setResult] = useState(null);
  // const [error, setError] = useState("");

  // const checkPNR = async () => {
  //   if (pnr.length !== 10) {
  //     setError("Please enter a valid 10-digit PNR");
  //     return;
  //   }

  //   setError("");
  //   setLoading(true);

  //   try {
  //     const response = await fetch(`http://localhost:5000/api/pnr/${pnr}`);

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.message || "Something went wrong");
  //     }

  //     setResult(data);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="app">
      <Frontpage />
    </div>
  );
}

export default App;
