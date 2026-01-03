const express = require("express");
const db = require("../config/db");
const { isLoggedIn, allowRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// show create exam form
router.get(
  "/exams/create",
  isLoggedIn,
  allowRoles("GLOBAL_ADMIN"),
  (req, res) => {
    res.render("exams/create");
  }
);

// handle exam creation
router.post(
  "/exams/create",
  isLoggedIn,
  allowRoles("GLOBAL_ADMIN"),
  async (req, res) => {
    const { title, exam_date, session } = req.body;

    await db.query(
      `INSERT INTO exams (title, exam_date, session, created_by)
       VALUES (?, ?, ?, ?)`,
      [title, exam_date, session, req.session.user.id]
    );

    res.redirect("/exams");
  }
);

// list exams
router.get(
  "/exams",
  isLoggedIn,
  allowRoles("GLOBAL_ADMIN", "LOCAL_ADMIN"),
  async (req, res) => {
    const [exams] = await db.query(
      `SELECT exams.*, users.name AS creator
       FROM exams
       JOIN users ON exams.created_by = users.id
       ORDER BY exam_date`
    );
    console.log(exams);
    res.render("exams/list", { exams });
  }
);

router.get(
  "/exams/:examId",
  isLoggedIn,
  allowRoles("GLOBAL_ADMIN", "LOCAL_ADMIN"),
  async (req, res) => {
    const { examId } = req.params;
    const role = req.session.user.role;
    const deptId = req.session.user.department_id;

    const [[exam]] = await db.query("SELECT * FROM exams WHERE id = ?", [
      examId,
    ]);

    const [departments] = await db.query("SELECT * FROM departments");

    const [examDepartments] = await db.query(
      `SELECT d.name AS department
       FROM exam_departments ed
       JOIN departments d ON ed.department_id = d.id
       WHERE ed.exam_id = ?`,
      [examId]
    );

    let examClassrooms = [];

    // 🔑 ONLY for Local Admin
    if (role === "LOCAL_ADMIN") {
      [examClassrooms] = await db.query(
        `SELECT ec.classroom_id, c.name AS classroom_name
         FROM exam_classrooms ec
         JOIN classrooms c ON ec.classroom_id = c.id
         WHERE ec.exam_id = ?
         AND ec.department_id = ?`,
        [examId, deptId]
      );
    }
    let departmentClassrooms = [];

    if (role === "LOCAL_ADMIN") {
      [departmentClassrooms] = await db.query(
        `SELECT id, name
     FROM classrooms
     WHERE department_id = ?`,
        [deptId]
      );
    }

    console.log(examClassrooms);
    res.render("exams/show", {
      exam,
      departments,
      examDepartments,
      examClassrooms,
      departmentClassrooms,
    });
  }
);

module.exports = router;
