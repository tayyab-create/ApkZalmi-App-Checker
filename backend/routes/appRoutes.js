const express = require("express");
const router = express.Router();
const appController = require("../controllers/appController");

// More specific routes should be defined first
router.get("/fetch", appController.fetchApps);
router.get("/check-updates", appController.checkUpdates);
router.get("/check-update/:id", appController.checkUpdateForApp);
router.delete("/delete", appController.deleteAllApps);
router.delete("/delete/:id", appController.deleteApp);

// Dynamic route should be defined last
router.get("/", appController.getAllApps);
router.get("/:id", appController.getAppById);

// New routes for counting apps
router.get("/count/total", appController.countTotalApps);
router.get("/count/updated", appController.countUpdatedApps);
router.get("/count/need-update", appController.countNeedUpdateApps);

module.exports = router;
