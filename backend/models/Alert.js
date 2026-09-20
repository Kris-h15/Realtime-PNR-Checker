const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    lastStatus: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Alert", alertSchema);
