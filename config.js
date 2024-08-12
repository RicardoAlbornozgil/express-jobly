"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = parseInt(process.env.PORT, 10) || 3000;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "postgresql:///jobly_test"
    : process.env.DATABASE_URL || "postgresql:///jobly";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

// Only log configuration details in non-production environments
if (process.env.NODE_ENV !== "production") {
  console.log("Jobly Config:".green);
  console.log("SECRET_KEY:".yellow, SECRET_KEY);
  console.log("PORT:".yellow, PORT);
  console.log("BCRYPT_WORK_FACTOR:".yellow, BCRYPT_WORK_FACTOR);
  console.log("Database:".yellow, getDatabaseUri());
  console.log("---");
}

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
