// should handle ranking the images based off of many users' preferences\

import {
  getDinos,
} from "./getDinos.js";
import {
  PowerRanker,
} from "./powerRanker.js";

const ordersLocation = "backend/storage/orders.txt";
const rankingsLocation = "backend/storage/rankings.json";
const servedLocation = "backend/storage/served.json";
const rankerExpiryLocation = "backend/storage/rankerExpiry.txt";

class Ranker {
  constructor() {
    this.ordersCache = null;
    this.rankingsCache = null;
    this.servedCache = null;
    this.rankerAlg = null;
    this.unseenOrders = [];
  }
  
  async init() {
    this.ordersCache = await this.readOrders();
    this.servedCache = await this.readServed();
    // this.inferServed();
    this.rankingsCache = await this.retrieveRankings(); // my naming scheme is messed up
    this.generateRankings(this.ordersCache);
  }

  async addOrder(order) {
    this.ordersCache.push(order);
    const str = JSON.stringify(order) + "\n";
    await Deno.writeTextFile(ordersLocation, str, { append: true });
    this.unseenOrders.push(order);
    
    const ranking = order.ranking;
    for (const hash of ranking) {
      this.servedCache[hash] += 1; // increment served count
    }
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
  
  async inferServed() {
    this.servedCache = await this.newServed();
    for (const order in this.ordersCache) {
      const ranking = this.ordersCache[order].ranking;
      for (const dino of ranking) {
        this.servedCache[dino] += 1;
      }
    }
    return this.servedCache;
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
    let candidates = [];
    let leastCount = Infinity;
    const hashes = Object.keys(this.servedCache);
    for (const hash of hashes) {
      const hashCount = this.servedCache[hash];
      
      // skip hash if it has been served more than the leastCount
      if (hashCount > leastCount) continue;
      
      // if the hashCount is equal to the leastCount, add it to the candidates array
      if (hashCount === leastCount) {
        candidates.push(hash);
        continue;
      }
      
      // if the hashCount is less than the leastCount, clear the array and add the hash
      if (hashCount < leastCount) {
        candidates.length = 0; // clear the array
        candidates.push(hash);
        leastCount = hashCount;
      }
    }
    
    if (leastCount > 0) {
      // try to retrieve images close to each other on the leaderboard
      const orderedHashes = this.rankingsCache.ranked;
      const orderedCandidates = orderedHashes.filter(hash => candidates.includes(hash));
      if (orderedCandidates.length >= 4) {
        const randomIndex = Math.floor(Math.random() * (orderedCandidates.length - 3));
        candidates = orderedCandidates.slice(randomIndex, 4);
      } else {
        candidates = orderedCandidates; // fallback to whatever we have
      }
    }
    
    // if there are less than 4 hashes, add random ones until there are 4
    if (candidates.length < 4) {
      while (candidates.length < 4) {
        const randomHash = hashes[Math.floor(Math.random() * hashes.length)];
        
        // check if the random hash is already in the candidates array
        if (!candidates.includes(randomHash)) {
          candidates.push(randomHash);
        }
      }
    }
    
    const selectedHashes = [];
    // choose 4 random hashes from the array
    while (selectedHashes.length < 4) {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const randomHash = candidates[randomIndex];
      
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
  
  async generateEmptyRankings() {
    const data = {
      ranked: [],
      unseen: [],
    };
    const dinosData = await getDinos();
    const dinos = dinosData.dinos;
    const hashes = Object.keys(dinos);
    for (const hash of hashes) {
      data.unseen.push(hash); // all hashes are unseen
    }
    const str = JSON.stringify(data);
    await Deno.writeTextFile(rankingsLocation, str);
    this.rankingsCache = data;
  }
  
  async retrieveRankings() {
    const rawRankings = await Deno.readTextFile(rankingsLocation);
    if (rawRankings === "") {
      await this.generateEmptyRankings();
      return this.rankingsCache;
    } else {
      const parsedRankings = JSON.parse(rawRankings);
      this.rankingsCache = parsedRankings;
      return parsedRankings;
    }
  }
  
  async generateRankings(orders) {
    const processedOrders = [];
    for (const order of orders) {
      processedOrders.push(order.ranking);
    }
    
    this.rankerAlg = new PowerRanker(processedOrders);
    this.updateRankings();
  }
  
  async addOrders(orders) {
    const processedOrders = [];
    for (const order of orders) {
      processedOrders.push(order.ranking);
    }
    
    this.rankerAlg.addRankings(processedOrders);
    this.updateRankings();
  }
  
  async addUnseenOrders(force=false) {
    if (this.unseenOrders.length === 0) return false; // no unseen orders to add
    if (!force) {
      // check expiry
      const expired = await this.checkRankingExpired();
      if (!expired) return false;
    }
    await this.addOrders(this.unseenOrders);
    this.unseenOrders = [];
    return true;
  }
  
  async checkRankingExpired() {
    const expiry = Number(await Deno.readTextFile(rankerExpiryLocation));
    const now = Date.now();
    return (expiry < now || expiry !== "") 
  }
  
  async updateRankings(force=false) {
    if (!force) {
      // check expiry
      const expired = await this.checkRankingExpired();
      if (!expired) return false;
    };
    
    const rankingPairs = this.rankerAlg.getRanking().ranking;
    const ranking = rankingPairs.map(pair => pair[0]);
    const seen = new Set(ranking);
    
    const unseen = [];
    const dinosData = await getDinos();
    const dinos = dinosData.dinos;
    const hashes = Object.keys(dinos);
    for (const hash of hashes) {
      if (!seen.has(hash)) {
        unseen.push(hash);
      }
    }
    
    const data = {
      ranked: ranking,
      unseen: unseen,
    };
    
    this.rankingsCache = data;
    const str = JSON.stringify(data);
    await Deno.writeTextFile(rankingsLocation, str);
    
    // update expiry
    const expiryTime = Date.now() + 30 * 60 * 1000; // 30 minutes
    await Deno.writeTextFile(rankerExpiryLocation, expiryTime.toString());
    return true;
  }
  
  async frontendRanking() {
    const frontendData = {
      ranked: [],
      unseen: [],
    };
    
    const dinosData = await getDinos();
    const dinos = dinosData.dinos;
    
    function toFrontendFormat(arr, frontend) {
      for (const hash of arr) {
        frontend.push({
          hash: hash,
          info: dinos[hash],
        });
      }
    }
    
    toFrontendFormat(this.rankingsCache.ranked, frontendData.ranked);
    toFrontendFormat(this.rankingsCache.unseen, frontendData.unseen);
    
    return frontendData;
  }
}

const ranker = new Ranker();

export {  
  ranker,
};