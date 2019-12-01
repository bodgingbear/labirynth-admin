setTimeout(() => {
    document.querySelector('.logo').classList.add('hide-logo');
}, 2100)

let socketUrl = 'http://localhost:1337';

if (!(/(^\d+\.)|(^localhost$)/.test(window.location.hostname))) {
    socketUrl = 'https://bb-pgg-labyrinth.herokuapp.com';
}

const socket = io(`${socketUrl}/admin`);

const bravoSound = new Audio('bravo, this is not a wall.mp3')
const oopsSound = new Audio('oops, this is a wall.mp3')
const music = new Audio('music.mp3')
music.volume = 0.3

const celebrateSound = new Audio('koolSuccess.mp3')
celebrateSound.volume = 0.8
const $confetti = document.querySelector('#confetti');
const confettiSettings = {
    target: 'confetti',
    width: document.innerWidth,
    height: document.innerHeight,
};
const confetti = new ConfettiGenerator(confettiSettings);

const $startBtn = document.getElementById('start-btn')
$startBtn.addEventListener('click', () => {
    bravoSound.play()
    bravoSound.pause()
    socket.emit('game-init')
})

function onSetupUpdate({team, count}){
    teams[team].playerCount = count;
    document.querySelector(`#${team}-count`).innerText = count
}

function onGameStart(){
    music.play()
    const $mazeContainer = document.getElementById('maze-container');
    for(const $tile of $mazeContainer.children){
        for(const $border of $tile.children){
            $border.className = $border.className.replace(/\-white/g, '');
        }
    }

    const $iconsContainer = document.createElement('div');
    $iconsContainer.classList.add('iconsContainer');

    $circle = document.createElement('div');
    $circle.classList.add('icon');
    $circle.classList.add('circle');

    $square = document.createElement('div');
    $square.classList.add('icon');
    $square.classList.add('square');

    $iconsContainer.appendChild($circle);
    $iconsContainer.appendChild($square);

    $mazeContainer.children[0].appendChild($iconsContainer);

    teams['teamA'].$entity = $circle;
    teams['teamB'].$entity = $square;

    document.querySelector('#timer').style.setProperty('visibility', 'hidden')
}

function onTeamUpdate({team: { id: whichTeam }, previousOutcome, gameOrder}){
    const $mazeContainer = document.getElementById('maze-container');
    teams[whichTeam].currTile = gameOrder;
    teams[whichTeam].prevVotingStatus = previousOutcome;

    if($mazeContainer.children.length > 0){
        let $iconsContainer = $mazeContainer.children[gameOrder].querySelector('.iconsContainer');

        if ($iconsContainer === null) {
            $iconsContainer = document.createElement('div');
            $iconsContainer.classList.add('iconsContainer');
            $mazeContainer.children[gameOrder].appendChild($iconsContainer);
        }

        if(whichTeam === 'teamA'){
            $iconsContainer.prepend(teams[whichTeam].$entity);
        }
        else{
            $iconsContainer.appendChild(teams[whichTeam].$entity);
        }
    }

    const teamStr = whichTeam.charAt(0).toUpperCase() + whichTeam.substr(1, 3) + ' ' + whichTeam.substr(4, 5);

    if(previousOutcome === 'error'){
        oopsSound.play()
        teams[whichTeam].$entity.classList.add('error');
        addSubs(`${teamStr}: Oops, this is a wall.`)
    }

    if(previousOutcome === 'success'){
        bravoSound.play()
        teams[whichTeam].$entity.classList.remove('error');
        addSubs(`${teamStr}: Bravo, this is not a wall!`)
    }
}

function addSubs(sub) {
    const $sub = document.createElement('div')
    $sub.classList.add('sub')
    $sub.innerText = sub

    const $subs = document.querySelector('#subs')
    $subs.appendChild($sub)

    while($subs.children.length > 3) {
        $subs.children[0].remove()
    }

    setTimeout(() => {
        $sub.remove()
    }, 8000)
}

