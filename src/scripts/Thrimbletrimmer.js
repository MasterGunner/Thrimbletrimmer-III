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

    //Bind time updates
    Thrimbletrimmer.bindTimeUpdate();

    //Create volume slider
    Thrimbletrimmer.setVolumeSlider();
    
    //Bind play button swap
    Thrimbletrimmer.bindPlayPause();

    connectEditorControls(); 
}

var connectEditorControls = function() {
    var video = $('#wubPlayer')[0];

    //get new elements
    var $wub_editor_range 			= $('#wub-editor-selectRange');
    var $wub_editor_limitPlayback 	= $('#EndPlaybackCheckbox');
    var $wub_editor_start 			= $('#StartTimeStamp');
    var $wub_editor_setStartBtn 	= $('#SetStartTimeButton');
    var $wub_editor_gotoStartBtn	= $('#GoToStartButton');
    var $wub_editor_stop 			= $('#EndTimeStamp');
    var $wub_editor_setStopBtn		= $('#SetEndTimeButton');
    var $wub_editor_gotoStopBtn		= $('#GoToEndButton');
    
    var $wub_editor_Title 			= $('#VideoTitle');
    var $wub_editor_Description 	= $('#VideoDescription');
    var $wub_editor_Submit 			= $('#SubmitButton');
    
    //Configure Editor Controls
    var createRange = function() {
        if(video.readyState) {
            //Set initial start and end values
            (wubs.endOffset == 0) ? video.duration:wubs.endOffset; //set end offset to the end of the video, if not set by server.
            startSeconds = wubs.startOffset;
            endSeconds = wubs.endOffset;
            $wub_editor_start.val(getTimeFormat(startSeconds));
            $wub_editor_stop.val(getTimeFormat(endSeconds));
            
            //Create the Segment Selection bar.
            $wub_editor_range.slider({
                range: true,
                min: 0,
                max: video.duration,
                step: 0.01,					
                values: [wubs.startOffset, wubs.endOffset],
                slide: function(event, ui){
                    startSeconds = ui.values[0];
                    endSeconds = ui.values[1];
                    $wub_editor_start.val(getTimeFormat(startSeconds));
                    $wub_editor_stop.val(getTimeFormat(endSeconds));
                }
            });
            
            //Configure Start Timestamp Control
            $wub_editor_setStartBtn.click(function() {
                startSeconds = video.currentTime;
                $wub_editor_start.val(getTimeFormat(video.currentTime));
                $wub_editor_range.slider("values", [video.currentTime,$wub_editor_range.slider("values")[1]]);
            });
            $wub_editor_start.change(function() {
                //Do input validation.
                if(/^\d*:?\d*:?\d*\.?\d*$/.test($wub_editor_start.val())) {
                    startSeconds = getSeconds($wub_editor_start.val());
                    $wub_editor_start.val(getTimeFormat(startSeconds));
                    $wub_editor_range.slider("values", [startSeconds,$wub_editor_range.slider("values")[1]]);
                } else {
                    $wub_editor_start.val(getTimeFormat(startSeconds));
                }
            });
            $wub_editor_gotoStartBtn.click(function() {
                video.currentTime = startSeconds;
            });
            
            //Configure End Timestamp Control
            $wub_editor_setStopBtn.click(function() {
                endSeconds = video.currentTime;
                $wub_editor_stop.val(getTimeFormat(video.currentTime));
                $wub_editor_range.slider("values", [$wub_editor_range.slider("values")[0],video.currentTime]);
            });
            $wub_editor_stop.change(function() {
                //Do input validation.
                if(/^\d*:?\d*:?\d*\.?\d*$/.test($wub_editor_stop.val())) {
                    endSeconds = getSeconds($wub_editor_stop.val());
                    $wub_editor_stop.val(getTimeFormat(endSeconds));
                    $wub_editor_range.slider("values", [$wub_editor_range.slider("values")[0],endSeconds]);
                } else {
                    $wub_editor_stop.val(getTimeFormat(endSeconds));
                }
            });
            $wub_editor_gotoStopBtn.click(function() {
                video.currentTime = endSeconds;
            });
            
            //Prevent video from progressing beyond end timestamp (if requested)
            $(video).on('timeupdate', function() {
                if ($wub_editor_limitPlayback.prop('checked') && video.currentTime >= endSeconds) { 
                    video.pause();
                    video.currentTime = endSeconds;
                }
            });
            
            //Configure submit button
            $wub_editor_Submit.click(function() {
                $wub_editor_Submit.prop("disabled",true);
                if(startSeconds >= endSeconds) {
                    alert("End Time must be greater than Start Time");
                    $wub_editor_Submit.prop("disabled",false);
                } else {
                    var wubData = {
                        vidID:wubs.vidID,
                        startOffset:startSeconds,
                        endOffset:endSeconds,
                        title:$wub_editor_Title.val(),
                        description:$wub_editor_Description.val(),
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
                        $wub_editor_Submit.prop("disabled",false);
                    });
                }
            });
        } else {
            setTimeout(createRange, 150);
        }
    };
    createRange();
    
    
}

function ConfigureThrimbletrimmer () {

/* Get frequently reused elements */
Thrimbletrimmer.video           = document.getElementById("wubPlayer");

Thrimbletrimmer.playButton      = document.getElementById('wub-video-play');

Thrimbletrimmer.$seekBar        = $('#wub-video-seek');
Thrimbletrimmer.videoTimer      = document.getElementById("wub-video-timer");

Thrimbletrimmer.$volumeSlider   = $('#wub-volume-slider');
Thrimbletrimmer.volumeButton 	= document.getElementById('wub-volume-button');


/* Some general reused variables */
Thrimbletrimmer._seekSliding = false; //Stops the seek bar from being updated while using it to seek.
Thrimbletrimmer._videoVolume = 1; //Stores the last volume while the video is muted.

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

/* Bind Events */
Thrimbletrimmer.bindPlayPause = function() {
    this.video.onpause = () => { this.playButton.classList.remove('wub-pause-button'); };
    this.video.onplay = () => { this.playButton.classList.add('wub-pause-button'); };
}

Thrimbletrimmer.bindTimeUpdate = function() {
    this.video.ontimeupdate = () => {
        var currenttime = this.video.currentTime;
        if(!this._seekSliding) {
            this.$seekBar.slider('value', currenttime);
            this.videoTimer.innerText = getTimeFormat(currenttime, false);
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