process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

const { authenticateJWT, adminToken, u1Token, u2Token } = require("./testRoutes");

let testJobIds = [];

beforeEach(async function () {
  await db.query("DELETE FROM jobs");

  const result = await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('J1', 40000, '0', 'c1')
    RETURNING id`
  );
  testJobIds.push(result.rows[0].id);
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
          title: "J1",
          salary: 40000,
          equity: "0",
          companyHandle: "c1",
        },
      ],
    });
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "J1",
        salary: 40000,
        equity: "0",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "New Title",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "New Title",
        salary: 40000,
        equity: "0",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "New Title",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "New Title",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          salary: "not-a-number",
        })
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
});