function onGameEnd({team: {id: winningTeam}}){
    confetti.render();

    document.querySelector('.cont').classList.add('hidden');
    const $winningTextCont = document.createElement('div');
    const $winningTextTeam = document.createElement('div');
    const $chickenDinner = document.createElement('div');
    $chickenDinner.textContent = 'Winner, winner chicken dinner!';
    $winningTextTeam.classList.add('teamText');
    $chickenDinner.classList.add('teamText');
    $winningTextCont.classList.add('textCont');
    const teamStr = winningTeam.substr(0, 4) + ' ' + winningTeam.substr(4, 5);
    $winningTextTeam.textContent = teamStr.toUpperCase();
    $winningTextTeam.style.color = winningTeam === 'teamA' ? '#ff00ff' : '#fff000';
    $winningTextCont.appendChild($winningTextTeam);
    $winningTextCont.appendChild($chickenDinner);
    document.body.prepend($winningTextCont);

    music.pause()
    celebrateSound.play()

    document.querySelector('#start-screen').style.setProperty('visibility', 'hidden')
}

function onGameInit({game: {gameDoors: doorIndices, gameOrder: tilesIndices, time}} ) {
    const $mazeContainer = document.getElementById('maze-container');
    document.body.style.setProperty('--size', Math.sqrt(doorIndices.length))
    $mazeContainer.textContent = '';
    let preDoorIndex = null
    const tiles = []
    for(const tileIndex of tilesIndices) {
        const doorIndex = doorIndices[tileIndex]
        const doorIndices2 = [doorIndex]
        if(preDoorIndex !== null) {
           doorIndices2.push(((Math.floor(preDoorIndex / 3)+ 2) % 4) * 3 + 2 - (preDoorIndex % 3))
        }
        const $tile = createTile(doorIndices2)
        preDoorIndex = doorIndex
        tiles.push({$tile, tileIndex})
    }

    document.querySelector('#start-btn').style.display = 'none';

    tiles.sort(({tileIndex: a}, {tileIndex: b}) => a - b)
    tiles.forEach(({$tile}) => $mazeContainer.appendChild($tile))

    document.querySelector('#timer').style.setProperty('visibility', 'visible')

    let timeLeft = Math.floor(time / 1000)
    const updateTime = () => {
        document.querySelector('#seconds-left').innerText = ('0' + timeLeft).slice(-2)
        timeLeft--

        if(timeLeft < 0) {
            return
        }

        setTimeout(updateTime, 1000)
    }

    updateTime()
}

function createTile(doorIndices) {
    const borderBoxToDoor = {
        0: [{ doorIndex: 11, border: 'left' }, { doorIndex: 0, border: 'top' }],
        1: [{ doorIndex: 1, border: 'top' }],
        2: [{ doorIndex: 2, border: 'top' }, { doorIndex: 3, border: 'right' }],
        3: [{ doorIndex: 10, border: 'left' }],
        5: [{ doorIndex: 4, border: 'right' }],
        6: [{ doorIndex: 8, border: 'bottom' }, { doorIndex: 9, border: 'left' }],
        7: [{ doorIndex: 7, border: 'bottom' }],
        8: [{ doorIndex: 5, border: 'right' }, { doorIndex: 6, border: 'bottom' }],
    }

    const $tile = document.createElement('div')
    $tile.classList.add('tile')

    const borderClasses = ['left top', 'top', 'top right', 'left', '', 'right', 'bottom left', 'bottom', 'bottom right']
    for(const borderIndex in borderClasses) {
        const borderClass = borderClasses[borderIndex]
        const $border = document.createElement('div')
        $border.classList.add('border')
        if(borderClass) {
            $border.classList.add(...borderClass.split(' '))

            const doorBorderInfos = borderBoxToDoor[borderIndex].filter(({doorIndex}) => doorIndices.includes(doorIndex))
            for(const doorBorderInfo of doorBorderInfos) {
                $border.classList.add(`${doorBorderInfo.border}-white`)
            }
        }
        $tile.appendChild($border)
    }

    return $tile
}

const teams = {
    teamA: {currTile: 0, prevVotingStatus: null, playerCount: 0, $entity: null},
    teamB: {currTile: 0, prevVotingStatus: null, playerCount: 0, $entity: null}
}

socket.on('game-init', onGameInit);
socket.on('game-start', onGameStart);
socket.on('game-update', onTeamUpdate)
socket.on('squad-update', onSetupUpdate)
socket.on('game-end', onGameEnd);
