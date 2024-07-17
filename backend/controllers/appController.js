const WPAPI = require("wpapi");
const App = require("../models/App");
const wp = new WPAPI({ endpoint: "https://apkzalmi.net/wp-json" });
const {
  getGoogleAppDetails,
  updateAppDetails,
  extractAppInfo,
  needsUpdate,
  formatDate,
} = require("../helpers");

const handleError = (res, err, message) => {
  console.error(err);
  res.status(500).json({ message, error: err.message });
};

exports.getAppById = async (req, res) => {
  try {
    const appId = req.params.id;
    const app = await App.findById(appId);
    if (!app) return res.status(404).json({ message: "App not found" });
    res.status(200).json({ message: "App fetched successfully", app });
  } catch (err) {
    handleError(res, err, "Error fetching the app");
  }
};

exports.getAllApps = async (req, res) => {
  try {
    const apps = await App.find();
    res.status(200).json({ message: "All apps fetched", apps });
  } catch (err) {
    handleError(res, err, "Error fetching apps");
  }
};

exports.fetchApps = async (req, res) => {
  try {
    await App.deleteMany();
    console.log("All apps deleted before fetching new data");

    const gplay = await import("google-play-scraper");
    const perPage = 100;
    const posts = [];
    let page = 1,
      fetchedPosts;

    do {
      fetchedPosts = await wp.posts().perPage(perPage).page(page).get();
      posts.push(...fetchedPosts);
      page++;
    } while (fetchedPosts.length === perPage);

    const apps = await Promise.all(
      posts.map(async (post) => {
        const { name, version } = extractAppInfo(post.title.rendered);
        console.log(`Fetched from WordPress: ${name} - ${version}`);

        const googleApp = await gplay.default.search({ term: name, num: 1 });
        const googleAppDetails = googleApp[0]
          ? await gplay.default.app({ appId: googleApp[0].appId })
          : null;

        if (googleAppDetails) {
          const publishDate = formatDate(post.date);
          const status = needsUpdate(
            googleAppDetails.version,
            version,
            googleAppDetails.updated,
            post.date
          )
            ? "Need Update"
            : "Updated";

          return {
            name: googleAppDetails.title,
            url: googleAppDetails.url,
            apkZalmiVersion: version,
            googlePlayVersion: googleAppDetails.version,
            status,
            googleUpdateDate: googleAppDetails.updated,
            postUrl: post.link,
            postName: post.title.rendered,
            publishDate,
          };
        }
      })
    );

    await App.insertMany(apps.filter((app) => app));
    res
      .status(200)
      .json({ message: "Apps fetched and saved to database", apps });
  } catch (err) {
    handleError(res, err, "Error fetching apps");
  }
};

exports.checkUpdates = async (req, res) => {
  try {
    const apps = await App.find();
    const updates = await Promise.all(
      apps.map(async (app) => {
        const googleAppDetails = await getGoogleAppDetails(app.name);
        return googleAppDetails
          ? updateAppDetails(app, googleAppDetails)
          : null;
      })
    );
    res.status(200).json({
      message: "App updates checked",
      updates: updates.filter((update) => update),
    });
  } catch (err) {
    handleError(res, err, "Error checking updates");
  }
};

exports.deleteAllApps = async (req, res) => {
  try {
    await App.deleteMany();
    res.status(200).json({ message: "All apps deleted" });
  } catch (err) {
    handleError(res, err, "Error deleting apps");
  }
};

exports.deleteApp = async (req, res) => {
  try {
    const { id } = req.params;
    await App.findByIdAndDelete(id);
    res.status(200).json({ message: "App deleted" });
  } catch (err) {
    handleError(res, err, "Error deleting app");
  }
};

exports.checkUpdateForApp = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await App.findById(id);
    if (!app) return res.status(404).json({ message: "App not found" });

    const googleAppDetails = await getGoogleAppDetails(app.name);
    if (googleAppDetails) {
      const update = await updateAppDetails(app, googleAppDetails);
      res
        .status(200)
        .json({ message: "App update checked", app: update || app });
    } else {
      res.status(404).json({ message: "App not found on Google Play" });
    }
  } catch (err) {
    handleError(res, err, "Error checking app update");
  }
};

exports.countTotalApps = async (req, res) => {
  try {
    const totalApps = await App.countDocuments();
    res.status(200).json({ message: "Total apps counted", totalApps });
  } catch (err) {
    handleError(res, err, "Error counting total apps");
  }
};

exports.countUpdatedApps = async (req, res) => {
  try {
    const updatedApps = await App.countDocuments({ status: "Updated" });
    res.status(200).json({ message: "Updated apps counted", updatedApps });
  } catch (err) {
    handleError(res, err, "Error counting updated apps");
  }
};

exports.countNeedUpdateApps = async (req, res) => {
  try {
    const needUpdateApps = await App.countDocuments({ status: "Need Update" });
    res
      .status(200)
      .json({ message: "Apps needing update counted", needUpdateApps });
  } catch (err) {
    handleError(res, err, "Error counting apps needing update");
  }
};
