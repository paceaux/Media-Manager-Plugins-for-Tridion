(function ( $ ){
    $.fn.mediamanager = function(params) {
        return this.each(function() {
            //SETUP
            var video,
                data = $.extend($(this).data('video'),$(this).data('video-url'), $(this).data('video-type'), $(this).data('video-height'), $(this).data('video-width')),
                $this = $(this);

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
                    _this.bindPlayerEvents();
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
                        $.getScript(url);
                    },
                    setIframe: function () {
                        var _this = video,
                            url = data.url.replace('/embed',''),
                            iframe = document.createElement('iframe');
                        iframe.src = url;
                        $this.append(iframe);

                    }                    
                },
                bindPlayerEvents: function () {
                    var _this = video;
                    $(document).bind('MMPLAYERREADY', function (e) {
                        _this.functions.setDimensions();
                    })
                },
                functions:{
                    cleanUrl: function () {
                        data.url = data.url.replace('vms/distribution', 'Distributions');
                        
                    },
                    setDimensions: function () {
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
