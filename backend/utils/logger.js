import winston from "winston";
import { ElasticsearchTransport } from "winston-elasticsearch";
import { Client } from "@elastic/elasticsearch";
import ecsFormat from "@elastic/ecs-winston-format";

import dotenv from "dotenv";
dotenv.config();

const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const esTransport = new ElasticsearchTransport({
  level: "info",
  client: elasticClient,
  indexPrefix: "winston-logs",
});
esTransport.on("error", (err) => {
  console.error("Elasticsearch transport error [tasks]:", err);
});

const esAuthTransport = new ElasticsearchTransport({
  level: "info",
  client: elasticClient,
  indexPrefix: "winston-logs-auth",
});
esAuthTransport.on("error", (err) => {
  console.error("Elasticsearch transport error [auth]:", err);
});

const esUserTransport = new ElasticsearchTransport({
  level: "info",
  client: elasticClient,
  indexPrefix: "winston-logs-users",
});
esUserTransport.on("error", (err) => {
  console.error("Elasticsearch transport error [users]:", err);
});

const esTMorAdminTransport = new ElasticsearchTransport({
  level: "info",
  client: elasticClient,
  indexPrefix: "winston-logs-tmadmin",
});
esUserTransport.on("error", (err) => {
  console.error("Elasticsearch transport error [tmadmin]:", err);
});

const esNotifTransport = new ElasticsearchTransport({
  level: "info",
  client: elasticClient,
  indexPrefix: "winston-logs-notifs",
});
esUserTransport.on("error", (err) => {
  console.error("Elasticsearch transport error [notifs]:", err);
});

const logger = winston.createLogger({
  level: "info",
  format: ecsFormat(),
  transports: [new winston.transports.Console(), esTransport],
});

const userLogger = winston.createLogger({
  level: "info",
  format: ecsFormat(),
  transports: [new winston.transports.Console(), esUserTransport],
});

const authLogger = winston.createLogger({
  level: "info",
  format: ecsFormat(),
  transports: [new winston.transports.Console(), esAuthTransport],
});

const tmadminLogger = winston.createLogger({
  level: "info",
  format: ecsFormat(),
  transports: [new winston.transports.Console(), esTMorAdminTransport],
});

const notifsLogger = winston.createLogger({
  level: "info",
  format: ecsFormat(),
  transports: [new winston.transports.Console(), esNotifTransport],
});

export { logger, userLogger, authLogger, tmadminLogger, notifsLogger };
