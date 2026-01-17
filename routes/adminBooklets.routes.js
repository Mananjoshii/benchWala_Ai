const express = require("express");
const db = require("../config/db");
const { isLoggedIn, allowRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/admin/exams/:examId/booklets",
  isLoggedIn,
  allowRoles("GLOBAL_ADMIN"),
  async (req, res) => {
    const { examId } = req.params;

    const [rows] = await db.query(
      `SELECT 
     c.name AS classroom,
     SUM(eb.received_count) AS received_count,
     COUNT(ea.id) AS present_students,
     (COUNT(ea.id) - SUM(eb.received_count)) AS shortage
   FROM exam_booklets eb
   JOIN classrooms c ON eb.classroom_id = c.id
   JOIN exam_attendance ea
     ON ea.exam_id = eb.exam_id
    AND ea.classroom_id = eb.classroom_id
    AND ea.status = 'PRESENT'
   WHERE eb.exam_id = ?
   GROUP BY c.id, c.name`,
      [examId]
    );

    res.render("admin/booklets", { rows });
  }
);

module.exports = router;
