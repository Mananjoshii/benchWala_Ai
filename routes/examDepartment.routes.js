const express = require("express");
const db = require("../config/db");
const { isLoggedIn, allowRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/exams/:examId/departments",
  isLoggedIn,
  allowRoles("GLOBAL_ADMIN"),
  async (req, res) => {
    const { department_id } = req.body;
    const { examId } = req.params;

    await db.query(
      `INSERT IGNORE INTO exam_departments (exam_id, department_id)
       VALUES (?, ?)`,
      [examId, department_id]
    );

    res.redirect(`/exams/${examId}`);
  }
);

module.exports = router;
