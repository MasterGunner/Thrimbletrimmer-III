!function(e){e.fn.wVideo=function(t){var a={startOffset:0},t=e.extend(a,t);return this.each(function(){var a=e(this),u=e("<div></div>").addClass("wub-video-player"),i=e('<div class="wub-video-controls"><a class="wub-video-play" title="Play/Pause"></a><div class="wub-video-seek"></div><div class="wub-video-timer">00:00</div><div class="wub-volume-box"><div class="wub-volume-slider"></div><a class="wub-volume-button" title="Mute/Unmute"></a></div></div>');a.wrap(u),a.after(i);var r,n=a.parent(".wub-video-player"),i=e(".wub-video-controls",n),s=e(".wub-video-play",n),d=e(".wub-video-seek",n),o=e(".wub-video-timer",n),l=e(".wub-volume-slider",n),v=e(".wub-volume-button",n),c=function(){if(a[0].readyState){var u=a[0].duration;d.slider({value:t.startOffset,step:.01,orientation:"horizontal",range:"min",max:u,animate:!1,slide:function(){r=!0},stop:function(e,t){r=!1,a[0].currentTime=t.value}}),a[0].currentTime=t.startOffset;var i=e(".wub-video-seek.ui-slider",n).append('<span id="ProgressBar" class="wub-slider-buffered ui-slider-range" ></span>');a.bind("progress updateMediaState",function(){var t=a[0].buffered;t&&t.length&&(t=g(t,a[0].currentTime),e("#ProgressBar",e(i)).width(t[2]/a[0].duration*100+"%"))})}else setTimeout(c,150)};c();var b=function(){1==a[0].paused?a[0].play():a[0].pause()};s.click(b),a.click(b),a.bind("play",function(){s.addClass("wub-paused-button")}),a.bind("pause",function(){s.removeClass("wub-paused-button")}),a.bind("ended",function(){s.removeClass("wub-paused-button")});var f=function(e){var t=new Date(null);return t.setSeconds(e),t.toISOString().substr(11,8)},m=function(){var e=a[0].currentTime;r||d.slider("value",e),o.text(f(e))};a.bind("timeupdate",m);var w=1;l.slider({value:1,orientation:"vertical",range:"min",max:1,step:.05,animate:!0,slide:function(e,t){a[0].muted=!1,w=t.value,a[0].volume=t.value}});var p=function(){a[0].muted?(a[0].muted=!1,l.slider("value",w),v.removeClass("wub-volume-mute")):(a[0].muted=!0,l.slider("value","0"),v.addClass("wub-volume-mute"))},g=function(e,t){for(var a=e.length,u=-1,i=0,r=0,n=0;a>n;n++)if(t>=(i=e.start(n))&&t<=(r=e.end(n))){u=n;break}return[u,i,r]};v.click(p),a.removeAttr("controls"),o.text(f(t.startOffset))})}}(jQuery);