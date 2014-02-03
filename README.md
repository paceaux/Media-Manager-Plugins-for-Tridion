# Media Manager Plugins for Tridion

JavaScript plugins, jQuery plugins,  and Razor TBBs that make it a easier to get Media Manager working in Tridion


## The JavaScript Filmstrip Module

The JavaScript Module is designed to work in conjunction with a "filmstrip". a jQuery plugin for the "filmstrip" is **not ** provided. JavaScript for the filmstrip is also not included.

### JavaScript Filmstrip Module - Upcoming Features
+ a jQuery plugin for the filmstrip itself 

## The jQuery Plugin

the jQuery plugin is  `mm.plugin.js`. The plugin has been tested with jQuery 1.8.3 - 2.0. 

### Setting Parameters

**The jQuery plugin does not work like other jQuery plugins you may have worked with in the past; it does *not* accept parameters via JavaScript.** 

The Media Manager jQuery plugin instead accepts parameters via HTML&mdash;so that you can allow content authors or Template Building Blocks (TBBs) to set parameters (example Razor templates and schemas to come).

#### Setting Parameters in the HTML

This jQuery plugin accepts parameters via a `data-*` attribute. Add a `data-video` attribute to your element, and set the value as a stringified JSON object: 
    
    <div data-video='{"height": "200px", "type":"iframe", "url" :"http://nationwide.dist.sdlmedia.com/vms/distribution/embed/?o=46A74ED4-23BC-4E29-9B2C-D3E1C9D338FD"}'></div>


##### What Parameters are Available?

The following parameters are available to you:

+  `height` : any value is permitted 
+  `width` : any value is permitted
+  `type`: `iframe` or `embed`
+  `url` : the fully qualified distribution url. It is **not** necessary to add "/embed/" in the url if this is a script. 

#### Options for Setting Parameters

It's not necessary to set the parameters in a single HTML `data-*` attribute. This can make for writing messy TBBs. If you want, you can make each parameter its own `data-video-*`  attribute: 
    
    <div data-video='{"height": "150px", "width":"250px"}' data-video-type='{"type":"embed"}' data-video-url='{"url":"http://nationwide.dist.sdlmedia.com/vms/distribution/embed/?o=46A74ED4-23BC-4E29-9B2C-D3E1C9D338FD"}'></div>

### Using the jQuery plugin
To use the jQuery plugin, just make sure that `mm.plugin.js` is included in your HTML pages after your jQuery file (optimally, at the bottom of the page). After you've included the jQuery plugin file, you should add this to any JavaScript that would execute *after* the jQuery plugin file is loaded: 
    
    $('data-video').mediamanager();


### Upcoming jQuery Plugin features

+ binding player events to external elements
+ loading gif

