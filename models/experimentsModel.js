const mongoose = require("mongoose");
const experimentSchema = new mongoose.Schema(
  {
    experimentId: {
      type: String,
      // required: false,
    },
    experimentName: {
      type: String,
      required: true,
    },
    experimentDetails: {
      type: String,
      required: true,
    },
    timings : {
      type: Array,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const experimentModel = mongoose.model("experiments", experimentSchema);
module.exports = experimentModel;
