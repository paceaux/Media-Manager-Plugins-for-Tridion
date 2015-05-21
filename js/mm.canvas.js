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
      console.log(this.data)
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
      this.Video = function (renditions) {
        var video = document.createElement('video');
        video.classList.add('sdlmm__video');
        renditions.forEach(function (resource) {
          var source = document.createElement('source');
          source.src = resource.url;
          video.appendChild(source);
        });
        video.autoplay = _this.data.autoplay;
        video.volume = _this.data.volume;
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
          renditionGroups.forEach(function (group) {
            if (group.name.indexOf('Web') !== -1) {
              var video = _this.Video(group.renditions);
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