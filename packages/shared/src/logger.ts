export type LogLevel = "info" | "warn" | "error";

export type LogFields = Record<string, unknown>;

export type Logger = {
  info: (message: string, fields?: LogFields) => void;
  warn: (message: string, fields?: LogFields) => void;
  error: (message: string, fields?: LogFields) => void;
};

function write(level: LogLevel, service: string, message: string, fields?: LogFields) {
  const entry = {
    level,
    service,
    message,
    timestamp: new Date().toISOString(),
    ...(fields ?? {}),
  };

  const serialized = JSON.stringify(entry);

  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}

export function createLogger(service: string): Logger {
  return {
    info: (message, fields) => write("info", service, message, fields),
    warn: (message, fields) => write("warn", service, message, fields),
    error: (message, fields) => write("error", service, message, fields),
  };
}
