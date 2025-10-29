const lifeworld = {

    init(numCols, numRows) {
        this.numCols = numCols,
            this.numRows = numRows,
            this.world = this.buildArray();
        this.worldBuffer = this.buildArray();
        this.randomSetup();
    },

    buildArray() {
        let outerArray = [];
        for (let row = 0; row < this.numRows; row++) {
            let innerArray = [];
            for (let col = 0; col < this.numCols; col++) {
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        return outerArray;
    },

    randomSetup() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                this.world[row][col] = 0;
                if (Math.random() < .1) {
                    this.world[row][col] = 1;
                }
            }
        }
    },

    getLivingNeighbors(row, col) {
        if ((row <= 0 || col <= 0) || (row >= this.numRows - 1 || col >= this.numCols - 1)) {
            return 0;
        }

        let sum = 0;
        if (this.world[row + 1][col] == 1) { sum++ };
        if (this.world[row + 1][col + 1] == 1) { sum++ };
        if (this.world[row][col + 1] == 1) { sum++ };
        if (this.world[row - 1][col + 1] == 1) { sum++ };
        if (this.world[row - 1][col] == 1) { sum++ };
        if (this.world[row - 1][col - 1] == 1) { sum++ };
        if (this.world[row][col - 1] == 1) { sum++ };
        if (this.world[row + 1][col - 1] == 1) { sum++ };
        return sum;

    },

    step() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                let liveNeighbors = this.getLivingNeighbors(row, col);
                if (this.world[row][col] === 1 && (liveNeighbors < 2 || liveNeighbors > 3)) {
                    this.worldBuffer[row][col] = 0;
                } else if (this.world[row][col] === 0 && liveNeighbors === 3) {
                    this.worldBuffer[row][col] = 1;
                } else {
                    this.worldBuffer[row][col] = this.world[row][col];
                }
            }
        }
        let tempWorld = this.worldBuffer.slice();
        this.worldBuffer = this.world.slice();
        this.world = tempWorld.slice();
    }
}