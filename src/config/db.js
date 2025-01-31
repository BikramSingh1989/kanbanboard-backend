const { Sequelize } = require("sequelize");
require("dotenv").config();

// Use the Render PostgreSQL connection string from .env
const sequelize = new Sequelize(process.env.RENDER_DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for Render
    },
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL Connected Successfully on Render");
  } catch (error) {
    console.error("❌ PostgreSQL Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
