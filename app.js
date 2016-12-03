var icons = {
  covered: 'http://i.imgur.com/HM1e3Tbb.jpg',
  pressed: 'http://i.imgur.com/bGT8xGEb.jpg',
  exposedBomb: 'http://i.imgur.com/pTJ8Swhb.jpg',
  explodedBomb: 'http://i.imgur.com/UFmXprFb.jpg',
  flag: 'http://i.imgur.com/nLPvW15b.jpg',
  // Index is # of adjacent bombs
  bombs: [
    'http://i.imgur.com/Flqdqi1b.jpg', // 0
    'http://i.imgur.com/bM8oExob.jpg', // 1
    'http://i.imgur.com/bQKSbqYb.jpg', // 2
    'http://i.imgur.com/5jNcEeVb.jpg', // 3
    'http://i.imgur.com/BnxjHgHb.jpg', // 4
    'http://i.imgur.com/RaFrMYcb.jpg', // 5
    'http://i.imgur.com/GlwQOy0b.jpg', // 6
    'http://i.imgur.com/8ngsVa8b.jpg', // 7
    'http://i.imgur.com/lJ8P1wab.jpg'  // 8
  ]
};

function initiate() {
  'use strict';

  var defaultBoard = {
    cols: 10,
    rows: 10, 
    mines: 10
  }

  var clickCell;
  var gameActive = true;

  window.Board = function() {
    this.status = null;
    this.sideLength = 10;
    this._board = [];
    this._mines = {};
    this._active = false;
    this._minesLeft = 0;
    this.minesLeftToUser = 0;
  }

  Board.prototype = {
    // initiate board 
    initiateBoard: function(defaultSetup) {
      
      var n; // Side length of board
      var numMines; // Total mines on board

      if (defaultSetup === 'default') {
        n = defaultBoard.cols;
        numMines = defaultBoard.mines;
      }
      n = n || +$('.nboard').val();
      numMines = numMines || +$('.mines').val();

      // Validation on user input
      if (+n <= 1 || +n >100 || +numMines < 1 || +numMines >= (+n * +n)) {
        throw new Error('Board size and number of mines must be valid numbers. Number of mines must not be larger number of cells.');
      }
      // If game is active, confirm before continuing
      if (this._active && !confirm('Are you sure you would like to restart?')) {
        return;
      }
      this.resetStats(n, numMines);
      this.generateBoard();
    },

    resetStats: function(n, numMines) {
      $('.game-notes').html('')
      this._board = [];
      this._mines = {};
      this.status = null;
      this.sideLength = n;
      this._minesLeft = numMines;
      this.minesLeftToUser = numMines;
      $('.num-mines').text(numMines)
    },

    generateBoard: function(sameSize) { // If same size, do not need to re-generate board. Just mark all cells covered and update this._board, this._mines
      var n = this.sideLength;
      // Generate cells
      var htmlContent = '<table class="board">';
      for (var i = 0; i < n; i++) {
        htmlContent += '<tr class="row clearfix">';
        for (var j = 0; j < n; j++) {
          var cell = new Cell(i, j);
          cell.index = cell.calcPositionId(i,j,n);
          this._board.push(cell);
          htmlContent += '<td id="' + cell.index + '"data-position="' + cell.x + ',' + cell.y + '"class="cell covered"></td>';
        }
        htmlContent += '</tr>';
      }
      htmlContent += '</table>';
      $('#board').html(htmlContent);
      this.setupClickHandler();
      this.generateMines()
    },

    setupClickHandler: function() {
      var self = this;
      $('.cell')
        .bind("mousedown", function(event) {
        self.handleMouseDown(event);
      })
        .bind("mouseup", function(event) {
        self.handleMouseUp(event);
      });
    },

    generateMines: function(done) {
      var mineCount = this._minesLeft;
      while (mineCount > 0) {
        var mine = Math.floor(Math.random() * (this.sideLength * this.sideLength));
        if (!this._mines[mine]) {
          this._board[mine]._isMine = true;
          this._mines[mine] = 1;
          mineCount--;
        }
      }
      this.findAdjacentMines();
    },

    findAdjacentMines: function() {
      // for each cell, find adjacent mines
      var mines = Object.keys(this._mines);
      // For each mine, loop through neighboring cells of mines to increment cell's neighboring mine count
      for (var i = 0; i < mines.length; i++) {
        var currentCell = this._board[mines[i]];
        // positions === array of neighboring cell position Ids
        var self = this;
        currentCell.accessNeighbors(this.sideLength, function(posId) {

          var neighboringCell = self._board[posId];
          if (!neighboringCell._isMine) {
            neighboringCell._neighboringMines++;
          }
        });
      }
      this._active = true;
    },

    handleMouseDown: function(e) {
      var currentCell = this._board[e.target.id];
      // If clicked cell is revealed or board is inactive, do nothing
      if (currentCell._revealed || !this._active) {
        return;
      }
      // If right click: 
      if (e.which === 3) {
        clickCell = e.target;
      } else if (e.which === 1) {
        // If left click:
        if (!currentCell._flagged) {
          clickCell = e.target;
          $(e.target).css("background-image", 'url(' + icons.pressed + ')');
        }
      }
    },

    handleMouseUp: function(e) {

      if (!this._active) { return }
      var id = e.target.id;  // 17
      var currentCell = this._board[id]; // Cell object
      // var clickedCell = this._board[clickCell.id]
      if (currentCell._revealed) {
        return;
      }
      // 'Release' click if 1) user did not release mouse on same cell clicked 2) cell is not revealed and 3) cell is not flagged
      // if (e.target !== clickCell && !clickedCell._revealed && !clickedCell._flagged) {
      if (!currentCell._revealed && !currentCell._flagged) {
        $(currentCell).css("background-image", 'url(' + icons.covered + ')');
      } 
      // If right click:
      if (e.which === 3) {
        this.flagCell(e);
      } else {
        // If left click:
        this.revealCell(id);
      }
    },

    flagCell: function(e) {
      var id = e.target.id;
      var currentCell = this._board[id];
      var mine = this._mines[currentCell.index];
      var url = (currentCell._flagged) ? icons.covered : icons.flag;
      $('#'+id).css("background-image", 'url(' + url + ')')
      this.minesLeftToUser--;
      // If cell is flagged increment appropriate counters
      if (currentCell._flagged) {
        if ( mine === 'x' ) {
          mine = 1;
          this._minesLeft++;
        }
        this.minesLeftToUser++;
      } else {
        // If cell is not flagged, decrement appropriate counters
        if ( mine === 1) {
          mine = 'x';
          this._minesLeft--;
        }
      }
      currentCell._flagged = !currentCell._flagged;
      $('.num-mines').text(this.minesLeftToUser)
      this.onGameOver(null, id)
    },

    revealCell: function(id, cb) {
      // Accounts for 3 cases (uncovered cells are handled in mouseDown action)
      var currentCell = this._board[id];
      // If flagged, do not do anything
      if (currentCell._flagged) {
        return;
      }
      // If mine, game over
      if (currentCell._isMine) {
        return this.onGameOver('lose', id);
      } else {
        // Otherwise, reveal number tile(s)
        var adjacentMines = currentCell._neighboringMines;
        if (adjacentMines >= 0) {
          this.revealFront(id, cb);
        } 
        this.onGameOver(null, id);
      }
    },

    revealMines: function(id) {   
      var covered = $('#board .covered');
      var mines = Object.keys(this._mines)
      var self = this;
      _.each(mines, function(val) {
        val = parseInt(val);
        var cell = self._board[val];
        cell._revealed = true;
        // Display exploded bomb (where user clicked) or exposed bomb where user did not, otherwise display neighboring mine number
        self.displayCell(cell, val === id ? 'explodedBomb' : 'exposedBomb');
      });
    },

    revealFront: function(id, cb) {
      // Breadth-first traverse - continue adding neighbors to queue if neighborcount is > 0 and is not already revealed/uncovered
      var zeroQueue = [];
      zeroQueue.push(id);
      while (zeroQueue.length > 0) {
        var id = zeroQueue.shift();
        var currentCell = this._board[id];
        if (!currentCell._revealed && !currentCell._flagged) {
          // Display cell on board and mark revealed
          this.displayCell(currentCell);
          var adjacentMines = currentCell._neighboringMines;
          if (adjacentMines === 0) {
            var self = this;
            // If cell is === 0, add neighbors that have not yet been revealed to zeroQueue
            currentCell.accessNeighbors(this.sideLength, function(posId) {
              if (!self._board[posId]._revealed) {
                zeroQueue = zeroQueue.concat(posId);
              }
            });
          } else if (adjacentMines > 0) {
            cb ? cb(id) : null;
          }
        }
      }
    },

    displayCell: function(cell, bombType) {
      var adjacent = cell._neighboringMines;
      cell._revealed = true;
      $('#' + cell.index).removeClass("covered").addClass("uncovered");
      var url = (!bombType) ? icons.bombs[adjacent] : icons[bombType]
      $('#' + cell.index).css( "background-image", 'url(' + url + ')' );
    },

    onGameOver: function(lose, id) {
      if (lose) {
        $('.game-notes').text('You lose :(');
        this._active = false;
        this.status = 'lose';
        this.revealMines(id);
      } else {
        var cellsCovered = $('#board .covered').length;
        var numMines = Object.keys(this._mines).length;
        var minesLeft = this._minesLeft
        var minesLeftPublic = this.minesLeftToUser

        if ( cellsCovered === numMines || (minesLeft === 0 && minesLeftPublic === 0) ) {
          $('.game-notes').html('You won :)');
          this.status = 'win';   
          this._active = false;
        }
      }
    }, 

    solver: function(numGames) {
      var solver = new Solver();

      while (numGames > 0) {
        this.initiateBoard();
        solver.initiate(this)
        solver.bestGuess(solver.side * solver.side, solver.Board._board, true);
        solver.playAlgo();
        if (this.status === 'win') { 
          solver.wins++
        }
        solver.rounds++;
        numGames--;
      }
      solver.displayStats();
    }

  };

  window.Solver = function() {
    this.Board;
    this._minesLeft = Board._minesLeft;
    this.side = Board.sideLength;
    this._front = []; // the outer uncovered cell numbers 
    this._frontOnes = [];
    this._remainingFronts = {};  // Contains local probabilities
    this.rounds = 0;
    this.wins = 0;
    this._changes = false;
  }

  Solver.prototype = {
    initiate: function(Board) {
      this.Board = Board;
      this._minesLeft = Board._minesLeft;
      this.side = Board.sideLength;
      this._front = [];  // the outer uncovered cell numbers 
      this._frontOnes = [];
      this._remainingFronts = {};  // Contains local probabilities
      this._changes = false;

    },

    playAlgo: function() {
      // <-- Loop starts -->
      // 1) Add exposed cells queue. Continue evaluating each cell in queue to flag mines or expose until empty, adding newly exposed to queue. Add uncertains (exposed cells which still have more mines to flag) to remainingFronts, calculating local probabilities. 
      // 2) Revisit uncertains to update with any newly placed flags/exposed cells.
      // 3) Find patterns (1-2-2-1, 1-2-1) to flag and expose more cells
      // 4) Once "stuck" with no more certainties, make best guess
      // <-- Loop ends -->
      this.Board._active = true;
      var self = this;
      var loops = 0;

      function loop() {
        while ( self._changes === true
                || self._front.length > 0
                || self._frontOnes.length > 0
                && self.Board._active ) {
          self._changes = false;
          self.evaluateRevealed(self._frontOnes, 'ones');
          if (!self.Board._active) {
            return; }
          self.outerCoveredRevisit()
          if (!self.Board._active) {
            return; }
          self.findPatterns()
          if (!self.Board._active) {
            return; }
          loops++;
        }
        self.bestGuess(null, null, true);
      }

      while (this.Board._minesLeft > 0 && this.Board._active) {
        loop();
      }
      gameActive = false;
    },

    getCell: function(id) {
      return this.Board._board[id];
    },

    // For each revealed cell, determine whether we will 1) mark mines with 100% certainty, 2) reveal surrounding (covered) cells (to be done later), OR 3) keep in front array - may need to pick best guess at one point
    evaluateRevealed: function(arr, type) {
      var changes = false;
      while (arr.length > 0) {
        var frontCell = arr.shift();
        var coveredNeighbors = [];
        var flagged = 0;
        var self = this;   
        // get valid neighbors (excluding flagged)   
        this.getCell(frontCell).accessNeighbors(this.side, function(neighborId) {
          var coveredCell = self.getCell(neighborId);
          if (coveredCell._flagged) { flagged++ }
          (!coveredCell._revealed && !coveredCell._flagged) ? coveredNeighbors.push(neighborId) : null;
        });
        self.checkForMines(frontCell, coveredNeighbors, flagged)
      }
      if (type === 'ones') { 
        this.evaluateRevealed(this._front, 'multiple')
      } 
    },

    checkForMines: function(id, coveredNeighbors, flagged) { //Checks for EACH front cell
      // If cell's mines === number of covered neighboring cells, flag all neighboring
      var mine = this.getCell(id)._neighboringMines;
      var l = coveredNeighbors.length;
      var self = this;

      var minesExcludeFlag = mine - flagged;
      if (flagged === mine) {
      // If all mines surrounding cell have been flagged, reveal neighbors (retain front)
        for (var i = 0; i < l; i++) {
          this.Board.revealCell(coveredNeighbors[i], this.retainFront.bind(this))
        }
      } else if ( mine-flagged === l) { 
        // If remaining covered cells are all mines, immediately flag rest of neighbors
        for (var i = 0; i < l; i++) {
          if (!coveredNeighbors[i]._flagged) {
            $('#'+coveredNeighbors[i]).trigger({ type: 'mouseup', which: 3 });
          }
        }
      } else {
        var remaining = mine - flagged;
        var localProb = this.calcProbability(id, coveredNeighbors, flagged); // insert as { id: [# surrounding mines, probability]}
        this._remainingFronts[id] = [mine, localProb]
      }
    },

    outerCoveredRevisit: function() {
      var revisitArr = Object.keys(this._remainingFronts);
      this._remainingFronts = {}
      this.evaluateRevealed(revisitArr, 'revisit');
    },

    calcProbability: function(id, arrayOfIds, flagged) {
      return (this.Board._board[id]._neighboringMines - flagged) / arrayOfIds.length;
    },

    bestGuess: function(nCells, cells, allCovered) { // nCells == possible number of guesses, cells == possible cells to choose from. allCovered means totally random based on covered cells - flagged
      if (allCovered) {
        cells = $('.covered');
        nCells = cells.length;
      }
      var self = this;

      if (nCells === 0) return;
      generate()
      function generate() {
        var randNum = self.randomNumber(nCells);   
        if (cells[randNum]) {
          var cell = self.getCell(cells[randNum].id);
          if (!cell._flagged) {
            self.Board.revealCell(cell.index, self.retainFront.bind(self));
          }
        } else {
          generate();
        }
      }
    },

    randomNumber: function(upUntil, callback) {
      return Math.floor(Math.random() * upUntil);
    },

    retainFront: function(cell) {
      var mines = this.getCell(cell)._neighboringMines;
      if (mines === 1) { this._frontOnes.push(cell); 
        this._changes = true;
      } else if (mines > 1) { this._front.push(cell); 
        this._changes = true;
      }
    },

    findPatterns: function() {
      var remainingOpen = Object.keys(this._remainingFronts);
      if (remainingOpen.length < 3) { return }
      var self = this;
      var patterns = { 
        oneTwo: [1,2,1], //* 0 *
        twoTwo: [1,2,2,1], // 0 * * 0
        twoTwoFlag: [1,2,2, /*flag*/ 'flagged'], // _ _ *
        ones: [1,1,1,1,1] // _ _ uncover _ _
      }
      for (var i = 0; i < remainingOpen.length; i++) {
        // Initiate pattern finder on 1 mines
        var cellId = remainingOpen[i];
        var cell = this._remainingFronts[cellId];
        if (cell[0] === 1) {
          patternMatch(cellId, 0)
        }
      }

      function patternMatch(lastId, lastPatternI, direction, sideCovered, pattern) {
        lastId = parseInt(lastId);
        var nextPatternI = lastPatternI+1;
        var patternArr = patterns[pattern];
        // Base case: make appropriate flags/reveal appropriate cells once last character in pattern has been validated
        if (pattern && nextPatternI === patternArr.length) {
          var endCovered = nextInSequence(sideCovered, lastId)
          var secondFromEndCovered= nextInSequence(sideCovered, nextInSequence(direction, lastId, 1, true))
          var twoBackwards = nextInSequence(direction, lastId, 2, true);
          var thirdFromEndCovered = nextInSequence(sideCovered, twoBackwards)
          if (pattern === 'oneTwo') {
            !self.getCell(endCovered)._flagged ? $('#'+endCovered).trigger({ type: 'mouseup', which: 3 }) : null;
            self.Board.revealCell(secondFromEndCovered, self.retainFront.bind(self));
            !self.getCell(thirdFromEndCovered)._flagged ? $('#'+thirdFromEndCovered).trigger({ type: 'mouseup', which: 3 }) : null;
          } else if (pattern === 'twoTwo') {
            !self.getCell(secondFromEndCovered)._flagged ? $('#'+secondFromEndCovered).trigger({ type: 'mouseup', which: 3 }) : null;
            !self.getCell(thirdFromEndCovered)._flagged ? $('#'+thirdFromEndCovered).trigger({ type: 'mouseup', which: 3 }) : null;
          } else if (pattern === 'twoTwoFlag') {
            !self.getCell(thirdFromEndCovered)._flagged ? $('#'+thirdFromEndCovered).trigger({ type: 'mouseup', which: 3 }) : null;
          } else if (pattern === 'ones') {
            !self.getCell(thirdFromEndCovered)._flagged ? $('#'+thirdFromEndCovered).trigger({ type: 'mouseup', which: 3 }) : null;
          }
          return;
        }
        
        // Recursive cases: 
        // 1) if direction is specified - compare current cell id's subsequent sideCovered(single) and # mines against specified pattern.
        // 2) if direction is NOT specified (means pattern is not specified either), check R and D directions for next mine# in each pattern.  
        // For pattern matches, check that current and last Id's sideCovereds are the same.  If the same, recurse through function and continue 
        // comparing against pattern

        if (pattern && direction) {
          var next = nextInSequence(direction, lastId);
          if ((next === -1 || self._remainingFronts[next] === undefined)) {
            return;
          }
          if (typeof patternArr[nextPatternI] === 'string' && self.getCell(lastId)._flagged) {
            patternMatch(next, nextPatternI, direction, sideCovered, pattern);  
          } else if (self._remainingFronts[next][0] === patternArr[nextPatternI]) {
            if (!self.getCell(nextInSequence(sideCovered, next))._revealed 
                && !self.getCell(nextInSequence(sideCovered, next))._flagged) {
              patternMatch(next, nextPatternI, direction, sideCovered, pattern)
            }
          }
        } else if (direction) {  
          var next = nextInSequence(direction, lastId);
          if (self._remainingFronts[next]) {
            var patternKeys = Object.keys(patterns);
            for (var i = 0; i < patternKeys.length; i++) { 
               if (patterns[patternKeys[i]][nextPatternI] === self._remainingFronts[next][0]) {
                if (!self.getCell(nextInSequence(sideCovered, next))._revealed ) {
                  patternMatch(next, nextPatternI, direction, sideCovered, patternKeys[i])
                }
              }
            }
          }
        } else if (!direction) {
          var right = nextInSequence('right', lastId);
          var down = nextInSequence('down', lastId);
          var seq = [right, down];

          for (var i = 0; i < 2; i++) { 
            if (self._remainingFronts[seq[i]]) {
              if (self._remainingFronts[seq[i]][0] === 2 || self._remainingFronts[seq[i]][0] === 1) {
                // Constraints (finding covered side going right and down) - FIRST TIME THROUGH: DIRECTION IS GOING RIGHT.  
                // SECOND TIME THROUGH: DIRECTION IS GOING DOWN.
                var revealedLastMinus = nextInSequence(  (i===0) ? 'up' : 'left', lastId )
                var revealedNextMinus = nextInSequence(  (i===0) ? 'up' : 'left', seq[i] );
                if ( revealedLastMinus > -1
                    && revealedNextMinus > -1
                    && !self.getCell( revealedLastMinus )._revealed
                    && !self.getCell( revealedNextMinus )._revealed ) {
                  patternMatch(seq[i], nextPatternI, (i===0) ? 'right' : 'down', (i==0) ? 'up' : 'left', (self._remainingFronts[seq[i]][0] === 1 ? 'ones' : undefined));
                } // AND/OR 
                var revealedLastPlus = nextInSequence(  (i===0) ? 'down' : 'right', lastId )
                var revealedNextPlus = nextInSequence(  (i===0) ? 'down' : 'right', seq[i] );
                if (revealedLastPlus > -1
                    && revealedNextPlus > -1
                    && !self.getCell( revealedLastPlus )._revealed 
                    && !self.getCell( revealedNextPlus )._revealed) {
                  patternMatch(seq[i], nextPatternI, (i===0) ? 'right' : 'down', (i===0) ? 'down' : 'right', (self._remainingFronts[seq[i]][0] === 1 ? 'ones' : undefined));
                }
              }
            }
          }
        }
      }


      function nextInSequence(dir, id, moves, backwards) { 
        var x = self.Board._board[parseInt(id)].x
        var y = self.Board._board[parseInt(id)].y

        if (backwards) {
          if (dir === 'right') { dir = 'left' }
          else if (dir === 'down') { dir = 'up' }  
          else if (dir === 'left') { dir = 'right' }
          else if (dir === 'up') { dir = 'down' }
        }
        moves = moves || 1;
        var position = {
          right: function() { return [x, y + moves] },
          left: function() { return [x, y - moves] },
          up: function() { return [x - moves, y] },
          down: function() { return [x + moves, y] },
        }
        var newCoords = position[dir]();
        if (newCoords[0] < 0 || newCoords[0] >= self.side || newCoords[1] < 0 || newCoords[1] >= self.side) {
          return -1
        } else {
          return newCoords[0]*self.side + newCoords[1];
        }
      }
    },

    displayStats: function() {
      var html = '<h3>Game Stats</h3><section class="grid"><div>Games:<br>'+this.rounds+'</div><div>Win rate:<br>'+this.wins+'</div></section>'
      $('#stats').html(html)
    },
  }

  window.Cell = function(row, col) {
    this.x = row;
    this.y = col;
    this.index = 0;
    this._neighboringMines = 0;
    this._isMine = false;
    this._flagged = false;
    this._revealed = false;
  };


  Cell.prototype = {
    accessNeighbors: function(n, cb) {
    // Neighbors function accepts an optional callback which filters results that pass a truth test
      for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <=1; j++) {
          if ( !(i === 0 && j === 0) ) {
            var neighborX = +this.x + i;
            var neighborY = +this.y + j;
            if (neighborX >= 0 && neighborX < n && neighborY >= 0 && neighborY < n) {
              var posId = this.calcPositionId(neighborX, neighborY, n);
              cb(posId);
            }
          }
        }
      }
    },

    calcPositionId: function(row,col,size) {
      return row*size+col;
    }
  }

  var module = function(board) {
    var minesweeper = new Board();
    minesweeper.initiateBoard('default')
    $('#board').contextmenu(function(event) {
      event.preventDefault();
    });
    $('.new-game').on("mousedown", function(event){
      gameActive = true;
      minesweeper.initiateBoard();
    });
    $('.solver').on("mousedown", function(event){
      if (!gameActive) { return; }
      var games = $('.n-games').val();
      minesweeper.solver(games);
    });
  }
  module(Board);
};

// On page load, initiate Board and Cell classes and default 10x10 board
$(document).ready(function() {
  initiate();
})
