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

var PageSetup = function() {
    var videoPlayer = document.getElementById("wubPlayer");
    var videoTitle = document.getElementById("VideoTitle");
    var videoDescription = document.getElementById("VideoDescription");

    var scaling = wubs.width/640;
    var videoPlayerHTML =   `<video id="wubPlayer" width="`+wubs.width*scaling+`" height="`+wubs.height*scaling+`" vidID="`+wubs.vidID+`">
                                <source src="`+wubs.source+`" type="`+wubs.type+`" />
                                Your browser does not support HTML5 video.
                            </video>`;

    videoPlayer.outerHTML = videoPlayerHTML;
    videoTitle.value = wubs.title;
    videoDescription.value = wubs.description;

    connectPlayerControls();
    connectEditorControls();
}

var connectPlayerControls = function() {
    //get new elements
    var $wVideo             = $('#wubPlayer');
    var $video_container 	= $('.wub-video-player');
    var $wub_play_btn 		= $('.wub-video-play', $video_container);
    var $wub_video_seek 	= $('.wub-video-seek', $video_container);
    var $wub_video_timer 	= $('.wub-video-timer', $video_container);
    var $wub_volume 		= $('.wub-volume-slider', $video_container);
    var $wub_volume_btn 	= $('.wub-volume-button', $video_container);

    //Create seek bar
    var seeksliding;			
    var createSeek = function() {
        if($wVideo[0].readyState) {
            var video_duration = $wVideo[0].duration;
            $wub_video_seek.slider({
                value: wubs.startOffset,
                step: 0.01,
                orientation: "horizontal",
                range: "min",
                max: video_duration,
                animate: false,					
                slide: function(){							
                    seeksliding = true;
                },
                stop:function(e,ui){
                    seeksliding = false;						
                    $wVideo[0].currentTime = ui.value;
                }
            });
            $wVideo[0].currentTime = wubs.startOffset; //Set initial time value for the video.
            //Add buffer progress bar.
            var seekBar = $(".wub-video-seek.ui-slider", $video_container).append('<span id="ProgressBar" class="wub-slider-buffered ui-slider-range" ></span>');
            $wVideo.bind('progress updateMediaState', function () {
                var buffered = $wVideo[0].buffered;
                if (!buffered || !buffered.length) {
                    return;
                }
                buffered = getActiveTimeRange(buffered, $wVideo[0].currentTime);
                $('#ProgressBar', $(seekBar)).width(buffered[2]/$wVideo[0].duration*100 + '%');
            });
        } else {
            setTimeout(createSeek, 150);
        }
    };
    createSeek();
    
    //Hook up the video controls to functions.
    var wPlay = function() {
        if($wVideo[0].paused == true) {
            $wVideo[0].play();				
        } else {
            $wVideo[0].pause();
        }
    };
    
    $wub_play_btn.click(wPlay);
    $wVideo.click(wPlay);
    
    $wVideo.bind('play', function() {
        $wub_play_btn.addClass('wub-paused-button');
    });
    
    $wVideo.bind('pause', function() {
        $wub_play_btn.removeClass('wub-paused-button');
    });
    
    $wVideo.bind('ended', function() {
        $wub_play_btn.removeClass('wub-paused-button');
    });
    
    
    var gTimeFormat=function(seconds){
        var date = new Date(null);
            date.setSeconds(seconds); //Set date based on Seconds.
            return date.toISOString().substr(11, 8); //Get time segment of date.
    };
    
    var seekUpdate = function() {
        var currenttime = $wVideo[0].currentTime;
        if(!seeksliding) $wub_video_seek.slider('value', currenttime);
        $wub_video_timer.text(gTimeFormat(currenttime));							
    };
    
    $wVideo.bind('timeupdate', seekUpdate);	
    
    var video_volume = 1;
    $wub_volume.slider({
        value: 1,
        orientation: "vertical",
        range: "min",
        max: 1,
        step: 0.05,
        animate: true,
        slide:function(e,ui){
                $wVideo[0].muted = false;
                video_volume = ui.value;
                $wVideo[0].volume = ui.value;
            }
    });
    
    var muteVolume = function() {
        if($wVideo[0].muted) {
            $wVideo[0].muted = false;
            $wub_volume.slider('value', video_volume);
            
            $wub_volume_btn.removeClass('wub-volume-mute');					
        } else {
            $wVideo[0].muted = true;
            $wub_volume.slider('value', '0');
            
            $wub_volume_btn.addClass('wub-volume-mute');
        };
    };
    
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
    
    $wub_volume_btn.click(muteVolume);
    
    $wVideo.removeAttr('controls');
    
    //Set initial values.
    $wub_video_timer.text(gTimeFormat(wubs.startOffset));
}

var connectEditorControls = function() {
    var video = $('#wubPlayer')[0];

    //get new elements
    var $video_container            = $('.wub-video-player');
    var $editor_controls 			= $('.wub-video-editorControls', $video_container);
    var $wub_editor_range 			= $('.wub-editor-selectRange', $editor_controls);
    var $wub_editor_limitPlayback 	= $('#EndPlaybackCheckbox', $editor_controls);
    var $wub_editor_start 			= $('#StartTimeStamp', $editor_controls);
    var $wub_editor_setStartBtn 	= $('#SetStartTimeButton', $editor_controls);
    var $wub_editor_gotoStartBtn	= $('#GoToStartButton', $editor_controls);
    var $wub_editor_stop 			= $('#EndTimeStamp', $editor_controls);
    var $wub_editor_setStopBtn		= $('#SetEndTimeButton', $editor_controls);
    var $wub_editor_gotoStopBtn		= $('#GoToEndButton', $editor_controls);
    
    var $wub_editor_Details 		= $('#EditorDetailsPane', $video_container.parent());
    var $wub_editor_Title 			= $('#VideoTitle', $wub_editor_Details);
    var $wub_editor_Description 	= $('#VideoDescription', $wub_editor_Details);
    var $wub_editor_Submit 			= $('#SubmitButton', $wub_editor_Details);
    
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
    
    var getTimeFormat=function(seconds){
            var date = new Date(null);
            date.setSeconds(seconds); //Set date based on Seconds.
            var d = parseInt((seconds % 1)*100); //Get the decimal places to two places for appending.
            return date.toISOString().substr(11, 8) + "." + d; //Get time segment of date, with two decimal places.
    };
    var getSeconds=function(time){
        var timeArr = time.split(':'), //Array of hours, minutes, and seconds.
            s = 0, //Seconds total
            m = 1; //Multiplier
        while (timeArr.length > 0) { //Iterate through time segments starting from the seconds,
            s += m * timeArr.pop(); //multiply as  appropriate, and add to seconds total,
            m *= 60;				//increase multiplier.
        }
        return s;
    }
}