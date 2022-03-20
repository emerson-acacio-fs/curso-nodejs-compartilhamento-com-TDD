const { v4: uuidv4 } = require("uuid");
const app = require("../src/app");
const mongoose = require("mongoose");
const supertest = require("supertest");
const request = supertest(app);

const mainUser = {
  name: "1111111111111111111",
  email: "111111111111@gmail.com",
  password: "123456",
};

beforeAll(async (done) => {
  try {
    await request.post("/user").send(mainUser);
  } catch (err) {
    console.log(err);
  }
  done();
});

describe("Cadastro de usuários", () => {
  test("Deve cadastrar um usuário", async (done) => {
    const email = `${uuidv4()}@gmail.com`;
    const user = {
      name: "victor",
      email,
      password: "123456",
    };
    try {
      const res = await request.post("/user").send(user);

      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toEqual(email);
      done();
    } catch (err) {
      done(err);
    }
  });
  test("Impedir o usuário de cadastrar email repetido", async (done) => {
    const email = `${uuidv4()}@gmail.com`;
    const user = {
      name: "victor",
      email,
      password: "123456",
    };
    try {
      const res = await request.post("/user").send(user);

      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toEqual(email);

      const res2 = await request.post("/user").send(user);

      expect(res2.statusCode).toEqual(400);
      expect(res2.body.err).toEqual("E-mail já cadastrado");

      done();
    } catch (err) {
      done(err);
    }
  });
  test("Impedir que o usuário se cadastre com o dado vazio", (done) => {
    const user = {
      name: "",
      email: "",
      password: "",
    };
    request
      .post("/user")
      .send(user)
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe("Autenticação", () => {
  test("Deve retornar um token quando logar", async (done) => {
    try {
      const res = await request
        .post("/auth")
        .send({ email: mainUser.email, password: mainUser.password });

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
      done();
    } catch (err) {
      done(err);
    }
  });
  test("Deve impedir que o usuário não cadastrado se logue ", async (done) => {
    try {
      const res = await request.post("/auth").send({
        email: "asssaaaaaaaaaaaaaaaaaaaa",
        password: "sssssssssaaasssssssddddd",
      });

      expect(res.statusCode).toEqual(403);
      expect(res.body.errors.email).toEqual("E-mail não cadastrado");
      done();
    } catch (err) {
      done(err);
    }
  });
  test("Deve impedir que o usuário se logue com uma senha errada", async (done) => {
    try {
      const res = await request.post("/auth").send({
        email: mainUser.email,
        password: "sssssssssaaasssssssddddd",
      });

      expect(res.statusCode).toEqual(403);
      expect(res.body.errors.password).toEqual("Senha inválida");
      done();
    } catch (err) {
      done(err);
    }
  });
});

afterAll(async (done) => {
  try {
    await request.delete(`/user/${mainUser.email}`);

    // Closing the DB connection allows Jest to exit successfully.
    mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
  done();
});
