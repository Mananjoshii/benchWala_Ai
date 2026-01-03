const express = require("express");
const db = require("../config/db");
const { isLoggedIn, allowRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/exams/:examId/classrooms",
  isLoggedIn,
  allowRoles("LOCAL_ADMIN"),
  async (req, res) => {
    const { classroom_id } = req.body;
    const { examId } = req.params;
    const deptId = req.session.user.department_id;

    // 1. Check department is part of exam
    const [[deptAllowed]] = await db.query(
      `SELECT 1 FROM exam_departments
       WHERE exam_id = ? AND department_id = ?`,
      [examId, deptId]
    );

    if (!deptAllowed) {
      return res.status(403).send("Department not assigned to this exam");
    }

    // 2. Verify classroom belongs to department
    const [[classroom]] = await db.query(
      `SELECT 1 FROM classrooms
       WHERE id = ? AND department_id = ?`,
      [classroom_id, deptId]
    );

    if (!classroom) {
      return res.status(400).send("Invalid classroom for your department");
    }

    // 3. Insert mapping
    await db.query(
      `INSERT INTO exam_classrooms (exam_id, department_id, classroom_id)
       VALUES (?, ?, ?)`,
      [examId, deptId, classroom_id]
    );

    res.redirect(`/exams/${examId}`);
  }
);

router.post(
  "/exams/:examId/classrooms/:classroomId/freeze",
  isLoggedIn,
  allowRoles("LOCAL_ADMIN"),
  async (req, res) => {
    const { examId, classroomId } = req.params;
    const deptId = req.session.user.department_id;

    const [result] = await db.query(
      `UPDATE exam_classrooms
       SET seats_frozen = TRUE
       WHERE exam_id = ?
       AND classroom_id = ?
       AND department_id = ?`,
      [examId, classroomId, deptId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).send("Invalid classroom or exam mapping");
    }

    res.redirect(`/exams/${examId}`);
  }
);

module.exports = router;
