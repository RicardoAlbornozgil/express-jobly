"use strict";

describe("config can come from env", function () {
  beforeAll(() => {
    // Set environment variables before running tests
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "3000";
    process.env.DATABASE_URL = "postgresql:///jobly";
    process.env.NODE_ENV = "test"; // Ensure the test environment is set
  });

  afterAll(() => {
    // Clean up environment variables after tests
    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.DATABASE_URL;
    delete process.env.NODE_ENV;
  });

  test("works", function() {
    const config = require("./config");
    
    // Test that environment variables are correctly loaded
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(3000);
    expect(config.getDatabaseUri()).toEqual("postgresql:///jobly_test"); // Adjusted for test environment
    expect(config.BCRYPT_WORK_FACTOR).toEqual(1); // Adjusted for test environment
  });
});
