const Task = require("../models/Task");



// GET all task by admin /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedUser");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//  GET /api/users/tasks
const getAssignTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ createdBy: req.user }, { assignedUser: req.user }],
    })
      .populate("assignedUser", "name email")
      .populate("createdBy", "name email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//  POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, status, priority, assignedUser } =
      req.body;
    const task = await Task.create({
      title,
      description,
      dueDate,
      status,
      priority,
      assignedUser,
      createdBy: req.user,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task ) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//  DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task ) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @route patch /api/tasks/:id
const assignTask = async (req, res) => {
  const { assignedUser } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedUser },
      {
        new: true,
      }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// // Generate summary report of tasks based on filters
const generateSummary = async (req, res) => {
  try {
   
    const { status, userId, startDate, endDate } = req.query;

    
    const query = {};

   
    if (status) {
      query.status = status;
    }

   
    if (userId) {
      query.$or = [{ createdBy: req.user }, { assignedUser: req.user }];
    }

   
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }


    const tasks = await Task.find(query)
      .populate("createdBy", "name email")
      .populate("assignedUser", "name email");

   
    const report = tasks.map((task) => ({
      title: task.title,
      description: task.description,
      status: task.status,
      assignedTo: task.assignedUser ? task.assignedUser.name : "N/A",
      createdBy: task.createdBy ? task.createdBy.name : "N/A",
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
    }));

    
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  getAssignTasks,
  generateSummary,
};
