function makeVotingMenu() {
  const votingContainer = document.createElement('div');
  votingContainer.className = "voting-container";
  
  const votingMenu = document.createElement('div');
  votingMenu.className = "voting-menu";
  
  // title for voting menu
  const title = document.createElement('h2');
  title.className = "centered-text";
  title.textContent = "Rank the Art!";
  
  // image holder for voting menu
  const imageHolder = document.createElement('div');
  imageHolder.className = "image-holder";
  
  // create image containers
  const imageContainers = [];
  for (let i = 0; i < 4; i++) {
    const imageContainer = document.createElement('div');
    imageContainer.className = "image-container";
    imageContainers.push(imageContainer);
    imageHolder.appendChild(imageContainer);
  }
  
  votingMenu.appendChild(title);
  votingMenu.appendChild(imageHolder);
  
  votingContainer.appendChild(votingMenu);
  document.body.appendChild(votingContainer);
  
  // load a new set of images
  const newImages = async function() {
    // get the dino set from the API
    const response = await fetch("/api/dinos/set");
    const dinosData = await response.json();
    const order = dinosData.order;
    const dinos = dinosData.data;
    
    for (let i = 0; i < imageContainers.length; i++) {
      const imageContainer = imageContainers[i];
      // clear the image container
      while (imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild);
      }
      
      // create a new image element
      const image = document.createElement('img');
      image.className = "voting-image";
      image.src = dinos[order[i]].image;
      
      imageContainer.appendChild(image);
    }
  }
  
  return {
    newImages: newImages,
  };
}

function main() {
  console.log("Script loaded successfully.");
  const votingMenu = makeVotingMenu();
  votingMenu.newImages();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}