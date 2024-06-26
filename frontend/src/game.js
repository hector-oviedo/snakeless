class SnakeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SnakeScene' });
        this.snake;
        this.food;
        this.cursors;
        this.speed;
        this.difficulty;
        this.multiplier;
        this.startText;
        this.score = 0;
        this.updateDelay = 0;
        this.direction = 'right';
        this.newDirection = null;
        this.addNew = false;
    }

    init(data) {
        this.speed = data.speed;
        this.multiplier = data.multiplier;
        this.difficulty = data.difficulty;
    }

    create() {
        this.startText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'PRESS ENTER TO START', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        this.input.keyboard.once('keydown-ENTER', () => {
            this.startText.setVisible(false);
            this.startGame();
        });
    }

    startGame() {
        this.snake = [];
        this.snake[0] = this.add.rectangle(160, 160, 16, 16, 0xffffff);
        this.food = this.add.rectangle(80, 80, 16, 16, 0xff0000);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#fff' });
        this.add.rectangle(this.sys.game.config.width/2+1, this.sys.game.config.height/2+1, this.sys.game.config.width-2, this.sys.game.config.height-2).setStrokeStyle(2, 0xffffff);
    }

    update(time) {
        if (!this.snake) return;
        if (this.cursors.left.isDown && this.direction !== 'right') {
            this.newDirection = 'left';
        } else if (this.cursors.right.isDown && this.direction !== 'left') {
            this.newDirection = 'right';
        } else if (this.cursors.up.isDown && this.direction !== 'down') {
            this.newDirection = 'up';
        } else if (this.cursors.down.isDown && this.direction !== 'up') {
            this.newDirection = 'down';
        }

        if (time >= this.updateDelay) {
            this.updateDelay = time + this.speed;
            this.moveSnake();
        }
    }

    moveSnake() {
        let headX = this.snake[0].x;
        let headY = this.snake[0].y;

        if (this.newDirection) {
            this.direction = this.newDirection;
            this.newDirection = null;
        }

        if (this.direction === 'left') headX -= 16;
        else if (this.direction === 'right') headX += 16;
        else if (this.direction === 'up') headY -= 16;
        else if (this.direction === 'down') headY += 16;

        if (this.checkCollision(headX, headY)) {
            this.gameOver();
            return;
        }

        let newPart = this.add.rectangle(headX, headY, 16, 16, 0xffffff);

        if (this.addNew) {
            this.addNew = false;
        } else {
            this.snake.pop().destroy();
        }

        this.snake.unshift(newPart);

        if (headX === this.food.x && headY === this.food.y) {
            this.score += 10 * this.multiplier;
            this.scoreText.setText('Score: ' + this.score);
            this.repositionFood();
            this.addNew = true;
        }
    }

    checkCollision(x, y) {
        if (x < 0 || x >= this.sys.game.config.width || y < 0 || y >= this.sys.game.config.height) {
            return true;
        }

        for (let i = 0; i < this.snake.length; i++) {
            if (x === this.snake[i].x && y === this.snake[i].y) {
                return true;
            }
        }

        return false;
    }

    repositionFood() {
        let randomX = Phaser.Math.Between(0, this.sys.game.config.width - 16);
        let randomY = Phaser.Math.Between(0, this.sys.game.config.height - 16);
        randomX = randomX - (randomX % 16);
        randomY = randomY - (randomY % 16);

        for (let i =        0; i < this.snake.length; i++) {
            if (randomX === this.snake[i].x && randomY === this.snake[i].y) {
                this.repositionFood();
                return;
            }
        }

        this.food.setPosition(randomX, randomY);
    }

    gameOver() {
        this.scene.pause();
        this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'Game Over\nScore: '+ this.score, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.handleGameOver(this.score, this.difficulty);
    }
      

    handleGameOver(score, difficulty) {
        console.log("score:", score);

        //generate date
        let date = new Date();
        let dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        let timeOptions = { hour: '2-digit', minute: '2-digit' };
        
        let datePart = date.toLocaleDateString('en-US', dateOptions);
        let timePart = date.toLocaleTimeString('en-US', timeOptions);
        
        let dateSTR = `${datePart} ${timePart}`;

        // Prepare data to send
        let postData = {
            nickname: window.nickname,
            score: parseInt(score).toString(),
            difficulty: difficulty,
            date: dateSTR
        };
    
        // Perform the API call
        console.log("trying to reach",window.PUT_SCORE);
        $.ajax({
            url: window.PUT_SCORE,
            method: 'POST',
            data: JSON.stringify(postData),
            contentType: 'application/json', 
            success: function(response) {
                // Handle response here
                console.log("Data sent successfully, result:", response);
                
                let msg;
                if (response.error) msg = response.error;
                if (response.message) msg = response.message;
                if (!response.success) alert(msg)
        
                // After getting a response, show the leaderboard
                setTimeout(() => {
                    window.leaderboardView();
                }, 3000);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // Display the constructed error message to the user
                console.log(errorThrown)
                alert(errorThrown);

                // After getting a response error, also show the leaderboard
                setTimeout(() => {
                    window.leaderboardView();
                }, 3000);
            }
        });
        console.log("end of ajax")
    }
}

window.initGame = function(data) {
    let difficulty = data;
    let speed;
    let multiplier;
    switch (difficulty) {
        case 'easy':
            speed = 60;
            multiplier = 1;
            break;
        case 'normal':
            speed = 30;
            multiplier = 1.2;
            break;
        case 'hard':
            speed = 15;
            multiplier = 1.5;
            break;
    }

    const gameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight - window.innerHeight * 0.25,
        parent: 'app',
        backgroundColor: '#000',
        scene: [SnakeScene],
        physics: { default: 'arcade' },
    };

    const game = new Phaser.Game(gameConfig);
    game.scene.start('SnakeScene', { speed: speed, multiplier: multiplier, difficulty: difficulty });
};