// ==UserScript==
// @name        Flickr: Show All Sizes
// @namespace   Jason Tank/Druidic
// @author      Jason Tamez <druidic@gmail.com>
// @description Adds links to every available size of a Flickr image.
// @version     4.3.2
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js
// @match       *://*.flickr.com/photos/*
// ==/UserScript==

// Summary: Adds links to the bottom of any Flickr individual photo page, pointing to the available sizes of the photo. While the links are fetched in the background, an animated 'loading' message will show. Image sizes are sorted according to type: Square, Small, Medium, or Large.
//          GreaseMonkey menu commands allow you to toggle which image links you get (turn Square off, for instance). You can also set it so the browser automatically downloads the image you click (by default, clicking a link merely loads the image in your browser).
//          The script uses jQuery 2.0.0, as hosted on GoogleAPIs.

// v1.0   - Initial script.
// v1.1   - Small visual tweaks.
//        - Added links to new "Small 320" and "Medium 800" formats.
// v1.2   - Minor change to loading message.
//        - More documentation in-script.
// v1.3   - "Large 1600" and "Large 2048" now supported.
//        - More documentation.
//        - Image links now rearrange by size if too many are available.
// v1.4   - More robust image-checking.
// v1.4.1 - Square 150 support.
//        - Even MORE robust image-checking.
// v1.5   - Reorganized script, links. Trying to keep output on one line.
//        - Links now have tooltips.
//        - Redid image-checking using HTML to save info instead of the sometimes-buggy .data() jQuery method.
//        - Thumbnail is now simply "Small 100". (But remains "Thumbnail" in tooltip.)
// v2.0   - Changed methodology. Rather than brute-force trying all possible files, just look at ONE image page and figure out what's available.
//        - Moved from jQuery 1.6.2 to 1.7.2
// v2.1   - Fixed bug where Firefox would not show links. (Bug probably existed since 1.5!)
//        - More documentation
// v2.2   - Even more documentation!!
//        - Fixed an unclosed tag in the Medium 640 link.
// v2.3   - Clarified the error message and altered its appearance.
//        - Simplied code.
//        - Added a check for jQuery, so we don't have to load a second instance if it's already installed.
//        - Added support for secure (https) pages.
// v2.4   - @namespace added.
//        - Moved the NotOkToDeLoad variable initialization to a place where it would actually initialize! (oops)
//        - @require added.
//        - Added "?zz=1" to Medium 640 images so older photos can resize correctly.
// v2.5   - Compacted three @match commands into one.
//        - Bumped up to jQuery 1.8.2
//        - Tweaked error message, directing users to http://userscripts.org/scripts/discuss/111902
// v3.0   - Bumped up to jQuery 1.8.3
//        - Turned off loading of larger sizes by default.
// v3.1   - Minor coding tweaks. (Flickr updated its interface, this extension still works with it!)
// v3.2   - Changed colors to match current Flickr look.
//        - Minor CSS tweak to push Hack outside of a neighbor element's bounding box.
//        - Bumped up to jQuery 2.0.0
// v3.2.1 - Minor code-style tweaks. (unreleased)
// v4.0   - MAJOR rewrite, inspired by http://userscripts.org/scripts/show/168642
//        - Revamped the way images are found, using the YUI that Flickr itself uses, when possible.
//        - Optimized for use with TamperMonkey on Chrome.
//          - Menu option allows you to change link behavior: view image in browser, or download image.
//        - Added support for the new "beta" look, as well as the "old" look.
//        - Tooltips now show width and height of the image.
// v4.0.1 - Deleted unused code.
//        - More documentation.
//        - Bug fix: Non-JPG original images and some Large size images weren't being transformed into download links.
// v4.0.2 - Kludge to fix a bug in the Beta that's erasing the sizes as soon as they're loaded.
// v4.1   - Added GM menu commands to toggle viewing of square/small/medium/large images.
// v4.1.1 - Fixed bug where sizes wouldn't show.
// v4.1.2 - Another workaround regarding the ever-changing Beta backend.
// v4.2   - Eliminated page-scraping code that was needed for running directly from Chrome's extensions page, which is now impossible.
// v4.3   - Another Flickr layout change, another fix.
//        - Link groupings now use abbreviations: Sq for Square, S for small, M for medium and L for large. This is to make them fit in the new layout.
//        - "Beta" is now referred to as the 2013 layout. In the future, after everyone has made the switch, I'll likely dump that code. And the "old style" code.
// v4.3.1 - Added an @author tag.
//        - Fixed a bug where older photos with a special Medium 640 filename (?zz=1) would break the script.
// v4.3.2 - Minor bugfix to keep generated links from changing color after you hover on them.




