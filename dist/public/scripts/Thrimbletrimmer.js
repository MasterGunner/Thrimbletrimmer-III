// var wubs = {id: '2549',
//     start: 10,
//     end: 591.926213,
//     title: 'Desert Bus Clip',
//     description: 'A clip from Desert Bus.',
//     source: 'videos/DB-TestClip.mp4'}

var Thrimbletrimmer = {};

var PageSetup = function() {
    if (document.cookie.split(';').filter((item) => item.includes('darkMode=1')).length) {
        $('body').addClass('dark');
        $("#NightModeToggleCheckBox").prop("checked", true);
    }

    if(window.location.search.match(/video=(.*?)(&|$)/i)) {
        var videoID = window.location.search.match(/video=(.*?)(&|$)/i)[1];
        $.getJSON('/getVideo/'+videoID, (data) => {
            //Create the video player elements
            createVideoPlayer(data);

            //Start hooking Thrimbletrimmer into page elements.
            ConfigureThrimbletrimmer(data);
        }).fail((x) => {
            $('#EditorContent').prepend('<h1>Requested video unavailable or previously submitted.</h1>');
        });
    } else {
        $('#EditorContent').prepend('<h1>No video requested.</h1>');
    }
}

function toggleDarkMode() {
    $('body').toggleClass('dark');
    if(!!$('body.dark').length) {
        document.cookie = "darkMode=1; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    } else {
        document.cookie = "darkMode=0";
    }
}

function createVideoPlayer(data) {
    data = JSON.parse(data);
    var videoPlayer = document.getElementById("wubPlayer");
    var videoTimer = document.getElementById("wub-video-timer");
    var videoTitle = document.getElementById("VideoTitle");
    var videoDescription = document.getElementById("VideoDescription");

    var videoPlayerHTML =   `<video id="wubPlayer" width="640" height=360" vidID="`+data.vidID+`" onclick="Thrimbletrimmer.play()">
                                <source src="`+data.source+`" type="video/mp4" />
                                Your browser does not support HTML5 video.
                            </video>`;

    videoPlayer.outerHTML = videoPlayerHTML;
    videoTimer.innerText = getTimeFormat(data.start, false);
    videoTitle.value = data.title;
    videoDescription.value = data.description;
}

