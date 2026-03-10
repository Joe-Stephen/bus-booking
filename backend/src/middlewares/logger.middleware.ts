import morgan from "morgan";
import chalk from "chalk";

// Define a custom morgan token for colorized output
export const requestLogger = morgan((tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res) || "500";
  const responseTime = tokens["response-time"](req, res);
  
  // Format the status code with appropriate colors
  let statusColor = chalk.green;
  if (Number(status) >= 500) statusColor = chalk.red;
  else if (Number(status) >= 400) statusColor = chalk.yellow;
  else if (Number(status) >= 300) statusColor = chalk.cyan;

  // Format the HTTP method
  let methodColor = chalk.blue;
  if (method === "GET") methodColor = chalk.green;
  else if (method === "POST") methodColor = chalk.yellow;
  else if (method === "PUT" || method === "PATCH") methodColor = chalk.blue;
  else if (method === "DELETE") methodColor = chalk.red;

  return [
    chalk.gray(new Date().toISOString()),
    methodColor.bold(`[${method}]`),
    chalk.white(url),
    statusColor.bold(status),
    chalk.gray(`${responseTime} ms`)
  ].join(" ");
});
