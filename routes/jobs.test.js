"use strict";

process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

const { authenticateJWT, adminToken, u1Token, u2Token } = require("./testRoutes");

let testJobIds = [];

// Helper function to create a job
async function createJob() {
  const result = await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('Test Job', 50000, '0.1', 'c1')
    RETURNING id`
  );
  return result.rows[0].id;
}

beforeEach(async function () {
  await db.query("DELETE FROM jobs");
  const jobId = await createJob();
  testJobIds.push(jobId);
});

afterEach(async function () {
  await db.query("DELETE FROM jobs");
});

afterAll(async function () {
  await db.end();
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("works for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Test Job",
          salary: 50000,
          equity: "0.1",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("fails gracefully when jobs table is missing", async function () {
    await db.query("DROP TABLE IF EXISTS jobs");
    const resp = await request(app).get("/jobs");
    expect(resp.statusCode).toEqual(500);
    await db.query(`
      CREATE TABLE jobs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        salary INTEGER NOT NULL,
        equity TEXT NOT NULL,
        company_handle TEXT NOT NULL REFERENCES companies(handle)
      )
    `);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "Test Job",
        salary: 50000,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found for invalid job ID", async function () {
    const resp = await request(app).get(`/jobs/invalid-id`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({ title: "Updated Job Title" })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "Updated Job Title",
        salary: 50000,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({ title: "Updated Job Title" })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({ title: "New Title" })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({ salary: "invalid-salary" })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid ID", async function () {
    const resp = await request(app)
        .patch(`/jobs/invalid-id`)
        .send({ title: "New Title" })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${testJobIds[0]}` });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid ID", async function () {
    const resp = await request(app)
        .delete(`/jobs/invalid-id`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});
