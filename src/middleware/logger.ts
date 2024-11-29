import { Context } from "../framework/types.ts";

export const logger = () => {
  return async (
    type: string,
    error: Error,
    c: Context,
    next: () => Promise<Response>,
  ) => {
    const start = performance.now();
    const response = await next();
    const duration = Math.round(performance.now() - start);

    let method = type;
    const url = c.url.pathname;
    const status = response.status;

    const methodColor = getColor(method);
    const statusColor = getStatusColor(status);

    console.log(
      `%c${method}%c %c${url}%c - %c${status}%c (${duration}ms) ${error}`,
      methodColor,
      "color: #9e9e9e",
      "color: #1e88e5",
      "color: #9e9e9e",
      statusColor,
      "color: #9e9e9e",
    );

    return response;
  };
};

function getColor(method: string) {
  switch (method) {
    case "SUCCESS":
      return "color: #4caf50";

    case "ERROR":
      return "color: #e53935";
    default:
      return "color: #9e9e9e";
  }
}

function getStatusColor(status: number) {
  if (status >= 200 && status < 300) {
    return "color: #4caf50";
  } else if (status >= 300 && status < 400) {
    return "color: #2196f3";
  } else if (status >= 400 && status < 500) {
    return "color: #e53935";
  } else {
    return "color: #e53935";
  }
}
