const db = require("../config/db");

async function getExamHall(studentId, subjectCode) {
  const [rows] = await db.execute(`
    SELECT
      e.title,
      c.name AS classroom,
      c.floor,
      b.bench_number
    FROM exam_seats es
    JOIN exams e ON es.exam_id = e.id
    JOIN classrooms c ON es.classroom_id = c.id
    JOIN benches b ON es.bench_id = b.id
    WHERE es.student_id = ?
      AND e.title = ?
  `, [studentId, subjectCode]);

  if (!rows.length) return "<b>No exam hall found.</b>";

  const r = rows[0];
  return `
    <h4>📍 Exam Hall</h4>
    <b>Exam:</b> ${r.title}<br>
    <b>Classroom:</b> ${r.classroom}<br>
    <b>Bench:</b> ${r.bench_number}
  `;
}

async function getSeatLocation(studentId, subjectCode) {
  const [rows] = await db.execute(`
    SELECT b.bench_number
    FROM exam_seats es
    JOIN exams e ON es.exam_id = e.id
    JOIN benches b ON es.bench_id = b.id
    WHERE es.student_id = ?
      AND e.title = ?
  `, [studentId, subjectCode]);

  if (!rows.length) return "<b>No seat allocation found.</b>";

  return `
    <h4>🪑 Seat Location</h4>
    Bench Number: <b>${rows[0].bench_number}</b>
  `;
}

async function getExamSchedule(studentId) {
  const [rows] = await db.execute(`
    SELECT title, exam_date, session
    FROM exams e
    JOIN exam_seats es ON e.id = es.exam_id
    WHERE es.student_id = ?
    ORDER BY exam_date
  `, [studentId]);

  if (!rows.length) return "<b>No exams found.</b>";

  let html = "<h4>🗓 Exam Schedule</h4><ul>";
  rows.forEach(r => {
    html += `<li>${r.title} – ${r.exam_date} (${r.session})</li>`;
  });
  html += "</ul>";

  return html;
}

module.exports = {
  getExamHall,
  getSeatLocation,
  getExamSchedule
};
