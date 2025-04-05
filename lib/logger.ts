import winston from "winston";

const { combine, timestamp, json, errors } = winston.format;

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({
      level:
        process.env.LOG_LEVEL ||
        (process.env.NODE_ENV === "production" ? "info" : "debug"),
      format: combine(errors({ stack: true }), timestamp(), json()),
    }),
  ],
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

export default logger;
