const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Task = sequelize.define("Task", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM("todo", "in-progress", "done"), defaultValue: "todo" },
});

// A Task belongs to a User
Task.belongsTo(User, { foreignKey: "userId" });

module.exports = Task;
