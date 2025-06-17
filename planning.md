# Orpheus Planning

## User Experience
The user should be shown two options; a leaderboard for which artwork is best, and a voting or decision machine that helps contribute to how good something is.

### Leaderboard
The leaderboard should order all of the artworks from best to worst in a grid so that many artworks could be contained.

### Voting
The voting method is simple. The user is presented 4 images, and is asked to order them from worst to best. After they submit the ordering, they will be continuously presented with more random selections of images. Over time, with many users, there should gradually develop an ordering of images based on how good they are.

Each image will be shrinked to have a square aspect ratio. If the image is clicked on in a particular way, it should put it into full screen and allow for the user to truly admire its beauty. On PC, they can order the images by using the keyboard buttons 1 through 4, by clicking each of the images in order normally, or by dragging the image. On mobile, the images can be ordered through clicking or by dragging.

Perhaps, to view the image, the image could be dragged to a box where it will then be shown in full screen.

## Algorithmic Specifics
The algorithm should somehow rank each image based off of the orderings provided. The presentation of orderings should not affect the final outcome.

In a perfect scenario, after four images are presented, given names $d_1$ through $d_4$, an ordering of four different images should result in an equation $d_1 > d_2 > d_3 > d_4$. Given these equations, it should be possible to determine the ordering of all the images given enough orderings.

However, people have different preferences, and even the same person may forget and order it differently. To account for this, the algorithm should be more approximate in terms of its decisions. Generally, given four images, the ordering should be $d_1 \gtrapprox d_2 \gtrapprox d_3 \gtrapprox d_4$.

### Method 1
One method to create a hierarchical order from these orderings would be to track the average position of every image relative to each other. For example, if an image $d_n$ has relative orderings $[4, 3, 3, 4, 4, 2, 3, 4]$, its score will be $\frac{4 + 3 + 3 + 4 + 4 + 2 + 3 + 4}{8}$, or an average placement of $3.375$. All the images' average position is then ranked and determines its position on the leaderboard.

This method, however, requires a lot of voting and rating to work. There may also be images which are only voted a very low number of times and wouldn't have an accurate score.

### Method 2
Another method to create a hierarchical order from these orderings would be to track the position of images relative to each other.