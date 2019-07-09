import React, { Component } from 'react';
import './style.css';

let gameWidth = document.documentElement.clientWidth,
  gameHeight = document.documentElement.clientHeight;
let player1Score = 0,
  player2Score = 0,
  gameOver = false,
  winner = "",
  monkey = false;

class App extends Component {
  componentDidMount() {
    this.btnRight.style.display = 'none';
    this.butt2.style.display = 'none';
    this.update()
  }
  update() {
    const Width = gameWidth,
      Height = gameHeight,
      ctx = this.canvas.getContext("2d"),
      fps = 60,
      paddleWidth = Height > 800 ? 200 : 100;
    let ballY = Height / 2,
      ballX = Width / 2,
      ballRadius = 6,
      ballSpeedY = 0,
      ballSpeedX = Height / 75;
    let paddle1Y = Height / 2 - paddleWidth / 2,
      paddle2Y = Height / 2 - paddleWidth / 2,
      paddleSpeed = Height > 800 ? 9 : 6;

    function KeyListener() {
      this.pressedKeys = [];
      this.keydown = (e) => {
        this.pressedKeys[e.keyCode] = true;
      };
      this.keyup = (e) => {
        this.pressedKeys[e.keyCode] = false;
      };
      document.addEventListener("keydown", this.keydown.bind(this));
      document.addEventListener("keyup", this.keyup.bind(this));
    }
    KeyListener.prototype.isPressed = function(key) {
      return this.pressedKeys[key] ? true : false;
    };
    KeyListener.prototype.addKeyPressListener = function(keyCode, callback) {
      document.addEventListener("keypress", (e) => {
        if (e.keyCode === keyCode) callback(e);
      });
    };
    const keys = new KeyListener();

    const reset = () => {
      ballY = Height / 2;
      ballX = Width / 2;
      ballSpeedX = -ballSpeedX;
      ballSpeedY = 0;
    };
    // draw everything on screen
    const drawAll = () => {
      // screen
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, Width, Height);
      // middle dashed line
      ctx.strokeStyle = "#fff";
      ctx.setLineDash([10]);
      ctx.beginPath();
      ctx.moveTo(Width / 2, 0);
      ctx.lineTo(Width / 2, Height);
      ctx.stroke();
      // score
      ctx.font = "30px Orbitron";
      ctx.fillStyle = "#888";
      ctx.fillText(player1Score, Width / 2 / 2, 100);
      ctx.fillText(player2Score, (Width / 2) * 1.5, 100);
      // 2 rects
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, paddle1Y, 10, paddleWidth);
      ctx.fillRect(Width - 10, paddle2Y, 10, paddleWidth);
      // ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();
    };
    // move stuff begore drawing again
    const moveAll = () => {
      // ball movement
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // horizontal
      if (ballX > Width || ballX < 0) {
        // right side collision
        if (
          ballX > Width / 2 &&
          (ballY >= paddle2Y && ballY <= paddle2Y + paddleWidth)
        ) {
          ballSpeedX = -ballSpeedX;
          let deltaY = ballY - (paddle2Y + paddleWidth / 2);
          ballSpeedY = deltaY * 0.2;
        } else if (
          ballX < Width / 2 &&
          (ballY >= paddle1Y && ballY <= paddle1Y + paddleWidth)
        ) {
          ballSpeedX = -ballSpeedX;
          let deltaY = ballY - (paddle1Y + paddleWidth / 2);
          ballSpeedY = deltaY * 0.2;
        } else {
          if (ballX < Width / 2) {
            player2Score++;
            if (player2Score === 11) {
              winner = "PLAYER2";
              gameOver = true;
            }
          } else {
            player1Score++;
            if (player1Score === 11) {
              winner = "PLAYER1";
              gameOver = true;
            }
          }
          reset();
        }
      } // vertical
      if (ballY > Height || ballY < 0) {
        ballSpeedY = -ballSpeedY;
      }
      // ai paddle movement, limits at canvas boundaries to make it more efficient
      if (!monkey) {
        if (
          ballY > paddle2Y + paddleWidth / 3 &&
          paddle2Y + paddleWidth < Height
        ) {
          paddle2Y += paddleSpeed;
        } else if (ballY < paddle2Y + paddleWidth / 3 && paddle2Y > 0) {
          paddle2Y -= paddleSpeed;
        }
      } else {
        if (keys.isPressed(40) && paddle2Y + paddleWidth < Height) {
          // DOWN
          paddle2Y += paddleSpeed;
        } else if (keys.isPressed(38) && paddle2Y > 0) {
          // UP
          paddle2Y -= paddleSpeed;
        }
      }
      // player1 paddle movement thanks to
      // http://blog.mailson.org/2013/02/simple-pong-game-using-html5-and-canvas
      // same limits as ai for efficiency
      if (keys.isPressed(83) && paddle1Y + paddleWidth < Height) {
        // DOWN
        paddle1Y += paddleSpeed;
      } else if (keys.isPressed(87) && paddle1Y > 0) {
        // UP
        paddle1Y -= paddleSpeed;
      }
    };
    // draw default if changing game type, else save last draw
    const GameOver = () => {
      ballSpeedY = 0;
      paddle1Y = Height / 2 - paddleWidth / 2;
      paddle2Y = Height / 2 - paddleWidth / 2;
      player1Score = 0;
      player2Score = 0;
      ctx.textAlign = "center";
      if (winner !== "") {
        ctx.fillStyle = "#888";
        ctx.font = "36px Orbitron";
        ctx.fillText(winner + " WON!", Width / 2, 150);
      } else {
        ballY = Height / 2;
        ballX = Width / 2;
        drawAll();
        gameOver = true;
      }
      ctx.font = "14px Roboto Mono";
      ctx.fillText("Click anywhere to start a new game.", Width / 2, 200);
      document.addEventListener("mousedown", () => {
        gameOver = false;
        winner = "";
      });
    };
    // trigger 2 monkeys
    this.butt1.addEventListener('click' ,() => {
      ballY = Height / 2;
      ballX = Width / 2;
      GameOver();
      monkey = true;
      this.butt1.style.display = 'none';
      this.butt2.style.display = 'initial';
      this.btnRight.style.display = 'initial';
    });
    // trigger AI
    this.butt2.addEventListener('click' ,() => {
      GameOver();
      monkey = false;
      this.butt2.style.display = 'none';
      this.butt1.style.display = 'initial';
      this.btnRight.style.display = 'none';
    });
    // to block automatic start
    GameOver();
    // default 60fps
    setInterval(() => {
      if (gameOver === false) {
        moveAll();
        drawAll();
      } else {
        GameOver();
      }
    }, 1000 / fps);
  }

  render() {
    return (
      <div>
        <canvas
          ref={(canvas) => {this.canvas = canvas}}
          width={gameWidth}
          height={gameHeight}
          id="gameCanvas"
        />
        <div className="buttons buttonLeft">W</div>
        <div className="buttons buttonLeft" id="buttonS">S</div>
        <div 
          ref={(element) => {
            this.btnRight = element
          }}
          className="buttons buttonRight" id="buttonUp"
          >Up</div>
        <div 
          ref={(element) => {this.btnRight = element}}
          className="buttons buttonRight"
        >Down</div>
        <button 
          ref={(butt1) => {this.butt1 = butt1}}
          className="buttons" 
          id="butt1"
        >vs Computer</button>
        <button 
          ref={(butt2) => {this.butt2 = butt2}}
          className="buttons" 
          id="butt2"
        >2 Players</button>
      </div>
    );
  }
}

export default App;

