// ==UserScript==
// @name Dark Tiktok | CSS
// @description Dark css for tiktok desktop version.
// @version 0.2.6
// @namespace https://www.tiktok.com/*
// @grant GM_addStyle
// @run-at document-start
// @include http://tiktok.com/*
// @include https://tiktok.com/*
// @include http://*.tiktok.com/*
// @include https://*.tiktok.com/*
// ==/UserScript==

(function() {
let css = `

/*broken feature toggle below*/

/*
@preprocessor   stylus

@var checkbox hideAccount "Hide suggested Accounts" 0
*/
/*.tiktok-w7c21z-HeaderContainer { height:0px; } */
html{background:black}
.engagement-text-v23 {
    color: #808080;
}
/* Explore page | Tiktok Logo */
.tiktok-hvdb7f-LinkLogo { display:none; }
/* Explore page | Header */
.tiktok-1vuji9j-HeaderRightContainer { 
    position:absolute;
    right:30px; 
    top:20px;
}
.tiktok-1dvfans-HeaderCenterContainer { height:0px; }
.tiktok-1g3oxgd-HeaderWrapper{ height: 0px; }
.tiktok-w7c21z-HeaderContainer{ height: 0px; }
/* Explore page | Search */
[class~=search-input]{
    right:420px;
    top:110px;
}
[class~=sug-container]{
    right:420px;
    top:150px;
}
[class~=sug-container]{
background:black!important;
}
input {color: #808080!important;}

[class~=search-input]:hover{
    border:solid 1px;
    border-color:#8080802e;
    transition: ease-in-out 300ms
}
/* Login/Avatar */
[class~=menu-right]{
    position:absolute;
    top:125px;
    right:-370px;
    background-color:#fff0;
}
[class~=upload-wrapper]{
    filter:invert(.3);
}
[class~=message-icon]{
    filter:invert(.3);
}
[class~=header-inbox]{
    filter:invert(.3);
}
[class~=search-container]{
    right:420px!important;
    background:red;
}

/* Explore page | sidebar */
.tiktok-1qn2tr4-ScrollContainer-StyledScroll {
top:-26px;
}
/* Explore page | recommendations */
.tiktok-jidueg-UserContainer{display:none;}
/* Explore page | Legal info */
.tiktok-1b8f3hm-FooterContainer{display:none;}
/* Explore page | Main Video Section */
.tiktok-3bidcs-MainContainer {padding: 0px;}
.tiktok-p62ew4-BodyContainer {margin-top: 0px;}

/* Explore page | text colors */
.tiktok-10100fy-ActionItemText {
    color: #808080!important;
}


[class~=content-container]{
    background-color: #000!important;
}
[class~=comment-post-outside-container]{
    background-color: #000!important;
}
[class~=comment-text]{
    color: #acacac!important;
}
[class~=user-username], [class~=user-nickname], [class~=video-meta-title], [class~=action-container], [class~=username], [class~=comment-time], [class~=reply], [class~=link-container], h2 > a{
    color: #808080!important;
}
[class~=main-body], [class~=side-bar-container], [class~=scroll-container]{
    background-color: #000!important;
}
#app > div.tiktok-p62ew4-BodyContainer.emtmpql0 > div.tiktok-1e13ecs-DivSideNavContainer.emtmpql1 > div > div.tiktok-1onbh2l-SideNavContainer.eh217d91 > div{
background-color:#000;
}

#app > div.tiktok-p62ew4-BodyContainer.emtmpql0 > div.tiktok-1e13ecs-DivSideNavContainer.emtmpql1 > div > div.tiktok-1onbh2l-SideNavContainer.eh217d91 > div > div.tiktok-1vsa65b-Wrapper.eh217d92 > div.tiktok-1jua48b-DivDiscoverContainer.e2h82qx2 {
Display:none;
}
/*blugh*/
.main-body.middle{
    position:absolute;
    top:-70px!important;
}
 [class~=side-bar-wrapper]{
    position:absolute;
    top:-15px!important;
}
/* misc 1*/
h1, h2, h3, h4, h5, h6, p, ul {
    background-image: none!important;
    background-color: #000!important;
    color: #808080!important;
    text-shadow: none!important;
}
/*HEADER*/
[class~=logo-link]{display:none!important;}
[class~=search-container]{
    position:absolute;
    top:0px;
    left:-670px
}
[class~=header-container]{
top:-60px!important;
}
[class~=header-container], [class~=desktop-container]{
    background-color: #000!important;
}
[class~=header-container], [class~=HeaderContainer]{
    height:0px;
    border-bottom: 1px solid #8080802e!important
}
[class~=e17na9cg0]{
    background-color: #000!important;
}
[class~=header-content]{
    position:absolute;
    top:-40px;}

[class~=profile-card-container]{
    background-color:black!important;
    color:#808080;
    border:solid 1px;
    border-color:#8080804f!important;}
[class~=text]{
    color: #808080!important;
}
[class~=search-button-container]{
filter:invert(1);
}
/* remove suggested sounds */
[class~=hidden-bottom-line], [class~=discover-list-container], [class~=bottom-wrapper]{
    display: none!important;
}

/* remove App advert in bottom right corner */
[class~=app-promotion] {
display:none!important;
}
[class~=to-top]{
    display:none!important;
}
a {
    color: #a2a2a2!important;
    transition: .4s ease-in-out;
}
a:hover {
    color: #812100!important;
}
span {
    color: #808080!important;
}
[class~=author-uniqueId]{
    transition: .4s ease-in-out;
}
[class~=author-uniqueId]:hover{
    color: #812100!important;
}
[class~=username]{
    transition: .4s ease-in-out;
}
[class~=username]:hover{
    color: #812100!important;
}
h4{
    transition: .4s ease-in-out;
}
h4:hover{
    color: #812100!important;
}
[class~=comment-post-outer-wrapper]{
    border-radius:25px;
}
[class~=comment-input-outside-container]{
    filter:invert(.065);
}
[class~=comment-post-outside-container]{
    background:#171717b5!important;
    margin: 0px 0px!important;
    padding:0px 0px!important;
    border-top: none!important;
}
[class~=post-container]{
    color:#808080!important;
    width:40px;
}
[class~=user-username]{
    transition: .4s ease-in-out;
}
[class~=user-username]:hover{
    color: #812100!important;
}
[class~=comment-container]{
    background: #000!important;
}
/* comment like icons */
img[src*="like"] {
    filter: saturate(5);
}
img[src*="unlike"] {
filter: brightness(5) saturate(0);
}
[class~=like-container] {
    background: transparent!important;
}
.mentionSuggestions {
    background: rgb(0, 0, 0);
    border:solid 1px;
    border-color:#8080804f!important;
}
[class~=tt-video-meta-caption]{
    color:#808080!important;
}
[class~=user-item-container]{
    border: 1px solid #66666630!important;
    border-radius: 12px;
    background: #000!important;
    -webkit-transition: all 200ms;
    transition: all 200ms;
}
[class~=user-item-container]:hover{
    border: 1px solid transparent!important;
    border-radius: 12px;
    background: #2222227a!important;
    -webkit-transition: all 200ms;
    transition: all 200ms;
}
[class~=item-text]{
    color:#acacac!important;
    transition: .4s ease-in-out;
}
[class~=item-text]:hover{
    color:#812100!important;
}
[class~=user-list-header]{
    Display:none!important;
}
[class~=play-line] > div:nth-child(2), [class~=play-line] > div:nth-child(1){
    color:#acacac9c;
}
[class~=like-icon]{
    filter:invert(.5);
}  
`;
if (typeof GM_addStyle !== "undefined") {
  GM_addStyle(css);
} else {
  let styleNode = document.createElement("style");
  styleNode.appendChild(document.createTextNode(css));
  (document.querySelector("head") || document.documentElement).appendChild(styleNode);
}
})();
