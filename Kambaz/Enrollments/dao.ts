import { v4 as uuidv4 } from "uuid";
export default function EnrollmentsDao(db) {
  function isUserEnrolledInCourse(userId, courseId) {
    return db.enrollments.some(
      (enrollment) => enrollment.user === userId && enrollment.course === courseId,
    );
  }
  function enrollUserInCourse(userId, courseId) {
    if (isUserEnrolledInCourse(userId, courseId)) return;
    const { enrollments } = db;
    enrollments.push({ _id: uuidv4(), user: userId, course: courseId });
  }
  function unenrollUserFromCourse(userId, courseId) {
    db.enrollments = db.enrollments.filter(
      (enrollment) => !(enrollment.user === userId && enrollment.course === courseId),
    );
  }
  function findUsersForCourse(courseId) {
    return db.users.filter((user) => isUserEnrolledInCourse(user._id, courseId));
  }
  return { enrollUserInCourse, unenrollUserFromCourse, findUsersForCourse };
}
