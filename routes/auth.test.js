"use strict";

const request = require("supertest");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

// Setup and teardown hooks
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/token **************************************/

describe("POST /auth/token", function () {
  test("should return token with valid credentials", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
        password: "password1",
      });
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("should return 401 for non-existent user", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "no-such-user",
        password: "password1",
      });
    expect(resp.statusCode).toBe(401);
    expect(resp.body).toEqual({
      error: "Unauthorized",
    });
  });

  test("should return 401 for incorrect password", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
        password: "wrongpassword",
      });
    expect(resp.statusCode).toBe(401);
    expect(resp.body).toEqual({
      error: "Unauthorized",
    });
  });

  test("should return 400 for missing password", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
      });
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toEqual({
      error: "Bad Request: Missing password",
    });
  });

  test("should return 400 for invalid username type", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: 42,
        password: "password",
      });
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toEqual({
      error: "Bad Request: Invalid username",
    });
  });
});

/************************************** POST /auth/register **************************************/

describe("POST /auth/register", function () {
  test("should register new users successfully", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "newuser",
        firstName: "First",
        lastName: "Last",
        password: "newpassword",
        email: "newuser@email.com",
      });
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("should return 400 for missing fields", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "newuser",
      });
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toEqual({
      error: "Bad Request: Missing fields",
    });
  });

  test("should return 400 for invalid email format", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "newuser",
        firstName: "First",
        lastName: "Last",
        password: "newpassword",
        email: "invalid-email",
      });
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toEqual({
      error: "Bad Request: Invalid email format",
    });
  });
});