// Do we want to download images (true), or view them (false)?
var downloadLinks = GM_getValue("downloadLinks", false);

function maybeModifyLinks(val) {
  var h;

  if (val) {
    alert("Clicking on links will now download the image.");
  } else {
    alert("Clicking on links will now load the image in the browser.");
  }
  if(val === downloadLinks) {
    // Same value. No need to do anything.
    return;
  }
  downloadLinks = val;
  $("a.fshLink").each(function() {

    h = $(this).attr("href");
    if(val) {
      // Change to download links.
      $(this).attr("href", h.replace(/\.([a-z]+)$/i, "_d.$1"));
    } else {
      // Change to non-download links.
      $(this).attr("href", h.replace(/_d\.([a-z]+)$/i, ".$1"));
    }

  });
}


// Do we want to see certain groups of links (true) or not (false)?
var showSquare = GM_getValue("showSquare", true);
var showSmall =  GM_getValue("showSmall", true);
var showMedium = GM_getValue("showMedium", true);
var showLarge =  GM_getValue("showLarge", true);
// Original sizes images will ALWAYS show, if available.

function doToggle(imageSize, newFlag) {
  var m = " be shown. You will need to reload the page for this change to take effect.";
  GM_setValue("show" + imageSize, newFlag);
  if(newFlag) {
    m = imageSize + " images will now" + m;
  } else {
    m = imageSize + " images will no longer" + m;
  }
  alert(m);
}


// Register Greasemonkey/Tampermonkey menu commands
GM_registerMenuCommand('Flickr: SAS: View Images in Browser', function(cmd) {
  GM_setValue("downloadLinks", false);
  maybeModifyLinks(false);
});

GM_registerMenuCommand('Flickr: SAS: Download Images', function(cmd) {
  GM_setValue("downloadLinks", true);
  maybeModifyLinks(true);
});

GM_registerMenuCommand('Flickr: SAS: Toggle Square Images', function(cmd) {
  showSquare = !showSquare;
  doToggle("Square", showSquare);
});
GM_registerMenuCommand('Flickr: SAS: Toggle Small Images', function(cmd) {
  showSmall = !showSmall;
  doToggle("Small", showSmall);
});
GM_registerMenuCommand('Flickr: SAS: Toggle Medium Images', function(cmd) {
  showMedium = !showMedium;
  doToggle("Medium", showMedium);
});
GM_registerMenuCommand('Flickr: SAS: Toggle Large Images', function(cmd) {
  showLarge = !showLarge;
  doToggle("Large", showLarge);
});


