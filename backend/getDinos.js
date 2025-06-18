/**
 * https://api.github.com/repos/hackclub/dinosaurs/contents/
 * this is where all the dino images are stored
 */

/**
 * fetches list of dinos from the GitHub repository
 */
async function getDinosFetch() {
  // note: there is probably a better way to do so it but at the moment im just doing it like this because it's easy
  // const response = await fetch("https://api.github.com/repos/hackclub/dinosaurs/contents/");
  
  const response = await fetch("https://api.github.com/repos/hackclub/dinosaurs/git/trees/main");
  if (!response.ok) {
    return {
      success: false,
      error: `Failed to fetch dinos: ${response.status} ${response.statusText}`
    };
  }
  
  const data = await response.json();
  const tree = data.tree;
  const dinos = {};
  for (const file of tree) {
    if (file.path === ".gitignore") continue; // skip .gitignore file
    if (file.path === "README.md") continue; // skip README file
    if (file.path === "CNAME") continue; // skip CNAME file
    if (file.path === "svg") continue; // skip svg directory
    if (file.path === "LICENSE") continue; // skip LICENSE file
    if (file.path === "MAINTAINERS.md") continue; // skip MAINTAINERS file
    dinos[file.sha] = {
      name: file.path,
      image: `https://raw.githubusercontent.com/hackclub/dinosaurs/main/${file.path}`,
    };
  }
  
  const svgResponse = await fetch("https://api.github.com/repos/hackclub/dinosaurs/git/trees/67a02673eeb1407a09a4ff57efbc641c0a56f07b");
  if (!svgResponse.ok) {
    return {
      success: false,
      error: `Failed to fetch SVG dinos: ${svgResponse.status} ${svgResponse.statusText}`
    };
  }
  
  const svgData = await svgResponse.json();
  const svgTree = svgData.tree;
  for (const file of svgTree) {
    dinos[file.sha] = {
      name: file.path,
      image: `https://raw.githubusercontent.com/hackclub/dinosaurs/83058f0954dd232d7fdc4b87079ee1dde3105539/svg/${file.path}`,
    };
  }
  
  return {
    success: true,
    dinos: dinos,
  };
}

/**
 * gets dinos from cache or fetches them if cache is expired
 * @param {string|null} mode
 */
async function getDinos(mode=null) {
  // check cache expiry
  try {
    if (mode === null) {
      const expiry = await Deno.readTextFile("backend/storage/expiry.txt");
      const currentTime = Date.now();
      if (currentTime > parseInt(expiry)) {
        mode = "fetch"; // cache expired, fetch new data
      }
    }
  } catch (error) {
    mode = "fetch";
  }
  
  if (mode === "fetch") {
    console.log("Cache expired, fetching new dinos...");
    const result = await getDinosFetch();
    
    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }
    
    // save to cache
    await Deno.writeTextFile(
      "backend/storage/expiry.txt",
      String(Date.now() + 24 * 60 * 60 * 1000), // cache for 24 hours
      { encoding: "utf-8" }
    );
    await Deno.writeTextFile(
      "backend/storage/dinos.json",
      JSON.stringify(result.dinos),
      { encoding: "utf-8" }
    );
    
    return result;
  }
  
  // get from cache
  try {
    console.log("Fetching dinos from cache...");
    const cachedDinos = await Deno.readTextFile("backend/storage/dinos.json");
    const dinos = JSON.parse(cachedDinos);
    return {
      success: true,
      dinos: dinos
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export {
  getDinos,
};