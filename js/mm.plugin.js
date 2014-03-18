(function ( $ ){
    $.fn.mediamanager = function(params) {
        return this.each(function() {
            //SETUP
            var video,
                data = $.extend($(this).data('video'), params),
                $this = $(this),
                thisEl = document.getElementById($this.attr('id'));

            for (var attr, i=0, attrs=thisEl.attributes, l=attrs.length; i<l; i++){
                attr = attrs.item(i)
                if (attr.nodeName.match('data-video-')){
                    name = attr.nodeName.replace('data-video-','');
                    data[name] = attr.nodeValue;
                }
            }
            //DEFAULT SETTINGS
            var settings = $.extend({
            'height' : '100%',
            'width' : '100%',
            'type' : 'embed'
            }, params);            
            
            //module
            video = {
                init: function () {
                    var _this = this;
                    _this.functions.cleanUrl();
                    _this.functions.getVideo();
                },
                helpers: {
                    generateId: function () {
                        var c = 'video-',
                            d = new Date();
                        d = d.getTime();
                        $this.attr('id', c+d);
                        return c + d;
                    },
                    getId: function () {
                        var _this = video;
                        return $this.attr('id') != undefined ? $this.attr('id') : _this.helpers.generateId(); 
                    },
                    generateScriptUrl: function (url, id) {
                        return url + '&trgt=' + id
                    },
                    generateIframeUrl: function (url) {
                        return url.replace('embed')
                    },
                    setScript: function (el) {
                        var _this = video,
                            id = _this.helpers.getId(),
                            url = _this.helpers.generateScriptUrl(data.url, id);
                        $.getScript(url).done(function(e){
                            $(document).bind('MMPLAYERREADY', _this.helpers.playerready);
                        });
                    },
                    setIframe: function () {
                        var _this = video,
                            url = data.url.replace('/embed',''),
                            iframe = document.createElement('iframe');
                        iframe.src = url;
                        $this.append(iframe);

                    }, 
                    playerready: function (e) {
                        var _this = video,
                            player = $('#'+e.value);
                        _this.functions.setDimensions();
                        _this.bindPlayerEvents(player)
                    }            
                },
                bindPlayerEvents: function (player) {
                    var _this = video, 
                        videoEl = document.getElementById($(player).find('video').attr('id'));
                    console.log(videoEl);
                    $(player).on("player-ready",function (e) {
                        console.log("player is ready");
                    });
                    videoEl.onplay = function (e) {
                        console.log('is playing');
                    }
                },
                functions:{
                    cleanUrl: function () {
                        console.log(data);
                        if (!data.url.match('embed')){
                            data.url = data.url.replace('Distributions', 'Distributions/embed/');
                        }
                    },
                    setDimensions: function (player) {
                        var _this = video,
                            h = data.height != null ? data.height : $this.height(),
                            w = data.width != null ? data.width : $this.width();
                        $this.css({'height': h, 'width': w});
                        $this.children().css({'height': 'inherit', 'width': 'inherit'});
                        $this.find('.projekktor').css({'height': 'inherit', 'width': 'inherit'});
                    },
                    getVideo: function () {
                        var _this = video;
                        switch(data.type) {
                            case 'embed' :
                                _this.helpers.setScript();
                                _this.functions.setDimensions();
                            break;
                            case 'iframe' :
                                _this.helpers.setIframe();
                            break;
                            default: 
                            break;

                        }

                    }
                }
            }
            video.init();
        });

    }
}( jQuery));
$('[data-video]').mediamanager();
