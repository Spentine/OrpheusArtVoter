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

/* taken from stackoverflow to get ip address */
function assertIsNetAddr (addr) {
  if (!['tcp', 'udp'].includes(addr.transport)) {
    throw new Error('Not a network address');
  }
}

function getRemoteAddress (connInfo) {
  assertIsNetAddr(connInfo.remoteAddr);
  return connInfo.remoteAddr;
}
/* stackoverflow end */

async function handler(_req, connInfo) {
  const {hostname, port} = getRemoteAddress(connInfo);
  
  const url = new URL(_req.url);
  const path = url.pathname;
  const pathType = getPathType(path);
  console.log(path);
  
  if (pathType === "frontend") {
    return handleFrontend(_req, hostname);
  } else if (pathType === "api") {
    return handleApi(_req, hostname);
  }
}

Deno.serve({
  port: 8200,
}, handler);