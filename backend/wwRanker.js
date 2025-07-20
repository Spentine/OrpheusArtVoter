// web worker ranker

import {
  PowerRanker,
} from "./powerRanker.js";

self.onmessage = async (event) => {
  const { type, data } = event.data;

  if (type === "generateRankings") {
    // data.orders is an array of orders with rankings
    const orders = data.orders;
    const processedOrders = [];
    for (const order of orders) {
      processedOrders.push(order.ranking);
    }
    const ranker = new PowerRanker(processedOrders);
    const ranking = ranker.getRanking();
    self.postMessage({ type: "rankingsGenerated", data: ranking });
  }
};