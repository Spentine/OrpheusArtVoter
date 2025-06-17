import mime from "npm:mime-types";

async function retrieveFile(path) {
  try {
    const file = await Deno.readFile(path);
    return {
      success: true,
      file: file,
    };
  } catch (error) {
    return {
      success: false,
      error: error
    };
  }
}

function generateValidPath(path) {
  if (!path.includes(".")) path += ".html";
  if (path === "/.html") return "frontend/index.html";
  path = "frontend" + path;
  return path;
}

async function handleFrontend(_req) {
  const url = new URL(_req.url);
  const path = url.pathname;
  
  const validPath = generateValidPath(path);
  const retrievedFile = await retrieveFile(validPath);
  if (retrievedFile.success) {
    const file = retrievedFile.file;
    const decoder = new TextDecoder();
    const data = decoder.decode(file);
    
    const contentType = mime.lookup(validPath);
    
    return new Response(data, {
      status: 200,
      headers: {
        "content-type": contentType || "text/plain",
      },
    });
  }
  
  const file = await retrieveFile(generateValidPath("/404.html"));
  const decoder = new TextDecoder();
  const data = decoder.decode(file.file);
  return new Response(data, {
    status: 404,
    headers: {
      "content-type": "text/html",
    },
  });
}

export {
  retrieveFile,
  generateValidPath,
  handleFrontend,
};