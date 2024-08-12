"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");

/**
 * Executes before running all tests:
 * - Clears existing data from the database.
 * - Inserts test companies and users.
 */
async function commonBeforeAll() {
  try {
    // Clear existing data
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");

    // Insert test companies
    await Company.create({
      handle: "c1",
      name: "C1",
      numEmployees: 1,
      description: "Desc1",
      logoUrl: "http://c1.img",
    });
    await Company.create({
      handle: "c2",
      name: "C2",
      numEmployees: 2,
      description: "Desc2",
      logoUrl: "http://c2.img",
    });
    await Company.create({
      handle: "c3",
      name: "C3",
      numEmployees: 3,
      description: "Desc3",
      logoUrl: "http://c3.img",
    });

    // Insert test users
    await User.register({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "user1@user.com",
      password: "password1",
      isAdmin: false,
    });
    await User.register({
      username: "u2",
      firstName: "U2F",
      lastName: "U2L",
      email: "user2@user.com",
      password: "password2",
      isAdmin: false,
    });
    await User.register({
      username: "u3",
      firstName: "U3F",
      lastName: "U3L",
      email: "user3@user.com",
      password: "password3",
      isAdmin: false,
    });
  } catch (err) {
    console.error("Error in commonBeforeAll:", err);
    throw err; // Re-throw to ensure tests fail if setup fails
  }
}

/**
 * Executes before each test:
 * - Starts a new transaction.
 */
async function commonBeforeEach() {
  try {
    await db.query("BEGIN");
  } catch (err) {
    console.error("Error in commonBeforeEach:", err);
    throw err; // Re-throw to ensure tests fail if setup fails
  }
}

/**
 * Executes after each test:
 * - Rolls back the current transaction.
 */
async function commonAfterEach() {
  try {
    await db.query("ROLLBACK");
  } catch (err) {
    console.error("Error in commonAfterEach:", err);
    throw err; // Re-throw to ensure tests fail if teardown fails
  }
}

/**
 * Executes after all tests:
 * - Closes the database connection.
 */
async function commonAfterAll() {
  try {
    await db.end();
  } catch (err) {
    console.error("Error in commonAfterAll:", err);
    throw err; // Re-throw to ensure proper cleanup
  }
}

// Generate token for user u1
const u1Token = createToken({ username: "u1", isAdmin: false });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
};
