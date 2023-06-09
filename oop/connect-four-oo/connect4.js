/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const colorInputs = document.querySelector("form");
const startBtn = document.getElementById('startBtn')
startBtn.addEventListener('click', startGame);
let gameBoard = document.getElementById('board');

class Game{
  constructor(width = 7, height = 6){
    let p1color = document.getElementById("p1Color").value
    let p2color = document.getElementById("p2Color").value
    this.width = width;
    this.height = height;
    this.board = []; // array of rows, each row is array of cells  (board[y][x])
    this.p1 = this.createPlayer(p1color, 1) // use input1
    this.p2 = this.createPlayer(p2color, 2) // use input2
    this.currPlayer = this.p1; // active player: 1 or 2
    this.htmlboard = document.getElementById('board');
    this.clickHandler = this.handleClick.bind(this);
    this.makeBoard();
    this.makeHtmlBoard();
  }

/** makeBoard: create in-JS board structure:
 *   board = array of rows, each row is array of cells  (board[y][x])
 */

  makeBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }
  
  createPlayer(color, id){
    return new Player(color, id);
    
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard() {
    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.clickHandler);
  
    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }
  
    this.htmlboard.append(top);
  
    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement('tr');
  
      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }
  
      this.htmlboard.append(row);
    }
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */
  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place piece into HTML table of board */
  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.style.backgroundColor = `${this.currPlayer.color}`
    piece.style.top = -50 * (y + 2);
  
    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }
  
  endGame(msg) {
    setTimeout(() => alert(msg), 100);
    let top = document.getElementById("column-top");
    top.removeEventListener("click", this.clickHandler);
    startBtn.innerText = "New Game";
    colorInputs.classList.remove("hidden");
  }

  /** handleClick: handle click of column top to play piece */
  handleClick(evt) {
    // get x from ID of clicked cell
    const x = +evt.target.id;
  
    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }
  
    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);
    
    // check for win
    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer.playerid} won!`);
    }
    
    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }
      
    // switch players
    this.currPlayer = this.currPlayer === this.p1 ? this.p2 : this.p1;
  }
/** checkForWin: check board cell-by-cell for "does a win start here?" */
  checkForWin() {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer
    const _win = (cells) =>
       (cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer
          )
       )
  
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
}
class Player {
  // constructor with parameters for color
  constructor(color, playerid){
    this.color = color;
    this.playerid = playerid;
  }
}

function startGame(width = 7, height = 6) {
  colorInputs.classList.add("hidden");
  gameBoard.innerHTML = "";
  startBtn.innerText = "Restart";
  return new Game(6, 7);
};

// Make color selector invisible during play
// start button returns to playey color selection with start button
// start button changes to restart during play
// start button changes to "New Game" after win