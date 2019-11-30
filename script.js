const $startBtn = document.getElementById('start-btn')
$startBtn.addEventListener('click', () => {
    // TODO communicate with server
    onGameStart();
    $startBtn.remove();
})

let $mazeContainer = null

// on setup update  I: { blueTeam: number, redTeam: number }
function onSetupUpdate({teamA, teamB}){
    teams['teamA'].playerCount = teamA;
    teams['teamB'].playerCount = teamB;

}

function onGameStart(){
    const $mazeContainer = document.getElementById('maze-container');
    for(const $tile of $mazeContainer.children){
        for(const $border of $tile.children){
            $border.className = $border.className.replace('-white', '');
        }
    }
    $circle = document.createElement('div');
    $circle.classList.add('circle');
    $mazeContainer.children[teams['teamA'].currTile].appendChild($circle)
    $square = document.createElement('div');
    $square.classList.add('square');
    $mazeContainer.children[teams['teamB'].currTile].appendChild($square);
}

// on team update I: whichTeam, { currTile: number, prevVotingStatus: success | error | null } Effect: update team location, (optionally) show feedback based prevVotingStatus
function onTeamUpdate(whichTeam, {currTile, prevVotingStatus}){
    teams[whichTeam].currTile = currTile;
    teams[whichTeam].prevVotingStatus = prevVotingStatus;

    

    //TODO do sth prevVotingStatus
}

// on game end I: winningTeam
function onGameEnd(winningTeam){}

function onGameInit(doorIndices) {
    $mazeContainer = document.getElementById('maze-container')
    for(const doorIndex of doorIndices) {
        const $tile = createTile([doorIndex])
        $mazeContainer.appendChild($tile)
    }
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
    teamA: {currTile: 0, prevVotingStatus: null, playerCount: 0},
    teamB: {currTile: 0, prevVotingStatus: null, playerCount: 0}
}


onGameInit([4,8,4, 7,11,1, 4,4,0]);


