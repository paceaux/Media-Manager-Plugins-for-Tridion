(function($) {
    $.fn.mmplayer = function(params) {
        /*
        Yes, this is a jQuery plugin. However, the insides don't use jQuery at all. 
        So, if a client didn't want to use jQuery, that's fine. we can make a non-jquery version without issue
        */
        //make sure that GUM works the same in all browsers
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        //create a custom event for custom events
        var videoTimeevt = new CustomEvent('videoTime',{
                'detail': {
                    playTime: this.currentTime
                }
            });
        /*=== THE JUICY BITS ===*/
        return this.each(function() {
            /*== INTERNAL VARIABLES==*/
            this.data = $.extend($(this).data('sdlmm'), params);
            var video,
                _this = this,
                $this = $(this);
            this.colorizing = {
                rgb: {
                    r: 1,
                    g: 1,
                    b: 1
                },
                hslToRgb: function(h, s, l) {
                    var r, g, b;
                    if (s == 0) {
                        r = g = b = l; // achromatic
                    } else {
                        function hue2rgb(p, q, t) {
                            if (t < 0) t += 1;
                            if (t > 1) t -= 1;
                            if (t < 1 / 6) return p + (q - p) * 6 * t;
                            if (t < 1 / 2) return q;
                            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                            return p;
                        }

                        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                        var p = 2 * l - q;
                        r = hue2rgb(p, q, h + 1 / 3);
                        g = hue2rgb(p, q, h);
                        b = hue2rgb(p, q, h - 1 / 3);
                    }
                    return [r * 255, g * 255, b * 255];
                },
            };
            //take all of the data attributes and add them to the data that already exists on the object
            for (var attr, i = 0, attrs = $this[0].attributes, l = attrs.length; i < l; i++) {
                attr = attrs.item(i);
                if (attr.nodeName.match('data-sdlmm-')) {
                    name = attr.nodeName.replace('data-sdlmm-', '');
                    this.data[name] = attr.nodeValue;
                }
            }
            /*== VIDEO EVENT CALLBACKS==*/
            this.callbacks = {
                visChange: function (e) {
                  if (document.visibilityState !== 'hidden') {
                    _this.videoEl.play();
                  } else {
                    _this.videoEl.pause();
                  }
                },
                vidSuc: function(stream) {
                    var _this = videoStream;
                    if ('mozSrcObject' in _this.data.videoEl) {
                        _this.data.videoEl.mozSrcObject = stream;
                        _this.data.videoEl.play();

                    } else if (window.webkitURL) {
                        _this.data.videoEl.src = window.webkitURL.createObjectURL(stream);
                        _this.data.videoEl.play();
                    } else {
                        _this.data.videoEl.src = stream;
                        _this.data.videoEl.play();

                    }
                },
                vidErr: function(err) {},
                vidPlay: function(e) {
                    var zoom = _this.data['canvas-zoom'] !== undefined ? _this.data['canvas-zoom'] : 1;
                    if (_this.ctx !== undefined) {
                        _this.drawCanvas(this, 0, 0, this.offsetWidth * zoom, this.offsetHeight * zoom);

                    }
                }
            };
            /*== MM URI CLEANUP ==*/
            this.Uuid = function() {
                return this.data.url.substring(this.data.url.indexOf('=') + 1);
            };
            this.uuid = this.Uuid();
            this.ResourceUrl = function() {
                var url = this.data.url;
                switch (this.data.type) {
                    case 'json':
                        url = this.data.url.replace('Distributions/?o=', 'json/');
                        break;
                    case 'embed':
                        break;
                    default:
                        break;
                }
                return url;
            };
            this.resourceUrl = this.ResourceUrl();

            /*== CANVAS SHENANIGANS ==*/
            this.setCanvasTextData = function () {
                //declare variables for the userText and the canvas text default. 
                var userCtext,
                    cText = {
                        font : "48px sans-serif",
                        lineWidth : 4, 
                        strokeColor : 'black', 
                        fillColor : 'white'
                    };
                //if there's user-provided data, let's grab it and apply it to the default variable
                if (_this.data['canvas-text']) {
                    userCtext = JSON.parse(_this.data['canvas-text']);
                    for (var attr in userCtext) {
                        cText[attr] = userCtext[attr];
                    }
                }
                //only if there's animation should the currentCoord not be the same as cText.x/y
                cText.currentCoord = {
                    x: -400,
                    y: 48
                };
                //set the canvas text to the stored data
               _this.canvasData.textDrawing = cText;
            };
            this.drawTextOnCanvas = function (x,y, text) {
              if (_this.canvasData.textDrawing.text || text !== undefined) {
                var cText = _this.canvasData.textDrawing;
                cText.text = text !== undefined ? text : _this.canvasData.textDrawing.text;
                _this.ctx.font = cText.font;
                _this.ctx.strokeStyle = cText.strokeColor; 
                _this.ctx.lineWidth = cText.lineWidth;
                _this.ctx.strokeText(cText.text, x, y);
                _this.ctx.fillStyle = cText.fillColor;
                _this.ctx.fillText(cText.text, x, y);
              }
            };
            this.drawCanvas = function(src, x, y, w, h) {
                if (src.paused || src.ended) return false;
                if (src !== undefined) {
                  _this.ctx.drawImage(src, x, y, w, h);
                  if (_this.data.colorshift && _this.data.colorshift !== 'none') {
                    var pixels = _this.ctx.getImageData(0, 0, w, h),i = 0,brightness;
                    for (; i < pixels.data.length; i += 4) {
                            brightness = ((3 * pixels.data[i] + 4 * pixels.data[i + 1] + pixels.data[i + 2]) >>> 3) / 256;
                            pixels.data[i] = ((_this.colorizing.rgb.r * brightness) + 0.1) >> 0;
                            pixels.data[i + 1] = ((_this.colorizing.rgb.g * brightness) + 0.1) >> 0
                            pixels.data[i + 2] = ((_this.colorizing.rgb.b * brightness) + 0.1) >> 0
                        }
                      _this.ctx.putImageData(pixels, 0, 0);
                    }
                _this.canvasData.textDrawing.currentCoord.x = _this.canvasData.textDrawing.currentCoord.x < _this.canvasData.textDrawing.x ? _this.canvasData.textDrawing.currentCoord.x+=10 : _this.canvasData.textDrawing.currentCoord.x >_this.canvasData.textDrawing.x ?_this.canvasData.textDrawing.currentCoord.x-=10 : _this.canvasData.textDrawing.currentCoord.x;
                _this.canvasData.textDrawing.currentCoord.y = _this.canvasData.textDrawing.currentCoord.y < _this.canvasData.textDrawing.y ? _this.canvasData.textDrawing.currentCoord.y+=2 : _this.canvasData.textDrawing.currentCoord.y >_this.canvasData.textDrawing.y ?_this.canvasData.textDrawing.currentCoord.y-=2 : _this.canvasData.textDrawing.currentCoord.y;

                _this.drawTextOnCanvas(_this.canvasData.textDrawing.currentCoord.x, _this.canvasData.textDrawing.currentCoord.y);
                  window.requestAnimationFrame(function() {
                      _this.drawCanvas(_this.videoEl, x, y, w, h);
                  });
                }
            };
            this.Canvas = function(video, metadata) {
                var canvas = document.createElement('canvas'),
                    ratio = metadata.aspectRatio,
                    floatRatio = (parseInt(ratio.substr(ratio.indexOf('/') + 1), 10) / parseInt(ratio.substring(0, ratio.indexOf('/'))));
                canvas.classList.add('sdlmm__canvas');
                _this.canvasData = {};
                return canvas;
            };
            /*== ENRICHMENT AND METADATA  ==*/
            this.modifyEnrichmentData = function () {
                for (var evt in _this.enrichments.customEvents) {
                    var cEvt = _this.enrichments.customEvents[evt],
                        time = cEvt.appearsAt.split(':');

                    cEvt.appearsAtInt =  (+time[0]) * 60 * 60 + (+time[1]) * 60 + (+time[2]);
                }
            };
            this.setCustomEvents = function (video) {
                //if we have custom events, let's add them
                if (_this.enrichments.customEvents.length >0) {
                    var cEvts = _this.enrichments.customEvents, 
                        cEvtTimeList = [];
                    for (var cEvt in cEvts) {
                        cEvts[cEvt].cvsCtx = _this.ctx;
                        cEvtTimeList[cEvts[cEvt].appearsAtInt] = cEvts[cEvt];
                        //if there's an animation, then, by golly, let's do something about it.
                        if (cEvts[cEvt].name === 'animation') {
                            /*
                            change the value from a string to an object.
                             Because media manager UI converts symbols to HTML characters, we have the user provide invalid JSON strings. 
                             We'll insert some quotations in the right places so that JSON.parse can properly parse the string into an object
                             */
                             var commaReg = new RegExp(',', 'g'),
                                colonReg = new RegExp(':', 'g'),
                                spaceReg = new RegExp(' ','g'),
                                hyphenReg = new RegExp('-','g'),
                                doubleSpcReg = new RegExp('/\s\s+', 'g')
                                underReg = new RegExp('_', 'g');
                            cEvts[cEvt].value = cEvts[cEvt].value.replace('{', '{"').replace('}', '"}').replace(commaReg,'","').replace(colonReg, '":"').replace(spaceReg,'').replace(hyphenReg, ' ').replace(underReg, ' ');
                            cEvts[cEvt].value = JSON.parse(cEvts[cEvt].value);
                        }
                    }
                    video.customEventList = cEvtTimeList;
                    video.ontimeupdate = function (e) {
                         if (cEvtTimeList[Math.floor(this.currentTime)] && !cEvtTimeList[Math.floor(this.currentTime)].fired ) {
                            cEvtTimeList[Math.floor(this.currentTime)].fired = true;
                            this.dispatchEvent(videoTimeevt);
                         }
                    }
                }
            };
            this.setVideoAttributes = function (video, metadata) {
                video.classList.add('sdlmm__video');
                video.classList.add('sdlmm__video--' + this.data.space);
                video.classList.add('sdlmm__video--ratio-' + metadata.aspectRatio.replace('/', '-'));
                video.classList.add('sdlmm__video--height-' + metadata.height);
                video.classList.add('sdlmm__video--width-' + metadata.width);
                video.crossOrigin = "Anonymous";

            };
            this.addVideoEventListeners = function (video) {
                _this.setCustomEvents(video);
                video.addEventListener('play', _this.callbacks.vidPlay, false);
                document.addEventListener('visibilitychange', _this.callbacks.visChange, false);
                video.addEventListener('videoTime', function (e) {
                    var custEvent = this.customEventList[Math.floor(this.currentTime)];

                    if (custEvent.name === 'animation') {
                        if (custEvent.value.origin) _this.canvasData.textDrawing.text = custEvent.value.text;
                        switch(custEvent.value.origin){
                            case 'fromLeft':
                                _this.canvasData.textDrawing.currentCoord.x= -400;
                            break;
                            case 'fromRight':
                                _this.canvasData.textDrawing.currentCoord.x = _this.canvas.offsetWidth;

                            break;
                            case 'fromTop':
                                _this.canvasData.textDrawing.currentCoord.y= -50;
                            break;
                            case 'fromBottom':
                                _this.canvasData.textDrawing.currentCoord.y = _this.canvas.offsetHeight;

                            break;

                            default:
                            break;
                        }
                    }
                });
            };
            this.setVideoUI = function (video, metadata) {
                var ratio = metadata.aspectRatio,
                    floatRatio = (parseInt(ratio.substr(ratio.indexOf('/') + 1), 10) / parseInt(ratio.substring(0, ratio.indexOf('/'))));
                if (this.data.space !== 'background') {
                    video.volume = parseInt(_this.data.volume);
                    video.controls = _this.data.controls;
                    video.style.height = (floatRatio * 100) + '%';
                } else {
                    video.muted = true;
                    video.controls = false;
                }
            };
            this.Video = function(renditions, metadata) {
                var video = document.createElement('video');

                renditions.forEach(function(resource) {
                    var source = document.createElement('source');
                    source.src = resource.url;
                    video.appendChild(source);
                });
                _this.setVideoAttributes(video, metadata);
                _this.setVideoUI(video, metadata);
                _this.addVideoEventListeners(video);
                video.autoplay = _this.data.autoplay;
                video.loop = _this.data.loop;

        
                return video;
            };
            this.setVideoStream = function() {
                navigator.getUserMedia({
                    video: true
                }, _this.callbacks.vidSuc, _this.callbacks.vidErr);
            };
            $.ajax({
                url: this.resourceUrl,
                method: "GET",
                dataType: "json"
            })
                .done(function(jsonData) {
                    var containers = jsonData.assetContainers,
                        assets = containers[0].assets[0],
                        renditionGroups = assets.renditionGroups,
                        video;
                    _this.enrichments = assets.enrichments;
                    _this.modifyEnrichmentData();
                    renditionGroups.forEach(function(group) {
                        if (group.name.indexOf('Web') !== -1) {
                            var video = _this.Video(group.renditions, assets.metadata.properties);
                            canvas;
                            _this.appendChild(video);
                            _this.videoEl = video;
                            if (_this.data['canvas-effects']) {
                                switch(_this.data['colorshift']) {
                                    case ('gray'):
                                        _this.colorizing.rgb.r = 255;
                                        _this.colorizing.rgb.g = 255;
                                        _this.colorizing.rgb.b = 255;
                                    break;
                                    case ('grayscale'):
                                        _this.colorizing.rgb.r = 255;
                                        _this.colorizing.rgb.g = 255;
                                        _this.colorizing.rgb.b = 255;
                                    break;

                                    case  'sepia': 
                                        _this.colorizing.rgb.r = 252;
                                        _this.colorizing.rgb.g = 204;
                                        _this.colorizing.rgb.b = 158;
                                    break;
                                    case 'red':
                                        _this.colorizing.rgb.r = 252;
                                        _this.colorizing.rgb.g = 194;
                                        _this.colorizing.rgb.b = 178;
                                    break;
                                    case 'blue':
                                        _this.colorizing.rgb.r = 198;
                                        _this.colorizing.rgb.g = 204;
                                        _this.colorizing.rgb.b = 252;
                                    break;
                                    default: 
                                    break;
                            }
                                var canvas = _this.Canvas(video, assets.metadata.properties);
                                _this.canvas = canvas;
                                _this.ctx = _this.canvas.getContext('2d');
                                _this.setCanvasTextData();
                                
                                canvas.height = video.offsetHeight;
                                canvas.width = video.offsetWidth;
                                _this.appendChild(canvas);
                            }
                        }
                    });
                });
            //DEFAULT SETTINGS
            var settings = $.extend({
                'height': '100%',
                'width': '100%',
                'type': 'embed'
            }, params);
        });
    }
}(jQuery));