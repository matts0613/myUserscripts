// ==UserScript==
// @name        Direct links out
// @name:ru     Прямые ссылки наружу
// @description Removes all "You are leaving our site" and redirection stuff from links
// @description:ru Убирает "Бла-бла-бла, Вы покидаете наш сайт" и переадресации из ссылок
// @namespace   https://github.com/nokeya
// @author      nokeya
// @update      https://github.com/nokeya/direct-links-out/raw/master/direct-links-out.user.js
// @icon        https://raw.githubusercontent.com/nokeya/direct-links-out/master/icon.png
// @version     2.19
// @grant       none
//google
// @include     *://google.*
// @include     *://www.google.*
// @include     *://encrypted.google.*
//yandex
// @match       *://yandex.ru/*
// @match       *://yandex.ua/*
// @match       *://yandex.by/*
// @match       *://yandex.kz/*
// @match       *://yandex.com.tr/*
// @match       *://yandex.com/*
// @match       *://*.yandex.ru/*
// @match       *://*.yandex.ua/*
// @match       *://*.yandex.by/*
// @match       *://*.yandex.kz/*
// @match       *://*.yandex.com.tr/*
// @match       *://*.yandex.com/*
//youtube
// @match       *://youtube.com/*
// @match       *://*.youtube.com/*
//wikimapia
// @match       *://wikimapia.org/*
//deviantart
// @match       *://deviantart.com/*
// @match       *://*.deviantart.com/*
//joyreactor
// @match       *://joyreactor.cc/*
// @match       *://*.joyreactor.cc/*
// @match       *://reactor.cc/*
// @match       *://*.reactor.cc/*
// @match       *://joyreactor.com/*
// @match       *://*.joyreactor.com/*
//vk
// @match       *://vk.com/*
// @match       *://*.vk.com/*
//ok
// @match       *://ok.ru/*
// @match       *://*.ok.ru/*
//steam
// @match       *://steamcommunity.com/*
// @match       *://*.steamcommunity.com/*
//fb
// @match       *://facebook.com/*
// @match       *://*.facebook.com/*
//twitter
// @match       *://twitter.com/*
// @match       *://*.twitter.com/*
//4pda
// @match       *://4pda.ru/*
// @match       *://*.4pda.ru/*
//kickass
// @match       *://kat.cr/*
// @match       *://kickassto.co/*
// @match       *://katproxy.is/*
// @match       *://thekat.tv/*
// @match       *://*.kat.cr/*
// @match       *://*.kickassto.co/*
// @match       *://*.katproxy.is/*
// @match       *://*.thekat.tv/*
//AMO
// @match       *://addons.mozilla.org/*
//pixiv
// @match       *://pixiv.net/*
// @match       *://*.pixiv.net/*
//tumblr
// @match       *://tumblr.com/*
// @match       *://*.tumblr.com/*
//danieldefo
// @match       *://danieldefo.ru/*
// @match       *://*.danieldefo.ru/*
//yaplakal
// @match       *://yaplakal.com/*
// @match       *://*.yaplakal.com/*
//soundcloud
// @match       *://soundcloud.com/*
// @match       *://*.soundcloud.com/*
//upwork
// @match       *://upwork.com/*
// @match       *://*.upwork.com/*
//picarto
// @match       *://picarto.tv/*
// @match       *://*.picarto.tv/*
//taker
// @match       *://taker.im/*
// @match       *://*.taker.im/*
//forumavia
// @match       *://*.forumavia.ru/*
//slack
// @match       *://*.slack.com/*
//instagram
// @match       *://instagram.com/*
// @match       *://*.instagram.com/*
// ==/UserScript==
!function(){
// anchors and functions
var anchor,after,rwLink=function(){},rwAll=function(){},retTrue=function(){return!0};//dummy function to always return true
// simple rewrite link -  based on anchors
function rwSimple(link){if(anchor){var ndx=link.href.indexOf(anchor);if(-1!=ndx){var newlink=link.href.substring(ndx+anchor.length);after&&-1!=(ndx=newlink.indexOf(after))&&(newlink=newlink.substring(0,ndx)),link.href=unescape(newlink)}}}function rwaSimple(){for(var links=document.getElementsByTagName('a'),i=0;i<links.length;++i)rwLink(links[i])}
// vk
function rwVK(link){if('page_media_link_thumb'===link.className){var parent=link.parentNode;link.href=parent.getAttribute("href"),parent.removeAttribute('href'),parent.removeAttribute('onclick'),link.removeAttribute('onclick')}var ndx=link.href.indexOf(anchor);if(-1!=ndx){for(var newlink=link.href.substring(ndx+anchor.length),afterArr=['&post=','&el=snippet','&cc_key='],i=0;i<afterArr.length;++i)-1!=(ndx=newlink.indexOf(afterArr[i]))&&(newlink=newlink.substring(0,ndx));link.href=unescape(newlink)}}
// twitter
function rwTwitter(link){link.hasAttribute('data-expanded-url')&&(link.href=link.getAttribute('data-expanded-url'),link.removeAttribute('data-expanded-url'))}function rwaTwitter(){for(var links=document.getElementsByClassName('twitter-timeline-link'),i=0;i<links.length;++i)rwLink(links[i])}
// kickass
function rwKickass(link){var ndx=link.href.indexOf(anchor);-1!=ndx&&(link.href=window.atob(unescape(link.href.substring(ndx+anchor.length,link.href.length-1))),link.className='')}
// youtube
function rwYoutube(link){/redirect/i.test(link.className)&&link.setAttribute('data-redirect-href-updated','true'),rwSimple(link)}
// facebook
function rwFacebook(link){/referrer_log/i.test(link.onclick)&&(link.removeAttribute('onclick'),link.removeAttribute('onmouseover')),rwSimple(link)}
// google
function rwGoogle(link){
// images
if(
// replace global rwt script
window.rwt&&window.rwt!=retTrue&&(delete window.rwt,Object.defineProperty(window,'rwt',{value:retTrue,writable:!1})),
// main search
link.hasAttribute('onmousedown')&&link.removeAttribute('onmousedown'),link.hasAttribute('jsaction')){var tmp=link.getAttribute('jsaction');tmp&&link.setAttribute('jsaction',tmp.replace(/(mousedown:irc.rl|keydown:irc.rlk)/g,''))}}
// yandex
function rwYandex(link){
// main search
link.hasAttribute('onmousedown')&&link.removeAttribute('onmousedown'),
// images
anchor='&img_url=',after='&pos=',rwSimple(link)}
//mozilla addons store
function rwAMO(link){if(/outgoing.prod.mozaws.net/i.test(link.href)){var tmp=link.href;link.href="#",
// we have to fight mozilla's replacing of direct redirect string with jquery events
setTimeout((function(){link.href=unescape(tmp.replace(/(http|https):\/\/outgoing.prod.mozaws.net\/v1\/[0-9a-zA-Z]+\//i,''))}),100)}}
// daniueldefo
function rwDanielDefo(link){link.hasAttribute('data-proxy-href')&&link.removeAttribute('data-proxy-href')}
// slack
function rwSlack(link){link.removeAttribute('onclick'),link.removeAttribute('onmouseover')}
// determine anchors, functions and listeners
!function(){rwLink=rwSimple,rwAll=rwaSimple;var loc=window.location.hostname;/google/i.test(loc)?rwLink=rwGoogle:/youtube/i.test(loc)?(anchor='redirect?q=',after='&redir_token=',rwLink=rwYoutube):/facebook/i.test(loc)?(anchor='u=',after='&h=',rwLink=rwFacebook):/instagram/i.test(loc)?(anchor='u=',after='&e='):/twitter/i.test(loc)?(rwLink=rwTwitter,rwAll=rwaTwitter):/yandex/i.test(loc)?rwLink=rwYandex:/vk/i.test(loc)?(anchor='to=',rwLink=rwVK):/ok/i.test(loc)?(anchor='st.link=',after='&st.name='):/pixiv/i.test(loc)?anchor='jump.php?':/tumblr/i.test(loc)?(anchor="redirect?z=",after="&t="):/deviantart/i.test(loc)?anchor='outgoing?':/(steam|reactor)/i.test(loc)?anchor='url=':/(kat|kickass)/i.test(loc)?(anchor='confirm/url/',rwLink=rwKickass):/soundcloud/i.test(loc)?anchor="exit.sc/?url=":/upwork/i.test(loc)?anchor='leaving-odesk?ref=':/4pda/i.test(loc)?(anchor='go/?u=',after='&e='):/mozilla/i.test(loc)?rwLink=rwAMO:/danieldefo/i.test(loc)?rwLink=rwDanielDefo:/yaplakal/i.test(loc)?anchor="go/?":/wikimapia.org/i.test(loc)?anchor='external_link?url=':/forumavia.ru/i.test(loc)?anchor='/e/?l=':/picarto/i.test(loc)?(anchor="referrer?go=",after="&ref="):/taker/i.test(loc)?anchor="phpBB2/goto/":/slack/i.test(loc)&&(rwLink=rwSlack),document.addEventListener('DOMNodeInserted',(function(event){if(event&&event.target&&event.target instanceof HTMLElement){var node=event.target;node instanceof HTMLAnchorElement&&rwLink(node);for(var links=node.getElementsByTagName('a'),i=0;i<links.length;++i)rwLink(links[i])}}),!1)}(),rwAll()}();