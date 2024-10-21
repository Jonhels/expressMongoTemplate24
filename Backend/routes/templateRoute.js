const express = require("express");
const {templatePost, getAllTemplateData} = require("../controllers/templateController");

const router = express.Router();

router.post("/template", templatePost);
router.get("/template", getAllTemplateData);

module.exports = router;