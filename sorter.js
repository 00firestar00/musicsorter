var unsorted = videos;
var sorted = [];
var ignored = [];
var round = 0;
var group_size = [];
var new_group_size = [];
var group_a = [];
var group_b = [];
var group_c = [];
var alpha = {};
var beta = {};
var end = false;
var alpha_video_btn = document.getElementById("alpha-btn");
var beta_video_btn = document.getElementById("beta-btn");

var alpha_ignore_btn = document.getElementById("alpha-ignore");
var beta_ignore_btn = document.getElementById("beta-ignore");

function isIgnored(x) {
    return ignored.indexOf(x.name);
}

function ignoreSong(song, choose) {
    ignored.push(song.name);
    console.log("Ignoring " + song.name);
    choose.click();
}

function ignoreA() {
    ignoreSong(alpha, beta_video_btn);
}

function ignoreB() {
    ignoreSong(beta, alpha_video_btn);
}

alpha_ignore_btn.addEventListener("click", ignoreA);
beta_ignore_btn.addEventListener("click", ignoreB);

// Loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var alpha_player, beta_player;
var alpha_vid_id, beta_vid_id;
var youtube_is_loaded = false;
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
    youtube_is_loaded = true;
}

function loadPicks() {
    //Setup groups
    if (group_a.length + group_b.length == 0) {
        var x, y;
        y = group_size.shift();
        while (group_a.length < y && unsorted.length !== 0) {
            x = unsorted.shift();
            if (x == undefined) break;
            console.log("Added " + x.name + " to group_a");
            group_a.push(x);
        }
        y = group_size.shift();
        while (group_b.length < y && unsorted.length !== 0) {
            x = unsorted.shift();
            if (x == undefined) break;
            console.log("Added " + x.name + " to group_b");
            group_b.push(x);
        }
    }

    //Load picks
    alpha = group_a.shift();
    beta = group_b.shift();

    if (isIgnored(alpha) != -1) {
        ignored.push(alpha.name);
        console.log("Auto Win " + beta.name);
        console.log("Ignoring " + alpha.name);
        run("beta-btn");
        return;
    }
    else if (isIgnored(beta) != -1) {
        ignored.push(beta.name);
        console.log("Auto Win " + alpha.name);
        console.log("Ignoring " + beta.name);
        run("alpha-btn");
        return;
    }

    round++;
    document.getElementById("round").innerHTML = "Round: " + round;
    console.log("ROUND " + round + "!\n" + alpha.name + " VS " + beta.name);

    alpha_video_btn.innerHTML = alpha.name;
    beta_video_btn.innerHTML = beta.name;
    alpha_vid_id = alpha.vidId;
    beta_vid_id = beta.vidId;
    if (youtube_is_loaded) {
        alpha_player.loadVideoById(alpha_vid_id);
        alpha_player.stopVideo();
        beta_player.loadVideoById(beta_vid_id);
        beta_player.stopVideo();
    }
}

function init() {
    var i;
    alpha_video_btn.addEventListener('click', run);
    beta_video_btn.addEventListener('click', run);
    for (i = 0; i < unsorted.length; i++) {
        group_size.push(1);
    }

    console.log(unsorted);
    loadPicks();
}

function run(button) {
    console.log("unsorted : ");
    console.log(unsorted);
    console.log("sorted: ");
    console.log(sorted);
    if (end == true) {
        return;
    }
    //Deal with the winner
    if ((this.getAttribute && this.getAttribute("id") == "alpha-btn") || button == "alpha-btn") {
        console.log(alpha.name + " wins!");
        if (alpha == undefined) return;
        group_c.push(alpha);
        group_b.unshift(beta);
    }
    else if ((this.getAttribute && this.getAttribute("id") == "beta-btn") || button == "beta-btn") {
        console.log(beta.name + " wins!");
        if (beta == undefined) return;
        group_c.push(beta);
        group_a.unshift(alpha);
    }
    //If either group empty, add all to group_c
    if (group_a.length == 0 || group_b.length == 0) {
        while (group_a.length != 0) {
            x = group_a.shift();
            group_c.push(x);
        }
        while (group_b.length != 0) {
            x = group_b.shift();
            group_c.push(x);
        }
        if (group_size.length == 1) { //If only one group remaining, bonus round with group_c
            console.log("Extra round!");
            while (group_c.length != 0) {
                x = group_c.shift();
                if (x == undefined) break;
                console.log("Added " + x.name + " to group_a");
                group_a.push(x);
            }
            y = group_size.shift();
            while (group_b.length < y) {
                x = unsorted.shift();
                if (x == undefined) break;
                console.log("Added " + x.name + " to group_b");
                group_b.push(x);
            }
        }
        else {
            //Add group_c to sorted
            new_group_size.push(group_c.length); //Get the new size of the group
            while (group_c.length != 0) {
                x = group_c.shift();
                sorted.push(x);
            }
        }
    }

    //if all unsorted sorted, add all them back to Sorting pool
    if (unsorted.length + group_a.length + group_b.length == 0) {
        while (sorted.length != 0) {
            x = sorted.shift();
            console.log(x.name + " added to unsorted");
            unsorted.push(x);
        }
        while (new_group_size.length != 0) {
            group_size.push(new_group_size.shift());
        }
        //end
        if (group_size.length + new_group_size.length == 1) {
            document.getElementById("vid-group").style.display = "none";

            unsorted = unsorted.filter(function (x) {
                return ignored.indexOf(x) < 0
            }); //remove ignored
            console.log(unsorted);
            end = true;
            var Winner = unsorted.shift();

            document.getElementById("round").innerHTML = "round: " + round + "/" + round;
            document.getElementById("subtitle").innerHTML = "All sorted!<br>" + Winner.name + " wins";
            while (unsorted.length != 0) {
                var x = unsorted.shift();
                var li = document.createElement('li');
                li.className = "mdl-list__item";
                var span = document.createElement('span');
                span.className = "mdl-list__item-primary-content";
                span.innerHTML = x.name;

                li.appendChild(span);
                document.getElementById("losers").appendChild(li);
                document.getElementById("final-list").style.display = "";
            }
            return;
        }
    }
    loadPicks();
}

//Start
init();
