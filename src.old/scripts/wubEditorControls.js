(function($) {
	// plugin definition
	$.fn.wEditor = function(options) {
		//Set the default values.
		var defaults = {
			submitLoc:null,
			startOffset:0,
			endOffset:0,
			vidID:'',
			title:'',
			description:'',
			extraMetadata:function(){return [];}
		}
		var options =  $.extend(defaults, options);
		var startSeconds = 0;
		var endSeconds = 0;
		
		// iterate and reformat each matched element
		return this.each(function() {
			var video = this
			var $video_container = $(video).parent();
			
			//create html structure
			var $editor_controls = $('<div class="wub-video-editorControls" >' +
										'<div class="wub-editor-selectRange"></div>' +
										'<input type="checkbox" id="EndPlaybackCheckbox" />' +
										'<span style="font-size: 0.7em; color:#999">Stop Here</span>' +
										'<div style="clear:both;">' +
											'<div id="StartControl">' +
												'<input type="text" id="StartTimeStamp" value="00:00.00" /><br />' +
												'<input type="button" id="SetStartTimeButton" value="Set" />' +
												'<input type="button" id="GoToStartButton" value="Go To" />' +
											'</div>' +
											'<div id="EndControl">' +
												'<input type="text" id="EndTimeStamp" value="00:00.00" /><br />' +
												'<input type="button" id="SetEndTimeButton" value="Set" />' +
												'<input type="button" id="GoToEndButton" value="Go To" />' +
											'</div>' +
										'</div>' +
									'</div>');
			var $editor_fields = $('<div id="EditorDetailsPane" style="clear:both; padding-top:5px;">' +
										'<div>Title:<br /><input type="text" id="VideoTitle" value="'+$('<div>').text(options.title).html().replace(/"/g,'&quot;').replace(/'/g,'&#39')+'" maxlength="91" /></div>' +
										'<div>Description:<br/><textarea id="VideoDescription" >'+$('<div>').text(options.description).html().replace(/"/g,'&quot;').replace(/'/g,'&#39')+'</textarea></div>' +
										'<input type="button" id="SubmitButton" value="Submit" />' +
									'</div>');
			
			$video_container.append($editor_controls);
			$video_container.after($editor_fields);
			
			
			
			//get new elements
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
					(options.endOffset == 0) ? video.duration:options.endOffset; //set end offset to the end of the video, if not set by server.
					startSeconds = options.startOffset;
					endSeconds = options.endOffset;
					$wub_editor_start.val(getTimeFormat(startSeconds));
					$wub_editor_stop.val(getTimeFormat(endSeconds));
					
					//Create the Segment Selection bar.
					$wub_editor_range.slider({
						range: true,
						min: 0,
						max: video.duration,
						step: 0.01,					
						values: [options.startOffset, options.endOffset],
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
							var data = {
								vidID:options.vidID,
								startOffset:startSeconds,
								endOffset:endSeconds,
								title:$wub_editor_Title.val(),
								description:$wub_editor_Description.val(),
								extraMetadata:options.extraMetadata()
							};
							var posting = $.post(options.submitLoc, data);
							posting.done(function(data) {
								alert('Successfully submitted video.\r\n' + data);
								//window.close();
							});
							posting.fail(function(data) {
								alert('Failed to submit video.\r\n' + data.status+' - '+data.responseText);
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
			};
		});
	};
})(jQuery);