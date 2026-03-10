import morgan from "morgan";

// ANSI colour codes - no external dependencies needed
const c = {
  reset: "\x1b[0m",
  gray:  "\x1b[90m",
  white: "\x1b[37m",
  green: "\x1b[32m",
  yellow:"\x1b[33m",
  blue:  "\x1b[34m",
  cyan:  "\x1b[36m",
  red:   "\x1b[31m",
  bold:  "\x1b[1m",
};

function methodColor(method: string | undefined): string {
  switch (method) {
    case "GET":    return c.green;
    case "POST":   return c.yellow;
    case "PUT":
    case "PATCH":  return c.blue;
    case "DELETE": return c.red;
    default:       return c.white;
  }
}

function statusColor(status: string | undefined): string {
  const code = Number(status ?? 500);
  if (code >= 500) return c.red;
  if (code >= 400) return c.yellow;
  if (code >= 300) return c.cyan;
  return c.green;
}

export const requestLogger = morgan((tokens, req, res) => {
  const method  = tokens.method(req, res) ?? "-";
  const url     = tokens.url(req, res) ?? "-";
  const status  = tokens.status(req, res) ?? "???";
  const time    = tokens["response-time"](req, res) ?? "-";
  const ts      = new Date().toISOString();

  return [
    `${c.gray}${ts}${c.reset}`,
    `${methodColor(method)}${c.bold}[${method}]${c.reset}`,
    `${c.white}${url}${c.reset}`,
    `${statusColor(status)}${c.bold}${status}${c.reset}`,
    `${c.gray}${time} ms${c.reset}`,
  ].join("  ");
});

// Utility for structured error logging – call this in catch blocks
export function logError(context: string, error: unknown): void {
  const ts = new Date().toISOString();
  console.error(
    `${c.red}${c.bold}[ERROR]${c.reset} ${c.gray}${ts}${c.reset} ${c.red}${context}${c.reset}`,
    error
  );
}
