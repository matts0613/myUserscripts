// ==UserScript==
// @name        dev_spankbang
// @namespace2  unt0uchable
// @description Userscript for spankbang
// @author      unt0uchable
// @include     *spankbang.com*
// @include     *spankbang.com/*/video/*
// @version     1
// @grant           GM_config
// @grant           GM_xmlhttpRequest
// @grant           GM_getResourceURL
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_registerMenuCommand
// @require         http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require         https://greasyfork.org/libraries/GM_config/20131122/GM_config.js
// ==/UserScript==

/*
Other includes:
// @include     *spankbang.com*
*/


this.$ = this.jQuery = jQuery.noConflict(true);

try {

// $(function(){

    //$('similar')
    // $('a:visited').parent('.inf').parent('.video-item').css({'opacity':'0.5'});
    // $('a:visited').parentsUntil('.video-item').css({'opacity':'0.5'});
    // $('a:visited').parentsUntil('.video-item').siblings('').css({'opacity':'0.5'});
    // $('a:visited').parentsUntil('.video-item').css({'opacity':'0.5'});
    $('a:visited').parentsUntil('.video-similar').css({'opacity':'0.5'});

    // $("#MenuBar a").bind("click", function(){
    //     $(this).addClass("clicked");
    // });
// });

} catch (err) {
    alert(err.toString());
}


