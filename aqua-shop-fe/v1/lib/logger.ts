type LogLevel = "debug" | "info" | "warn" | "error";

function log(level: LogLevel, message: string, ...args: unknown[]) {
  if (process.env.NODE_ENV === "production" && level === "debug") {
    return;
  }

  console[level === "debug" ? "log" : level](`[AquaShop:${level}]`, message, ...args);
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => log("debug", message, ...args),
  info: (message: string, ...args: unknown[]) => log("info", message, ...args),
  warn: (message: string, ...args: unknown[]) => log("warn", message, ...args),
  error: (message: string, ...args: unknown[]) => log("error", message, ...args),
};
