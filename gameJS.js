// iframe contents
var mainFrameContents;
var menuFrameContents;


var stage = 1;

let gameOver = false;
//https://stackoverflow.com/questions/8093297/jquery-can-i-detect-once-all-content-is-loaded
$(window).on('load', function() {

    // default number setup
    let playerData = setup();

    beginStage(playerData);

    menuFrameContents.find("#attackButton").click(function(){
        if (gameOver) {
            alert("Game is over. Refresh the page to play again")
        }
    });


});

// initial stats/number display
function setup() {
    // Base player stats
    let playerHP = 100;
    let playerAtt = 5;
    let playerDef = 5;
    let xp = 0;
    let currentGold = 0;
    resize();
    // iframe contents
    mainFrameContents = $('iframe#mainFrame').contents();
    menuFrameContents = $('iframe#menuFrame').contents();

    // player stats
    menuFrameContents.find('#hp').text(playerHP);
    menuFrameContents.find('#att').text(playerAtt);
    menuFrameContents.find('#def').text(playerDef);
    menuFrameContents.find('#xp').text(xp);
    menuFrameContents.find('#gold').text(currentGold);

    return {playerHP: playerHP, playerAtt: playerAtt, playerDef: playerDef, xp: xp, currentGold: currentGold};
}



// enemy stats referenced from http://yanfly.moe/tools/enemylevelcalculator/
function enemySetup() {
    let baseEnemyHP = 50, baseEnemyAtt = 5, baseEnemyDef = 5, baseEnemyXP = 10, baseEnemyGold = 10;
    let rateHP =  .3, rateAtt = .05, rateDef = .05, rateXP = .15, rateGold = 1;
    let flatHP = 50, flatAtt = 2.5, flatDef = 2.5, flatXP = 10, flatGold = 10;

    let enemyHP = enemyCalc(baseEnemyHP, rateHP, flatHP);
    let enemyAtt = enemyCalc(baseEnemyAtt, rateAtt, flatAtt);
    let enemyDef = enemyCalc(baseEnemyDef, rateDef, flatDef);
    // let enemyXP = Math.round(enemyCalc(baseEnemyXP, rateXP, flatXP));
    let enemyGold = Math.round(enemyCalc(baseEnemyGold, rateGold, flatGold));

    // console.log(enemyDef + 'eDef');

    //https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

    // random alphanumeric string. https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
    // needs better algorithm later on
    let enemyName = Math.random().toString(36).substr(2, 7);

    // update stage number
    mainFrameContents.find('#stageNumber').text(stage);
    mainFrameContents.find('#enemyHPBar')
            .attr("aria-valuemax", enemyHP)
            .attr("aria-valuenow", enemyHP)
            .css("width", '100' + '%');
    mainFrameContents.find('#enemyHP').text('100');


    mainFrameContents.find('#monsterNameDisplay').text(enemyName);
    mainFrameContents.find('#monsterImage')
        .attr("src", "https://robohash.org/" + enemyName +"?set=set2")
        .attr("alt", "Lovely portrait of " + enemyName);

    return {enemyHP: enemyHP, enemyAtt: enemyAtt, enemyDef: enemyDef,
        // enemyXP: enemyXP,
        enemyGold: enemyGold, enemyName: enemyName};
}

// enemy stats calculation referenced from http://yanfly.moe/tools/enemylevelcalculator/
function enemyCalc(base, rate, flat) {
    return base * (1 + (stage - 1) * rate) + (flat * (stage - 1));
}



function beginStage(playerData) {
    let enemyAttackRate = 5000; //default enemy attackrate of 5000 ms
    let enemyData = enemySetup();

    // change enemy image based on randomly generated name. Powered by robohash.org
    // robohash.org generates random images based on the text sting.


    let enemyCurrentHP = enemyData.enemyHP;

    enemyData.enemyCurrentHP = enemyCurrentHP;
    // let xp = enemyData.enemyXP;
    let gold = enemyData.enemyGold;

    // console.log(enemyCurrentHP);


    let enemyAttack = setInterval(function(){
        if ( enemyData.enemyCurrentHP <= 0 || playerData.playerHP <= 0) {
            clearInterval(enemyAttack);
        }
        else {
            enemyAtt(playerData, enemyData);
        }

    }, enemyAttackRate);


    let interval = setInterval(function() {
        if (enemyData.enemyCurrentHP <= 0) {
            clearInterval(interval);
            endStage(playerData, gold);
        }
    }, 0);

    let playerLife = setInterval(function () {
        if ( (playerData.playerHP <= 0) && !gameOver) {
            clearInterval(playerLife);
            endGame();
        }

    }, 0);

    menuFrameContents.find("#attackButton").click(function(){
        if (!gameOver) {
            attackEnemy(playerData, enemyData)
        }
    });

}



// when the player defeats the enemy of the stage
function endStage(playerData, gold) {
    alert('Stage' + stage + ' clear!\nOnto the next stage!');
    playerData.currentGold += gold;

    menuFrameContents.find('#gold').text(gold);

    stage++;
    beginStage(playerData)
}








// adjust the game size keeping the aspect ratio
function resize() {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    let  height = windowHeight-10;
    let  width = height *0.9;

    if (width >= windowWidth-10) {
         width = windowWidth-10;
         height = width / 0.9;
    }

    $("#mainFrame")
        .css('height', height + "px")
        .css('width', width*.75 + 'px');
    $("#menuFrame")
        .css('height', height + "px")
        .css('width', width *.25 + 'px');
}


// combat damage calculation. Returns the dmg value based on the attacker
function combat(playerData, enemyData, attacker) {
    let enemyDMG = (playerData.playerAtt * playerData.playerAtt) / (playerData.playerAtt + enemyData.enemyDef);
    let playerDMG = (enemyData.enemyAtt * enemyData.enemyAtt) / (enemyData.enemyAtt + playerData.playerDef);

    if (attacker === 'player') {
        return enemyDMG
    }
    else if (attacker === 'enemy') {
        return playerDMG
    }
}

// enemy attack phase
function enemyAtt(playerData, enemyData) {
    let playerDMG = combat(playerData, enemyData, 'enemy');

    playerData.playerHP -= playerDMG;
    let playerHP = playerData.playerHP;

    if (playerHP <= 0) {
        menuFrameContents.find('#hp').text("0");
    }
    else if (playerHP.toFixed(0) === '0') {
        menuFrameContents.find('#hp').text("1");
    }
    else {
        menuFrameContents.find('#hp').text(playerHP.toFixed(0));
    }
}

// player attack on click
function attackEnemy(playerData, enemyData) {
    let enemyDMG = combat(playerData, enemyData, 'player');

    enemyData.enemyCurrentHP -= enemyDMG;
    // console.log(enemyDMG);
    let enemyHPPerc = enemyData.enemyCurrentHP / enemyData.enemyHP * 100;
    // console.log(enemyHPPerc);

    mainFrameContents.find('#enemyHPBar')
        .attr("aria-valuenow", enemyData.enemyCurrentHP)
        .css("width", enemyHPPerc + '%');
    if (enemyHPPerc <= 0) {
        mainFrameContents.find('#enemyHP').text('0');
    }
    else if (enemyHPPerc.toFixed(0) === '0') {
        mainFrameContents.find('#enemyHP').text('1');
    }
    else {
        mainFrameContents.find('#enemyHP').text(enemyHPPerc.toFixed(0));
    }
}

// when player hp goes equal to or below 0
function endGame() {
    alert('You died');
    gameOver = true;

}

// whenever player resize one's window, trigger resize() function
window.addEventListener("resize", resize);