// the guts of this userscript
function flickrSizeHackMain() {


  var flickrVersion;
  // Check if we're on the right type of page.
  if($("div#main div#primary-column div#meta").length <= 0) {
    if($("div#content div.photo-page-view div.photo-sidebar-view div.sidebar-panel-fixed div.photo-sidebar-actions-view").length > 0) {

      flickrVersion = 2;  // We're in the 2013-style (beta)

    } else if($("div#content div.photo-page-scrappy-view div.sub-photo-view div.sub-photo-container div.sub-photo-right-view div.sub-photo-right-row1").length > 0) {

      flickrVersion = 3;  // 2014-style

    } else {

      return;             // Not a photo page. No need to run.

    }
  } else {

    flickrVersion = 1;    // We're in the old-style (possibly non-English users?)

  }


  //*//*//*//*//*//*//*//*//*//*//*//*//*//
  //         HTML AND CSS DISPLAY        //
  //*//*//*//*//*//*//*//*//*//*//*//*//*//


  // NOTE about the TITLE attribute.
  //    The links' title attributes contain space-deliminated information.
  //      (1) The default image link ending.
  //      (2) The default download link ending. [new info: v4.0]
  //      (3) The link's group (small, medium, etc).
  //      (4) The link's maximum height and width.
  //      (5) Flickr's special name for this link's size. [optional]
  //    All information is used in pre-4.0 scripts, and in the legacy code for bare Chromium installs.
  //    Only 3, 4 and 5 are used in 4.0+ scripts.


  // Initialize variables
  var fshHTML,fshHTMLhead,fshHTMLtail,fshHTMLtemp,wholeStyle,linkStyle,groupStyle,rowStyle;

  // Animation of the 'loading' block.
  function animateLoading() {
      var Lone = $("div#FlickrSizeHack span.fshL1"),
          Ltwo = $("div#FlickrSizeHack span.fshL2"),
          Lthr = $("div#FlickrSizeHack span.fshL3");
      function doFading() {
          Lone.fadeOut(200);
          Lone.fadeIn(200);

          Ltwo.delay(100);
          Ltwo.fadeOut(200);
          Ltwo.fadeIn(200);

          Lthr.delay(300);
          Lthr.fadeOut(200);
          Lthr.fadeIn(200, doFading);
      }
      doFading();
  }

  if(flickrVersion === 1) {
    //
    // ORIGINAL LAYOUT
    //

    // Create the HTML for display.
    fshHTML = '<div id="FlickrSizeHack">' +
        '<span id="fshSquare" class="fshGroup">Square: ' +
            '<a href="" class="fshLink" id="fsh_sq" title="_s.jpg _s_d.jpg Square 75"></a>' +
            '<a href="" class="fshLink" id="fsh_q" title="_q.jpg _q_d.jpg Square 150"></a></span>' +
        '<span id="fshSmall" class="fshGroup">Small: ' +
            '<a href="" class="fshLink" id="fsh_t" title="_t.jpg _t_d.jpg Small 100 Thumbnail"></a>' +
            '<a href="" class="fshLink" id="fsh_s" title="_m.jpg _m_d.jpg Small 240"></a>' +
            '<a href="" class="fshLink" id="fsh_n" title="_n.jpg _n_d.jpg Small 320"></a></span>' +
        '<span id="fshMedium" class="fshGroup">Medium: ' +
            '<a href="" class="fshLink" id="fsh_m" title=".jpg _d.jpg Medium 500"></a>' +
            '<a href="" class="fshLink" id="fsh_z" title="_z.jpg?zz=1 _z_d.jpg Medium 640"></a>' +
            '<a href="" class="fshLink" id="fsh_c" title="_c.jpg _c_d.jpg Medium 800"></a></span>' +
        '<span id="fshLarge" class="fshGroup">Large: ' +
            '<a href="" class="fshLink" id="fsh_l" title="_b.jpg _b_d.jpg Large 1024"></a>' +
            '<a href="" class="fshLink" id="fsh_h" title="_h.jpg _h_d.jpg Large 1600"></a>' +
            '<a href="" class="fshLink" id="fsh_k" title="_k.jpg _k_d.jpg Large 2048"></a></span>' +
        '<span id="fshOriginal" class="fshGroup"> <a href="" class="fshLink" id="fsh_o" title="_o.jpg _o_d.jpg Original Original Original"></a></span>' +
        '<span class="fshLoading"><span class="fshL1">Loading</span> <span class="fshL2">all</span> <span class="fshL3">sizes...</span></span>' +
      '</div><div id="fshTemp"></div>';

    // Place the HTML after the photo's description.
    $("div#main div#primary-column div#meta").after(fshHTML);

    // CSS presentation for the grouping as a whole.
    wholeStyle = {"margin-bottom" : "10px"};

    // CSS presentation for the links.
    linkStyle = {"border-width"  : "1px",
                 "border-style"  : "solid",
                 "border-color"  : "#000",
                 "padding-left"  : "2px",
                 "padding-right" : "2px",
                 "font-family"   : "arial,sans-serif",
                 "background"    : "#fff",
                 "margin-right"  : "5px"};

    // CSS presentation for the link groupings ("fshGroup").
    groupStyle = {"white-space"  : "nowrap",
                  "background"   : "#222",
                  "color"        : "#fff",
                  "padding-left" : "2px"};

    // Apply the CSS to the links and groups.
    $("div#FlickrSizeHack").css(wholeStyle);
    $("div#FlickrSizeHack a, div#FlickrSizeHack span.fshLoading").css(linkStyle);
    $("div#FlickrSizeHack span.fshGroup").css(groupStyle);

    // Fix link hovering color-change to behave like other links.
    $("div#FlickrSizeHack a").hover(function() { $(this).css("background-color", "#0063dc"); }, function() { $(this).css("background-color", "#fff"); });

    // Hide links and groups until we're ready to display them.
    $("div#FlickrSizeHack a, span.fshGroup, div#fshTemp").css("display", "none");



  } else if (flickrVersion === 2) {
    //
    // 2013 LAYOUT
    //
    // Create (or reload) the HTML for display.
    function printBaseHTML() {

        fshHTMLhead = '<div id="FlickrSizeHack">';
        fshHTMLtail = '</div>';
        fshHTMLtemp = '<div id="fshTemp"></div>';
        fshHTML = '<div id="fshRow">' +
                      '<span id="fshSquare" class="fshGroup">Square: ' +
                          '<a class="fshLink" href="" id="fsh_sq" title="_s.jpg _s_d.jpg Square 75"></a>' +
                          '<a class="fshLink" href="" id="fsh_q" title="_q.jpg _q_d.jpg Square 150"></a></span>' +
                      '<span id="fshSmall" class="fshGroup">Small: ' +
                          '<a class="fshLink" href="" id="fsh_t" title="_t.jpg _t_d.jpg Small 100 Thumbnail"></a>' +
                          '<a class="fshLink" href="" id="fsh_s" title="_m.jpg _m_d.jpg Small 240"></a>' +
                          '<a class="fshLink" href="" id="fsh_n" title="_n.jpg _n_d.jpg Small 320"></a></span>' +
                      '<span class="fshLoading fshL1">Loading</span>' +
                  '</div><div id="fshRow">' +
                      '<span id="fshMedium" class="fshGroup">Medium: ' +
                          '<a class="fshLink" href="" id="fsh_m" title=".jpg _d.jpg Medium 500"></a>' +
                          '<a class="fshLink" href="" id="fsh_z" title="_z.jpg?zz=1 _z_d.jpg Medium 640"></a>' +
                          '<a class="fshLink" href="" id="fsh_c" title="_c.jpg _c_d.jpg Medium 800"></a></span>' +
                      '<span class="fshLoading fshL2">all</span>' +
                  '</div><div id="fshRow">' +
                      '<span id="fshLarge" class="fshGroup">Large: ' +
                          '<a class="fshLink" href="" id="fsh_l" title="_b.jpg _b_d.jpg Large 1024"></a>' +
                          '<a class="fshLink" href="" id="fsh_h" title="_h.jpg _h_d.jpg Large 1600"></a>' +
                          '<a class="fshLink" href="" id="fsh_k" title="_k.jpg _k_d.jpg Large 2048"></a>' +
                          '<a class="fshLink" href="" id="fsh_o" title="_o.jpg _o_d.jpg Large Original Original"></a></span>' +
                      '<span class="fshLoading fshL3">sizes...</span>' +
                  '</div>';


        // Place the HTML before the favorite/comment/share bar.
        $("div#content div.photo-page-view div.photo-sidebar-view div.sidebar-panel-fixed div.photo-sidebar-actions-view").before(fshHTMLhead + fshHTML + fshHTMLtail + fshHTMLtemp);

        // CSS presentation for the grouping as a whole.
        wholeStyle = {"margin-bottom" : "20px"};

        // CSS presentation for the links.
        linkStyle = {"border-width"  : "0px",
                     "padding-left"  : "2px",
                     "padding-right" : "2px",
                     "font-family"   : "arial,sans-serif",
                     "background"    : "#fff",
                     "color"         : "#000",
                     "margin-right"  : "5px"};

        // CSS presentation for the link groupings ("fshGroup").
        groupStyle = {"white-space"  : "nowrap",
                      "background"   : "#111",
                      "color"        : "#fff",
                      "padding-left" : "2px"};

        // CSS presentation for the rows.
        rowStyle = {"margin-left"   : "20px",
                    "margin-bottom" : "5px"};

        // Apply the CSS to the links, groups and rows.
        $("div#FlickrSizeHack").css(wholeStyle);
        $("div#FlickrSizeHack a, div#FlickrSizeHack span.fshLoading").css(linkStyle);
        $("span.fshLoading").css("background-color", "#999");
        $("div#FlickrSizeHack span.fshGroup").css(groupStyle);
        $("div#FlickrSizeHack div#fshRow").css(rowStyle);

        // Fix link hovering color-change to behave like the old links.
        $("div#FlickrSizeHack a").hover(function() { $(this).css({"background-color" : "#0063dc", "color" : "#fff"}); }, function() { $(this).css({"background-color" : "#fff", "color" : "#000"}); });

        // Hide links and groups until we're ready to display them.
        $("div#FlickrSizeHack a, span.fshGroup, div#fshTemp").css("display", "none");

    }
    printBaseHTML();

  } else {

    // 2014 LAYOUT
    // Create/reload the HTML for display.
    function printBaseHTML() {
    
      fshHTMLhead = '<div id="FlickrSizeHack">';
      fshHTMLtail = '</div>';
      fshHTMLtemp = '<div id="fshTemp"></div>';
      fshHTML = '' +
          '<span id="fshSquare" class="fshGroup">Sq: ' +
              '<a href="" class="fshLink" id="fsh_sq" title="_s.jpg _s_d.jpg Square 75"></a>' +
              '<a href="" class="fshLink" id="fsh_q" title="_q.jpg _q_d.jpg Square 150"></a></span>' +
          '<span id="fshSmall" class="fshGroup">S: ' +
              '<a href="" class="fshLink" id="fsh_t" title="_t.jpg _t_d.jpg Small 100 Thumbnail"></a>' +
              '<a href="" class="fshLink" id="fsh_s" title="_m.jpg _m_d.jpg Small 240"></a>' +
              '<a href="" class="fshLink" id="fsh_n" title="_n.jpg _n_d.jpg Small 320"></a></span>' +
          '<span id="fshMedium" class="fshGroup">M: ' +
              '<a href="" class="fshLink" id="fsh_m" title=".jpg _d.jpg Medium 500"></a>' +
              '<a href="" class="fshLink" id="fsh_z" title="_z.jpg?zz=1 _z_d.jpg Medium 640"></a>' +
              '<a href="" class="fshLink" id="fsh_c" title="_c.jpg _c_d.jpg Medium 800"></a></span>' +
          '<span id="fshLarge" class="fshGroup">L: ' +
              '<a href="" class="fshLink" id="fsh_l" title="_b.jpg _b_d.jpg Large 1024"></a>' +
              '<a href="" class="fshLink" id="fsh_h" title="_h.jpg _h_d.jpg Large 1600"></a>' +
              '<a href="" class="fshLink" id="fsh_k" title="_k.jpg _k_d.jpg Large 2048"></a></span>' +
          '<span id="fshOriginal" class="fshGroup"> <a href="" class="fshLink" id="fsh_o" title="_o.jpg _o_d.jpg Original Original Original"></a></span>' +
          '<span class="fshLoading"><span class="fshL1">Loading</span> <span class="fshL2">all</span> <span class="fshL3">sizes...</span></span>';

      // Place the HTML after the date/view/rights info.
      $("div#content div.photo-page-scrappy-view div.sub-photo-view div.sub-photo-container div.sub-photo-right-view div.sub-photo-right-row1").after(fshHTMLhead + fshHTML + fshHTMLtail + fshHTMLtemp);

      // CSS presentation for the grouping as a whole.
      wholeStyle = {"margin-top"    : "20px",
                    "margin-bottom" : "15px",
                    "color"         : "#000",
                    "font-size"     : "13px"};

      // CSS presentation for the links.
      linkStyle = {"border-width"  : "0px",
                   "padding-left"  : "2px",
                   "padding-right" : "2px",
                   "font-family"   : '"Proxima Nova","helvetica neue",helvetica,arial,sans-serif',
                   "background"    : "#fff",
                   "margin-right"  : "5px"};

      // CSS presentation for the link groupings ("fshGroup").
      groupStyle = {"white-space"  : "nowrap",
                    "background"   : "#ddd",
                    "padding-left" : "5px"};

      // Apply the CSS to the links, groups and rows.
      $("div#FlickrSizeHack").css(wholeStyle);
      $("div#FlickrSizeHack a, div#FlickrSizeHack span.fshLoading").css(linkStyle);
      $("span.fshLoading").css({"background-color" : "#000", "color" : "#fff"});
      $("div#FlickrSizeHack span.fshGroup").css(groupStyle);

      // Fix link hovering color-change to behave like the old links.
      $("div#FlickrSizeHack a").hover(function() { $(this).css({"background-color" : "#006dac", "color" : "#fff", "text-decoration" : "none"}); }, function() { $(this).css({"background-color" : "#fff", "color" : "#006dac", "text-decoration" : "none"}); });

      // Hide links and groups until we're ready to display them.
      $("div#FlickrSizeHack a, span.fshGroup, div#fshTemp").css("display", "none");

    }
    printBaseHTML();

  }


  animateLoading();




  //*//*//*//*//*//*//*//*//*//*//*//*//*//
  //            ERROR LOGGING            //
  //*//*//*//*//*//*//*//*//*//*//*//*//*//

  var errorLog = [],
      errorFlag = true;

  function printErrorMsg() {
    var EM = errorLog.join('; '),
        EL = EM;
    // Sometimes we want to print an "error" that really isn't one.
    if(errorFlag) {
      EL = "<em><span>Flickr: Show All Sizes</span> could not complete, failing with <span>" +
           errorLog.length.toString() + "</span> error(s): <strong>" + EM +
           ".</strong> Please <a href=\"http://userscripts.org/scripts/discuss/111902\">report</a> this error to the script author.</em>";
    }
    $("#FlickrSizeHack").html(EL);
    $("#FlickrSizeHack em span").css("font-weight", "bold");
    $("#FlickrSizeHack em a").css("color", "#00f");
    $("#FlickrSizeHack em").css({"background"   : "#eee",
                                 "color"        : "#000",
                                 "border-width" : "1px",
                                 "border-color" : "#cce",
                                 "border-style" : "solid",
                                 "padding"      : "1px",
                                 "font-style"   : "normal",
                                 "display"      : "block"});
    $("#FlickrSizeHack em strong").css({"font-style"  : "italic",
                                        "font-weight" : "normal"});
    errorLog = [];
    errorFlag = true;
  }





  //*//*//*//*//*//*//*//*//*//*//*//*//*//
  //       LOAD IMAGE INFO TO PAGE       //
  //*//*//*//*//*//*//*//*//*//*//*//*//*//



  if(flickrVersion === 1) {
      //
      // We're on a pre-2013 page.
      //
      //

      if(typeof unsafeWindow.YUI !== 'function') {
    
        // No API access, or something.
    
        errorLog.push("could not find the API");
    
      } else {
    
        //
        // NEW-STYLE API METHOD
        //
    
        unsafeWindow.YUI().use('event-base', 'node', function(Y){
    
          // Convert API labels to url endings (used to mark the clickable links)
          var labels = {};
          if(showSquare) {
            labels['Square'] = 'sq';
            labels['Large Square'] = 'q';
          }
          if(showSmall) {
            labels['Thumbnail'] = 't';
            labels['Small'] = 's';
            labels['Small 320'] = 'n';
          }
          if(showMedium) {
            labels['Medium'] = 'm';
            labels['Medium 640'] = 'z';
            labels['Medium 800'] = 'c';
          }
          if(showLarge) {
            labels['Large'] = 'l';
            labels['Large 1600'] = 'h';
            labels['Large 2048'] = 'k';
          }
          labels['Original'] = 'o';
    
          // Use raw info to activate the links.
          function grabInfoActivateLinks(sizesAPI) {
            // Initialize variables.
            var ph,SPAN,t,wh,url,
                rawInfo = [];
    
            // Grab the raw info.
            Y.Object.each(sizesAPI, function(o, i) {
              rawInfo.push(o);
            });
    
            if (rawInfo.length) {
              // If any info was loaded, start activating the links!
              while(rawInfo.length) {
                ph = rawInfo.pop();                           // Get a piece of info...
                if(!ph.label) {
                  // Probably a video. Just skip this.
                  continue;
                }
                if(typeof(labels[ph.label]) != 'undefined') {
                  SPAN = "#fsh_" + labels[ph.label];
                  wh = [' (',ph.width,"x",ph.height,')'].join('');
                  url = ph.url;
                  if(downloadLinks) {
                    url = url.replace(/\.([a-z]+)$/i, "_d.$1"); // Make it a download-ready link, if desired.
                  }
                  $(SPAN).attr("href", url);                    // Set the link's href
                  t = $(SPAN).attr("title").split(" ");            // Get the data stored in the link's title attribute
                  $(SPAN).text(t[3]);                              // Set the link text to the appropriate info
                  if(t[4]) {
                    $(SPAN).attr("title", t[4] + wh);                   // If there's a special tooltip, use it (plus WxH)
                  } else {
                    $(SPAN).attr("title", t[2] + " " + t[3] + wh);      // ... otherwise, the tooltip is the group + size (plus wXh)
                  }
                  $(SPAN).css("display", "inline");                // Make the link visible
                  $("#fsh"+t[2]).css("display", "inline");         // Make the link's group visible
                }
              }
    
              // Once all info has been found, delete the Temp and 'loading' blocks.
              $("#fshTemp").remove();
              $("#FlickrSizeHack span.fshLoading").remove();
            } else {
              // No info was loaded.
              errorLog.push("could not find the sizes object");
            }
    
          }
    
          function getAPIinfo(){
            counter++;
            if(counter > 100) {
              errorLog.push("API method timed out");
            } else if (typeof unsafeWindow.FLICKR == "undefined") {
              // Not loaded yet. Retry.
              window.setTimeout(getAPIinfo, 250);
            } else if (!!unsafeWindow.FLICKR['photo']) {
              // Everything loaded correctly!
              grabInfoActivateLinks(unsafeWindow.FLICKR.photo.getSizes());
            } else {
              // Bad load. Go to old method.
              errorLog.push("Could not find photo information via API");
            }
          }
    
        // Let's get this party started.
        var counter = 0;
        getAPIinfo();
    
        });
    
      }


  } else {
      //
      // We're in a 2013 or 2014 page!
      //
      //
      // Initialize variables
      var patt = new RegExp("_(.)\.[a-z]+([?]zz=1)?$"),
          res,
          count = 0,
          labels = {};
      if(showSquare) {
        labels['s'] = 'sq';
        labels['q'] = 'q';
      }
      if(showSmall) {
        labels['t'] = 't';
        labels['m'] = 's';
        labels['n'] = 'n';
      }
      if(showMedium) {
        labels['xx'] = 'm';
        labels['z'] = 'z';
        labels['c'] = 'c';
      }
      if(showLarge) {
        labels['b'] = 'l';
        labels['h'] = 'h';
        labels['k'] = 'k';
      }
      labels['o'] = 'o';


      // Use raw info to activate the links.
      function printImageSizes (pid, sizes, photo, Y) {
        // Initialize variables.
        var obj,ph,SPAN,t,u,wh,found = false;

        // If any info was loaded, start activating the links!
        for (obj in sizes) {
          found = true;
          ph = sizes[obj];
          u = ph.url;
          res = patt.exec(u);
          if(res === null) {
            res = ['xx','xx'];
          }
          if(typeof labels[res[1]] != 'undefined') {
            SPAN = "#fsh_" + labels[res[1]];
            wh = [' (',ph.width,"x",ph.height,')'].join('');
            if(downloadLinks) {
              u = u.replace(/\.([a-z]+)$/i, "_d.$1");    // Make it a download-ready link, if desired.
            }
            $(SPAN).attr("href", u);                     // Set the link's href
            t = $(SPAN).attr("title").split(" ");        // Get the data stored in the link's title attribute
            $(SPAN).text(t[3]);                          // Set the link text to the appropriate info
            if(t[4]) {
              $(SPAN).attr("title", t[4] + wh);               // If there's a special tooltip, use it (plus WxH)
            } else {
              $(SPAN).attr("title", t[2] + " " + t[3] + wh);  // ... otherwise, the tooltip is the group + size (plus WxH)
            }
            $(SPAN).css("display", "inline");            // Make the link visible
            $("#fsh"+t[2]).css("display", "inline");     // Make the link's group visible
          }
        }

        // Once all info has been found, delete the Temp and 'loading' blocks.
        $("#fshTemp").remove();
        $("#FlickrSizeHack span.fshLoading").remove();
        if (!found) {
          // No info was loaded.
          errorLog.push("could not find the sizes object");
          printErrorMsg();
        }

      }

      // Set up the YUI stuff that'll handle the page information.
      function initYUI() {

          unsafeWindow.YUI({classNamePrefix: 'pure'}).use('client-app', 'photo-page-view', 'person-models', 'photo-models',
                                 'person-relationship-models', 'photo-engagement-models', 'photo-stats-models',
                                 'photo-privacy-models', 'photo-tags-models', 'tag-models', 'photo-location-models',
                                 'photo-contexts-models', 'favorite-models', 'gallery-models', 'groups-pool-models',
                                 'set-models', 'photostream-models', function(Y){
          var photoId;
          // Figure out where we are, store photo id, maybe a path.
          function findPhotoInfo() {
            // Ugh. Revert to parsing the URL. This ought to work, even in the Beta.
            var U = window.location.toString(), //
                m = U.split('/'),               // Parse the current URL into usable chunks.
                photo = m[5];                   //
            photoId = parseInt(photo, 10);
            return photoId;
          }

          // Check if we're a video, then behave appropriately.
          function photoModelsCB(e) {
            var isvid = e.getValue('isVideo'),
                sizes = e.getValue('sizes'),
                proto = unsafeWindow.appContext.normalizedProtocol;
            if (!isvid) {
              printImageSizes(photoId, sizes, proto, Y);
            } else {
              errorLog = ['<em>&nbsp;&nbsp;Images are not avaiable on video pages.</em>'];
              errorFlag = false;
              printErrorMsg();
            }
          }

          // set photoId
          findPhotoInfo();


          // Triggered when page changes
          Y.Global.after('history:change', function(e) {
            findPhotoInfo();
            // TODO: find sidebar 'finish load' event instead of Timeout
            setTimeout(function() {
              // Reset HTML
              $("#FlickrSizeHack").remove();
              printBaseHTML();
              unsafeWindow.appContext.getModel('photo-models', photoId).then(photoModelsCB);
              // animateLoading();
            }, 1000);
          });


          // Get all sizes
          unsafeWindow.appContext.getModel('photo-models', photoId).then(photoModelsCB);


          // Very odd disappearing-sizes bug.
              // Current solution is icky:
              //   Run a timeout every few hundred milliseconds to reload the info if the DIV has disappeared.
              //   Stop running timeouts after five seconds have passed. (Ought to be enough time, right?)
          function timeoutKludge(x) {
            if($("#FlickrSizeHack").length <= 0) {
              // disappeared?
              printBaseHTML();
              unsafeWindow.appContext.getModel('photo-models', photoId).then(photoModelsCB);
//              alert("Reloaded.");
            }
            if(x >= 0) {
              setTimeout(function() { timeoutKludge(x - 250); }, 250);
//            } else {
//              alert("Stopped.");
            }
          }
          setTimeout(function() { timeoutKludge(5000); }, 250);

        });
      }

      function makeContact() {
        if (count > 80) {
          errorLog.push("API access mechanism timed out");
          printErrorMsg();
          return;
        }

        if (typeof unsafeWindow.YUI == "undefined" || typeof unsafeWindow['appContext'] == "undefined") {
          // Not ready yet.
          count++;
          window.setTimeout(makeContact, 250);
        } else {
          // Ready. Initialize!
          initYUI();
        }
      }

      // Let's get this rolling...
      makeContact();

  }

}

// Execute the main function
flickrSizeHackMain();