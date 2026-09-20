const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");
const Alert = require("./models/Alert");
const sendEmail = require("./utils/mailer");

require("dotenv").config();
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const express = require("express");
const app = express();

const { configure, checkPNRStatus } = require("railkit");
configure(process.env.RAILKIT_API_KEY);

app.use(cors());
app.use(express.json());

let PORT = 5000;

app.get("/", (req, res) => {
  res.json({
    message: "PNR Checker Backend is running",
  });
});

app.get("/api/pnr/:pnr", async (req, res) => {
  const { pnr } = req.params;

  // checks if pnr has 10 digits or not
  if (!/^\d{10}$/.test(pnr)) {
    return res.status(400).json({
      message: "Invalid PNR. PNR must contain 10 digits.",
    });
  }

  try {
    const result = await checkPNRStatus(pnr);

    if (!result.success) {
      return res.status(500).json({
        message: result.error || "Unable to fetch PNR status",
      });
    }
    res.json(result);
  } catch (error) {
    console.error("PNR Error:", error);

    res.status(500).json({
      message: "Failed to fetch PNR status",
    });
  }
});

app.post("/api/alert", async (req, res) => {
  const { pnr, email } = req.body;

  if (!pnr || !/^\d{10}$/.test(pnr)) {
    return res.status(400).json({
      message: "Invalid PNR",
    });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      message: "Invalid email",
    });
  }

  try {
    const existingAlert = await Alert.findOne({
      pnr,
      email,
    });

    if (existingAlert) {
      existingAlert.active = true;
      await existingAlert.save();

      return res.json({
        success: true,
        message: "Alert enabled successfully",
      });
    }

    const alert = new Alert({
      pnr,
      email,
      active: true,
      laststatus: "",
    });

    await alert.save();

    res.json({
      success: true,
      message: "Alert enabled successfully",
    });
  } catch (error) {
    console.error("Alert error:", error);

    res.status(500).json({
      message: "Could not save alert",
    });
  }
});

app.put("/api/alert/off", async (req, res) => {
  const { pnr, email } = req.body;

  if (!pnr || !email) {
    return res.status(400).json({
      message: "PNR and email are required",
    });
  }

  try {
    const alert = await Alert.findOneAndUpdate(
      { pnr, email },
      { active: false },
      { new: true },
    );

    if (!alert) {
      return res.status(404).json({
        message: "Alert not found",
      });
    }

    res.json({
      success: true,
      message: "Alert switched off successfully",
    });
  } catch (error) {
    console.error("Switch off alert error:", error);

    res.status(500).json({
      message: "Could not switch off alert",
    });
  }
});

// app.get("/api/test-email", async (req, res) => {
//   try {
//     await sendEmail(
//       "amanjha2470@gmail.com",
//       // process.env.EMAIL_USER,
//       "PNR Checker Test",
//       "Your PNR Checker email system is working successfully!",
//     );

//     res.json({
//       success: true,
//       message: "Test email sent successfully",
//     });
//   } catch (error) {
//     console.error("Email error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to send email",
//     });
//   }
// });

// =============================================================== node-cron ===================================
cron.schedule("*/5 * * * *", async () => {
  console.log("Checking active PNR alerts...");

  try {
    const alerts = await Alert.find({ active: true });

    console.log(`Found ${alerts.length} active alert(s)`);

    for (const alert of alerts) {
      try {
        const result = await checkPNRStatus(alert.pnr);

        if (!result.success) {
          console.log(`Could not check PNR ${alert.pnr}`);
          continue;
        }

        const passengers = result.data?.passengers || [];

        const currentStatus = passengers
          .map((passenger, index) => {
            return `Passenger ${index + 1}: ${
              passenger.current?.details || "Unknown"
            }`;
          })
          .join(" | ");

        console.log(`PNR ${alert.pnr} current status: ${currentStatus}`);

        // First check: save the status but don't send an email
        if (!alert.lastStatus) {
          alert.lastStatus = currentStatus;
          await alert.save();

          console.log(`Initial status saved for ${alert.pnr}`);
          continue;
        }

        // Status changed
        if (alert.lastStatus !== currentStatus) {
          await sendEmail(
            alert.email,
            `PNR Status Updated - ${alert.pnr}`,
            `Your PNR status has changed.

PNR: ${alert.pnr}

Previous Status:
${alert.lastStatus}

Current Status:
${currentStatus}

Please check your PNR for the latest details.`,
          );

          console.log(`Status change email sent for ${alert.pnr}`);

          alert.lastStatus = currentStatus;
          await alert.save();
        }
      } catch (error) {
        console.error(`Error checking PNR ${alert.pnr}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Alert checker error:", error);
  }
});

// ======================================================
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
