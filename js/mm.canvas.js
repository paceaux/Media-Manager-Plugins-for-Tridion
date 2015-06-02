(function ( $ ){
  $.fn.mmplayer = function(params) {
    return this.each(function() {
      //SETUP
      this.data = $.extend($(this).data('sdlmm'), params);
      var video,
          _this = this,
          $this = $(this);

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
        console.log(video.style);
        return video;
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
          console.log(assets);
          renditionGroups.forEach(function (group) {
            if (group.name.indexOf('Web') !== -1) {
              var video = _this.Video(group.renditions, assets.metadata.properties);

              _this.appendChild(video);
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