async function main() {
  console.log("Script loaded successfully.");
  const rankingContaniner = document.getElementById("ranking-container");
  
  async function getRankings() {
    const response = await fetch("/api/ranking");
    const data = await response.json();
    return data;
  }
  
  async function renderRankings() {
    const rankings = await getRankings();
    
    // clear previous rankings
    while (rankingContaniner.firstChild) {
      rankingContaniner.removeChild(rankingContaniner.firstChild);
    }
    
    const ranked = rankings.ranked;
    const unseen = rankings.unseen;
    
    async function renderIntoContainer(data, container) {
      for (const dino of data) {
        const dinoInfo = dino.info;
        const dinoElement = document.createElement("img");
        dinoElement.src = dinoInfo.image;
        dinoElement.alt = dinoInfo.name;
        dinoElement.className = "ranking-dino";
        
        container.appendChild(dinoElement);
      }
    }
    
    await renderIntoContainer(ranked, rankingContaniner);
  }
  
  renderRankings();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}