const { format } = require("date-fns");
const App = require("./models/App");
const gplay = import("google-play-scraper");

const extractAppInfo = (title) => {
  const versionPattern = /(?:v?)(\d+\.\d+(\.\d+)?)/;
  const versionMatch = title.match(versionPattern);
  const version = versionMatch ? versionMatch[1] : "unknown";
  const name = title.replace(versionPattern, "").split("MOD APK")[0].trim();
  return { name, version };
};

const needsUpdate = (
  googlePlayVersion,
  apkZalmiVersion,
  googleUpdateDate,
  publishDate
) => {
  return (
    googlePlayVersion !== apkZalmiVersion &&
    new Date(googleUpdateDate) > new Date(publishDate)
  );
};

const formatDate = (date) => format(new Date(date), "MMM dd, yyyy");

const getGoogleAppDetails = async (name) => {
  const googleApp = await (await gplay).default.search({ term: name, num: 1 });
  return googleApp[0]
    ? await (await gplay).default.app({ appId: googleApp[0].appId })
    : null;
};

const updateAppDetails = async (app, googleAppDetails) => {
  const status = needsUpdate(
    googleAppDetails.version,
    app.apkZalmiVersion,
    googleAppDetails.updated,
    app.publishDate
  )
    ? "Need Update"
    : "Updated";

  if (
    status !== app.status ||
    googleAppDetails.version !== app.googlePlayVersion
  ) {
    await App.findByIdAndUpdate(app._id, {
      googlePlayVersion: googleAppDetails.version,
      status,
      googleUpdateDate: googleAppDetails.updated,
    });
    return {
      name: app.name,
      googlePlayVersion: googleAppDetails.version,
      apkZalmiVersion: app.apkZalmiVersion,
      status,
    };
  }
  return null;
};

module.exports = {
  getGoogleAppDetails,
  updateAppDetails,
  extractAppInfo,
  needsUpdate,
  formatDate,
};
