// Grid variables
const ROWS = 20;
const COLS = 20;
let grid = [];

// Start and goal variables
let startCell = null;
let goalCell = null;

// Flags
let isGeneratingObstacles = false;
let isPathGenerated = false;

// Create grid
function createGrid() {
  const container = document.getElementById('gridContainer');
  container.innerHTML = '';

  grid = [];

  for (let row = 0; row < ROWS; row++) {
    const rowElement = document.createElement('div');
    rowElement.className = 'row';

    let rowArray = [];

    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('mouseover', handleCellHover);
      cell.addEventListener('click', handleCellClick);
      rowElement.appendChild(cell);
      rowArray.push(cell);
    }

    container.appendChild(rowElement);
    grid.push(rowArray);
  }
}

// Randomize obstacles
function randomizeObstacles() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid[row][col];

      if (cell !== startCell && cell !== goalCell) {
        const shouldObstacle = Math.random() < 0.3;
        cell.classList.toggle('obstacle', shouldObstacle);
      }
    }
  }
}

// Clear obstacles, path, and start/end points
function refreshGrid() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid[row][col];
      cell.classList.remove('obstacle', 'path', 'start', 'goal');
    }
  }

  startCell = null;
  goalCell = null;
  isPathGenerated = false;
}

// Generate path using A* algorithm
function generatePath() {
  if (!startCell || !goalCell) {
    console.log('Please set the starting and goal points.');
    return;
  }

  const openSet = [];
  const closedSet = [];
  let pathFound = false;

  openSet.push(startCell);

  while (openSet.length > 0) {
    let winner = 0;

    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }

    const current = openSet[winner];

    if (current === goalCell) {
      pathFound = true;
      break;
    }

    openSet.splice(winner, 1);
    closedSet.push(current);

    const neighbors = getNeighbors(current);

    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];

      if (!closedSet.includes(neighbor) && !neighbor.classList.contains('obstacle')) {
        const tempG = current.g + 1;

        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
          }
        } else {
          neighbor.g = tempG;
          openSet.push(neighbor);
        }

        neighbor.h = heuristic(neighbor, goalCell);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.previous = current;
      }
    }
  }

  if (pathFound) {
    let path = [];
    let temp = goalCell;
    path.push(temp);

    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }

    for (let i = path.length - 1; i >= 0; i--) {
      setTimeout(() => {
        path[i].classList.add('path');
      }, 50 * (path.length - i));
    }
  }

  isPathGenerated = true;
}

// Helper function to calculate heuristic value (Manhattan distance)
function heuristic(a, b) {
  const distance = Math.abs(a.dataset.row - b.dataset.row) + Math.abs(a.dataset.col - b.dataset.col);
  return distance;
}

// Helper function to get neighbors of a cell
function getNeighbors(cell) {
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const neighbors = [];

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < COLS - 1) neighbors.push(grid[row][col + 1]);

  return neighbors;
}

// Event handlers for cell interactions
function handleCellHover(event) {
  if (!isPathGenerated && isGeneratingObstacles && !event.buttons) {
    const cell = event.target;
    cell.classList.toggle('obstacle');
  }
}

function handleCellClick(event) {
  const cell = event.target;

  if (isGeneratingObstacles) {
    cell.classList.toggle('obstacle');
  } else {
    if (!isPathGenerated) {
      if (!startCell) {
        cell.classList.add('start');
        startCell = cell;
      } else if (!goalCell) {
        cell.classList.add('goal');
        goalCell = cell;
      } else {
        startCell.classList.remove('start');
        goalCell.classList.remove('goal');
        cell.classList.add('start');
        startCell = cell;
        goalCell = null;
        isPathGenerated = false;
      }
    }
  }
}

// Button event handlers
document.getElementById('generateGrid').addEventListener('click', function() {
  refreshGrid();
  createGrid();
});
document.getElementById('randomizeObstacles').addEventListener('click', randomizeObstacles);
document.getElementById('refreshGrid').addEventListener('click', refreshGrid);
document.getElementById('generatePath').addEventListener('click', generatePath);

// Initial grid generation
createGrid();
