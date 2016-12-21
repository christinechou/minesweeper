import { LOAD_BOARD, RESET_BOARD_NEW, RESET_BOARD_EXIST, CLICK_CELL } from './actions'


// Board actions 
export function loadBoard (board) { 
  return { type: LOAD_BOARD, value: board }
}

export function resetBoardNew (n, mines) { //n and mines are contained in action object
  return { type: RESET_BOARD_NEW, n: n, mines: mines }
}

export function resetBoardExisting (mines) { //n and mines are contained in action object
  return { type: RESET_BOARD_EXIST, mines: mines }
}

// Cell actions
export function clickCell (x, y) {
  return { type: CLICK_CELL, x: x, y: y }
}
