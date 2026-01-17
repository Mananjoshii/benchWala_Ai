const {
  getExamHall,
  getSeatLocation,
  getExamSchedule
} = require("../routes/aiStudent.routes");

async function handleIntent({ intent, confidence, subjects, user }) {

  if (confidence < 0.7) {
    return "Sorry, I couldn't understand your request.";
  }

  if (!user) {
    return `<b>Please login to view your exam details.</b>`;
  }

  switch (intent) {

    case "get_exam_schedule":
      return await getExamSchedule(user.id);

    case "get_exam_hall":
      if (!subjects || !subjects.length) {
        return "<b>Please specify the subject code.</b>";
      }
      return await getExamHall(user.id, subjects[0]);

    case "get_seat_location":
      if (!subjects || !subjects.length) {
        return "<b>Please specify the subject code.</b>";
      }
      return await getSeatLocation(user.id, subjects[0]);

    default:
      return "Sorry, I couldn't understand your request.";
  }
}

module.exports = { handleIntent };
