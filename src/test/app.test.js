const request = require("supertest");
const mongoose = require("mongoose");
const { app, server } = require("../app");
const fs = require("fs");
const Fingerprint = mongoose.model("Fingerprint");

let connection;
beforeAll(async () => {
  const url = "mongodb://127.0.0.1:27017/testDB";
  if (!connection) {
    connection = await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
  }
});

afterAll(async () => {
  if (connection) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (server) {
    server.close();
  }
});



describe("POST /fingerprints", () => {
  it("should save a new fingerprint", async () => {
    const response = await request(app)
      .post("/fingerprints")
      .send({ fingerprintHash: "testhash", fingerprint: "testfingerprint" });

    expect(response.status).toBe(200);
    expect(response.text).toBe("Fingerprint saved successfully");
  });

  it("should return 400 if fingerprint is missing", async () => {
    const response = await request(app)
      .post("/fingerprints")
      .send({ fingerprintHash: "testhash" });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Missing fingerprint");
  });

  it("should return 400 if canvases array is full", async () => {
    const fingerprintHash = "fullhash";
    const fingerprint = "testfingerprint";

    // Fill the canvases array
    for (let i = 0; i < 1900; i++) {
      await request(app)
        .post("/fingerprints")
        .send({ fingerprintHash, fingerprint });
    }

    const response = await request(app)
      .post("/fingerprints")
      .send({ fingerprintHash, fingerprint });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Canvases array is full");
  });
});

describe("GET /get-username", () => {
  it("should return the username for a given fingerprintHash", async () => {
    const fingerprintHash = "testhash";
    const username = "testuser";

    // Create a fingerprint record
    await new Fingerprint({ fingerprintHash, username }).save();

    const response = await request(app)
      .get("/get-username")
      .query({ fingerprintHash });

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(username);
  });

  it("should return 400 if fingerprintHash is missing", async () => {
    const response = await request(app)
      .get("/get-username")
      .query({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("FingerprintHash is required");
  });

  it("should return 500 if fingerprintHash is not found", async () => {
    const response = await request(app)
      .get("/get-username")
      .query({ fingerprintHash: "nonexistenthash" });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Fingerprint not found");
  });
});

describe("POST /create-model", () => {
  it("should create a new model if it does not exist", async () => {
    const username = "newuser";
    const response = await request(app)
      .post("/create-model")
      .send({ username });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should return 400 if the model already exists", async () => {
    const username = "existinguser";

    // Simuliere, dass das Modell bereits existiert
    await fs.promises.writeFile(`src/SWAT_auth/models/${username}_fingerprint_model.h5`, "");

    const response = await request(app)
      .post("/create-model")
      .send({ username });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Model already exists");

    // Entferne die simulierte Modell-Datei
    await fs.promises.unlink(`src/SWAT_auth/models/${username}_fingerprint_model.h5`);
  });
});
