const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

const controller = require("../controllers/masterData.controller");

router.get("/", verifyToken, controller.getAllMasterData);

router.get("/categories", verifyToken, controller.getOnlyCategories);

router.get("/category/:category", verifyToken, controller.getMasterDataByCategory);

router.get("/:id", verifyToken, controller.getMasterDataById);

module.exports = router;