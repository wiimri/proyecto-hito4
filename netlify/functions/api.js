const serverless = require("serverless-http");
const createApp = require("../../backend/src/app");

const app = createApp();
const handler = serverless(app);

exports.handler = (event, context) => {
  const functionPrefix = "/.netlify/functions/api";
  let path = event.path.replace(functionPrefix, "");

  if (!path.startsWith("/")) path = `/${path}`;
  if (!path.startsWith("/api")) path = `/api${path}`;

  return handler({ ...event, path }, context);
};
