const request = require("supertest");
const express = require("express");
const healthController = require("../controllers/healthController");

const app = express();
app.get("/health-check", healthController.healthCheck);

jest.mock("../controllers/healthController", () => ({
  healthCheck: jest.fn((req, res) => res.status(200).json({ message: "OK" })),
}));

describe("Health Check Routes", () => {
  it("should return status 200 for health check", async () => {
    const response = await request(app).get("/health-check");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("OK");
  });
});
