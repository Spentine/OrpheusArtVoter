/*

Code courtesy of Anagh Phanse
Modified by LLMs for improved performance and clarity

*/

class PowerRanker {
  constructor(rankings = []) {
    this.rankings = [];
    this.items = [];
    this.index = {};
    this.W = [];
    this.P = [];
    this._stationary = [];
    if (rankings.length) {
      this.addRankings(rankings);
    }
  }

  // Add new rankings; each ranking is an array of items in order
  addRankings(newRankings) {
    // Aggregate all unique items
    const allItems = new Set(this.items);
    for (const ranking of newRankings) {
      for (const item of ranking) allItems.add(item);
    }
    const newItems = Array.from(allItems).sort();
    const oldN = this.items.length;
    const n = newItems.length;
    const oldIndex = { ...this.index };
    const itemsChanged = n !== oldN;

    // Update items and index mapping
    this.items = newItems;
    this.index = {};
    this.items.forEach((item, i) => (this.index[item] = i));

    // Expand W if new items introduced, preserving existing counts
    if (itemsChanged) {
      const newW = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) =>
          (this.W?.[oldIndex[this.items[i]]] ?? [])[oldIndex[this.items[j]]] ?? 0
        )
      );
      this.W = newW;
      this.P = []; // Invalidate P, will be rebuilt
    }

    // Add new results to win matrix
    for (const ranking of newRankings) {
      for (let i = 0; i < ranking.length; i++) {
        for (let j = i + 1; j < ranking.length; j++) {
          const winner = ranking[i], loser = ranking[j];
          this.W[this.index[winner]][this.index[loser]] += 1;
        }
      }
    }
    this.rankings.push(...newRankings);
    this.P = []; // Invalidate P

    // Expand the cached stationary vector if needed
    if (itemsChanged && this._stationary.length) {
      // Pad with uniform probability for new items
      const oldStationary = this._stationary;
      const oldMap = {};
      for (let i = 0; i < oldN; ++i) {
        oldMap[this.items[i]] = oldStationary[i] || 0;
      }
      // Assign previous value if present, else uniform
      const uniform = 1 / n;
      this._stationary = this.items.map(
        item => oldMap[item] !== undefined ? oldMap[item] : uniform
      );
      // Re-normalize
      const sum = this._stationary.reduce((a, b) => a + b, 0);
      this._stationary = this._stationary.map(x => x / sum);
    }
    // Otherwise, keep old stationary as power iteration will use it as initial guess
  }

  // Build transition probability matrix P from W
  buildTransitionMatrix() {
    const n = this.items.length;
    const W = this.W;
    const P = Array.from({ length: n }, () => Array(n).fill(0));
    // Build P using win matrix W
    for (let i = 0; i < n; i++) {
      let rowSum = W[i].reduce((a, b) => a + b, 0);
      let colSum = 0;
      for (let r = 0; r < n; r++) colSum += W[r][i];
      const total = rowSum + colSum;
      if (total > 0) {
        for (let j = 0; j < n; j++) {
          if (i !== j) P[j][i] = W[i][j] / total;
        }
      }
    }
    // Normalize columns or fill with uniform if column sums to 0
    for (let i = 0; i < n; i++) {
      const colSum = P.reduce((sum, row) => sum + row[i], 0);
      if (colSum > 0) {
        for (let j = 0; j < n; j++) P[j][i] /= colSum;
      } else {
        for (let j = 0; j < n; j++) P[j][i] = 1 / n;
      }
    }
    this.P = P;
    return P;
  }

  // Power iteration for stationary distribution (accepts initial guess)
  static powerIteration(matrix, bInit = null, maxIter = 1000, tol = 1e-9) {
    const n = matrix.length;
    let b = Array.isArray(bInit) && bInit.length === n
      ? [...bInit]
      : new Array(n).fill(1 / n);
    for (let iter = 0; iter < maxIter; iter++) {
      let bNext = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          bNext[i] += matrix[i][j] * b[j];
        }
      }
      const norm = bNext.reduce((a, v) => a + v, 0);
      for (let i = 0; i < n; i++) bNext[i] /= norm;
      let diff = 0;
      for (let i = 0; i < n; i++) diff += Math.abs(bNext[i] - b[i]);
      if (diff < tol) {
        b = bNext;
        break;
      }
      b = bNext;
    }
    return b;
  }

  // Get the stationary distribution and sorted ranking
  getRanking() {
    const P = this.P.length ? this.P : this.buildTransitionMatrix();
    // Use cached stationary as initial guess if available
    const initVec = (
      Array.isArray(this._stationary) &&
      this._stationary.length === this.items.length
    )
      ? this._stationary
      : null;
    const stationary = PowerRanker.powerIteration(P, initVec);
    this._stationary = stationary;
    const ranking = this.items
      .map((item, i) => [item, stationary[i]])
      .sort((a, b) => a[1] - b[1]);
    return {
      stationary,
      ranking, // array of [item, value] pairs, lowest value first
    };
  }
}

export {
  PowerRanker,
};