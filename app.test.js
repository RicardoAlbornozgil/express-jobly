const request = require("supertest");
const app = require("./app");
const db = require("./db");

// Ensure the test environment is set correctly
beforeAll(() => {
  process.env.NODE_ENV = "test";
  // Suppress console.log during tests
  console.log = jest.fn();
});

// Restore console.log and close database connection after all tests
afterAll(async () => {
  console.log = console.__proto__.log; // Restore console.log
  await db.end();
});

// Test for handling 404 errors
test("should return 404 for unknown paths", async () => {
  const response = await request(app).get("/no-such-path");
  expect(response.statusCode).toBe(404);
});

// Test for handling 404 errors with stack trace print disabled
test("should return 404 for unknown paths with stack trace suppressed", async () => {
  // Save the original NODE_ENV
  const originalNodeEnv = process.env.NODE_ENV;

  // Temporarily set NODE_ENV to an empty string to suppress stack trace in the error handler
  process.env.NODE_ENV = "";

  const response = await request(app).get("/no-such-path");
  expect(response.statusCode).toBe(404);

  // Restore the original NODE_ENV
  process.env.NODE_ENV = originalNodeEnv;
});
