import {
  getDinos
} from "./getDinos.js";

async function handleApi(_req) {
  const url = new URL(_req.url);
  const path = url.pathname;
  
  // get dinos
  if (path === "/api/dinos") {
    const dinosData = await getDinos();
    
    // error handling
    if (!dinosData.success) {
      return new Response(dinosData.error, {
        status: 500,
        headers: {
          "content-type": "text/plain",
        },
      });
    }
    
    return new Response(JSON.stringify(dinosData.dinos), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  }
  
  return new Response("404", {
    status: 404,
    headers: {
      "content-type": "text/plain",
    },
  });
}

export {
  handleApi,
};