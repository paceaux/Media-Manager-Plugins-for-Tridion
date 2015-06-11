# Media Manager Tools for Tridion

## CSS Tools
The file `css.html` contains a demo of CSS tricks and hacks that you can do with Media Manager videos. 

## jQuery plugins for SDL's Media Manager

## The Canvas Plugin
The file `canvas.html` contains a demo of this plugin's features. 

This is a brand new jQuery plugin. This uses the HTML5 Canvas API, and it relies on Media Manager's new JSON API. The plugin has been tested with jQuery 1.8.3 - 2.0 in Chrome and Firefox. This plugin is intended for modern browsers, as it uses the following HTML5 APIs

+ Canvas
+ getUserMedia
+ Video

### Features

With the Canvas plugin, several feaures are available. They include:
+ Convert a video to gray scale (other color conversions coming soon)
+ Display a zoomed video
+ Set a video to be either background or foreground (if you want copy to lay on top of the video)
+ Insert styled text into a video
+ Use the Custom Events in Media Manager to insert animated text at specific points in the video

### Setting Parameters

This jQuery plugin was not built to work like other jQuery plugins that you may have worked with in the past; it does *not* accept parameters via JavaScript. Instead, parameters are set via HTML. This means that a content management system (CMS), such as Tridion, could contain a schema that stores configurations for the video that a content author can set, and that the configurations are translated into basic HTML with a template or a view. 


Al parameters are set in the HTML element of a parent container, using a `data-sdlmm` attribute. 

#### Standard Parameters

+ set the URI: `data-sdlmm-url="https://poc5.dist.sdlmedia.com/Distributions/?o=7045941B-0652-49ED-A5A9-240A91636FE5"` 
+ data type of the URI:   data-sdlmm-type="json"
+ autoplay: boolean:  ` data-sdlmm-autoplay="true"`
+ looping:boolean:  `data-sdlmm-loop="true"`
+ volume:float: `data-sdlmm-volume="0.0"`
+ native-browser controls: boolean: `data-sdlmm-controls="true"`

#### Canvas Parameters
It's not necessary, but certainly more fun, to use Canvas to display video, instead of native video
+ use Canvas effects: comma-separated string value of effects (colorshift, text, zoom): data-sdlmm-canvas-effects='text'
+ colorshift: text : `data-sdlmm-colorshift='gray'`
+ text: json string of text and parameters: `data-sdlmm-canvas-text='{"text": "Text with Custom Events", "x" : 100, "y" : 100, "font": "30px serif"}'`

### Custom Events
It is possible to also use the Custom Events API in Media Manager to insert text, with an animation, at specific points in the duration of the video. 

With this, the user should set the name of the custom event as `animation`. 

The value should be a JSON-like argument:
`{origin:, text: Sentence-using-hyphens-as-strings}`

+ origin : fromLeft, fromRight, fromTop, fromBottom
+ text: optional, should use basic characters and hyphens to separate spaces (sorry)

The text will animate *to* the coordinates that have been set in the text parameters. 


## The Standard Plugin

The HTML file `video.html` contains a demo of the standard jQuery plugin

The jQuery plugin is  `mm.plugin.js`. The plugin has been tested with jQuery 1.8.3 - 2.0 in Chrome, Firefox, IE8+, and Safari. 

### Setting Parameters

The jQuery plugin does not work like other jQuery plugins you may have worked with in the past; it does *not* accept parameters via JavaScript.


The Media Manager jQuery plugin instead accepts parameters via HTML&mdash;so that you can allow content authors or Template Building Blocks (TBBs) to set parameters (example Razor templates and schemas to come).

#### Setting Parameters in the HTML

This jQuery plugin accepts parameters via a `data-*` attribute. Add a `data-video` attribute to your element, and set the value as a stringified JSON object: 
    
    <div data-video='{"height": "200px", "type":"iframe", "url" :"http://[clientname].dist.sdlmedia.com/vms/distribution/embed/?o=46A74ED4-23BC-4E29-9B2C-D3E1C9D338FD"}'></div>


##### What Parameters are Available?

The following parameters are available to you:

+  `height` : any value is permitted 
+  `width` : any value is permitted
+  `type`: `iframe` or `embed`
+  `url` : the fully qualified distribution url. It is **not** necessary to add "/embed/" in the url if this is a script. 

#### Options for Setting Parameters

It's not necessary to set the parameters in a single HTML `data-*` attribute. This can make for writing messy TBBs. If you want, you can make each parameter its own `data-video-*`  attribute: 
    
    <div data-video='{"height": "150px", "width":"250px"}' data-video-type='{"type":"embed"}' data-video-url="http://[clientname].dist.sdlmedia.com/vms/distribution/embed/?o=46A74ED4-23BC-4E29-9B2C-D3E1C9D338FD"></div>

### Activating the jQuery plugin
To use the jQuery plugin, just make sure that `mm.plugin.js` is included in your HTML pages after your jQuery file (optimally, at the bottom of the page). After you've included the jQuery plugin file, you should add this to any JavaScript that would execute *after* the jQuery plugin file is loaded: 
    
    $('[data-video]').mediamanager();

You can use any standard jQuery selector, however, this one guarantees that you always execute the mediamanager function on elements that have the `data-video` attribute. 


