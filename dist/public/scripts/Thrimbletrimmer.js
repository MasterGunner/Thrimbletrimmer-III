var wubs = {
    "vidID": "5678",
    "source":"videos/DB-TestClip.mp4",
    "type":"video/mp4",
    "title":"Desert Bus Clip",
    "description":"A clip from Desert Bus 8.",
    "framerate":"30",
    "width":"640",
    "height":"360",
    "startOffset": "10",
    "endOffset": "591.926213",
    "deleteOnSubmit": "true",
    "submitLoc":'/setwubs',
    extraMetadata:function(){return [];}
}

var Thrimbletrimmer = {};

var PageSetup = function() {
    var videoPlayer = document.getElementById("wubPlayer");
    var videoTimer = document.getElementById("wub-video-timer");
    var videoTitle = document.getElementById("VideoTitle");
    var videoDescription = document.getElementById("VideoDescription");

    var scaling = wubs.width/640;
    var videoPlayerHTML =   `<video id="wubPlayer" width="`+wubs.width*scaling+`" height="`+wubs.height*scaling+`" vidID="`+wubs.vidID+`" onclick="Thrimbletrimmer.play()">
                                <source src="`+wubs.source+`" type="`+wubs.type+`" />
                                Your browser does not support HTML5 video.
                            </video>`;

    videoPlayer.outerHTML = videoPlayerHTML;
    videoTimer.innerText = getTimeFormat(wubs.startOffset, false);
    videoTitle.value = wubs.title;
    videoDescription.value = wubs.description;

    ConfigureThrimbletrimmer();

    //Create seek bar
    Thrimbletrimmer.setSeekBar();

    //Create editor bar
    Thrimbletrimmer.setEditorSlider();

    //Bind time updates
    Thrimbletrimmer.bindTimeUpdate();

    //Create volume slider
    Thrimbletrimmer.setVolumeSlider();
    
    //Bind play button swap
    Thrimbletrimmer.bindPlayPause();
}

function ConfigureThrimbletrimmer () {

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
            value: wubs.startOffset,
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
        this.video.currentTime = wubs.startOffset; //Set initial time value for the video.
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

//Editor Slider
Thrimbletrimmer.setEditorSlider = function() {
    if(this.video.readyState) {
        //Create the Segment Selection bar.
        this.$wub_editor_range.slider({
            range: true,
            min: 0,
            max: this.video.duration,
            step: 0.01,					
            values: [wubs.startOffset, wubs.endOffset],
            slide: function(event, ui){
                Thrimbletrimmer.updateTimeRange(ui.values[0], ui.values[1])
            }
        });

        //Set initial start and end values
        this.updateTimeRange(wubs.startOffset, ((wubs.endOffset == 0) ? this.video.duration:wubs.endOffset));
    } else {
        setTimeout(function() { Thrimbletrimmer.setEditorSlider() }, 150);
    }
}

/* Bind Events */
Thrimbletrimmer.bindPlayPause = function() {
    this.video.onpause = () => { this.playButton.classList.remove('wub-pause-button'); };
    this.video.onplay = () => { this.playButton.classList.add('wub-pause-button'); };
}

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
            vidID:wubs.vidID,
            startOffset:Thrimbletrimmer.startSeconds,
            endOffset:Thrimbletrimmer.endSeconds,
            title:document.getElementById("VideoTitle").value,
            description:document.getElementById("VideoDescription").value,
            extraMetadata:wubs.extraMetadata()
        };
        var posting = $.post(wubs.submitLoc, wubData);
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