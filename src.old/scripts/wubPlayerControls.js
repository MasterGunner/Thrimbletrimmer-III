(function($) {
	// plugin definition
	$.fn.wVideo = function(options) {
		//Set the default values.
		var defaults = {
			startOffset:0
		}
		var options =  $.extend(defaults, options);
		// iterate and reformat each matched element
		return this.each(function() {
			var $wVideo = $(this);
			
			//create html structure
			//main wrapper
			var $video_wrap = $('<div></div>').addClass('wub-video-player');
			//controls wrapper
			var $video_controls = $('<div class="wub-video-controls">' +
										'<a class="wub-video-play" title="Play/Pause"></a>' +
										'<div class="wub-video-seek"></div>' +
										'<div class="wub-video-timer">00:00</div>' +
										'<div class="wub-volume-box">' +
											'<div class="wub-volume-slider"></div>' +
											'<a class="wub-volume-button" title="Mute/Unmute"></a>' +
										'</div>' +
									'</div>');						
			$wVideo.wrap($video_wrap);
			$wVideo.after($video_controls);
			
			//get new elements
			var $video_container 	= $wVideo.parent('.wub-video-player');
			var $video_controls 	= $('.wub-video-controls', $video_container);
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
						value: options.startOffset,
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
					$wVideo[0].currentTime = options.startOffset; //Set initial time value for the video.
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
			$wub_video_timer.text(gTimeFormat(options.startOffset));
		});
	};
})(jQuery);