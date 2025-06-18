import {
  getDinos
} from "./getDinos.js";
import {
  ranker
} from "./ranker.js";

async function handleApi(_req, hostname) {
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
  } if (path === "/api/dinos/set") {
    const four = await ranker.retrieveFour();
    
    return new Response(JSON.stringify(four), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  } if (path === "/api/dinos/submit") {
    const rankingData = await _req.json();
    
    // verification
    const dinosData = await getDinos();
    const dinos = dinosData.dinos;
    for (const dino of rankingData) {
      if (dinos[dino] === undefined) {
        return new Response("Invalid dino hash: " + dino, {
          status: 400,
          headers: {
            "content-type": "text/plain",
          },
        });
      }
    }
    
    const fullData = {
      hostname: hostname,
      ranking: rankingData,
      timestamp: Date.now(),
    };
    
    await ranker.addOrder(fullData);
    
    for (const dino of rankingData) {
      ranker.servedCache[dino] += 1; // increment served count
    }
    
    await ranker.writeToServed(ranker.servedCache);
    
    return new Response("OK, i think", {
      status: 200,
      headers: {
        "content-type": "text/plain",
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

async function testRanker() {
  await ranker.init();
}

testRanker();

export {
  handleApi,
};