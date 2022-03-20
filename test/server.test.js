const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

const request = supertest(app);
test("A aplicação deve responder na porta 3131", (done) => {
  request
    .get("/")
    .then((res) => {
      expect(res.statusCode).toEqual(200);
      done();
    })
    .catch((err) => done(err));
});

afterAll((done) => {
  // Closing the DB connection allows Jest to exit successfully.
  mongoose.connection.close();
  done();
});
