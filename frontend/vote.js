function makeVotingMenu() {
  const votingContainer = document.createElement("div");
  votingContainer.className = "voting-container";
  
  const votingMenu = document.createElement("div");
  votingMenu.className = "voting-menu";
  
  // title for voting menu
  const title = document.createElement("h2");
  title.className = "centered-text";
  title.textContent = "Rank the Art!";
  
  // image holder for presenting menu
  const imageHolder = document.createElement("div");
  imageHolder.className = "image-holder";
  
  // image holder for ranking menu
  const rankingHolder = document.createElement("div");
  rankingHolder.className = "image-holder";
  
  // create image containers
  const imageContainers = [];
  const rankingContainers = [];
  for (let i = 0; i < 4; i++) {
    const imageContainer = document.createElement("div");
    imageContainer.className = "image-container";
    imageContainers.push(imageContainer);
    imageHolder.appendChild(imageContainer);
    
    const rankingItem = document.createElement("div");
    rankingItem.className = "image-container";
    
    // image storage
    const rankingContainer = document.createElement("div");
    rankingContainers.push(rankingContainer);
    
    // background
    const backgroundRanking = document.createElement("div");
    backgroundRanking.className = "background-ranking";
    
    const backgroundRankHashtag = document.createElement("p");
    backgroundRankHashtag.className = "background-rank-hashtag";
    backgroundRankHashtag.innerText = "#";
    backgroundRanking.appendChild(backgroundRankHashtag);
    
    const backgroundRank = document.createElement("p");
    backgroundRank.className = "background-rank";
    backgroundRank.innerText = `${i + 1}`;
    backgroundRanking.appendChild(backgroundRank);
    
    rankingItem.appendChild(backgroundRanking);
    rankingItem.appendChild(rankingContainer);
    rankingHolder.appendChild(rankingItem);
  }
  
  const aboutText = document.createElement("p");
  aboutText.className = "centered-text";
  aboutText.textContent = "Drag the images to rank them. Better images go left.";
  
  const submitButtonContainer = document.createElement("div");
  submitButtonContainer.className = "center-inside";
  
  const submitButton = document.createElement("button");
  submitButton.className = "submit-button";
  submitButton.textContent = "Submit Ranking";
  submitButton.disabled = true;
  
  submitButtonContainer.appendChild(submitButton);
  
  votingMenu.appendChild(title);
  votingMenu.appendChild(imageHolder);
  votingMenu.appendChild(aboutText);
  votingMenu.appendChild(rankingHolder);
  votingMenu.appendChild(submitButtonContainer);
  
  votingContainer.appendChild(votingMenu);
  document.body.appendChild(votingContainer);
  
  // load a new set of images
  const newImages = async function() {
    // get the dino set from the API
    const response = await fetch("/api/dinos/set");
    const dinosData = await response.json();
    const order = dinosData.order;
    const dinos = dinosData.data;
    const images = [];
    const imageLocations = [];
    
    submitButton.disabled = true;
  
    function addInteractivity(image, index) {
      // make the image draggable
      function mouseDown(event, type) {
        // cancel default behavior
        event.preventDefault();
        
        let pos;
        if (type === "click") {
          pos = event;
        } else if (type === "touch") {
          pos = event.touches[0];
        }
        
        // get relative position of the mouse
        const bounds = image.getBoundingClientRect();
        const offsetX = pos.clientX - bounds.left;
        const offsetY = pos.clientY - bounds.top;
        
        // mouse move event to drag the image
        function onMouseMove(moveEvent) {
          let pos;
          if (type === "click") {
            pos = moveEvent;
          } else if (type === "touch") {
            pos = moveEvent.touches[0];
          }
          
          image.classList.add("dragged-image");
          image.style.left = `${pos.clientX - offsetX}px`;
          image.style.top = `${pos.clientY - offsetY}px`;
        }
        if (type === "click") {
          document.addEventListener("mousemove", onMouseMove);
        } else if (type === "touch") {
          document.addEventListener("touchmove", onMouseMove);
        }
        
        // mouse up event to drop the image
        function onMouseUp(event) {
          event.preventDefault();
          
          const newBounds = image.getBoundingClientRect();
          const center = {
            x: newBounds.left + newBounds.width / 2,
            y: newBounds.top + newBounds.height / 2,
          };
          
          function getClosestContainer(containers) {
            let closestDistance = Infinity;
            let closestIndex = -1;
            for (let i = 0; i < containers.length; i++) {
              const containerBounds = containers[i].getBoundingClientRect();
              const containerCenter = {
                x: containerBounds.left + containerBounds.width / 2,
                y: containerBounds.top + containerBounds.height / 2,
              };
              
              const distance = Math.max(Math.abs(center.x - containerCenter.x), Math.abs(center.y - containerCenter.y));
              
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
            return {
              distance: closestDistance,
              index: closestIndex,
            };
          }
          
          const rankingClosest = getClosestContainer(rankingContainers);
          const imageClosest = getClosestContainer(imageContainers);
          
          // check if the closest container is a ranking container or an image container
          let closest = null;
          if (rankingClosest.distance < imageClosest.distance) {
            closest = {
              type: "ranking",
              index: rankingClosest,
            }
          } else {
            closest = {
              type: "image",
              index: imageClosest,
            }
          }
          
          const maxDist = 256; // maximum distance to consider a valid drop
          
          const newImageLocation = {
            type: closest.type,
            index: closest.index.index,
          };
          const previousLocation = imageLocations[index];
          
          if (closest.index.distance < maxDist) {
            if (closest.type === "ranking") {
              const rankingContainer = rankingContainers[closest.index.index];
              rankingContainer.appendChild(image);
            } else {
              const imageContainer = imageContainers[closest.index.index];
              imageContainer.appendChild(image);
            }
            imageLocations[index] = newImageLocation;
          }
          
          // check if there are any other images in the same container
          for (let i=0; i<imageLocations.length; i++) {
            const loc = imageLocations[i];
            if (
              loc.type === newImageLocation.type && 
              loc.index === newImageLocation.index && 
              i !== index
            ) {
              // swap images
              const otherImage = images[i];
              imageLocations[i] = previousLocation;
              if (previousLocation.type === "ranking") {
                rankingContainers[previousLocation.index].appendChild(otherImage);
              } else {
                imageContainers[previousLocation.index].appendChild(otherImage);
              }
              break;
            }
          }
          
          image.style.left = "0px";
          image.style.top = "0px";
          image.classList.remove("dragged-image");
          if (type === "click") {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          } else if (type === "touch") {
            document.removeEventListener("touchmove", onMouseMove);
            document.removeEventListener("touchend", onMouseUp);
          }
          
          updateFinishStatus();
        }
        if (type === "click") {
          document.addEventListener("mouseup", onMouseUp);
        } else if (type === "touch") {
          document.addEventListener("touchend", onMouseUp);
        }
      }
      image.addEventListener("mousedown", (e) => (mouseDown(e, "click")));
      image.addEventListener("touchstart", (e) => (mouseDown(e, "touch")));
    }
    
    /**
     * check if all the images are ranked
     */
    function updateFinishStatus() {
      const finished = imageLocations.every(image => image.type === "ranking");
      submitButton.disabled = !finished;
    }
    
    for (let i = 0; i < imageContainers.length; i++) {
      const imageContainer = imageContainers[i];
      const rankingContainer = rankingContainers[i];
      
      // clear the image containers
      while (imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild);
      }
      while (rankingContainer.firstChild) {
        rankingContainer.removeChild(rankingContainer.firstChild);
      }
      
      // create a new image element
      const image = document.createElement("img");
      image.className = "voting-image";
      image.src = dinos[order[i]].image;
      
      imageContainer.appendChild(image);
      images.push(image);
      imageLocations.push({
        type: "image",
        index: i,
      });
      addInteractivity(image, i);
    }
    
    // submit button click event
    async function submitRanking() {
      // get the keys of the images in the ranking containers
      const rankingData = [null, null, null, null];
      for (let i=0; i<imageLocations.length; i++) {
        const index = imageLocations[i].index;
        rankingData[index] = order[i];
      }
      
      // POST request with information
      const req = fetch("/api/dinos/submit", {
        method: "POST",
        body: JSON.stringify(rankingData),
        headers: {
          "Content-type": "application/json",
        },
      });
      console.log("Submitted Request", req);
      
      // remove event listener
      submitButton.removeEventListener("click", submitRanking);
      
      // more images
      newImages();
    }
    submitButton.addEventListener("click", submitRanking);
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}