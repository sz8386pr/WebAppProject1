$(document).ready(function() {
    resize();
    var current_progress = 100;
    var health = 100;

    var interval = setInterval(function () {
        current_progress -= 10;
        var currentHealth = health - current_progress
        console.log(currentHealth)
        if (current_progress <= 0)
            clearInterval(interval);
        $('#test')
            .css("width", currentHealth + '%')
            .attr("aria-valuenow", currentHealth)
        $('#enemyHP')
            .text(currentHealth);
     }, 1000);
});

// adjust the game size keeping the aspect ratio
function resize()
{
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    var  height = windowHeight-10;
    var  width = height *0.9;

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

window.addEventListener("resize", resize);