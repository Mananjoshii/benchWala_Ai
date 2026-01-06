const express = require("express");
const db = require("../config/db");

const router = express.Router();

// About page
router.get("/about", (req, res) => {
  res.render("about");
});

// Contact page
router.get("/contact", async (req, res) => {
  const [[admin]] = await db.query(
    `SELECT email FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE r.name = 'GLOBAL_ADMIN'
     LIMIT 1`
  );

  res.render("contact", {
    adminEmail: admin?.email || "admin@college.edu",
  });
});

module.exports = router;
