(function ( $ ){
  $.fn.mmplayer = function(params) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    return this.each(function() {
      //SETUP
      this.data = $.extend($(this).data('sdlmm'), params);
      var video,
          _this = this,
          $this = $(this);
          this.callbacks= {
            vidSuc: function (stream) {
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
            vidErr: function (err) {},
            vidPlay: function (e) {
              console.log('playing');
              if (_this.ctx !== undefined) {
                _this.drawOnCanvas(this,0,0, this.offsetWidth, this.offsetHeight);

              }
            }
          };
      for (var attr, i=0, attrs=$this[0].attributes, l=attrs.length; i<l; i++){
          attr = attrs.item(i);
          if (attr.nodeName.match('data-sdlmm-')) {
              name = attr.nodeName.replace('data-sdlmm-','');
              this.data[name] = attr.nodeValue;
          }
      }
      this.Uuid = function () {
        return this.data.url.substring(this.data.url.indexOf('=')+1);
      };
      this.uuid = this.Uuid();
      this.ResourceUrl = function () {
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
      this.Canvas = function (video, metadata) {
        var canvas = document.createElement('canvas'),
          ratio = metadata.aspectRatio,
          floatRatio = (parseInt(ratio.substr(ratio.indexOf('/')+1), 10) / parseInt( ratio.substring(0, ratio.indexOf('/') ) ) ) ;
        canvas.classList.add('sdlmm__canvas');
        return canvas;
      };
      this.drawOnCanvas = function (src, x, y, w, h) {

          if(src.paused || src.ended) return false;

        if (src !== undefined) {

          _this.ctx.drawImage(src, x,y, w, h);
          // var pixels = _this.ctx.getImageData(0,0,w,h),
          // i = 0,
          // brightness;
            // for (; i < pixels.data.length; i += 4) {
            //   brightness = ((3*pixels.data[i]+4*pixels.data[i+1]+pixels.data[i+2])>>>3) / 256;
            //   pixels.data[i] = ((_this.data.rgb.r * brightness)+0.5)>>0;
            //   pixels.data[i+1] = ((_this.data.rgb.g * brightness)+0.5)>>0
            //   pixels.data[i+2] = ((_this.data.rgb.b * brightness)+0.5)>>0
            // }
            // _this.canvas.putImageData(pixels, 0, 0);

          window.requestAnimationFrame(function () {
            _this.drawOnCanvas(_this.videoEl, 0,0,w,h);
          });
        }
      };
      this.Video = function (renditions, metadata) {
        var video = document.createElement('video'),
            ratio = metadata.aspectRatio,
            floatRatio = (parseInt(ratio.substr(ratio.indexOf('/')+1), 10) / parseInt( ratio.substring(0, ratio.indexOf('/') ) ) ) ;
        video.classList.add('sdlmm__video');
        video.classList.add('sdlmm__video--' + this.data.space);
        video.classList.add('sdlmm__video--ratio-'+metadata.aspectRatio.replace('/', '-'));
        video.classList.add('sdlmm__video--height-'+metadata.height);
        video.classList.add('sdlmm__video--width-'+metadata.width);
        renditions.forEach(function (resource) {
          var source = document.createElement('source');
          source.src = resource.url;
          video.appendChild(source);
        });
        if (this.data.space !== 'background') {
          video.volume = parseInt(_this.data.volume);
          video.controls = _this.data.controls;
          video.style.height = (floatRatio *100) + '%' ;


        } else {
          video.muted = true;
          video.controls = false;

        }
        video.autoplay = _this.data.autoplay;
        video.loop = _this.data.loop;
        return video;
      };
      this.setVideoStream = function () {
        navigator.getUserMedia({video: true}, _this.callbacks.vidSuc, _this.callbacks.vidErr);
      };
     $.ajax({
        url: this.resourceUrl,
        method: "GET",
        dataType: "json"
      })
      .done(function (jsonData) {
          var containers = jsonData.assetContainers,
              assets = containers[0].assets[0],
              renditionGroups = assets.renditionGroups,
              video;
          renditionGroups.forEach(function (group) {
            if (group.name.indexOf('Web') !== -1) {
              var video = _this.Video(group.renditions, assets.metadata.properties);
                  canvas;

              _this.appendChild(video);
              _this.videoEl = video;
            if(_this.data['canvas-effects']) {
              var canvas = _this.Canvas(video,assets.metadata.properties);
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
      'height' : '100%',
      'width' : '100%',
      'type' : 'embed'
      }, params);            

            
    });
  }
}( jQuery));