function ConfigureThrimbletrimmer (wubs) {

/* The video details from the server */
Thrimbletrimmer.wubs = JSON.parse(wubs);

/* Get frequently reused elements */
Thrimbletrimmer.video           = document.getElementById("wubPlayer");

Thrimbletrimmer.playButton      = document.getElementById('wub-video-play');

Thrimbletrimmer.$seekBar        = $('#wub-video-seek');
Thrimbletrimmer.videoTimer      = document.getElementById("wub-video-timer");

Thrimbletrimmer.$volumeSlider   = $('#wub-volume-slider');
Thrimbletrimmer.volumeButton 	= document.getElementById('wub-volume-button');

Thrimbletrimmer.$wub_editor_range = $('#wub-editor-selectRange');
Thrimbletrimmer.startTimestamp  = document.getElementById('StartTimeStamp');
Thrimbletrimmer.endTimestamp    = document.getElementById('EndTimeStamp');


/* Some general reused variables */
Thrimbletrimmer._seekSliding = false; //Stops the seek bar from being updated while using it to seek.
Thrimbletrimmer._videoVolume = 1; //Stores the last volume while the video is muted.
Thrimbletrimmer.limitPlayback = 0; //Whether or not to continue playback after the selected end time.
Thrimbletrimmer.startSeconds = 0;
Thrimbletrimmer.endSeconds = 0;

/* Configure JQuery Sliders */

//Video Seek Bar
Thrimbletrimmer.setSeekBar = function () {
    if(this.video.readyState) {
        var video_duration = this.video.duration;
        this.$seekBar.slider({
            value: Thrimbletrimmer.wubs.start,
            step: 0.01,
            orientation: "horizontal",
            range: "min",
            max: video_duration,
            animate: false,					
            slide: () => {							
                this._seekSliding = true;
            },
            stop:(e,ui) => {
                this.video.currentTime = ui.value;
                this._seekSliding = false;
            }
        });
        this.video.currentTime = Thrimbletrimmer.wubs.start; //Set initial time value for the video.
        //Add buffer progress bar.
        var bufferBar = this.$seekBar.append('<span id="ProgressBar" class="wub-slider-buffered ui-slider-range" ></span>');
        $('#wubPlayer').bind('progress updateMediaState', () => {
            var buffered = this.video.buffered;
            if (!buffered || !buffered.length) {
                return;
            }
            buffered = getActiveTimeRange(buffered, this.video.currentTime);
            $('#ProgressBar', $(bufferBar)).width(buffered[2]/this.video.duration*100 + '%');
        });
    } else {
        setTimeout(function() { Thrimbletrimmer.setSeekBar() }, 150);
    }
}
Thrimbletrimmer.setSeekBar();

//Volume Slider
Thrimbletrimmer.setVolumeSlider = function() {
    this.$volumeSlider.slider({
        value: 1,
        orientation: "vertical",
        range: "min",
        max: 1,
        step: 0.05,
        animate: true,
        slide:function(e,ui) {
            this.video.muted = false;
            this._videoVolume = ui.value;
            this.video.volume = ui.value;
        }
    });
}
Thrimbletrimmer.setVolumeSlider();

//Editor Slider
Thrimbletrimmer.setEditorSlider = function() {
    if(this.video.readyState) {
        //Create the Segment Selection bar.
        this.$wub_editor_range.slider({
            range: true,
            min: 0,
            max: this.video.duration,
            step: 0.01,					
            values: [Thrimbletrimmer.wubs.start, Thrimbletrimmer.wubs.end],
            slide: function(event, ui){
                Thrimbletrimmer.updateTimeRange(ui.values[0], ui.values[1])
            }
        });

        //Set initial start and end values
        this.updateTimeRange(Thrimbletrimmer.wubs.start, ((Thrimbletrimmer.wubs.end == 0) ? this.video.duration:Thrimbletrimmer.wubs.end));
    } else {
        setTimeout(function() { Thrimbletrimmer.setEditorSlider() }, 150);
    }
}
Thrimbletrimmer.setEditorSlider();

/* Bind Events */
Thrimbletrimmer.bindPlayPause = function() {
    this.video.onpause = () => { this.playButton.classList.remove('wub-pause-button'); };
    this.video.onplay = () => { this.playButton.classList.add('wub-pause-button'); };
}
Thrimbletrimmer.bindPlayPause();

Thrimbletrimmer.bindTimeUpdate = function() {
    this.video.ontimeupdate = () => {
        //Update Seek Bar with current video time, unless the user is actively seeking.
        var currenttime = this.video.currentTime;
        if(!this._seekSliding) {
            this.$seekBar.slider('value', currenttime);
            this.videoTimer.innerText = getTimeFormat(currenttime, false);
        }

        //Prevent video from progressing beyond end timestamp (if requested)
        if(this.limitPlayback && this.video.currentTime > this.endSeconds) {
            this.video.pause();
            this.video.currentTime = this.endSeconds
        }
    };
}
Thrimbletrimmer.bindTimeUpdate();

/* Button Actions */
Thrimbletrimmer.play = function() {
    this.video.paused ? this.video.play():this.video.pause()
}

Thrimbletrimmer.mute = function() {
    if(this.video.muted) { //If the video is muted, unmute it.
        this.video.muted = false;
        this.$volumeSlider.slider('value', this._videoVolume);
        this.volumeButton.classList.remove('wub-volume-mute');					
    } else { //Mute the video
        this.video.muted = true;
        this.$volumeSlider.slider('value', '0');
        this.volumeButton.classList.add('wub-volume-mute');
    };
}

Thrimbletrimmer.setTimestamps = function(value, index) {
    if(/^\d*:?\d*:?\d*\.?\d*$/.test(value)) {
        if(index === 0) {
            this.updateTimeRange(getSeconds(value), this.endSeconds);
        } else if (index === 1) {
            this.updateTimeRange(this.startSeconds, getSeconds(value));
        }
    } else {
        this.startTimestamp.value = getTimeFormat(this.startSeconds);
        this.endTimestamp.value = getTimeFormat(this.endSeconds);
    }
}

Thrimbletrimmer.submit = function() {
    document.getElementById('SubmitButton').disabled = true;
    if(this.startSeconds >= this.endSeconds) {
        alert("End Time must be greater than Start Time");
        document.getElementById('SubmitButton').disabled = false;
    } else {
        var wubData = {
            id:Thrimbletrimmer.wubs.id,
            start:Thrimbletrimmer.startSeconds,
            end:Thrimbletrimmer.endSeconds,
            title:document.getElementById("VideoTitle").value,
            description:document.getElementById("VideoDescription").value
        };
        var posting = $.post('/setVideo', wubData);
        posting.done(function(data) {
            alert('Successfully submitted video.\r\n' + data);
            //window.close();
        });
        posting.fail(function(data) {
            alert('Failed to submit video.\r\n' + data.status+' - '+data.responseText);
            console.log(wubData);
            document.getElementById('SubmitButton').disabled = false;
        });
    }
}

/* Binding keyboard shortcuts */
Thrimbletrimmer.setKeyboardShortcuts = function() {
    document.addEventListener('keypress', (event) => {
        if(event.target.nodeName == "BODY") {
            switch(event.key) {
                case "j":
                    Thrimbletrimmer.video.currentTime -= 5;
                    break;
                case "k":
                    Thrimbletrimmer.play();
                    break;
                case "l":
                    Thrimbletrimmer.video.currentTime += 5;
                    break;
                case ",":
                    Thrimbletrimmer.video.currentTime -= 0.1;
                    break;
                case ".":
                    Thrimbletrimmer.video.currentTime += 0.1;
                    break;
            }
        }

        // const keyName = event.key;
        // console.log('keypress event\n\n' + 'key: ' + keyName);
        // console.log(event.target.nodeName);
    });
}
Thrimbletrimmer.setKeyboardShortcuts();


/* General Thrimbletrimmer Functions */
Thrimbletrimmer.updateTimeRange = function(startVal, endVal) {
    this.startSeconds = startVal;
    this.endSeconds = endVal;
    this.startTimestamp.value = getTimeFormat(this.startSeconds);
    this.endTimestamp.value = getTimeFormat(this.endSeconds);
    this.$wub_editor_range.slider("values", [this.startSeconds,this.endSeconds]);
}

}


/* Utility/Time Functions */
var getActiveTimeRange = function (range, time) {
    var len = range.length;
    var index = -1;
    var start = 0;
    var end = 0;
    for (var i = 0; i < len; i++) {
        if (time >= (start = range.start(i)) && time <= (end = range.end(i))) {
            index = i;
            break;
        }
    }
    return [index, start, end];
};
//getActiveTimeRange(video.buffered, video.currentTime);

var getTimeFormat = function(seconds, includeDecimals=true){
    var date = new Date(null);
    date.setSeconds(seconds); //Set date based on Seconds.
    var outputString = date.toISOString().substr(11, 8); //Get time segment of date.
    if(includeDecimals) {
        var d = parseInt((seconds % 1)*100); //Get the decimal places to two places for appending.
        outputString += "." + d; //Include fractional seconds in output
    }
    return outputString;
};
var getSeconds = function(time){
    var timeArr = time.split(':'), //Array of hours, minutes, and seconds.
        s = 0, //Seconds total
        m = 1; //Multiplier
    while (timeArr.length > 0) { //Iterate through time segments starting from the seconds,
        s += m * timeArr.pop(); //multiply as  appropriate, and add to seconds total,
        m *= 60;				//increase multiplier.
    }
    return s;
}