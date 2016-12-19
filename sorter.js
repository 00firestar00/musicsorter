var Unsorted = videos;
var Total = Unsorted.length;
var Sorted = [];
var Ignored = [];
var Round = 1;
var GroupSize = [];
var newGroupSize = [];
var GroupA = [];
var GroupB = [];
var GroupC = [];
var Alpha = {};
var Beta = {};
var End = false;
var alpha_selector = $("#alpha-btn");
var beta_selector = $("#beta-btn");

function isIgnored(x) {
    return $.inArray(x, Ignored);
}
$("#ignorebtn").click(function () {
    Ignored.push(Alpha);
    Ignored.push(Beta);
    console.log("Ignoring " + Alpha.name + " and " + Beta.name);
    alpha_selector.trigger("click");
});

// Loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var alpha_player, beta_player;
var alpha_vid_id, beta_vid_id;
function onYouTubeIframeAPIReady() {
    // There is probably a race condition here.
    // This gets loaded asynchronously, but if it hits this before the IDs are set we might have a problem
    if (alpha_vid_id && beta_vid_id) {
        alpha_player = new YT.Player('alpha-vid', {
            height: '240',
            width: '428',
            videoId: alpha_vid_id
        });
        beta_player = new YT.Player('beta-vid', {
            height: '240',
            width: '428',
            videoId: beta_vid_id
        });
    }
}

function loadPicks() {
    //Setup groups
    if (GroupA.length + GroupB.length == 0) {
        var x, y;
        y = GroupSize.shift();
        while (GroupA.length < y && Unsorted.length !== 0) {
            x = Unsorted.shift();
            if (x == undefined) break;
            console.log("Added " + x.name + " to GroupA");
            GroupA.push(x);
        }
        y = GroupSize.shift();
        while (GroupB.length < y && Unsorted.length !== 0) {
            x = Unsorted.shift();
            if (x == undefined) break;
            console.log("Added " + x.name + " to GroupB");
            GroupB.push(x);
        }
    }

    //Load picks
    Alpha = GroupA.shift();
    Beta = GroupB.shift();

    document.getElementById("alpha-btn").innerHTML = Alpha.name;
    document.getElementById("beta-btn").innerHTML = Beta.name;
    alpha_vid_id = Alpha.vidId;
    beta_vid_id = Beta.vidId;
    // So this is working because race conditions
    // First time through the player object hasn't been created
    // But we set a global vid_id that will load the video onReady
    alpha_player.loadVideoById(alpha_vid_id);
    alpha_player.stopVideo();
    beta_player.loadVideoById(beta_vid_id);
    beta_player.stopVideo();

    Round++;
    document.getElementById("round").innerHTML = "Round: " + Round;
    document.getElementById("sorted").innerHTML = "Sorted: " + Math.floor(Sorted.length / Total);
    console.log("ROUND " + Round + "!\n" + Alpha.name + " VS " + Beta.name);

    if ((isIgnored(Alpha)) != -1) {
        Ignored.push(Alpha);
        console.log(Alpha.name + " is ignored, " + Beta.name + " wins automatically.");
        beta_selector.trigger("click");
    }
    else if ((isIgnored(Beta)) != -1) {
        Ignored.push(Beta);
        console.log(Beta.name + " is ignored, " + Alpha.name + " wins automatically.");
        alpha_selector.trigger("click");
    }

}

function init() {
    var i;
    for (i = 0; i < Unsorted.length; i++) {
        GroupSize.push(1);
    }
    for (i = 0; i < Total - 1; i++) { //Randomize ship order
        Sorted.push(Unsorted.splice(Math.floor(Math.random() * Unsorted.length), 1)[0]);
    }

    Sorted.push(Unsorted[0]);
    Unsorted = Sorted;
    Sorted = [];
    console.log(Unsorted);
    loadPicks();
}


$(".video_btn").click(function (event) {
    console.log("Unsorted : " + Unsorted.length);
    console.log("Sorted: " + Sorted.length);
    event.preventDefault();
    if (End == true) {
        return;
    }
    //Deal with the winner
    if (event.target.id == "alpha-btn") {
        console.log(Alpha.name + " wins!");
        if (Alpha == undefined) return;
        GroupC.push(Alpha);
        GroupB.unshift(Beta);
    }
    else {
        console.log(Beta.name + " wins!");
        if (Beta == undefined) return;
        GroupC.push(Beta);
        GroupA.unshift(Alpha);
    }
    //If either group empty, add all to GroupC
    if (GroupA.length == 0 || GroupB.length == 0) {
        while (GroupA.length != 0) {
            x = GroupA.shift();
            GroupC.push(x);
        }
        while (GroupB.length != 0) {
            x = GroupB.shift();
            GroupC.push(x);
        }
        if (GroupSize.length == 1) { //If only one group remaining, bonus round with GroupC
            console.log("Extra Round!");
            while (GroupC.length != 0) {
                x = GroupC.shift();
                if (x == undefined) break;
                console.log("Added " + x.name + " to GroupA");
                GroupA.push(x);
            }
            y = GroupSize.shift();
            while (GroupB.length < y) {
                x = Unsorted.shift();
                if (x == undefined) break;
                console.log("Added " + x.name + " to GroupB");
                GroupB.push(x);
            }
        }
        else {
            //Add GroupC to sorted
            newGroupSize.push(GroupC.length); //Get the new size of the group
            while (GroupC.length != 0) {
                x = GroupC.shift();
                Sorted.push(x);
            }
        }
    }

    //if all Unsorted sorted, add all ships back to Sorting pool
    if (Unsorted.length == 0 && GroupA.length + GroupB.length == 0) {
        while (Unsorted != 0) Sorted.push(Unsorted.pop);
        while (Sorted.length != 0) {
            x = Sorted.shift();
            console.log(x + " added to Unsorted");
            Unsorted.push(x);
        }
        while (newGroupSize.length != 0) {
            GroupSize.push(newGroupSize.shift());
        }
        //End
        if (GroupSize.length + newGroupSize.length == 1) {
            $("#ignorebtn").hide(); //hide ignore button
            Unsorted = Unsorted.filter(function (x) {
                return Ignored.indexOf(x) < 0
            }); //remove ignored ships
            console.log(Unsorted);
            End = true;
            var Winner = Unsorted.shift();

            document.getElementById("round").innerHTML = "Round: " + Round + "/" + Round;
            document.getElementById("subtitle").innerHTML = "All sorted!<br>" + Winner.name + " wins";
            while (Unsorted.length != 0) {
                var x = Unsorted.shift();
                var y = $(document.createElement('p'));
                y.html(x.name);
                y.appendTo('#losers');
            }
            return;
        }
    }

    loadPicks();

});

//Start
init();
