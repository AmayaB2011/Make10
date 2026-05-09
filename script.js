let previousConnection = null;
let slide = false;
let gameOver = false;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let highestNumber = 0;
let startingNumbers = [
    {number: 1, probability: 0.35, colour: '#FCC13D'},
    {number: 2, probability: 0.3, colour: '#cf1d09'},
    {number: 3, probability: 0.2, colour: '#4CB4CC'},
    {number: 4, probability: 0.15, colour: '#7AC843'},
    {number: 5, probability: 0, colour: '#723e57'},
    {number: 6, probability: 0, colour: '#FF7BAB'},
    {number: 7, probability: 0, colour: '#5EAD7F'},
    {number: 8, probability: 0, colour: '#C55B15'},
    {number: 9, probability: 0, colour: '#888E4F'},
    {number: 10, probability: 0, colour: '#E68370'},
];

for (let i = 0; i < 25; i++) {
    let place = document.createElement('div');
    place.classList.add('place');
    place.id = `place${i}`;
    document.getElementById('board').appendChild(place);
}

function startGame() {
    for (let i = 0; i < 25; i++) {
        function createTile(i) {
            let tile = document.createElement('div');
            tile.classList.add('tile');
            tile.id = `tile${i}`;
            for (let x = 0; x < 4; x++) {
                tile.appendChild(document.createElement('div'));
            }
            document.getElementById(`place${i}`).appendChild(tile);

            if (slide) {
                tile.style.transform = 'translateY(-400px)';
                tile.style.transition = 'transform 0.2s ease';
                requestAnimationFrame(() => {
                    tile.style.transform = 'translateY(0)';
                });
                let X = document.getElementById(`place${i}`).getBoundingClientRect().left - document.getElementById(`tile${i}`).getBoundingClientRect().left;
                let Y = document.getElementById(`place${i}`).getBoundingClientRect().top - document.getElementById(`tile${i}`).getBoundingClientRect().top;
                document.getElementById(`tile${i}`).style.transform = `translate(${X}px, ${Y}px)`;
            }

            let number;
            let total = 0;
            for (let x = 0; x < startingNumbers.length; x++) {
                total += startingNumbers[x].probability;
                if (Math.random() < total) {
                    number = startingNumbers[x];
                    break;
                }
            }

            let label = document.createElement('span');
            label.textContent = number.number;
            tile.appendChild(label);
            tile.dataset.number = number.number;
            tile.style.backgroundColor = number.colour;

            tile.addEventListener('click', () => {
                let connectingNumbers = [parseInt(tile.id.replace("tile", ""))];
                function checkAround(startingTile, update) {
                    let currentNumber = document.getElementById(`tile${startingTile}`).dataset.number;
                    let shadows = [];
                    let connectionsFound = [];
                    let condisionVarables = [
                        { add: -1, edge: [0, 5, 10, 15, 20], shadow: "inset 7px 0 0 #FFF" },
                        { add: 1, edge: [4, 9, 14, 19, 24], shadow: "inset -7px 0 0 #FFF" },
                        { add: -5, edge: [0, 1, 2, 3, 4], shadow: "inset 0 7px 0 #FFF" },
                        { add: 5, edge: [20, 21, 22, 23, 24], shadow: "inset 0 -7px 0 #FFF" },
                    ];
                    condisionVarables.forEach(({ add, edge, shadow }) => {
                        if (!edge.includes(startingTile) && document.getElementById(`tile${startingTile + add}`)?.dataset.number == currentNumber) {
                            connectionsFound.push(startingTile + add);
                        } else {
                            shadows.push(shadow);
                        }
                    });
                    for (let x = 0; x < connectionsFound.length; x++) {
                        if (!connectingNumbers.includes(connectionsFound[x]) && update) connectingNumbers.push(connectionsFound[x]);
                    }
                    if (update) document.getElementById(`tile${startingTile}`).style.boxShadow = shadows.join(", ");
                    if (connectionsFound.length > 0) {
                        return true;
                    } else {
                        return false;
                    }
                }
                function removeLines() {
                    for (let x = 0; x < 25; x++) {
                        if (document.getElementById(`tile${x}`)) document.getElementById(`tile${x}`).style.boxShadow = 'none';
                        if (document.getElementById(`tile${x}`).children[0]) document.getElementById(`tile${x}`).children[0].style.display = 'none';
                        if (document.getElementById(`tile${x}`).children[1]) document.getElementById(`tile${x}`).children[1].style.display = 'none';
                        if (document.getElementById(`tile${x}`).children[2]) document.getElementById(`tile${x}`).children[2].style.display = 'none';
                        if (document.getElementById(`tile${x}`).children[3]) document.getElementById(`tile${x}`).children[3].style.display = 'none';
                    }
                }

                removeLines();
                let e = 0;
                while (e < connectingNumbers.length) {
                    checkAround(connectingNumbers[e], true);
                    e++;
                }
                for (let x = 0; x < 25; x++) {
                    if (!connectingNumbers.includes(x) && connectingNumbers.includes(x + 1) && connectingNumbers.includes(x + 5) && connectingNumbers.includes(x + 6)) document.getElementById(`tile${x + 6}`).children[0].style.display = 'block';
                    if (!connectingNumbers.includes(x) && connectingNumbers.includes(x - 1) && connectingNumbers.includes(x - 5) && connectingNumbers.includes(x - 6)) document.getElementById(`tile${x - 6}`).children[3].style.display = 'block';
                    if (!connectingNumbers.includes(x) && connectingNumbers.includes(x + 1) && connectingNumbers.includes(x - 5) && connectingNumbers.includes(x - 4)) document.getElementById(`tile${x - 4}`).children[2].style.display = 'block';
                    if (!connectingNumbers.includes(x) && connectingNumbers.includes(x - 1) && connectingNumbers.includes(x + 5) && connectingNumbers.includes(x + 4)) document.getElementById(`tile${x + 4}`).children[1].style.display = 'block';
                }

                if (previousConnection != null && previousConnection.length === connectingNumbers.length && [...previousConnection].sort().every((item, index) => item === [...connectingNumbers].sort()[index]) && connectingNumbers.length > 1) {
                    removeLines();
                    let finished = 0;
                    let added = false;
                    let moveTo = document.getElementById(`tile${parseInt(tile.id.replace("tile", ""))}`);
                    let tileValue = parseInt(moveTo.dataset.number);
                    score += tileValue;
                    for (let x = 1; x < connectingNumbers.length; x++) {
                        document.querySelectorAll(".tile").forEach(tile => {
                            tile.style.transition = "transform 0.15s ease";
                        });
                        let moveFrom = document.getElementById(`tile${connectingNumbers[x]}`);
                        let moveX = moveTo.getBoundingClientRect().left - moveFrom.getBoundingClientRect().left;
                        let moveY = moveTo.getBoundingClientRect().top - moveFrom.getBoundingClientRect().top;

                        moveFrom.style.transform = `translate(${moveX}px, ${moveY}px)`;
                        moveFrom.addEventListener('transitionend', transitionend, { once: true });
                        function transitionend() {
                            moveFrom.remove();
                            score += tileValue;
                            if (highestNumber < tileValue + 1) {
                                highestNumber = tileValue + 1
                            }
                            finished++;
                            if (!added) {
                                moveTo.dataset.number = parseInt(moveTo.dataset.number) + 1;
                                moveTo.children[4].textContent = moveTo.dataset.number;
                                moveTo.style.backgroundColor = startingNumbers[moveTo.dataset.number - 1].colour;
                                added = true;
                            }

                            if (finished === connectingNumbers.length - 1) {
                                for (let x = 19; x >= 0; x--) {
                                    if (document.getElementById(`place${x + 5}`).children.length == 0 && document.getElementById(`place${x}`).children.length == 1) {
                                        if ([15, 16, 17, 18, 19].includes(x) || document.getElementById(`place${x + 10}`).children.length == 1) {
                                            fallDown(x, x + 5);
                                        } else if ([10, 11, 12, 13, 14].includes(x) || document.getElementById(`place${x + 15}`).children.length == 1) {
                                            fallDown(x, x + 10);
                                        } else if ([5, 6, 7, 8, 9].includes(x) || document.getElementById(`place${x + 20}`).children.length == 1) {
                                            fallDown(x, x + 15);
                                        } else if ([0, 1, 2, 3, 4].includes(x)) {
                                            fallDown(x, x + 20);
                                        }
                                    }
                                }
                                for (let y = 0; y < 25; y++) {
                                    if (document.getElementById(`place${y}`).children.length == 0) {
                                        createTile(y);
                                        if (finished === connectingNumbers.length - 1) {
                                            for (let y = 0; y < 25; y++) {
                                                if (document.getElementById(`place${y}`).children.length == 0) {
                                                    createTile(y);
                                                }
                                            }
                                            requestAnimationFrame(() => {
                                                for (let z = 0; z < 25; z++) {
                                                    gameOver = true;
                                                    for (let z = 0; z < 25; z++) {
                                                        if (checkAround(z, false)) {
                                                            gameOver = false;
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (gameOver) {
                                                    if (score > bestScore) {
                                                        bestScore = score;
                                                        localStorage.setItem("bestScore", score);
                                                    }
                                                    document.getElementById('finalScore').innerText = score;
                                                    document.getElementById('highScore').innerText = bestScore;
                                                    document.getElementById("gameOver").classList.add("show");
                                                    document.getElementById("gameOver").classList.remove("hide");
                                                    showing = true;
                                                    setTimeout(() => {
                                                        let i = 0;
                                                        let interval = setInterval(() => {
                                                            if (i >= highestNumber) {
                                                                clearInterval(interval);
                                                                return;
                                                            }
                                                            document.getElementById('blocks').children[i].style.opacity = '1';
                                                            i++;
                                                        }, 250);
                                                    }, 500);
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                            function fallDown(from, to) {
                                document.querySelectorAll(".tile").forEach(tile => {
                                    tile.style.transition = "transform 0.15s ease";
                                });
                                let goTo = document.getElementById(`place${to}`);
                                let goFrom = document.getElementById(`tile${from}`);
                                let first = goFrom.getBoundingClientRect();
                                let target = goTo.getBoundingClientRect();
                                goTo.appendChild(goFrom);
                                goFrom.id = `tile${to}`;
                                goFrom.style.transition = "none";
                                goFrom.style.transform = `translate(${first.left - target.left}px, ${first.top - target.top}px)`;
                                requestAnimationFrame(() => {
                                    requestAnimationFrame(() => {
                                        goFrom.style.transition = "transform 0.25s";
                                        goFrom.style.transform = "translate(0,0)";
                                    });
                                });
                            }
                            if (finished === connectingNumbers.length - 1) {
                                let currentScore = parseInt(document.getElementById("score").innerText);
                                let interval = setInterval(() => {
                                    if (currentScore < score) {
                                        currentScore++;
                                        document.getElementById("score").innerText = currentScore;

                                        document.getElementById("score").style.opacity = "0.4";
                                        setTimeout(() => {
                                            document.getElementById("score").style.opacity = "1";
                                        }, 40);
                                    } else {
                                        clearInterval(interval);
                                    }
                                }, 25);
                            }
                        }
                    }
                }
                previousConnection = [...connectingNumbers];
            });
        }
        createTile(i);
    }
    slide = true;
}
startGame();

document.getElementById('playAgain').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add("hide");
    document.getElementById('gameOver').classList.remove("show");
    previousConnection = null;
    slide = false;
    gameOver = false;
    score = 0;
    highestNumber = 0;
    document.getElementById("score").innerText = score;
    document.querySelectorAll('.tile').forEach(el => el.remove());
    startGame();
});