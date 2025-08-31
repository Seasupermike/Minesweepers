const canvas = document.querySelector("canvas");
const content = canvas.getContext("2d");
let tileSize = 20;
class game {
  constructor(Width, Height) {
    content.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = Width * tileSize;
    canvas.height = Height * tileSize;
    this.width = Width
    this.height = Height 
    canvas.addEventListener("mousedown", canvasClicked);
    this.board = [];
    this.bombs = [];
    this.cleared = 0;

    for (let x = 0; x < Width + 1; x++) {
      this.board[x] = [];

      for (let y = 0; y < Height + 1; y++) {
        this.board[x][y] = new tile(x, y, this);
      }
    }

    for (let x = 1; x < Width; x++) {
      for (let y = 1; y < Height; y++) {
        let tile = this.board[x][y];

        if (getRandom(0, Width * Height) < Width * Height * 0.2) {
          tile.isBomb = true;
          this.bombs.push(tile);
          for (let xo = -1; xo < 2; xo++) {
            for (let yo = -1; yo < 2; yo++) {
              this.board[x + xo][y + yo].nearby++;
            }
          }
        }
      }
    }
    
    this.flags = this.bombs.length;
    document.querySelector("#flags").textContent = `${this.flags} flags`;
    for (let x = 0, i = 0; x < (Width + 1) * tileSize; x += tileSize) {
      for (let y = 0; y < (Height + 1) * tileSize; y += tileSize, i++) {
        content.fillStyle = i % 2 == 0 ? "green" : "limegreen";
        this.board[x / tileSize][y / tileSize].shade = content.fillStyle;
        content.fillRect(x, y, 40, 40);
      }

      if (Height % 2 != 0) {
        i++;
      }
    }

    outerloop: for (let x = 1; x < Width; x++) {
      for (let y = 1; y < Height; y++) {
        if (this.board[x][y].nearby === 0) {
          this.board[x][y].destroy();
          break outerloop;
        }
      }
    }
    this.startingTiles = this.cleared
    this.tiles = (Width * Height);
    this.SafeTiles = (Width * Height) - this.bombs.length
  }

  endGame() {
    console.log("gameEnded");
    canvas.removeEventListener("mousedown", canvasClicked)
    document.querySelector("#flags").textContent = `You lost! You cleared ${Math.floor(((this.cleared - this.startingTiles)/ (this.tiles - this.startingTiles)) * 100)}% of the board!`
  }
  
  checkWin() {
    if (this.cleared != this.SafeTiles) {
      return false
    }
    canvas.removeEventListener("mousedown", canvasClicked)
    document.querySelector("#flags").textContent = `You won! Increase the number of tiles for an extra challenge`
    return true
  }
    
  win() {
    for (let x = 1; x <= this.width; x++) {
      for (let y = 1; y <= this.height; y++) {
        let tile = this.board[x][y]
        if (tile.isBomb) {
          tile.flag()
        } else {
          tile.destroy()
        }
        
      }
    }
    
    document.querySelector("#flags").textContent = `You cheated! Congrats on acomplising nothing.`
  }
}

class tile {
  constructor(x, y, game) {
    this.nearby = 0;
    this.flagged = false;
    this.cleared = false;
    this.x = x;
    this.y = y;
    this.shade = undefined;
    this.game = game;
  }

  destroy() {
    if (this.flagged || this.cleared || this.x == 0 || this.y == 0 || this.x == this.game.width + 1 || this.y == this.game.height + 1) {
      return;
    }
    this.cleared = true;
    if (this.isBomb) {
      this.game.endGame();
      return;
    }
    content.fillStyle = this.shade == "#008000" ? "#EECFB1" : "beige";
    content.fillRect((this.x - 1) * tileSize, (this.y - 1) * tileSize, tileSize, tileSize);
    this.game.cleared++
    this.game.checkWin()
    if (this.nearby !== 0) {
      content.fillStyle = "black";
      content.fillText(this.nearby, (this.x - 1) * tileSize + tileSize * 0.35, (this.y - 1) * tileSize + tileSize * 0.7);
      return;
    }

    for (let xo = -1; xo < 2; xo++) {
      for (let yo = -1; yo < 2; yo++) {
        if (xo == 0 && yo == 0) {
          continue
        }
        try {
          this.game.board[this.x + xo][this.y + yo].destroy();
        } catch {}
      }
    }
  }

  flag() {
    if (this.cleared) {
      return;
    }

    if (this.flagged) {
      this.flagged = false;
      content.fillStyle = this.shade;
      content.fillRect((this.x - 1) * tileSize, (this.y - 1) * tileSize, tileSize, tileSize);
      currentGame.flags++;
    } else if (currentGame.flags > 0) {
      this.flagged = true;
      currentGame.flags--;
      content.fillStyle = "red";
      content.fillRect((this.x - 1) * tileSize + tileSize / 5, (this.y - 1) * tileSize + tileSize / 5, tileSize * 0.6, tileSize * 0.6);
    }

    document.querySelector("#flags").textContent = `${this.game.flags} flags`;
  }
}

function getRandom(Min, Max, IsInt) {
  Min = Math.ceil(Min);
  Max = Math.floor(Max);
  let Temp = Math.random() * (Max - Min + 1) + Min;
  if (IsInt == true) {
    return Math.floor(Temp);
  }

  return Temp;
}

let currentGame = new game(20, 20);

document.querySelector("form").addEventListener("submit", function () {
  event.preventDefault();
  currentGame = new game(
    document.querySelector("#width").value,
    document.querySelector("#height").value
  );
});

function canvasClicked() {
  event.preventDefault();
  const canvasBox = canvas.getBoundingClientRect(); // Get the canvas's size and position
  const x = Math.floor((event.clientX - canvasBox.left) / tileSize); // Calculate X relative to canvas
  const y = Math.floor((event.clientY - canvasBox.top) / tileSize);
  let tile = currentGame.board[x + 1][y + 1];
  switch (event.button) {
    case 0:
      tile.destroy();
      break;
    case 2:
      tile.flag();
  }
}
