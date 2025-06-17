function makeVotingMenu() {
  const votingContainer = document.createElement('div');
  votingContainer.className = "voting-container";
  
  const votingMenu = document.createElement('div');
  votingMenu.className = "voting-menu";
  
  const title = document.createElement('h2');
  title.className = "centered-text";
  title.textContent = "Rank the Art!";
  
  votingMenu.appendChild(title);
  votingContainer.appendChild(votingMenu);
  document.body.appendChild(votingContainer);
}

function main() {
  console.log("Script loaded successfully.");
  makeVotingMenu();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}