const redis = require("redis");
const keys = require("./keys.js");

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000,
});
const redisSubscriber = redisClient.duplicate();

function fib(index) {
    if (index < 2) {
        return 1;
    } else {
        return fib(index - 1) + fib(index - 2);
    }
}

redisSubscriber.on("message", (channel, message) => {
    redisClient.hset("values", message, fib(parseInt(message)));
});
redisSubscriber.subscribe("insert");
