const mongoose = require("mongoose");

const AppSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  apkZalmiVersion: { type: String, required: true },
  googlePlayVersion: { type: String, required: true },
  status: { type: String, required: true },
  googleUpdateDate: { type: Date, required: true },
  postUrl: { type: String, required: true }, // Added postUrl field
  postName: { type: String, required: true }, // Added postName field
  publishDate: { type: Date, required: true }, // Added publishDate field
});

module.exports = mongoose.model("App", AppSchema);
