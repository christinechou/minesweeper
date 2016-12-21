import { LOAD_BOARD, RESET_BOARD_NEW, RESET_BOARD_EXIST, CLICK_CELL } from '../actions/actions'
import update from 'immutability-helper'

const initialState = {
  boardSize: 4,
  mines: 4,
  board: [],
  _mineBank: {},
  active: false,
  _minesLeft: 0,
  minesLeftToUser: 0,
  status: null  // will use 1) initiatedBoard, 2) playing, 3) win or lose
}

// reducers
const loadBoard = (state, action) => {
  const newState = {}
  Object.assign(newState, state, { board: action.value })
  return newState
}

const resetBoardNew = (state, action) => {
  const newState = {}
  Object.assign(newState, state, {
    board: [],
    boardSize: action.n,
    _mineBank: {},
    mines: action.mines,
    _minesLeft: action.mines,
    minesLeftToUser: action.mines,
    status: 'initiatedBoard'
  })
  return newState //return new version of state. is a pure function, does not modify any of its surrounding global env
}

const resetBoardExisting = (state, action) => {
  /*** TO DO:  NEED TO CHANGE SO THAT ALL MINES ARE SET TO FALSE BEFORE NEW ONES ARE ASSIGNED***/
  const newState = {}
  console.log('Resetting board NOT CHANGING BOARD')
  Object.assign(newState, state, {
    _mineBank: {},
    mines: action.mines,
    _minesLeft: action.mines,
    minesLeftToUser: action.mines,
    status: 'initiatedBoard'
  })
  return newState //return new version of state. is a pure function, does not modify any of its surrounding global env
}

const clickCell = (state, action) => {
  const newState = update(state, { board: {
    [action.x]: {
      [action.y]: {
        covered: {
          $set: false
        }
      }
    }
  }})
  return newState
}

const rootReducer = (state = initialState, action) => { //if state is undefined, assign initialstate
  switch (action.type) {
    case LOAD_BOARD: return loadBoard(state, action)
    case RESET_BOARD_NEW: return resetBoardNew(state, action)
    case RESET_BOARD_EXIST: return resetBoardExisting(state, action)
    case CLICK_CELL: return clickCell(state, action)
    default: return state
  }
}

export default rootReducer
