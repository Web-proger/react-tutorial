import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                key={i}
            />
        );
    }

    render() {
        return (
            <div>
                {[0, 1, 2].map(index => (
                    <div className="board-row" key={index}>
                        {[0, 1, 2].map(value => this.renderSquare(index * 3 + value))}
                    </div>
                ))}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                coords: {
                    line: 0,
                    column: 0,
                }
            }],
            stepNumber: 0,
            xIsNext: true,
            reverseSort: false,
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).player || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                coords: {
                    line: Math.floor(i / 3) + 1,
                    column: (i % 3) + 1,
                },
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        if (step) {
            const history = this.state.history.slice();
            const {line, column} = history[step].coords;
            const squareNumber = (((line - 1) * 3) + column) - 1;

            const square = document.getElementsByClassName('square')[squareNumber];
            square.classList.add('highlight-square');
            setTimeout(() => {
                square.classList.remove('highlight-square');
            }, 2000);

        }
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }

    invertSort() {
        this.setState({reverseSort: !this.state.reverseSort})
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const reverseSort = this.state.reverseSort;

        let moves = history.map((step, move) => {
            const coords = history[move].coords;
            const desc = move ? 'Перейти к ходу #' + move : 'К началу игры';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                        {desc} ({coords.column}, {coords.line})
                    </button>
                </li>
            );
        });

        if (reverseSort) {
            moves = moves.reverse();
        }

        let status;
        if (winner.player) {
            status = 'Выиграл: ' + winner.player;
            winner.line.forEach(el => {
                const square = document.getElementsByClassName('square')[el];
                square.classList.add('highlight-line');
                setTimeout(() => {
                    square.classList.remove('highlight-line');
                }, 2000);
            });
        } else {
            status = 'Следующий ход: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <br/>
                    <button onClick={() => this.invertSort()}>Обратная сортировка: {reverseSort ? 'Да' : 'Нет'}</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {player: squares[a], line: [a, b, c]};
        }
    }
    return {player: null, line: []};
}
