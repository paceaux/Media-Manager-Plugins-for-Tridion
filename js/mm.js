var mediaManager = {};
mediaManager: {
    init: function () {
        var _this = this;
        //MMPLAYERREADY is the event that fires when the media manager event loads
        _this.functions.setMetadata($('.js-active'));                
        _this.bindUIEvents();
        $(document).bind("MMPLAYERREADY", function (e){
            _this.functions.adjustDimensions();
            _this.functions.modifyProjekktor();
            _this.data.player = $('#'+e.value);
            $(_this.data.player).addClass('js-ready');
            _this.bindPlayerEvents();
        });
    },
    data: {
        wrapper: $('#video__wrapper'),
        iframe: document.getElementById('video__iframe'),
        shareWrapper: $('.video__share'),
        filmstrip: $('.filmstrip--video'),
        classes: {
            video: 'video',
            videoWrapper: 'video__wrapper',
            videoPlayer: 'video__player',
            videoShare: 'video__share',
            videoIframe: 'video__iframe',
            shareButton: 'video__share__button',
            shareWrap: 'video__share__options',
            projekktor: 'projekktor'
        },
        content: {
            title: '.video__description__title',
            description: '.video__description__text',
            videoPageLink: '#videoPageLink',
            videoEmbed: '#videoPageEmbed'
        }
    },
    helpers: {
        modifyHref: function (href) {
            href = href.replace('/vms/distribution', '/Distributions');
            return href.replace('Distributions', 'Distribution/embed');

        },
        restartPlayer: function () {
            var player = projekktors[0];
            player.reset();
            player.setPlay();
        },
        openFullscreen: function () {
            var player = projekktors[0];
            player.setFullscreen();
            $player.removeClass("js-fullscreen");
        },
        closeFullscreen: function() {
            var player = projekktors[0];
            $player.trigger("close-fullscreen");
            $player.removeClass("js-fullscreen");              
        },
        playPosition: function (n) {
            var player = projekktors[0];
            player.setPlayhead(n);
            return
        },
        playVideo: function (n) {
            var _this = mediaManager,
                player = _this.data.player;
            if(n) {
                _this.helpers.playPosition(n);
            }
            $(player).trigger("play");
        },
        pauseVideo: function () {
            var _this = mediaManager,
                player = _this.data.player;
            $(player).trigger("pause");
        },
        stopVideo: function () {
            var player = projekktors[0];
            player.setStop()
        },
        resetVideo: function () {
            var _this = mediaManager,
                player = $(_this.data.player);
            $(player).trigger("restart-asset")
        },               
        exitVideo: function () {
            var _this = mediaManager,
                $player = $(_this.data.player);
            $player.trigger("exit");
        },
        setVolume: function (vol) {
            var player = projekktors[0];
            player.setVolume(vol);
        },
        convertUrlToEmbed: function (href) {
            return href.replace('distribution', 'distribution/embed');
        }
    },
    bindUIEvents: function () {
        var _this = mediaManager,
            helpers = _this.helpers,
            functions = _this.functions,
            data = _this.data,
            player = $(data.player);
        //WAIT 3 SECONDS BEFORE SHOWING SHAREBUTTON
        window.setTimeout(_this.functions.showShareButton, 3000);

        //BIND EVENTS TO THE FILMSTRIP
        $('#filmstrip.filmstrip--video li a, .filmstrip.filmstrip--video li a').off('click');

        $('#filmstrip.filmstrip--video li a, .filmstrip.filmstrip--video li a').on('click', function (e) {
            e.preventDefault();
            var href = $(this).attr('href'), 
                videoMetadata = $(this).data('video');

            if (!$(this).is('.js-active')){
                $('.js-active').removeClass('js-active');
                $(this).addClass('js-active');
                _this.functions.setMetadata($(this));
                _this.functions.updateVideoContent(videoMetadata);
                _this.functions.changeScript(href, true);
                $('.'+_this.data.classes.shareWrap).removeClass('js-visible');

            } else {
                $('.'+_this.data.classes.shareWrap).removeClass('js-visible');
            }
        });
        //BIND EVENT TO SHARE BUTTON
        $('.'+_this.data.classes.shareButton).on('click', function (e) {
            var player = $(_this.data.player);
            e.preventDefault();
            functions.toggleShareWidget();
            $(this).toggleClass('js-clicked')
            //Alex please forgive me
            if( !$(player).is('.js-ready') ){ // player is in pause or play
                if (!$(player).is('.js-pause')){ // player is playing
                    if ($(this).is('.js-clicked')){ // the button has been clicked
                        helpers.pauseVideo(); // pause the video
                    }
                } else { // player is paused
                    if ($(this).is('.js-clicked')){ //button has been clicked
                        return; // do nothing. we don't play user-paused videos
                    } else { // button has been clicked again (no .js-clicked)
                        helpers.playVideo();
                    }
                }
            } else { // player is in ready state (how it is when it first loads)
                return; // do nothing. we don't play videos from the social media button
            } 
        });

    },
    bindPlayerEvents: function () {
        var _this = mediaManager,
            helpers = _this.helpers,
            functions = _this.functions,
            data = _this.data;
        //BIND EVENTS TO THE PLAYER
        $(data.player).bind("player-ready", function (e) {
            _this.functions.adjustDimensions();
        });
        $(data.player).bind("play", function () {

        });
        $(data.player).bind("pause", function () {

        });
        $(data.player).bind("show-layer-endstate", function (e) {
            setTimeout(helpers.playPosition(0),100);
        });
    },
    functions: {
        setMetadata: function (filmstripItem) {
            var _this = mediaManager,
                data = _this.data,
                playerMeta = $('#'+data.classes.video).data('video'),
                metadata = $.extend(playerMeta, $(filmstripItem).data('video'));
            metadata.targetPage = window.location.origin + "/" + metadata.targetPage;
            _this.data.metadata = metadata;
        },
        modifyProjekktor: function () {
            projekktors[0].setPause = function () {
                var el = document.getElementById(this.getId());
                el.parentNode.className = ' js-pause';
                this._enqueue("pause",false);
                return this;                       
            };
            projekktors[0].setPlay = function () {
                var el = document.getElementById(this.getId());
                el.parentNode.className = ' js-play';
                this._enqueue("play",false);
                return this                       
            };
        },
        adjustDimensions: function () {
            var _this = mediaManager,
                data = _this.data,
                classes = data.classes,
                metadata = _this.data.metadata;
            $(data.player).css({
                height: metadata.height,
                width: metadata.width
            });
            $(data.player).find('.'+classes.projekktor).css({
                height: '100%',
                width: '100%'
            });
            return
        },
        togglePlayPause: function () {
            var _this = mediaManager,
                helpers = _this.helpers,
                $player = $(_this.data.player);
            if (!$player.is('.js-play')) {
                helpers.playVideo();
            } else {
                helpers.pauseVideo();
            }
        },
        toggleFullscreen: function () {
            var _this = mediaManager,
                helpers = _this.helpers,
                $player = $(_this.data.player);
            if ($player.is(".js-fullscreen")){
                helpers.openFullscreen();
            } else {
                helpers.closeFullscreen();
            }
        },
        updateVideoContent: function () {
            var _this = mediaManager,
                classes = _this.data.classes,
                metadata = _this.data.metadata,
                content = _this.data.content;

            $(content.title).html(metadata.title);
            $(content.description).html(metadata.description);
            $(content.videoPageLink).val(metadata.targetPage);
            console.log(metadata.targetPage);
            $(content.videoEmbed).val('<iframe src="'+metadata.targetPage+'#video__player"></iframe>');
            $('[st_url]').attr('st_url', metadata.targetPage);
            if (metadata.shareWidget !== "true") {
                $("."+classes.videoShare).addClass('js-hidden')
            } else {
                $("."+classes.videoShare).removeClass('js-hidden')
            }
        },
        changeIframe: function (href) {
            var _this = mediaManager,
                helpers = _this.helpers;
            $(_this.data.wrapper).find('iframe, script').attr('src', href);
            helpers.playVideo();
        },
        changeScript: function (href, startVideo) {
            var _this = mediaManager,
                helpers = _this.helpers,
                player = _this.data.classes.videoPlayer,
                script = href + '&trgt=' + player;
            helpers.exitVideo(); //exit removes the PPPlayer from the projekktors array, guarantees that there's only ever one item in the array
            $.getScript(script); // load the script
            //we do a timeout so that we don't perform these functions until after a new player exists. 
            window.setTimeout(function(){
                //pause it first, incase autoplay is set to true - b/c it looks dumb to resize an autoplaying video
                _this.bindPlayerEvents();
                helpers.playVideo();
                //play the video after it's been resized. basically, we've manually created fouc. {{sadface}}
                //
            }, 4000);
        },
        toggleShareWidget: function () {
            var _this = mediaManager;
            $('.'+_this.data.classes.shareWrap).toggleClass('js-visible');
        },
        showShareButton: function () {
            var _this = mediaManager;
            $('.'+_this.data.classes.shareButton).removeClass('js-invisible');            
        },

    }

},