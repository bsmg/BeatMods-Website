import * as fs from "fs";
import { ClientOpts } from "redis";

const secret = "shared-secret";
let publicKey: Buffer | null = null;
let privateKey: Buffer | null = null;
try {
    publicKey = fs.readFileSync(`${__dirname}/../environment/jwt.key.pub`);
    privateKey = fs.readFileSync(`${__dirname}/../environment/jwt.key`);
} catch (ex) {
    console.warn("No environment jwt signing key found.");
}

const config = {
    env: process.env.NODE_ENV || "development",
    https: true,
    domain: "localhost",
    port: 4000,
    jwt: {
        alg: privateKey ? "RS256" : "HS256",
        publicKey: publicKey || secret,
        privateKey: privateKey || secret
    },
    mongo: {
        uri: "mongodb://localhost:27017/beatsaver"
    },
    discord: {
        webhook_url: []
    },
    redis: <ClientOpts>{
        host: "localhost",
        port: 6379,
        enable_offline_queue: false,
        retry_strategy: options => Math.min(options.attempt * 100, 3000)
    },
    logging: {
        logRestarts: false,
        console: {
            level: "debug"
        },
        mongo: {
            level: "",
            uri: "mongodb://localhost:27017/beatsaver",
            collection: "log"
        },
        file: {
            level: "",
            dirname: "./logs",
            filename: "application-%DATE%.log",
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true
        },
        email: {
            level: "",
            to: "dev@vanzeben.ca"
        }
    }
};

export default config;
