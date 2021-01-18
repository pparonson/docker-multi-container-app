const redis = require("redis");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const keys = require("./keys.js");
const { Pool } = require("pg");

/* express app setup */
const PORT = 5000;
const app = express();
app.use(cors());
app.use(bodyParser.json());

/* postgres client setup */
const pgClient = new Pool({
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDatabase,
    user: keys.pgUser,
    password: keys.pgPassword,
});

pgClient.on("connect", () => {
    pgClient
        .query("CREATE TABLE IF NOT EXISTS values (number INT)")
        .catch((err) => console.log(err));
});

/* redis client setup */
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

/* express routes */
app.get("/", (req, res) => res.send("Hello World!"));
app.get("/values/all", async (req, res) => {
    const values = await pgClient.query("SELECT * FROM values");
    res.send(values.rows);
});
app.get("/values/current", async () => {
    /* using callback because redis does not have out-of-box async support */
    redisClient.hgetall("values", (error, values) => res.send(values));
});
app.post("/values", (req, res) => {
    const index = req.body.index;
    if (parseInt(index) > 40) {
        return res.status(422).send("Index too large");
    }
    redisClient.hset("values", index, "values not set");
    redisPublisher.publish("insert", index);
    pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

    res.send({ working: true });
});

app.listen(PORT, (err) => {
    err
        ? console.log(`Error: ${err}`)
        : console.log(`app is listening on port: ${PORT}`);
});
