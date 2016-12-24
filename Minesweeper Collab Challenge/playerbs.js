/* Set rows and columns and the size of each space on the gameBoard */
var rows = 10;
var cols = 10;
var spaceSize = 40;

/* Define Constants */
var VISITED = 8;

var hitCount = 0;
var shotCount = 0;

//var uuid = PubNub.generateUUID();

var timeCountText = document.getElementById('time_count');
var bombCountText = document.getElementById('bomb_count');
var playerTurnText = document.getElementById('player_turn');

/* Instantiate PubNub */
var pubnub = new PubNub({
        publishKey: 'pub-c-30632ecf-d1bd-4190-8019-06cfc29f2a31',
        subscribeKey: 'sub-c-f3801f96-c893-11e6-bbe2-02ee2ddab7fe'
        //uuid : uuid
});

// Subscribe to the battleship_channel channel
pubnub.addListener({
    message: function(m){
        console.log(m.message.player);
        subBoard(m.message.r, m.message.c, m.message.e);
        $('#time_count').text(m.timeCount);;
    }
    // presence: function(m) {
    // 	console.log(m);

    // 	console.log(m.uuid);
    // 	console.log(uuid);
    // 	console.log(m.occupancy);
    // 	if(m.uuid === uuid && m.action === 'join') {
    		
    // 	}

    // 	if(m.occupancy > 2) {
    // 		console.log("success");
    // 		startGame();
    // 	}
    // }
})

pubnub.subscribe({
    channels: ['battleship_channel'],
    withPresence: true
});

// pubnub.hereNow(
// 	{
// 		channels: ['battleship_channel'],
// 		includeState: true,
// 		includeUUIDs: true
// 	},
// 	function(status, response){
// 		console.log(response);
// 	}	
// );

// playerTurnText.addEventListener("click", publishPosition("James", "22"), false);

/* Get the gameBoard element from the HTML */
var gameBoardDiv = document.getElementById("gameBoard");
/* This function creates HTML space divs AND CSS size and position 
 * for the gameBoard div BUT not the actual color where we can fully 
 * visualize it. Only in the CSS can we do that and set Width and Height 
 * This initializes each space to be "Open Water"
 */
//function initBoard(rows, cols, spaceSize) {

	for(i = 0; i < rows; i++) {
		for(j = 0; j < cols; j++) {

			/* Creat a new div element for each space */
			var space = document.createElement("div");
			/* Add the newly created div(space) to the gameBoard div */
			gameBoardDiv.appendChild(space);

			/* Set each div element a unique id ex: "00"*/
			space.id = 's' + i + j;

			/* Set each cell's coordinates */
			var topAbsPosition = i * spaceSize;
			var leftAbsPosition = j * spaceSize;

			/* Use CSS absolute positioning to place each cell on the HTML */
			space.style.top = topAbsPosition + 'px';
			space.style.left = leftAbsPosition + 'px';

		}
	}
//} 

/* Call the initBoard method */ 
//gameBoardDiv = initBoard(rows, cols, spaceSize);

/* 2D array of the representation of the game board */
var gameBoard = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,1,0,0,0],
	[0,0,0,1,0,1,0,0,0,0],
	[0,0,0,0,0,0,0,0,1,0],
	[0,0,1,0,0,0,0,0,1,1],
	[0,0,0,0,0,0,0,0,1,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,1,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,1,0,0],
	[0,0,0,0,0,0,0,0,0,0]
]

/* Shows the number of bombs */
function numberOfBombs(gameBoard) {
	var bombs = 0;
	for(var i = 0; i < rows; i++) {
		for(var j = 0; j < cols; j++) {
			if(gameBoard[i][j] == 1) {
				bombs++;
			}
		}
	}
	return bombs;
}

// The number of bombs
var numOfBombs = numberOfBombs(gameBoard);
// The number of clears
var numOfClears = ((rows * cols) - numOfBombs);
// Update bombCount
bombCountText.innerHTML = numOfBombs;


/* Set an event listener for all element in the gameBoardDiv
 * Run the shoot function when a space is clicked
 */
gameBoardDiv.addEventListener("click", shoot, false);

