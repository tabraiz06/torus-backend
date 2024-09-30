const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  getAssignTasks,
  generateSummary,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").get(protect, getTasks).post(protect, createTask);
router.route("/assign").get(protect, getAssignTasks);
router.route("/summary").get(protect, generateSummary);


router.route("/:id").put(protect, updateTask).delete(protect, deleteTask).patch(protect,assignTask);

module.exports = router;
