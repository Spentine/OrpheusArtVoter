import {
  handleFrontend,
} from "./frontendHandler.js";
import {
  handleApi,
} from "./api.js";
import mime from "npm:mime-types";

function getPathType(path) {
  if (path.startsWith("/api/")) {
    return "api";
  } else {
    return "frontend";
  }
}

async function handler(_req) {
  const url = new URL(_req.url);
  const path = url.pathname;
  const pathType = getPathType(path);
  console.log(path);
  
  if (pathType === "frontend") {
    return handleFrontend(_req);
  } else if (pathType === "api") {
    return handleApi(_req);
  }
}

Deno.serve({
  port: 8200,
}, handler);