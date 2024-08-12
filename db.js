"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri()
  });
}

db.connect(err => {
  if (err) {
    console.error("Failed to connect to the database", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

module.exports = db;
