// should handle ranking the images based off of many users' preferences
// did not implement rankings yet

import {
  getDinos,
} from "./getDinos.js";

const ordersLocation = "backend/storage/orders.txt";
const rankingsLocation = "backend/storage/rankings.json";
const servedLocation = "backend/storage/served.json";

class Ranker {
  constructor() {
    this.ordersCache = null;
    this.rankingsCache = null;
    this.servedCache = null;
  }
  
  async init() {
    this.ordersCache = await this.readOrders();
    this.servedCache = await this.readServed();
  }

  async addOrder(order) {
    this.ordersCache.push(order);
    const str = JSON.stringify(order) + "\n";
    await Deno.writeTextFile(ordersLocation, str, { append: true });
  }

  async readOrders() {
    const rawOrders = (
      await Deno.readTextFile(ordersLocation)
    ).split("\n");
    const orders = [];
    for (const order of rawOrders) {
      if (order === "") continue;
      try {
        const parsedOrder = JSON.parse(order);
        orders.push(parsedOrder);
      } catch (error) {
        console.error("Error parsing order:", error);
      }
    }
    return orders;
  }
  
  async newServed() {
    const dinosData = await getDinos();
    if (!dinosData.success) {
      throw new Error("Failed to fetch dinos for served initialization");
    }
    const dinos = dinosData.dinos;
    const hashes = Object.keys(dinos);
    const served = {};
    for (const hash of hashes) {
      served[hash] = 0; // served zero times
    }
    return served;
  }
  
  async readServed() {
    const served = await Deno.readTextFile(servedLocation);
    if (served === "") { // create new default served file
      const defaultServed = await this.newServed()
      await this.writeToServed(defaultServed);
      return defaultServed;
    } else {
      return JSON.parse(served);
    }
  }
  
  async writeToServed(value) {
    await Deno.writeTextFile(
      servedLocation,
      JSON.stringify(value),
      { encoding: "utf-8" }
    );
  }
  
  /**
   * retrieves four dino images that have been served the least
   */
  async retrieveFour() {
    const leastServed = [];
    let leastCount = Infinity;
    const hashes = Object.keys(this.servedCache);
    for (const hash of hashes) {
      const hashCount = this.servedCache[hash];
      
      // skip hash if it has been served more than the leastCount
      if (hashCount > leastCount) continue;
      
      // if the hashCount is equal to the leastCount, add it to the leastServed array
      if (hashCount === leastCount) {
        leastServed.push(hash);
        continue;
      }
      
      // if the hashCount is less than the leastCount, clear the array and add the hash
      if (hashCount < leastCount) {
        
        leastServed.push(hash);
        leastCount = hashCount;
      }
    }
    
    // if there are less than 4 hashes, add random ones until there are 4
    if (leastServed.length < 4) {
      while (leastServed.length < 4) {
        const randomHash = hashes[Math.floor(Math.random() * hashes.length)];
        
        // check if the random hash is already in the leastServed array
        if (!leastServed.includes(randomHash)) {
          leastServed.push(randomHash);
        }
      }
    }
    
    // choose 4 random hashes from the array
    const selectedHashes = [];
    while (selectedHashes.length < 4) {
      const randomIndex = Math.floor(Math.random() * leastServed.length);
      const randomHash = leastServed[randomIndex];
      
      // check if the hash is already in the selectedHashes array
      if (!selectedHashes.includes(randomHash)) {
        selectedHashes.push(randomHash);
      }
    }
    
    // make the format nicer for the actual frontend
    const returnData = {
      order: selectedHashes,
      data: {},
    };
    const dinosData = await getDinos();
    const dinos = dinosData.dinos;
    for (const hash of selectedHashes) {
      returnData.data[hash] = dinos[hash];
    }
    
    return returnData;
  }
}

const ranker = new Ranker();

export {
  ranker,
};