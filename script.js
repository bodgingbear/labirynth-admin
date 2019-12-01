const socket = io('http://localhost:1337/admin')

const $startBtn = document.getElementById('start-btn')
$startBtn.addEventListener('click', () => {
    // TODO communicate with server
    // $startBtn.remove();
    socket.emit('game-init')
})


// on setup update  I: { blueTeam: number, redTeam: number }
function onSetupUpdate({teamA, teamB}){
    teams['teamA'].playerCount = teamA;
    teams['teamB'].playerCount = teamB;

}

function onGameStart(){
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
}

// on team update I: whichTeam, { currTile: number, prevVotingStatus: success | error | null } Effect: update team location, (optionally) show feedback based prevVotingStatus
function onTeamUpdate({team: { id: whichTeam }, previousOutcome, gameOrder}){
    const $mazeContainer = document.getElementById('maze-container');
    teams[whichTeam].currTile = gameOrder;
    teams[whichTeam].prevVotingStatus = previousOutcome;

    if($mazeContainer.children.length > 0){
        $mazeContainer.children[gameOrder].appendChild(teams[whichTeam].$entity);
    }

    //TODO do sth prevVotingStatus
}

// on game end I: winningTeam
function onGameEnd(winningTeam){}

function onGameInit({game: {gameDoors: doorIndices, gameOrder: tilesIndices}} ) {
    const $mazeContainer = document.getElementById('maze-container');
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
//onGameInit([4,8,4, 7,11,1, 4,4,0]);