// To clear interval or not
var shouldClearInterval = false;
// Get the number from DIV
var timeCountText = parseInt($('#time_count').text(), 1) || 1;
/* JQuery ready for time function */
$(document).ready(function () {
    // Called the function in each second
    var interval = setInterval(function () {
        $('#time_count').text(timeCountText++); // Update the value in DIV

        // If it exceeds 1000 sec, then LOSE
        if (timeCountText > 1000) {
            clearInterval(interval); // If exceeded 1000, clear interval (Stop it)
            alert("YOU LOSE! Refresh the page to play again!");
			gameBoardDiv.removeEventListener("click", shoot, false);
        }
        if(shouldClearInterval == true) {
        	clearInterval(interval);
        }
    }, 1000); // Run for each second
});

function shoot(e) {

	/* The row and col of the space is the id of the space clicked */
	var row = e.target.id.substring(1,2);
	var col = e.target.id.substring(2,3);

	//publish moves here
	pubnub.publish({
		channel: 'battleship_channel',
	    message: {
	        player : "James",
	        r : row,
	    	c : col,
	    	e : 's' + row + col,
	    	timeCount : timeCountText
	    },
	    callback: function(m) {
	    	console.log(m);
	    }
	});
}

function subBoard(row, col, id) {
	console.log(row);
	console.log(col);
	
	var e = document.getElementById(id);

	/* If player clicks on Clear space, change color and space value */
	if(gameBoard[row][col] == 0) {
		// Change the space color
		e.style.background = '#f6f8f9';
		// Check for surrounding bombs
		var numBomb = checkForBombs(row, col, e);
		if(numBomb == 0) {
			console.log("NUMBOMB = 0");
		}

		// decrement the clears when found
		numOfClears--;
		// Set that space to visited
		gameBoard[row][col] = VISITED;
	}
	/* If bomb is clicked GameOver*/
	else if(gameBoard[row][col] == 1) {

		e.style.background = 'red';

		/* show all bomb */
		for(var i = 0; i < rows; i++) {
			for(var j = 0; j < cols; j++) {
				if(gameBoard[i][j] == 1) {
					var test = document.getElementById('s'+i+j);
					test.style.background = 'red';
				}
			}
		}
		alert("YOU LOSE! Refresh the page to play again!");
		gameBoardDiv.removeEventListener("click", shoot, false);
		shouldClearInterval = true;
	}

	/* If all the clears are found, win game */
	if(numOfClears == 0) {
		alert("YOU WIN! Refresh the page to play again!");
		gameBoardDiv.removeEventListener("click", shoot, false);
		shouldClearInterval = true;
	}
}

function checkForBombs(r, c, e) {
	var numBomb = 0;
	var col = parseInt(c);
	var row = parseInt(r);
	// Right of it
	if(col != 9) {
		if(gameBoard[row][col+1] == 1) {
			numBomb++;
			console.log("right");
		}
	}
	// Left of it
	if(col != 0) {
		if(gameBoard[row][col-1] == 1) {
			numBomb++;
			console.log("left");
		}
	}
	// Above it
	if(row != 0) {
		if(gameBoard[row-1][col] == 1) {
			console.log("above");
			numBomb++;
		}
	}
	//Below it
	if(row != 9) {
	 	if(gameBoard[row+1][col] == 1) {
	 		numBomb++;
	 	}
	}
	// Top Left
	if(col != 0 && row != 0) {
		if(gameBoard[row-1][col-1] == 1) {
			numBomb++;
		}
	}
	// Top Right
	if(col != 9 && row != 0) {
		if(gameBoard[row-1][col+1] == 1) {
			numBomb++;
		}
	}
	// Bottom Left
	if(col != 0 && row != 9) {
		if(gameBoard[row+1][col-1] == 1) {
			numBomb++;
		}
	}
	// Bottom Right
	if(col != 9 && row != 9) {
		if(gameBoard[row+1][col+1] == 1) {
			numBomb++;
		}
	}

	// Show number of bombs
	if(numBomb > 0) {
		e.innerHTML = numBomb;
		e.style.textAlign = "center";
	}

	return numBomb;
}

