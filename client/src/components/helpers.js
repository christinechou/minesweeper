
const helpers = {
  makeBoard: (board, n) => {
    for (let i = 0; i < n; i++) {
      board[i] = []
      for (let j = 0; j < n; j++) {
        board[i][j] = {
          x: i,
          y: j,
          index: i * n + j,
          isMine: false,
          flagged: false,
          covered: true,
          minesAdjacent: 0
        }
      }
    }
  },
  generateMines: (board, n, mines, mineBank) => {
    console.log('Generate mines given board:', board, mineBank)
    while (mines > 0) {
      let row = Math.floor(Math.random() * (n))
      let col = Math.floor(Math.random() * (n))
      let i = row * n + col

      if (!mineBank[i]) {
        board[row][col].isMine = true
        mineBank[i] = 1
        helpers.visitAdjacent(row, col, n, (x, y) => {
          let cell = board[x][y]
          if (!cell.isMine) {
            cell.minesAdjacent++
          }
        })
        mines--
      }
    }
  },

  visitAdjacent: (x, y, boardSize, callback) => {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (x + i >= 0 && y + j >= 0 && x + i < boardSize && y + j < boardSize) {
          !(i === 0 && j === 0) ? callback(x + i, y + j) : null
        }
      }
    }
  }
}

export default helpers
