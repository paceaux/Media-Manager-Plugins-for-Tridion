(function($) {
    $.fn.mmplayer = function(params) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        var playtimeevt = new CustomEvent('playtime',{'playermoment': this.currentTime});

        return this.each(function() {
            //SETUP
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
            this.callbacks = {
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
                        _this.drawOnCanvas(this, 0, 0, this.offsetWidth * zoom, this.offsetHeight * zoom);

                    }
                }
            };
            for (var attr, i = 0, attrs = $this[0].attributes, l = attrs.length; i < l; i++) {
                attr = attrs.item(i);
                if (attr.nodeName.match('data-sdlmm-')) {
                    name = attr.nodeName.replace('data-sdlmm-', '');
                    this.data[name] = attr.nodeValue;
                }
            }
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
            this.Canvas = function(video, metadata) {
                var canvas = document.createElement('canvas'),
                    ratio = metadata.aspectRatio,
                    floatRatio = (parseInt(ratio.substr(ratio.indexOf('/') + 1), 10) / parseInt(ratio.substring(0, ratio.indexOf('/'))));
                canvas.classList.add('sdlmm__canvas');
                return canvas;
            };
            this.drawTextOnCanvas = function (text) {
              var font = "48px sans-serif", lineWidth = 4, strokeColor = 'black', fillColor = 'white', cText;
              if (_this.data['canvas-text'] !== undefined){
                cText = JSON.parse(_this.data['canvas-text']);
                _this.ctx.font = cText.font !== undefined ? cText.font : font;
                _this.ctx.strokeStyle = cText.strokeColor !== undefined ? cText.strokeColor : strokeColor; 
                _this.ctx.lineWidth = cText.lineWidth !== undefined ? cText.lineWidth : lineWidth;
                _this.ctx.strokeText(cText.text, cText.x, cText.y);
                _this.ctx.fillStyle = cText.fillColor !== undefined ? cText.fillColor : fillColor;
                _this.ctx.fillText(cText.text, cText.x, cText.y);
              }

            };
            this.drawOnCanvas = function(src, x, y, w, h) {

                if (src.paused || src.ended) return false;
                if (src !== undefined) {
                  _this.ctx.drawImage(src, x, y, w, h);
                  if (_this.data.colorshift && _this.data.colorshift !== 'none') {
                    var pixels = _this.ctx.getImageData(0, 0, w, h),i = 0,brightness;
                    for (; i < pixels.data.length; i += 4) {
                            brightness = ((3 * pixels.data[i] + 4 * pixels.data[i + 1] + pixels.data[i + 2]) >>> 3) / 256;
                            pixels.data[i] = ((_this.colorizing.rgb.r * brightness) + 0.5) >> 0;
                            pixels.data[i + 1] = ((_this.colorizing.rgb.g * brightness) + 0.5) >> 0
                            pixels.data[i + 2] = ((_this.colorizing.rgb.b * brightness) + 0.5) >> 0
                        }
                      _this.ctx.putImageData(pixels, 0, 0);
                    }
                    _this.drawTextOnCanvas();
                  window.requestAnimationFrame(function() {
                      _this.drawOnCanvas(_this.videoEl, x, y, w, h);
                  });
                }
            };
            this.modifyEnrichmentData = function () {
                for (var evt in _this.enrichments.customEvents) {
                    var cEvt = _this.enrichments.customEvents[evt],
                        time = cEvt.appearsAt.split(':');
                    time[0] = parseInt(time[0],10);
                    time[1] = parseInt(time[1], 10);
                    console.log(time);
                    cEvt.appearsAtInt = ( ( ( (parseInt(time[2],10)/60 + parseInt(time[1], 10) ) /60 ) /10)   )*60 *60;
                }
            };
            this.setCustomEvents = function (video) {
                if (_this.enrichments.customEvents.length >0) {
                    var cEvts = _this.enrichments.customEvents, 
                        cEvtTimeList = {};
                    for (var cEvt in cEvts) {
                        cEvtTimeList[cEvts[cEvt].appearsAtInt] = cEvts[cEvt];
                    }
                    console.log(cEvtTimeList);
                    video.ontimeupdate = function (e) {
                         if (cEvtTimeList[Math.floor(this.currentTime)] && !cEvtTimeList[Math.floor(this.currentTime)].fired ) {
                            console.log(cEvtTimeList[Math.floor(this.currentTime)]);
                            cEvtTimeList[Math.floor(this.currentTime)].fired = true;
                         }
                    }
                }
            };
            this.Video = function(renditions, metadata) {
                var video = document.createElement('video'),
                    ratio = metadata.aspectRatio,
                    floatRatio = (parseInt(ratio.substr(ratio.indexOf('/') + 1), 10) / parseInt(ratio.substring(0, ratio.indexOf('/'))));
                video.classList.add('sdlmm__video');
                video.classList.add('sdlmm__video--' + this.data.space);
                video.classList.add('sdlmm__video--ratio-' + metadata.aspectRatio.replace('/', '-'));
                video.classList.add('sdlmm__video--height-' + metadata.height);
                video.classList.add('sdlmm__video--width-' + metadata.width);
                renditions.forEach(function(resource) {
                    var source = document.createElement('source');
                    source.src = resource.url;
                    video.appendChild(source);
                });
                video.crossOrigin = "Anonymous";
                if (this.data.space !== 'background') {
                    video.volume = parseInt(_this.data.volume);
                    video.controls = _this.data.controls;
                    video.style.height = (floatRatio * 100) + '%';
                } else {
                    video.muted = true;
                    video.controls = false;
                }
                video.autoplay = _this.data.autoplay;
                video.loop = _this.data.loop;
                _this.setCustomEvents(video);

       
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
                                if (_this.data['colorshift'] === 'grayscale' || _this.data['colorshift'] === 'gray') {
                                    _this.colorizing.rgb.r = 255;
                                    _this.colorizing.rgb.g = 255;
                                    _this.colorizing.rgb.b = 255;
                                }
                                var canvas = _this.Canvas(video, assets.metadata.properties);
                                _this.canvas = canvas;
                                _this.ctx = _this.canvas.getContext('2d');
                                canvas.height = video.offsetHeight;
                                canvas.width = video.offsetWidth;
                                _this.appendChild(canvas);
                                video.addEventListener('play', _this.callbacks.vidPlay, false);
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