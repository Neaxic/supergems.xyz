// struct Horse {
//     uint id;
//     uint range[2]; //Range for the chance.
//     uint chance;
//     mapping(address => uint) betters;
// }

// struct Round {
//     RoundStatus status;
//     uint cutoffTime;
//     uint maximumNumberOfDeposits;
//     uint maximumNumberOfParticipants;
//     uint valuePerEntry;
//     Horse[] horses;
// }

// enum RoundStatus {Waiting, Racing, Finished}
// uint public roundsCount;
// bool isPaused = false;


// event HorsesUpdated(uint roundId, Horse[])
// event RoundStatusUpdated(uint roundId, RoundStatus)

// Horses = 6[]

// /**
//  * @param _roundsCount The current rounds count
//  */
// function _startRound(uint256 _roundsCount) private returns (uint256 roundId) {
//     unchecked {
//         roundId = _roundsCount + 1;
//     }
//     roundsCount = uint40(roundId);
//     rounds[roundId].status = RoundStatus.Waiting;
//     rounds[roundId].cutoffTime = uint40(block.timestamp) + roundDuration;
//     rounds[roundId].maximumNumberOfDeposits = maximumNumberOfDepositsPerRound;
//     rounds[roundId].maximumNumberOfParticipants = maximumNumberOfParticipantsPerRound;
//     rounds[roundId].valuePerEntry = valuePerEntry;
//     emit RoundStatusUpdated(roundId, RoundStatus.Open);
// }

// public betHorse(id, bet){
// 	if !isPaused && !isAGameRunning
// 	if bal > 0

// 	let bethorse = horses.find((e) => e.id === id)
// 	//checking if already bet, then increasing that bet
// 		let betObj = betHorse.betters.find((e) => e.addy === msg.sender)
// 		if(betObj) {
// 			betObj.bet =+ bet;
// 				//betHorse.betters
// 		} else {
// 			bethorse.betters.push({addy: msg.sender, bet: bet})
// 		}

//     //transfering the bet to the contract
//     contractBalance += bet;
//     transfer(bet)

//     //If this is the first bet of the round, start the game timer

// }

// private populateHorses(){
//     for(let i = 0; i < 6; i++){
//         horses.push({id: i, range: [.5, .6], chance: 0, betters: []})
//     }
// }

// private calculateHorseOdds(){
//     horses.forEach((horse) => {
//         horse.chance = Math.random() * (horse.range[1] - horse.range[0]) + horse.range[0];
//     })
// }

// public setHorseRange(id, range) onlyOwner{
//     if !isPaused && !isAGameRunning

//     let horse = horses.find((e) => e.id === id)
//     horse.range = range;
// }

// public initNewGame(){
//     if !isPaused && !isAGameRunning
//     calculateHorseOdds();

// }

