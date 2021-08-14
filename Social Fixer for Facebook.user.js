// ==UserScript==
//
//  /////////////////////////////////////
//  //                                 //
//  //  IF YOU ARE SEEING THIS, your   //
//  //  Userscript manager ('monkey')  //
//  //  is not working correctly.      //
//  //                                 //
//  //  See socialfixer.com/ujs-help   //
//  //                                 //
//  /////////////////////////////////////
//
// @name           Social Fixer for Facebook
// @namespace      http://userscripts.org/users/864169999
// @include        /^https?:\/\/facebook\.com\//
// @include        /^https?:\/\/[^\/]*\.facebook\.com\//
// @exclude        /^https?:\/\/[^\/]*(channel|static)[^\/]*facebook\.com\//
// @exclude        /^https?:\/\/[^\/]*facebook\.com\/.*(ai.php|morestories.php|generic.php|xti.php|plugins|connect|ajax|sound_iframe|l.php\?u)/
// @exclude        /^https?:\/\/[^\/]*\.facebook\.com\/help/
// @exclude        /^https?:\/\/[^\/]*\.facebook\.com\/support/
// @exclude        /^https?:\/\/[^\/]*\.facebook\.com\/saved/
// @connect        mbasic.facebook.com
// @connect        socialfixer.com
// @connect        matt-kruse.github.io
// @run-at         document-start
// @version        27.2.0
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_xmlhttpRequest
// @grant          GM.getValue
// @grant          GM.setValue
// ==/UserScript==
/*
Social Fixer
(c) 2009-2021 Matt Kruse
http://SocialFixer.com/
*/

/*
 * Decide if we're supposed to be running at all.
 */
var prevent_running = false;

if (window.top != window.self ||                                      // We don't run in frames
    !location || /[?&]no_sfx/.test(location.search) ||                // URL keyword to disable
    /\/plugins\/|\/(l|ai|morestories)\.php$/.test(location.pathname)  // Avoid some FB features
   ) prevent_running = true;


var define, exports; // Guard against global scope leak in ViolentMonkey extension

// These two might as well be defined whether or not GM exists, since they don't use it
if (typeof GM_xmlhttpRequest === 'undefined') {
    var GM_xmlhttpRequest = function(details) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                details.onload({
                    responseText: xhr.responseText,
                    responseHeaders: xhr.getAllResponseHeaders(),
                    status: xhr.status,
                });
            }
        };
        xhr.open(details.method, details.url, true);
        xhr.send();
    };
}

if (typeof GM_addStyle === 'undefined') {
    var GM_addStyle_count = 1;
    var GM_addStyle = (css) => X.css(css, `GM_addStyle_${GM_addStyle_count++}`);
}

var use_Promise_getValue = (typeof GM !== 'undefined' && typeof GM_getValue === 'undefined');
var use_Promise_setValue = (typeof GM !== 'undefined' && typeof GM_setValue === 'undefined');

// Extension API
var Extension = (function() {
    var api = {
        "storage": {
            "get":
                function(keys, defaultValue, callback, prefix) {
                    // Keys can be either a single keys or an array of keys
                    if (typeof keys=="string") {
                        use_Promise_getValue
                            ? GM.getValue(prefix+keys,defaultValue)
                              .then(callback)
                            : callback(GM_getValue(prefix+keys,defaultValue));
                    }
                    else if (typeof keys=="object" && keys.length) {
                        var values = {};
                        var awaiting = keys.length;
                        for (let i=0; i<keys.length; i++) {
                            var default_value;
                            if (typeof defaultValue=="object" && defaultValue.length && i<defaultValue.length) {
                                default_value = defaultValue[i];
                            }
                            use_Promise_getValue
                                ? GM.getValue(prefix+keys[i],default_value)
                                  .then((value)=>(values[keys[i]]=value))
                                  .finally(()=>--awaiting||callback(values))
                                : (values[keys[i]] = GM_getValue(prefix+keys[i],default_value));

                        }
                        use_Promise_getValue || callback(values);
                    }
                    return;
                }
            ,
            "set":
                function(key,val,callback, prefix) {
                    typeof callback === 'function' || (callback = (() => undefined));
                    setTimeout(function() {
                        use_Promise_setValue
                            ? GM.setValue(prefix+key,val)
                              .then((ret)=>callback(key,val,ret))
                              .catch((e)=>callback(key,val,e))
                            : callback(key,val,GM_setValue(prefix+key,val));
                    },0);
                }
        },
        "ajax":function(urlOrObject,callback) {
            var details;
            var internalCallback = function(response) {
                var headers={};
                response.responseHeaders.split(/\r?\n/).forEach(function(header) {
                    var val = header.split(/\s*:\s*/,2);
                    headers[ val[0].toLowerCase() ] = val[1];
                });
                callback( response.responseText,response.status,headers );
            };
            if (typeof urlOrObject=="string") {
                details = {"method":"GET","url":urlOrObject,"onload":internalCallback };
            }
            else if (urlOrObject.url) {
                details = urlOrObject;
                details.onload = internalCallback;
            }
            else {
                alert("Invalid parameter passed to Extension.ajax");
                callback(null);
            }
            GM_xmlhttpRequest(details);
        }
    };
    // Backwards compat
    api.prefs = api.storage;
    return api;
})();

prevent_running || setTimeout(function() { // Fix for FF55.0b1
    GM_addStyle(`
/* Make room for the SFX Menu badge */
html.sfx_2020_layout *[role="banner"] > *:last-child {
  right: 50px !important;
}

.sfx_anonymous {
  border-radius: 3px;
  padding-left: 2px;
  padding-right: 2px;
}
.sfx_anonymous_1 {
  background-color: #E6A4B5;
  color: black !important;
}
.sfx_anonymous_2 {
  background-color: #EDC99A;
  color: black !important;
}
.sfx_anonymous_3 {
  background-color: #F3F190;
  color: black !important;
}
.sfx_anonymous_4 {
  background-color: #BBDB98;
  color: black !important;
}
.sfx_anonymous_5 {
  background-color: #EBCD3E;
  color: black !important;
}
.sfx_anonymous_6 {
  background-color: #6F308B;
  color: white !important;
}
.sfx_anonymous_7 {
  background-color: #DB6A29;
  color: white !important;
}
.sfx_anonymous_8 {
  background-color: #97CEE6;
  color: black !important;
}
.sfx_anonymous_9 {
  background-color: #B92036;
  color: white !important;
}
.sfx_anonymous_10 {
  background-color: #C2BC82;
  color: black !important;
}
.sfx_anonymous_11 {
  background-color: #7F8081;
  color: white !important;
}
.sfx_anonymous_12 {
  background-color: #62A647;
  color: white !important;
}
.sfx_anonymous_13 {
  background-color: #D386B2;
  color: black !important;
}
.sfx_anonymous_14 {
  background-color: #4578B3;
  color: white !important;
}
.sfx_anonymous_15 {
  background-color: #DC8465;
  color: black !important;
}
.sfx_anonymous_16 {
  background-color: #483896;
  color: white !important;
}
.sfx_anonymous_17 {
  background-color: #E1A131;
  color: black !important;
}
.sfx_anonymous_18 {
  background-color: #91288D;
  color: white !important;
}
.sfx_anonymous_19 {
  background-color: #E9E857;
  color: black !important;
}
.sfx_anonymous_20 {
  background-color: #7D1716;
  color: white !important;
}
.sfx_anonymous_21 {
  background-color: #93AD3C;
  color: black !important;
}
.sfx_anonymous_22 {
  background-color: #6E3515;
  color: white !important;
}
.sfx_anonymous_23 {
  background-color: #D12D27;
  color: white !important;
}
.sfx_anonymous_24 {
  background-color: #2C3617;
  color: white !important;
}
.sfx_anonymous_25 {
  background-color: #000000;
  color: white !important;
}

#sfx_feature_tour {
  position: absolute;
  z-index: 999999;
  width: 500px;
  min-height: 300px;
  max-height: 90vh;
  top: 5vh;
  left: 5vw;
  background-color: white;
  border: 2px solid black;
  border-radius: 10px;
}

html.sfx_fix_timestamps abbr.livetimestamp:not(.sfx_no_fix_timestamp):before {
  content: attr(title) attr(data-tooltip-content) " (";
}
html.sfx_fix_timestamps abbr.livetimestamp:not(.sfx_no_fix_timestamp):after {
  content: ")";
}

html.sfx_notification_popup {
  /* Gray out "likes" on comments
  ._33c[data-gt*="notif_type\\":\\"like\\""][data-gt*="subtype\\":\\"comment-"] {
    opacity:.4;
  }
  */
}
html.sfx_notification_popup #pagelet_bluebar,
html.sfx_notification_popup #pagelet_dock,
html.sfx_notification_popup #pagelet_ego_pane,
html.sfx_notification_popup #pagelet_sidebar,
html.sfx_notification_popup #pageFooter,
html.sfx_notification_popup #sfx_badge,
html.sfx_notification_popup .UIStandardFrame_SidebarAds {
  display: none !important;
}
html.sfx_notification_popup #globalContainer,
html.sfx_notification_popup .UIStandardFrame_Container,
html.sfx_notification_popup .UIStandardFrame_Content {
  width: 98% !important;
}
html.sfx_notification_popup .uiHeader {
  margin: 0 !important;
  padding-bottom: 0 !important;
}
html.sfx_notification_popup .UIStandardFrame_Container {
  padding-top: 0 !important;
}
html.sfx_notification_popup .UIStandardFrame_Content > .fcg {
  display: none !important;
}
html.sfx_notification_popup .jewelItemNew ._33e {
  border-left: 3px solid #4080FF !important;
}
html.sfx_notification_popup li.sfx_notification_selected {
  border-left: 3px solid red;
}
html.sfx_notification_popup #sfx_notification_popup_header {
  border: 1px solid #aaa;
  padding: 5px;
  margin: 2px;
}
html.sfx_notification_popup #sfx_notification_popup_header_actions > * {
  display: inline;
  margin-right: 10px;
}
html.sfx_notification_popup .sfx_sub_notification {
  padding-left: 50px;
}

html.sfx_stealth_mode .UFILikeLink,
html.sfx_stealth_mode .FriendRequestAdd,
html.sfx_stealth_mode .addFriendText,
html.sfx_stealth_mode .UFIAddComment,
html.sfx_stealth_mode .UFIReplyLink,
html.sfx_stealth_mode .PageLikeButton,
html.sfx_stealth_mode .share_action_link,
html.sfx_stealth_mode .comment_link,
html.sfx_stealth_mode a[data-tooltip-content^="Like"],
html.sfx_stealth_mode .commentable_item ._18vi a,
html.sfx_stealth_mode [data-testid^='UFI2Composer'],
html.sfx_stealth_mode [data-testid^='UFI2ReactionLink'],
html.sfx_stealth_mode [data-testid^='UFI2Comment/reply-link'] {
  display: none !important;
}

.sfx_bubble_note {
  position: fixed;
  min-height: 50px;
  min-width: 150px;
  max-height: 90vh;
  max-width: 50vw;
  margin: 10px;
  font-family: arial;
  background-color: #FFFFE5;
  color: black;
  border: 1px solid #3F5C71;
  font-size: 12px;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 0 5px #888888;
  z-index: 99999 !important;
  cursor: move;
  overflow: auto;
}
.sfx_bubble_note .sfx_bubble_note_title {
  font-size: 14px;
  font-weight: bold;
  margin: 10px 0;
}
.sfx_bubble_note .sfx_bubble_note_subtitle {
  font-size: 12px;
  font-weight: bold;
  margin: 5px 0;
}
.sfx_bubble_note .sfx_bubble_note_data {
  white-space: pre;
  font-family: monospace;
  font-size: 11px;
  background-color: #ddd;
  overflow: auto;
  max-height: 50vh;
}
.sfx_bubble_note_top_right {
  right: 0;
  top: 0;
}
.sfx_bubble_note_bottom_right {
  right: 0;
  bottom: 0;
}
.sfx_bubble_note_top_left {
  left: 0;
  top: 0;
}
.sfx_bubble_note_bottom_left {
  left: 0;
  bottom: 0;
}

/* Comment Button */
.sfx_comment_button {
  float: right;
  padding: 4px 8px;
  margin: 4px;
  background-color: #5A74A8 !important;
  border: 1px solid #1A356E;
  color: white;
  font-weight: bold;
  font-size: 12px !important;
  line-height: 12px !important;
  border-radius: 3px;
}
.sfx_comment_button_msg {
  float: right;
  display: inline-block;
  padding: 5px 4px;
  color: #9197A3;
}


#sfx_control_panel {
  position: fixed;
  min-width: 150px;
  max-width: 250px;
  border-radius: 3px;
  background-color: white;
  color: #404040;
  z-index: 201;
  opacity: .6;
  font-size: 12px;
  box-shadow: 0 0 5px rgba(105, 118, 136, 0.2), 0 5px 5px rgba(132, 143, 160, 0.2), 0 10px 10px rgba(132, 143, 160, 0.2), 0 20px 20px rgba(132, 143, 160, 0.2), 0 0 5px rgba(105, 118, 136, 0.3);
}
#sfx_control_panel:hover {
  opacity: 1;
}
#sfx_control_panel .sfx_cp_header {
  font-weight: bold;
  cursor: move;
  margin-bottom: 2px;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  vertical-align: top;
  padding: 5px;
  border-radius: 3px 3px 0 0;
  text-align: left;
  border: 0;
  color: #fff;
  background: linear-gradient(to right, #2C4372, #3B5998);
}
#sfx_control_panel .sfx_cp_section_label {
  background-color: #eee;
  font-size: 10px;
  font-family: arial,sans serif;
  font-weight: bold;
  padding: 3px;
}
#sfx_control_panel .sfx_cp_section_content {
  margin-bottom: 5px;
}

*[sfx_update_count]:before {
  display: block;
  border: 2px solid orange;
  border-radius: 5px;
  padding: 5px;
  background-color: white;
  content: "Updates: [" attr(sfx_update_count) "] " attr(sfx_update_tracking);
}

.sfx_insert_step_1 {
  margin: 2px;
  outline: 2px solid red;
}
.sfx_insert_step_2 {
  margin: 2px;
  outline: 2px solid green;
}
.sfx_insert_step_3 {
  margin: 2px;
  outline: 2px solid blue;
}
.sfx_insert_step_4 {
  margin: 2px;
  outline: 2px solid orange;
}
.sfx_insert_step_5 {
  margin: 2px;
  outline: 2px solid purple;
}
.sfx_insert_step_6 {
  margin: 2px;
  outline: 2px solid lime;
}
.sfx_insert_step_7 {
  margin: 2px;
  outline: 2px solid cyan;
}

.sfx_debug_tab {
  opacity: .5;
}
.sfx_debug_tab:hover {
  opacity: 1;
}

#sfx_debugger {
  position: fixed;
  bottom: 0;
  right: 0;
  border: 1px solid black;
  background-color: white;
  color: black;
  z-index: 99999;
}
#sfx_debugger_results {
  width: 40vw;
  height: 75vh;
  overflow: auto;
  clear: both;
  font-family: monospace !important;
}
#sfx_debugger_controls {
  border-bottom: 1px solid #333;
}
#sfx_debugger_controls > div {
  margin: 2px;
}
#sfx_debugger_url {
  margin-left: 10px;
  max-width: 400px;
  text-overflow: ellipsis;
  display: inline-block;
  white-space: nowrap;
  text-wrap: none;
}
.sfx_debugger_result {
  border: 1px solid #666;
  margin: 8px;
}
.sfx_debugger_subresult {
  border: 1px solid #ccc;
  margin: 3px;
}
.sfx_debugger_subresult:hover {
  background-color: #F2F4FF;
  cursor: pointer;
}
.sfx_debugger_button {
  float: right;
  height: 16px;
  width: 16px;
  cursor: pointer;
  text-align: center;
  padding: 3px;
  margin: 3px;
  font-size: 16px;
  font-weight: bold;
}
.sfx_debugger_button:hover {
  outline: 1px solid #ccc;
}
.sfx_debugger_warning {
  font-weight: bold;
  color: red;
}
.sfx_debugger_text_header {
  color: #666;
  float: right;
  margin: 1px;
}
.sfx_debugger_action {
  cursor: pointer;
  margin-left: 10px;
  display: inline-block;
}
.sfx_debugger_action:hover {
  text-decoration: underline;
}

.sfx_edit_buf_button {
  padding: 4px;
  outline: 2px solid black;
}
.sfx_edit_buf_button .selected {
  outline: 2px solid red;
}
.sfx_edit_buf_toggle {
  font-weight: normal;
  color: black;
}
.sfx_edit_buf_post_show {
  display: block !important;
  box-shadow: 5px 5px 5px blue, -5px -5px 5px red;
  opacity: 1;
}
.sfx_edit_buf_post_show > ._4-u2 {
  opacity: 1 !important;
}

/*ELEMENTS*/
/* REUSABLE STYLES */
.sfx_info {
  font-size: 12px;
}
input.sfx_input {
  padding-left: 0.2em;
  border: 1px solid #bec4cd;
  border-radius: 2px;
}
/* BUTTONS */
.sfx_button {
  background-color: #4267B2;
  border: 1px solid #4267B2;
  color: white;
  font-size: 12px;
  line-height: 22px;
  cursor: pointer;
  border-radius: 3px;
  padding: 2px 8px;
  font-weight: bold;
}
.sfx_button:hover {
  background-color: #365899;
}
.sfx_button.secondary {
  background-color: #e7e9ef;
  color: #000000;
  border-color: #d7dce5;
}
.sfx_button.secondary:hover {
  background-color: #d0d5e0;
}
.sfx_button.light {
  color: black;
  padding: 5px 8px;
  background-color: #f6f7f9;
  border: 1px solid #ced0d4;
  border-radius: 2px;
}
/* DIALOG BOXES */
.sfx_dialog_title_bar {
  padding: 10px 12px;
  font-weight: bold;
  line-height: 28px;
  min-height: 28px;
  margin: -10px -10px 0;
  border: 0;
  margin-bottom: 10px;
  color: #fff;
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  vertical-align: top;
  background: linear-gradient(to right, #2C4372, #3B5998 80%);
}
.sfx_dialog_title_bar .sfx_button {
  letter-spacing: normal !important;
  background-color: #253860;
  border: 0;
}
.sfx_dialog_title_bar .sfx_button.secondary {
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 0;
  font-weight: normal;
}
.sfx_dialog {
  z-index: 99999;
  overflow: hidden;
  position: fixed;
  top: 48px;
  left: 20px;
  width: 90vw;
  min-width: 500px;
  max-width: 1000px;
  max-height: 90vh;
  font-family: helvetica, arial, sans-serif;
  transition: height .5s linear;
  color: #404040;
  border: 0;
  border-radius: 3px;
  padding: 10px;
  background-color: #E9EBEE;
  box-shadow: 0 0 5px rgba(105, 118, 136, 0.2), 0 5px 5px rgba(132, 143, 160, 0.2), 0 10px 10px rgba(132, 143, 160, 0.2), 0 20px 20px rgba(132, 143, 160, 0.2);
}
#sfx_options_dialog_sections {
  flex: none;
  width: 125px;
}
#sfx_options_dialog_content {
  padding: 10px;
}
#sfx_options_dialog_body {
  background-color: white;
}
.sfx_options_dialog_section {
  padding: 6px 5px 6px 10px;
  background-color: #F6F7F9;
  font-weight: bold;
  margin: 2px;
  cursor: pointer;
}
.sfx_options_dialog_section.selected {
  background-color: #4267B2;
  color: white;
  cursor: auto;
}
.sfx_jewelCount {
  right: auto !important;
  left: 1px !important;
  top: 1px !important;
  padding: 0 !important;
}
.sfx_jewelCount > * {
  border: 1px solid white;
  min-height: 15px;
  padding: 1px 2px !important;
  font-size: 10px !important;
  line-height: 13px !important;
  color: white !important;
  background-color: #253860 /*#80aaff*/ /*2c4166*/ !important;
  border-radius: 3px !important;
}
.sfx_menu_jewelCount {
  display: inline-block;
  padding: 0 !important;
  border: 1px solid white;
  min-height: 15px;
  margin-right: 4px;
}
.sfx_menu_jewelCount > * {
  padding: 2px 6px !important;
  color: white !important;
  background-color: #253860 /*#80aaff*/ /*2c4166*/ !important;
  border-radius: 3px !important;
  font-weight: bold;
}
/*END ELEMENTS*/

.sfx_data_table {
  border-collapse: collapse;
}
.sfx_data_table th {
  font-weight: bold;
  background-color: #ccc;
  padding: 5px;
  border: 1px solid #666;
}
.sfx_data_table th.sortable {
  cursor: pointer;
}
.sfx_data_table th.sortable:hover {
  text-decoration: underline;
}
.sfx_data_table td {
  padding: 1px 5px;
  border: 1px solid #ddd;
}

html:not(.sfx_hide_show_all) .sfx_hide_hidden {
  display: none !important;
}
.sfx_hide_frame {
  position: absolute;
  z-index: 99999;
  opacity: .2;
  background-color: lime;
  outline: 2px solid lime;
  margin: 0 !important;
  font-weight: bold;
  text-align: center;
  color: transparent;
}
.sfx_hide_frame_hidden {
  color: white;
  background-color: red;
  outline: 2px solid red;
}
.sfx_hide_frame_hidden:hover {
  outline: 2px dashed green;
}
.sfx_hide_frame:hover {
  outline: 2px dashed red;
  background-color: goldenrod;
  color: black;
  opacity: .5;
  cursor: pointer;
}
.sfx_hide_bubble {
  max-width: 400px;
}
.sfx_hide_bubble > div {
  margin: 10px 0;
}
.sfx_hide_bubble .sfx_button {
  margin-left: auto;
  margin-right: auto;
}
.sfx_hide_bubble label {
  font-weight: normal;
  color: black;
}

#sfx_log_viewer {
  position: fixed;
  bottom: 0;
  right: 0;
  border: 1px solid black;
  background-color: white;
  color: black;
  z-index: 99999;
}
#sfx_log_viewer_entries {
  width: 40vw;
  height: 50vh;
  overflow: auto;
  white-space: pre;
  clear: both;
}
#sfx_log_controls {
  border-bottom: 1px solid #333;
}
.sfx_log_button {
  float: right;
  height: 16px;
  width: 16px;
  cursor: pointer;
  text-align: center;
  padding: 3px;
  margin: 3px;
  font-size: 16px;
  font-weight: bold;
}
.sfx_log_button:hover {
  outline: 1px solid #ccc;
}
.sfx_log_entry {
  font-family: monospace !important;
}

/* Note: Some styles are stored in JS to allow for customization */
/* Posts marked "read" should still show up when following notifications or showing a single post */
#facebook #pagelet_soft_permalink_posts .sfx_post_read > *,
#facebook[sfx_context_permalink="true"] .sfx_post_read > * {
  display: block !important;
}
#facebook #pagelet_soft_permalink_posts .sfx_post_read > *.sfx_post_marked_read_note,
#facebook[sfx_context_permalink="true"] .sfx_post_read > *.sfx_post_marked_read_note {
  display: none !important;
}
html:not(.sfx_show_read_posts) .sfx_post_read:not(.sfx_post_read_show) {
  /* Make sure to remove styles on the post itself that may have been put there by filters and change how the post is displayed */
  outline: none !important;
  border: none !important;
  margin: 0 !important;
  padding: 0 !important;
  background-color: transparent !important;
}
html:not(.sfx_show_read_posts) .sfx_post_read:not(.sfx_post_read_show) > *:not(.sfx_post_marked_read_note) {
  display: none !important;
}
html .sfx_post_read.sfx_post_read_show > * {
  display: block !important;
}
.sfx_post_marked_read_note {
  opacity: .3;
  margin: 1px;
  font-size: 10px;
  cursor: pointer;
  padding: 0 5px;
  color: var(--primary-text) !important;
}
.sfx_post_marked_read_note:hover {
  opacity: 1;
}
.sfx_cp_mark_all_read input {
  border-radius: 10px;
  font-size: 11px;
  padding: 2px 3px;
  line-height: 12px;
  font-weight: normal;
}
.sfx_cp_mark_all_read input[disabled="true"] {
  background-color: #eee;
  color: #aaa;
}
#sfx_post_action_tray {
  position: absolute;
  right: 32px;
  top: 1px;
  height: 16px;
  overflow: visible;
}
#sfx_post_action_tray > * {
  display: inline-block;
  width: 16px;
  height: 16px;
  float: right;
  cursor: pointer;
  margin-left: 7px;
  opacity: .5;
  font-size: 16px;
  line-height: 16px;
  background-color: transparent;
  background-repeat: no-repeat;
  color: #b1b5bb;
  z-index: 350;
}
#sfx_post_action_tray > *:hover {
  opacity: 1;
}
.sfx_post_action_menu {
  position: absolute;
  display: none;
  min-width: 150px;
  margin: 2px;
  padding: 4px;
  cursor: pointer;
  background-color: white;
  border: 1px solid #666;
  z-index: 9999;
}
.sfx_post_action_menu > div {
  padding: 4px 2px 4px 10px;
  font-size: 12px;
  font-family: arial, sans-serif;
}
.sfx_post_action_menu > div:hover {
  background-color: #7187B5;
  color: white;
}

/* Make room for the SFX Menu badge */
*[role="banner"] > *:last-child {
  right: 50px !important;
}
#sfx_badge {
  position: fixed;
  z-index: 350;
  cursor: pointer;
}
#sfx_badge .sfx_sticky_note {
  white-space: nowrap;
}
#sfx_badge_logo {
  position: relative;
  z-index: 351;
  color: white;
  font-size: 9px;
  text-align: center;
  height: 30px;
  width: 30px;
  border-radius: 16px;
  opacity: .5;
  border: 2px solid transparent;
  box-shadow: 3px 3px 3px #1c1c1c;
  background: #2C4166 url(data:image/gif;base64,R0lGODlhFwAXAOYAAJOgv3%2BOr4KRsYWUtIiXt5GfvpmnxZimxJelw5mmxKCuzKCty6GuzKOwzaKvzKe00aWyz09hhFVnilZoi1lrjlxtkGh5mml6m2x9nmt8nW%2BAoW19nnGCo29%2FoHSEpXKCo3yMrH%2BPr4SUs4CProeWtYWUs4mYt4iXtoybuoqZuI6dvI2cupWkwpalwpakwZ2ryKCuy56syaGvzCxBZi1CZy5DaDFGazJHbDFFajNHbDVJbjZKbzhMcThMcDpOczpOcj1RdUBUeEBTd0JWekFVeERYe0VYfElcf1FkhlRniVhqjFxukGFzlGV3mHqLqjBFaTNIbDZLbzlOcv%2F%2F%2FwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAFMALAAAAAAXABcAAAe4gFMzg4SFhoeCh4Y9ShkeHUtSipNNLw%2BXlwxHk4YSmJcQAxQ7nIUlmAcbQ6WGOwuYH6yHEZ8JNrKFHJ8PE4Y1nDUFuyKDOUgCTJxFuw8NERgIlxecGsy7DUSTQArWnxWTNSTdmB7gTuOXATSKTyPMDiBJLA8mN4o4IbswG0CDFgY8FEER9wmFkEJR%2Bh3aQWDXCSi4fqzYlUIHrhkqdgGIcnGGjE8ufHScwQBVkJEzpsSI0cIIyimBAAA7) no-repeat center center;
}
#sfx_badge:hover #sfx_badge_logo {
  opacity: 1;
  border: 2px solid white;
  box-shadow: none;
}
#sfx_badge_menu {
  z-index: 350;
  display: none;
  position: absolute;
  background-color: transparent;
  color: black;
  width: 250px;
}
#sfx_badge_menu.left {
  right: 12px;
}
#sfx_badge_menu.right {
  left: 25px;
}
#sfx_badge_menu.down {
  top: 0;
}
#sfx_badge_menu.up {
  bottom: 15px;
}
#sfx_badge_menu.up #sfx_badge_menu_wrap {
  display: flex;
  flex-direction: column-reverse;
}
#sfx_badge_menu_wrap {
  background-color: white;
  border-radius: 4px;
  border-color: #ddd;
  padding: 10px;
  margin-top: 20px;
  box-shadow: 0 0 5px rgba(105, 118, 136, 0.2), 0 5px 5px rgba(132, 143, 160, 0.2), 0 10px 10px rgba(132, 143, 160, 0.2), 0 20px 20px rgba(132, 143, 160, 0.2), 0 0 5px rgba(105, 118, 136, 0.3);
}
.sfx_menu_section {
  margin-bottom: 10px;
}
.sfx_menu_section:last-child {
  margin-bottom: 0;
}
.sfx_menu_section .sfx_menu_section_title {
  color: #3B5998;
  font-size: 9px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #bec4cd;
  padding: 0 5px;
}
.sfx_menu_section .sfx_menu_item {
  padding: 3px 5px 3px 15px;
  font-size: 12px;
}
.sfx_menu_section .sfx_menu_item .sfx_news_title {
  font-size: 12px;
  color: #666;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 1px 5px;
}
.sfx_menu_section .sfx_menu_item:hover {
  background-color: #7187B5;
  color: white;
}
.sfx_menu_section .sfx_menu_item:hover .sfx_news_title {
  color: white;
}
.sfx_menu_section .sfx_menu_item a.sfx_menu_item_content {
  text-decoration: none;
  color: inherit;
}

.sfx_notification_count {
  background-color: #F40008;
  color: white;
  position: absolute;
  top: -3px;
  left: -3px;
  font-size: 12px;
  font-weight: bold;
  padding: 0 1px;
  border: 1px solid #F40008;
  border-radius: 3px;
  z-index: 352;
  box-shadow: 1px 1px 1px 0 rgba(0, 0, 0, 0.9);
}

.sfx_filter_subscribed {
  opacity: .5;
  background-color: #d4ffd3;
}
.sfx_filter_subscribed .sfx_square_add {
  display: none;
}

.sfx_tweak_subscribed {
  opacity: .5;
  background-color: #afffbe;
}
.sfx_tweak_subscribed .sfx_square_add {
  display: none;
}

div.sfx_option {
  line-height: 24px;
  vertical-align: middle;
}
div.sfx_option input[type=checkbox]:not(.normal) ~ label {
  float: left;
  margin-right: 5px;
}
.sfx_option_verified {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 4px;
}
.sfx_square_control {
  height: 20px;
  width: 20px;
  cursor: pointer;
  border-radius: 3px;
  padding: 0;
  display: inline-block;
  overflow: hidden;
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  line-height: 20px;
  background-color: #fff;
  color: #4267B2;
  /*
  &:hover {
    opacity:.9;
  }*/
}
.sfx_square_add {
  height: 20px;
  width: 20px;
  cursor: pointer;
  border-radius: 3px;
  padding: 0;
  display: inline-block;
  overflow: hidden;
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  line-height: 20px;
  background-color: #fff;
  color: #4267B2;
  /*
  &:hover {
    opacity:.9;
  }*/
  color: white;
  background-color: #42b72a;
  box-shadow: none;
}
.sfx_square_delete {
  color: #a60000;
  background-color: white;
}
.sfx_dialog input[type=checkbox]:not(.normal) {
  display: none;
}
.sfx_dialog input[type=checkbox]:not(.normal) ~ label {
  height: 20px;
  width: 20px;
  cursor: pointer;
  border-radius: 3px;
  padding: 0;
  display: inline-block;
  overflow: hidden;
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  line-height: 20px;
  background-color: #fff;
  color: #4267B2;
  /*
  &:hover {
    opacity:.9;
  }*/
  box-shadow: inset 0 0 0 2px #3B5998;
  color: white;
}
.sfx_dialog input[type=checkbox]:not(.normal) ~ label:hover {
  opacity: 1;
}
.sfx_dialog input[type=checkbox]:not(.normal):checked ~ label {
  background-color: #3B5998;
  color: #fff;
}
.sfx_dialog input[type=checkbox]:not(.normal):checked ~ label:after {
  content: '\\2714';
  height: 20px;
  width: 20px;
  display: inline-block;
  font-size: 20px;
  line-height: 20px;
  color: white;
}
/* Section Headers displayed in right panel */
.sfx_options_dialog_section_header {
  margin: 6px 0 16px 0;
  font-size: 16px;
}
/* Options List Table */
.sfx_options_dialog_table {
  border-collapse: collapse;
  cell-spacing: 0;
  border-bottom: 1px solid #ccc;
  width: 95%;
  margin-top: 10px;
  margin-bottom: 5px;
}
.sfx_options_dialog_table thead {
  border-bottom: 2px solid #4267B2;
}
.sfx_options_dialog_table thead tr th {
  text-align: left;
  font-weight: bold;
  padding: 3px 5px;
  color: #4267B2;
}
.sfx_options_dialog_table tbody tr:hover td {
  background-color: #E9EBEE;
}
.sfx_options_dialog_table tbody td {
  border-top: 1px solid #ccc;
  padding: 3px;
  vertical-align: top;
}
.sfx_options_dialog_table tbody td.repeat {
  border-top: none;
  visibility: hidden;
}
.sfx_options_dialog_table .sfx_options_dialog_option_highlighted {
  background-color: #afffbe !important;
}
.sfx_options_dialog_table .sfx_options_dialog_option_title {
  font-size: 11px;
  font-weight: bold;
  width: 160px;
  padding-right: 20px;
}
.sfx_options_dialog_table .sfx_options_dialog_option_description {
  font-size: 12px;
  color: #5a5a5a;
}
.sfx_options_dialog_table .sfx_options_dialog_option_action {
  padding-right: 10px;
  padding-left: 10px;
}
.sfx_options_dialog_table .sfx_options_dialog_option_action input[type=checkbox] {
  transform: scale(1.25);
}
.sfx_options_dialog_table .sfx_options_dialog_option_disabled {
  opacity: .7;
}
#sfx_options_dialog_actions {
  float: right;
}
/* Dialog Panels */
.sfx_panel {
  padding: 5px;
}
.sfx_panel_title_bar {
  padding: 0 3px;
  color: #4267B2;
  font-weight: bold;
  font-size: 14px;
  line-height: 18px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 5px;
}
.sfx_options_dialog_panel {
  padding: 5px;
}
.sfx_options_dialog_panel > div:last-child {
  margin-top: 10px;
}
.sfx_options_dialog_panel .sfx_options_dialog_panel {
  background-color: #e7e9ef;
  margin: 10px 0;
}
.sfx_options_dialog_panel .sfx_options_dialog_panel .sfx_panel_title_bar {
  font-size: 18px;
}
.sfx_options_dialog_panel .sfx_options_dialog_panel_button {
  float: right;
  margin: 5px;
}
/* Filter Styles */
.sfx_options_dialog_filter_list .sfx_options_dialog_filter {
  padding: 5px;
}
.sfx_options_dialog_filter_conditions,
.sfx_options_dialog_filter_actions {
  margin-top: 0;
}
.sfx_options_dialog_panel_header {
  font-weight: bold;
  margin: 30px 0 10px;
  color: #697688;
  font-size: 15px;
  background-color: #E9EBEE;
  padding: 10px;
}

.sfx_photo_tags:hover:after {
  content: attr(sfx_photo_tags) !important;
  color: white !important;
  font-size: 14px !important;
  font-weight: bold !important;
  text-shadow: -1px 0 #000, 0 1px #000, 1px 0 #000, 0 -1px #000 !important;
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: #000000;
  border: 1px solid #999;
  margin: 5px;
  padding: 2px;
}

.sfx_filter_hidden:not(.sfx_filter_hidden_show) > *:not(.sfx_filter_hidden_note) {
  display: none !important;
}
.sfx_filter_hidden.sfx_filter_hidden_show > *:not(.sfx_filter_hidden_note) {
  opacity: .5;
}
.sfx_filter_hidden.sfx_filter_hidden_show:hover > *:not(.sfx_filter_hidden_note) {
  opacity: 1;
}
.sfx_filter_hidden_note {
  padding: 0 5px;
  border: 1px dashed #333;
  font-size: 11px;
  opacity: .5;
  cursor: pointer;
  margin-top: 2px;
  color: var(--primary-text) !important;
}
.sfx_filter_hidden_note:hover {
  opacity: 1;
}
/* "More Stories" Pager */
.sfx-pager-disabled {
  display: none;
}

#sfx_control_panel .sfx_filter_tab {
  cursor: pointer;
  padding: 2px 10px 2px 5px;
  background-color: #F6F7F9;
}
#sfx_control_panel .sfx_filter_tab:hover {
  background-color: #5890FF;
}
#sfx_control_panel .sfx_filter_tab:hover .sfx_count {
  color: black;
}
#sfx_control_panel .sfx_filter_tab.sfx_tab_selected {
  background-color: #4267B2;
  color: white;
}
#sfx_control_panel .sfx_filter_tab.sfx_tab_selected .sfx_count {
  color: white;
}
#sfx_control_panel .sfx_filter_tab.sfx_tab_occupied {
  font-weight: bold;
}
#sfx_control_panel .sfx_filter_tab:not(.sfx_tab_occupied):not(.sfx_tab_selected):not(:hover) {
  background-color: #d7dce5;
}
#sfx_control_panel .sfx_count {
  font-style: italic;
  color: #999;
}
.sfx_filter_tab_hidden {
  display: none !important;
}

/* "Sticky" note */
.sfx_sticky_note {
  position: absolute;
  min-height: 14px;
  min-width: 150px;
  right: 100%;
  margin-right: 8px;
  top: 50%;
  font-family: arial;
  background-color: #FFFFE5;
  color: black;
  border: 1px solid #3F5C71;
  font-size: 12px;
  padding: 3px;
  text-align: center;
  border-radius: 6px;
  box-shadow: 0 0 5px #888888;
  z-index: 9999 !important;
}
.sfx_sticky_note_right {
  left: 100%;
  right: auto;
  margin-left: 8px;
  margin-right: auto;
}
.sfx_sticky_note_left {
  right: 100%;
  left: auto;
  margin-right: 8px;
  margin-left: auto;
}
.sfx_sticky_note_bottom {
  top: 200%;
  right: auto;
  left: -25%;
  margin-top: 8px;
  margin-right: 0;
  margin-left: -3px;
}
.sfx_sticky_note_top {
  top: -100%;
  right: auto;
  left: -25%;
  margin-bottom: 8px;
  margin-right: 0;
  margin-left: -3px;
}
.sfx_sticky_note_arrow_border {
  border-color: transparent transparent transparent #666666;
  border-style: solid;
  border-width: 7px;
  height: 0;
  width: 0;
  position: absolute;
  margin-top: -7px;
  top: 50%;
  right: -15px;
}
.sfx_sticky_note_right .sfx_sticky_note_arrow_border {
  border-color: transparent #666666 transparent transparent;
  top: 50%;
  right: auto;
  left: -15px;
}
.sfx_sticky_note_left .sfx_sticky_note_arrow_border {
  border-color: transparent transparent transparent #666666;
  top: 50%;
  right: -15px;
  left: auto;
}
.sfx_sticky_note_bottom .sfx_sticky_note_arrow_border {
  border-color: transparent transparent #666666 transparent;
  left: 50%;
  right: auto;
  top: -15px;
  margin-left: -7px;
  margin-top: 0;
}
.sfx_sticky_note_top .sfx_sticky_note_arrow_border {
  border-color: #666666 transparent transparent transparent;
  left: 50%;
  right: auto;
  top: auto;
  bottom: -15px;
  margin-left: -7px;
  margin-bottom: 0;
}
.sfx_sticky_note_arrow {
  border-color: transparent transparent transparent #ffa;
  border-style: solid;
  border-width: 7px;
  height: 0;
  width: 0;
  position: absolute;
  top: 50%;
  right: -13px;
  margin-top: -7px;
}
.sfx_sticky_note_right .sfx_sticky_note_arrow {
  border-color: transparent #ffa transparent transparent;
  top: 50%;
  right: auto;
  left: -13px;
}
.sfx_sticky_note_left .sfx_sticky_note_arrow {
  border-color: transparent transparent transparent #ffa;
  top: 50%;
  right: -13px;
  left: auto;
}
.sfx_sticky_note_bottom .sfx_sticky_note_arrow {
  border-color: transparent transparent #ffa transparent;
  left: 50%;
  right: auto;
  top: -13px;
  margin-left: -7px;
  margin-top: 0;
}
.sfx_sticky_note_top .sfx_sticky_note_arrow {
  border-color: #ffa transparent transparent transparent;
  left: 50%;
  right: auto;
  bottom: -13px;
  top: auto;
  margin-left: -7px;
  margin-bottom: 0;
}
.sfx_sticky_note_close {
  float: left;
  width: 9px;
  height: 9px;
  background-repeat: no-repeat;
  background-position: center center;
  cursor: pointer;
  background-image: url("data:image/gif,GIF89a%07%00%07%00%91%00%00%00%00%00%FF%FF%FF%9C%9A%9C%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%07%00%07%00%00%02%0C%94%86%A6%B3j%C8%5Er%F1%B83%0B%00%3B");
  border: 1px solid transparent;
  float: right;
}
div.sfx_sticky_note_close:hover {
  background-image: url("data:image/gif,GIF89a%07%00%07%00%91%00%00%00%00%00%FF%FF%FF%FF%FF%FF%00%00%00!%F9%04%01%00%00%02%00%2C%00%00%00%00%07%00%07%00%00%02%0C%04%84%A6%B2j%C8%5Er%F1%B83%0B%00%3B");
  border: 1px solid black;
}

.sfx_hidden {
  display: none !important;
}
.sfx_clickable {
  cursor: pointer !important;
}
.sfx_link {
  text-decoration: underline !important;
  cursor: pointer !important;
}
.sfx_hover_link:hover {
  text-decoration: underline !important;
  cursor: pointer !important;
}
.sfx_clearfix:after {
  clear: both;
  content: '.';
  display: block;
  font-size: 0;
  height: 0;
  line-height: 0;
  visibility: hidden;
}
.sfx_info_icon {
  content: "i";
  position: absolute;
  display: block;
  left: 6px;
  top: 6px;
  width: 20px;
  height: 20px;
  font-size: 18px;
  line-height: 18px;
  text-align: center;
  font-style: italic;
  vertical-align: center;
  font-family: serif !important;
  font-weight: bold;
  background-color: #5890FF;
  color: white;
  padding: 0;
  border-radius: 20px;
}
.sfx_info {
  background-color: #FFFFE5;
  border: 1px solid #666;
  border-radius: 6px;
  padding: 7px;
  margin: 5px;
  font-family: arial;
  font-size: 12px;
  position: relative;
}
.sfx_info:not(.no_icon) {
  padding-left: 35px;
}
.sfx_info:not(.no_icon)::before {
  content: "i";
  position: absolute;
  display: block;
  left: 6px;
  top: 6px;
  width: 20px;
  height: 20px;
  font-size: 18px;
  line-height: 18px;
  text-align: center;
  font-style: italic;
  vertical-align: center;
  font-family: serif !important;
  font-weight: bold;
  background-color: #5890FF;
  color: white;
  padding: 0;
  border-radius: 20px;
}
.sfx_highlight {
  background-color: yellow;
  color: black;
}
.sfx_whats_this {
  color: #999;
  cursor: help;
  font-weight: normal !important;
}
.sfx_label_value {
  display: table;
  width: 95%;
  margin: 3px;
}
.sfx_label_value > * {
  display: table-cell;
}
.sfx_label_value input.sfx_wide {
  width: 100%;
}
.sfx_label_value > *:first-child {
  font-weight: bold;
  padding-right: 10px;
  width: 1px;
}
.sfx_label_value > .stretch {
  width: 100%;
}
/* A "Help" icon with tooltip */
.sfx-help-icon:after {
  display: inline-block;
  height: 14px;
  width: 14px;
  vertical-align: middle;
  background-color: #7187B5;
  color: white;
  border-radius: 50%;
  content: "?";
  cursor: help;
  text-align: center;
  line-height: 12px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: normal;
}
/* FLEXBOX */
.sfx-flex-row,
.sfx-flex-column {
  display: flex;
}
.sfx-flex-row > *,
.sfx-flex-column > * {
  flex: auto;
  align-self: auto;
  overflow: auto;
}
.sfx-flex-row,
.sfx-flex-column {
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-content: stretch;
  align-items: stretch;
}
.sfx-flex-row {
  flex-direction: row;
}
.sfx-flex-column {
  flex-direction: column;
}
.sfx-flex-row-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
}
.sfx-flex-row-container > * {
  margin-right: 5px;
}
.sfx-flex-row-container > *:not(.stretch) {
  flex-shrink: 0 ;
}
.sfx-flex-row-container > .stretch {
  flex-grow: 1;
}
.sfx-flex-row-container > .stretch > .stretch {
  width: 100%;
}

/* Support Group Styles */
.sfx_support_group #pagelet_announcement_posts .userContentWrapper,
.sfx_support_group #pagelet_pinned_posts .userContentWrapper {
  margin-top: 7px !important;
  padding: 5px !important;
  border: 2px solid #3D5B99 !important;
  border-radius: 10px !important;
  background-color: #D8DFEA !important;
}
.sfx_support_group #pagelet_announcement_posts .userContentWrapper:before,
.sfx_support_group #pagelet_pinned_posts .userContentWrapper:before {
  content: "Please read the notes below before posting!";
  text-align: center;
  font-size: 18px !important;
  font-weight: bold !important;
  color: red !important;
  display: inline-block !important;
}
.sfx_support_group #pagelet_announcement_posts .userContentWrapper:hover,
.sfx_support_group #pagelet_pinned_posts .userContentWrapper:hover {
  height: auto;
}
.sfx_support_post [data-testid^='UFI2Comment/reply-link'],
.sfx_support_post .UFIReplyLink,
.sfx_support_post .UFIReplyLink + span {
  display: none;
}

.sfx_unread_filtered_message {
  padding: 3px 0;
  color: #2c4166;
  font-weight: bold;
}
.sfx_unread_filtered_message .count {
  display: inline-block;
  font-weight: normal !important;
  background-color: #2c4166 !important;
  color: white !important;
  border: 1px solid #aaa;
  padding: 0px 3px;
  border-radius: 4px;
}
.sfx_unread_filtered_message a {
  text-decoration: underline !important;
}


.mark_read_filter {
    background: url('data:image/gif;base64,R0lGODdhEAAQAJAAALG1u////yH5BAEAAAEALAAAAAAQABAAAAIgjI8ZwO0Po1vyndoSVhRy431gJo5MaQJop6KTS5bv+hUAOw==');
}

.mark_read_markit {
    background: url('data:image/gif;base64,R0lGODdhEAAQAJAAALG1u////yH5BAEAAAEALAAAAAAQABAAAAIgjI+pC73Z3DMRTBpvqHrnyyGfJ4lZCFVoqoLrM7pWRxcAOw==');
}

.mark_read_nomark {
    background: url('data:image/gif;base64,R0lGODdhEAAQAJAAALG1u////yH5BAEAAAEALAAAAAAQABAAAAIijI+pC73Z3DMRTBpZ3Rbx/VSQFIijY55cuE7gVZJXBtdGAQA7');
}

.mark_read_wrench {
    background: url('data:image/gif;base64,R0lGODdhEAAQAPUAALq9wra5v/39/bO3vd7f4rS4vvn5+vf3+O7v8P7+/rW4vvz8/bW5v7W5vujp69/h5Nze4fz8/O/w8ezt7/Lz9M3Q1Ly/xbO2vOHj5cDDyPX19srN0e7u8L7BxszP0rS4vbq+w/Hx8re7wLK2vObn6dvd4NPV2MLFycXIzMnM0Pb298vN0bu/xPj4+fn5+dja3cbJzrG1u////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAADIALAAAAAAQABAAAAZyQJlwKEQ8iMihZhMzJZEkRSxgeA4Rg1isRExAkBWtYkEkBJAnrUgwPDBiSJY2tmLLUrECEjCPdV4wWgBECxd9hyhEGIeHBEMUAYxzGXYqfHMDIFkjHlUyLRZzHwQRQi4JRAeXDRNWQyEFARyuRA4StEJBADs=');
}

.sfx_option_verified {
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF+mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA5LTAxVDA3OjM3OjQ5LTA1OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wOS0wMVQwNzozODoyMC0wNTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wOS0wMVQwNzozODoyMC0wNTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3NjZiYWE3Ni1lOThhLTMwNDItYTE0MC1mM2MyOTViMzcxNDgiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpkYjdmYmIyMC1hMmQyLTkwNDUtYTNlYS0xOTNjMzQ0Y2Y1YmEiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpmYjBkNjdkNy0yNDU3LWIyNGQtYTY2Ny1hYTMxYTBlNWM0YWEiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmZiMGQ2N2Q3LTI0NTctYjI0ZC1hNjY3LWFhMzFhMGU1YzRhYSIgc3RFdnQ6d2hlbj0iMjAyMC0wOS0wMVQwNzozNzo0OS0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3NjZiYWE3Ni1lOThhLTMwNDItYTE0MC1mM2MyOTViMzcxNDgiIHN0RXZ0OndoZW49IjIwMjAtMDktMDFUMDc6Mzg6MjAtMDU6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7WoavCAAAA90lEQVQ4jWPwySxkQMbyZV95JMo+hIqXfdwtUf7xPQiD2UAxkBy6ehSOeNknb6DicxLln/5jwyA5kBqsBkiUfsySKPv0E5dmOAapAapFMQBkKlCSsGYE/glzCdjP+JyNzzsgvQygwCFGg3XPl99BM7/+Q/XOh1Cg8z/uJaQZpPHDt///D9z+h+6K3QyQqEJVDLINxk9a+u8/SPPlp//+I4tD8Mf3GAaAbAFpABlUsObX/3////8FiWk2fsbiOqABkASD6leQbSCN/4Fg9bk/ODTDvIAlEEEatl7993/+iX//5arxpQlgIFIcjRQnJKokZapkJnKzMwBFYUWnPcw1MAAAAABJRU5ErkJggg==');
}
`);
},0);

try {
// Libraries
// ===========
var XLib = function( args ) {
	args = args || {};

	// LOCAL CHANGE to prevent errors in Chrome:
	// -  !t.isImmediatePropagationStopped()
	// +  (!t.isImmediatePropagationStopped || !t.isImmediatePropagationStopped())
	// http://github.e-sites.nl/zeptobuilder/
	/*! Zepto 1.2.0 (generated with Zepto Builder) - zepto event - zeptojs.com/license */
	//     Zepto.js
	//     (c) 2010-2016 Thomas Fuchs
	//     Zepto.js may be freely distributed under the MIT license.

	/* eslint-disable */
	var Zepto = (function() {
		var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
			document = window.document,
			elementDisplay = {}, classCache = {},
			cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
			fragmentRE = /^\s*<(\w+|!)[^>]*>/,
			singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
			tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
			rootNodeRE = /^(?:body|html)$/i,
			capitalRE = /([A-Z])/g,

			// special attributes that should be get/set via method calls
			methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

			adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
			table = document.createElement('table'),
			tableRow = document.createElement('tr'),
			containers = {
				'tr': document.createElement('tbody'),
				'tbody': table, 'thead': table, 'tfoot': table,
				'td': tableRow, 'th': tableRow,
				'*': document.createElement('div')
			},
			readyRE = /complete|loaded|interactive/,
			simpleSelectorRE = /^[\w-]*$/,
			class2type = {},
			toString = class2type.toString,
			zepto = {},
			camelize, uniq,
			tempParent = document.createElement('div'),
			propMap = {
				'tabindex': 'tabIndex',
				'readonly': 'readOnly',
				'for': 'htmlFor',
				'class': 'className',
				'maxlength': 'maxLength',
				'cellspacing': 'cellSpacing',
				'cellpadding': 'cellPadding',
				'rowspan': 'rowSpan',
				'colspan': 'colSpan',
				'usemap': 'useMap',
				'frameborder': 'frameBorder',
				'contenteditable': 'contentEditable'
			},
			isArray = Array.isArray ||
				function(object){ return object instanceof Array }

		zepto.matches = function(element, selector) {
			if (!selector || !element || element.nodeType !== 1) return false
			var matchesSelector = element.matches || element.webkitMatchesSelector ||
				element.mozMatchesSelector || element.oMatchesSelector ||
				element.matchesSelector
			if (matchesSelector) return matchesSelector.call(element, selector)
			// fall back to performing a selector:
			var match, parent = element.parentNode, temp = !parent
			if (temp) (parent = tempParent).appendChild(element)
			match = ~zepto.qsa(parent, selector).indexOf(element)
			temp && tempParent.removeChild(element)
			return match
		}

		function type(obj) {
			return obj == null ? String(obj) :
			class2type[toString.call(obj)] || "object"
		}

		function isFunction(value) { return type(value) == "function" }
		function isWindow(obj)     { return obj != null && obj == obj.window }
		function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
		function isObject(obj)     { return type(obj) == "object" }
		function isPlainObject(obj) {
			return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
		}

		function likeArray(obj) {
			var length = !!obj && 'length' in obj && obj.length,
				type = $.type(obj)

			return 'function' != type && !isWindow(obj) && (
					'array' == type || length === 0 ||
					(typeof length == 'number' && length > 0 && (length - 1) in obj)
				)
		}

		function compact(array) { return filter.call(array, function(item){ return item != null }) }
		function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
		camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
		function dasherize(str) {
			return str.replace(/::/g, '/')
				.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
				.replace(/([a-z\d])([A-Z])/g, '$1_$2')
				.replace(/_/g, '-')
				.toLowerCase()
		}
		uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

		function classRE(name) {
			return name in classCache ?
				classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
		}

		function maybeAddPx(name, value) {
			return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
		}

		function defaultDisplay(nodeName) {
			var element, display
			if (!elementDisplay[nodeName]) {
				element = document.createElement(nodeName)
				document.body.appendChild(element)
				display = getComputedStyle(element, '').getPropertyValue("display")
				element.parentNode.removeChild(element)
				display == "none" && (display = "block")
				elementDisplay[nodeName] = display
			}
			return elementDisplay[nodeName]
		}

		function children(element) {
			return 'children' in element ?
				slice.call(element.children) :
				$.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
		}

		function Z(dom, selector) {
			var i, len = dom ? dom.length : 0
			for (i = 0; i < len; i++) this[i] = dom[i]
			this.length = len
			this.selector = selector || ''
		}

		// `$.zepto.fragment` takes a html string and an optional tag name
		// to generate DOM nodes from the given html string.
		// The generated DOM nodes are returned as an array.
		// This function can be overridden in plugins for example to make
		// it compatible with browsers that don't support the DOM fully.
		zepto.fragment = function(html, name, properties) {
			var dom, nodes, container

			// A special case optimization for a single tag
			if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

			if (!dom) {
				if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
				if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
				if (!(name in containers)) name = '*'

				container = containers[name]
				container.innerHTML = '' + html
				dom = $.each(slice.call(container.childNodes), function(){
					container.removeChild(this)
				})
			}

			if (isPlainObject(properties)) {
				nodes = $(dom)
				$.each(properties, function(key, value) {
					if (methodAttributes.indexOf(key) > -1) nodes[key](value)
					else nodes.attr(key, value)
				})
			}

			return dom
		}

		// `$.zepto.Z` swaps out the prototype of the given `dom` array
		// of nodes with `$.fn` and thus supplying all the Zepto functions
		// to the array. This method can be overridden in plugins.
		zepto.Z = function(dom, selector) {
			return new Z(dom, selector)
		}

		// `$.zepto.isZ` should return `true` if the given object is a Zepto
		// collection. This method can be overridden in plugins.
		zepto.isZ = function(object) {
			return object instanceof zepto.Z
		}

		// `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
		// takes a CSS selector and an optional context (and handles various
		// special cases).
		// This method can be overridden in plugins.
		zepto.init = function(selector, context) {
			var dom
			// If nothing given, return an empty Zepto collection
			if (!selector) return zepto.Z()
			// Optimize for string selectors
			else if (typeof selector == 'string') {
				selector = selector.trim()
				// If it's a html fragment, create nodes from it
				// Note: In both Chrome 21 and Firefox 15, DOM error 12
				// is thrown if the fragment doesn't begin with <
				if (selector[0] == '<' && fragmentRE.test(selector))
					dom = zepto.fragment(selector, RegExp.$1, context), selector = null
				// If there's a context, create a collection on that context first, and select
				// nodes from there
				else if (context !== undefined) return $(context).find(selector)
				// If it's a CSS selector, use it to select nodes.
				else dom = zepto.qsa(document, selector)
			}
			// If a function is given, call it when the DOM is ready
			else if (isFunction(selector)) return $(document).ready(selector)
			// If a Zepto collection is given, just return it
			else if (zepto.isZ(selector)) return selector
			else {
				// normalize array if an array of nodes is given
				if (isArray(selector)) dom = compact(selector)
				// Wrap DOM nodes.
				else if (isObject(selector))
					dom = [selector], selector = null
				// If it's a html fragment, create nodes from it
				else if (fragmentRE.test(selector))
					dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
				// If there's a context, create a collection on that context first, and select
				// nodes from there
				else if (context !== undefined) return $(context).find(selector)
				// And last but no least, if it's a CSS selector, use it to select nodes.
				else dom = zepto.qsa(document, selector)
			}
			// create a new Zepto collection from the nodes found
			return zepto.Z(dom, selector)
		}

		// `$` will be the base `Zepto` object. When calling this
		// function just call `$.zepto.init, which makes the implementation
		// details of selecting nodes and creating Zepto collections
		// patchable in plugins.
		$ = function(selector, context){
			return zepto.init(selector, context)
		}

		function extend(target, source, deep) {
			for (key in source)
				if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
					if (isPlainObject(source[key]) && !isPlainObject(target[key]))
						target[key] = {}
					if (isArray(source[key]) && !isArray(target[key]))
						target[key] = []
					extend(target[key], source[key], deep)
				}
				else if (source[key] !== undefined) target[key] = source[key]
		}

		// Copy all but undefined properties from one or more
		// objects to the `target` object.
		$.extend = function(target){
			var deep, args = slice.call(arguments, 1)
			if (typeof target == 'boolean') {
				deep = target
				target = args.shift()
			}
			args.forEach(function(arg){ extend(target, arg, deep) })
			return target
		}

		// `$.zepto.qsa` is Zepto's CSS selector implementation which
		// uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
		// This method can be overridden in plugins.
		zepto.qsa = function(element, selector){
			var found,
				maybeID = selector[0] == '#',
				maybeClass = !maybeID && selector[0] == '.',
				nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
				isSimple = simpleSelectorRE.test(nameOnly)
			return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
				( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
				(element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
					slice.call(
						isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
							maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
								element.getElementsByTagName(selector) : // Or a tag
							element.querySelectorAll(selector) // Or it's not simple, and we need to query all
					)
		}

		function filtered(nodes, selector) {
			return selector == null ? $(nodes) : $(nodes).filter(selector)
		}

		$.contains = document.documentElement.contains ?
			function(parent, node) {
				return parent !== node && parent.contains(node)
			} :
			function(parent, node) {
				while (node && (node = node.parentNode))
					if (node === parent) return true
				return false
			}

		function funcArg(context, arg, idx, payload) {
			return isFunction(arg) ? arg.call(context, idx, payload) : arg
		}

		function setAttribute(node, name, value) {
			value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
		}

		// access className property while respecting SVGAnimatedString
		function className(node, value){
			var klass = node.className || '',
				svg   = klass && klass.baseVal !== undefined

			if (value === undefined) return svg ? klass.baseVal : klass
			svg ? (klass.baseVal = value) : (node.className = value)
		}

		// "true"  => true
		// "false" => false
		// "null"  => null
		// "42"    => 42
		// "42.5"  => 42.5
		// "08"    => "08"
		// JSON    => parse if valid
		// String  => self
		function deserializeValue(value) {
			try {
				return value ?
				value == "true" ||
				( value == "false" ? false :
					value == "null" ? null :
						+value + "" == value ? +value :
							/^[\[\{]/.test(value) ? $.parseJSON(value) :
								value )
					: value
			} catch(e) {
				return value
			}
		}

		$.type = type
		$.isFunction = isFunction
		$.isWindow = isWindow
		$.isArray = isArray
		$.isPlainObject = isPlainObject

		$.isEmptyObject = function(obj) {
			var name
			for (name in obj) return false
			return true
		}

		$.isNumeric = function(val) {
			var num = Number(val), type = typeof val
			return val != null && type != 'boolean' &&
				(type != 'string' || val.length) &&
				!isNaN(num) && isFinite(num) || false
		}

		$.inArray = function(elem, array, i){
			return emptyArray.indexOf.call(array, elem, i)
		}

		$.camelCase = camelize
		$.trim = function(str) {
			return str == null ? "" : String.prototype.trim.call(str)
		}

		// plugin compatibility
		$.uuid = 0
		$.support = { }
		$.expr = { }
		$.noop = function() {}

		$.map = function(elements, callback){
			var value, values = [], i, key
			if (likeArray(elements))
				for (i = 0; i < elements.length; i++) {
					value = callback(elements[i], i)
					if (value != null) values.push(value)
				}
			else
				for (key in elements) {
					value = callback(elements[key], key)
					if (value != null) values.push(value)
				}
			return flatten(values)
		}

		$.each = function(elements, callback){
			var i, key
			if (likeArray(elements)) {
				for (i = 0; i < elements.length; i++)
					if (callback.call(elements[i], i, elements[i]) === false) return elements
			} else {
				for (key in elements)
					if (callback.call(elements[key], key, elements[key]) === false) return elements
			}

			return elements
		}

		$.grep = function(elements, callback){
			return filter.call(elements, callback)
		}

		if (window.JSON) $.parseJSON = JSON.parse

		// Populate the class2type map
		$.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
			class2type[ "[object " + name + "]" ] = name.toLowerCase()
		})

		// Define methods that will be available on all
		// Zepto collections
		$.fn = {
			constructor: zepto.Z,
			length: 0,

			// Because a collection acts like an array
			// copy over these useful array functions.
			forEach: emptyArray.forEach,
			reduce: emptyArray.reduce,
			push: emptyArray.push,
			sort: emptyArray.sort,
			splice: emptyArray.splice,
			indexOf: emptyArray.indexOf,
			concat: function(){
				var i, value, args = []
				for (i = 0; i < arguments.length; i++) {
					value = arguments[i]
					args[i] = zepto.isZ(value) ? value.toArray() : value
				}
				return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
			},

			// `map` and `slice` in the jQuery API work differently
			// from their array counterparts
			map: function(fn){
				return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
			},
			slice: function(){
				return $(slice.apply(this, arguments))
			},

			ready: function(callback){
				// need to check if document.body exists for IE as that browser reports
				// document ready when it hasn't yet created the body element
				if (readyRE.test(document.readyState) && document.body) callback($)
				else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
				return this
			},
			get: function(idx){
				return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
			},
			toArray: function(){ return this.get() },
			size: function(){
				return this.length
			},
			remove: function(){
				return this.each(function(){
					if (this.parentNode != null)
						this.parentNode.removeChild(this)
				})
			},
			each: function(callback){
				emptyArray.every.call(this, function(el, idx){
					return callback.call(el, idx, el) !== false
				})
				return this
			},
			filter: function(selector){
				if (isFunction(selector)) return this.not(this.not(selector))
				return $(filter.call(this, function(element){
					return zepto.matches(element, selector)
				}))
			},
			add: function(selector,context){
				return $(uniq(this.concat($(selector,context))))
			},
			is: function(selector){
				return this.length > 0 && zepto.matches(this[0], selector)
			},
			not: function(selector){
				var nodes=[]
				if (isFunction(selector) && selector.call !== undefined)
					this.each(function(idx){
						if (!selector.call(this,idx)) nodes.push(this)
					})
				else {
					var excludes = typeof selector == 'string' ? this.filter(selector) :
						(likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
					this.forEach(function(el){
						if (excludes.indexOf(el) < 0) nodes.push(el)
					})
				}
				return $(nodes)
			},
			has: function(selector){
				return this.filter(function(){
					return isObject(selector) ?
						$.contains(this, selector) :
						$(this).find(selector).size()
				})
			},
			eq: function(idx){
				return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
			},
			first: function(){
				var el = this[0]
				return el && !isObject(el) ? el : $(el)
			},
			last: function(){
				var el = this[this.length - 1]
				return el && !isObject(el) ? el : $(el)
			},
			find: function(selector){
				var result, $this = this
				if (!selector) result = $()
				else if (typeof selector == 'object')
					result = $(selector).filter(function(){
						var node = this
						return emptyArray.some.call($this, function(parent){
							return $.contains(parent, node)
						})
					})
				else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
				else result = this.map(function(){ return zepto.qsa(this, selector) })
				return result
			},
			closest: function(selector, context){
				var nodes = [], collection = typeof selector == 'object' && $(selector)
				this.each(function(_, node){
					while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
						node = node !== context && !isDocument(node) && node.parentNode
					if (node && nodes.indexOf(node) < 0) nodes.push(node)
				})
				return $(nodes)
			},
			parents: function(selector){
				var ancestors = [], nodes = this
				while (nodes.length > 0)
					nodes = $.map(nodes, function(node){
						if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
							ancestors.push(node)
							return node
						}
					})
				return filtered(ancestors, selector)
			},
			parent: function(selector){
				return filtered(uniq(this.pluck('parentNode')), selector)
			},
			children: function(selector){
				return filtered(this.map(function(){ return children(this) }), selector)
			},
			contents: function() {
				return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
			},
			siblings: function(selector){
				return filtered(this.map(function(i, el){
					return filter.call(children(el.parentNode), function(child){ return child!==el })
				}), selector)
			},
			empty: function(){
				return this.each(function(){ this.innerHTML = '' })
			},
			// `pluck` is borrowed from Prototype.js
			pluck: function(property){
				return $.map(this, function(el){ return el[property] })
			},
			show: function(){
				return this.each(function(){
					this.style.display == "none" && (this.style.display = '')
					if (getComputedStyle(this, '').getPropertyValue("display") == "none")
						this.style.display = defaultDisplay(this.nodeName)
				})
			},
			replaceWith: function(newContent){
				return this.before(newContent).remove()
			},
			wrap: function(structure){
				var func = isFunction(structure)
				if (this[0] && !func)
					var dom   = $(structure).get(0),
						clone = dom.parentNode || this.length > 1

				return this.each(function(index){
					$(this).wrapAll(
						func ? structure.call(this, index) :
							clone ? dom.cloneNode(true) : dom
					)
				})
			},
			wrapAll: function(structure){
				if (this[0]) {
					$(this[0]).before(structure = $(structure))
					var children
					// drill down to the inmost element
					while ((children = structure.children()).length) structure = children.first()
					$(structure).append(this)
				}
				return this
			},
			wrapInner: function(structure){
				var func = isFunction(structure)
				return this.each(function(index){
					var self = $(this), contents = self.contents(),
						dom  = func ? structure.call(this, index) : structure
					contents.length ? contents.wrapAll(dom) : self.append(dom)
				})
			},
			unwrap: function(){
				this.parent().each(function(){
					$(this).replaceWith($(this).children())
				})
				return this
			},
			clone: function(){
				return this.map(function(){ return this.cloneNode(true) })
			},
			hide: function(){
				return this.css("display", "none")
			},
			toggle: function(setting){
				return this.each(function(){
					var el = $(this)
						;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
				})
			},
			prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
			next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
			html: function(html){
				return 0 in arguments ?
					this.each(function(idx){
						var originHtml = this.innerHTML
						$(this).empty().append( funcArg(this, html, idx, originHtml) )
					}) :
					(0 in this ? this[0].innerHTML : null)
			},
			text: function(text){
				return 0 in arguments ?
					this.each(function(idx){
						var newText = funcArg(this, text, idx, this.textContent)
						this.textContent = newText == null ? '' : ''+newText
					}) :
					(0 in this ? this.pluck('textContent').join("") : null)
			},
			attr: function(name, value){
				var result
				return (typeof name == 'string' && !(1 in arguments)) ?
					(0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
					this.each(function(idx){
						if (this.nodeType !== 1) return
						if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
						else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
					})
			},
			removeAttr: function(name){
				return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
					setAttribute(this, attribute)
				}, this)})
			},
			prop: function(name, value){
				name = propMap[name] || name
				return (1 in arguments) ?
					this.each(function(idx){
						this[name] = funcArg(this, value, idx, this[name])
					}) :
					(this[0] && this[0][name])
			},
			removeProp: function(name){
				name = propMap[name] || name
				return this.each(function(){ delete this[name] })
			},
			data: function(name, value){
				var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

				var data = (1 in arguments) ?
					this.attr(attrName, value) :
					this.attr(attrName)

				return data !== null ? deserializeValue(data) : undefined
			},
			val: function(value){
				if (0 in arguments) {
					if (value == null) value = ""
					return this.each(function(idx){
						this.value = funcArg(this, value, idx, this.value)
					})
				} else {
					return this[0] && (this[0].multiple ?
							$(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
							this[0].value)
				}
			},
			offset: function(coordinates){
				if (coordinates) return this.each(function(index){
					var $this = $(this),
						coords = funcArg(this, coordinates, index, $this.offset()),
						parentOffset = $this.offsetParent().offset(),
						props = {
							top:  coords.top  - parentOffset.top,
							left: coords.left - parentOffset.left
						}

					if ($this.css('position') == 'static') props['position'] = 'relative'
					$this.css(props)
				})
				if (!this.length) return null
				if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
					return {top: 0, left: 0}
				var obj = this[0].getBoundingClientRect()
				return {
					left: obj.left + window.pageXOffset,
					top: obj.top + window.pageYOffset,
					width: Math.round(obj.width),
					height: Math.round(obj.height)
				}
			},
			css: function(property, value){
				if (arguments.length < 2) {
					var element = this[0]
					if (typeof property == 'string') {
						if (!element) return
						return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
					} else if (isArray(property)) {
						if (!element) return
						var props = {}
						var computedStyle = getComputedStyle(element, '')
						$.each(property, function(_, prop){
							props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
						})
						return props
					}
				}

				var css = ''
				if (type(property) == 'string') {
					if (!value && value !== 0)
						this.each(function(){ this.style.removeProperty(dasherize(property)) })
					else
						css = dasherize(property) + ":" + maybeAddPx(property, value)
				} else {
					for (key in property)
						if (!property[key] && property[key] !== 0)
							this.each(function(){ this.style.removeProperty(dasherize(key)) })
						else
							css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
				}

				return this.each(function(){ this.style.cssText += ';' + css })
			},
			index: function(element){
				return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
			},
			hasClass: function(name){
				if (!name) return false
				return emptyArray.some.call(this, function(el){
					return this.test(className(el))
				}, classRE(name))
			},
			addClass: function(name){
				if (!name) return this
				return this.each(function(idx){
					if (!('className' in this)) return
					classList = []
					var cls = className(this), newName = funcArg(this, name, idx, cls)
					newName.split(/\s+/g).forEach(function(klass){
						if (!$(this).hasClass(klass)) classList.push(klass)
					}, this)
					classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
				})
			},
			removeClass: function(name){
				return this.each(function(idx){
					if (!('className' in this)) return
					if (name === undefined) return className(this, '')
					classList = className(this)
					funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
						classList = classList.replace(classRE(klass), " ")
					})
					className(this, classList.trim())
				})
			},
			toggleClass: function(name, when){
				if (!name) return this
				return this.each(function(idx){
					var $this = $(this), names = funcArg(this, name, idx, className(this))
					names.split(/\s+/g).forEach(function(klass){
						(when === undefined ? !$this.hasClass(klass) : when) ?
							$this.addClass(klass) : $this.removeClass(klass)
					})
				})
			},
			scrollTop: function(value){
				if (!this.length) return
				var hasScrollTop = 'scrollTop' in this[0]
				if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
				return this.each(hasScrollTop ?
					function(){ this.scrollTop = value } :
					function(){ this.scrollTo(this.scrollX, value) })
			},
			scrollLeft: function(value){
				if (!this.length) return
				var hasScrollLeft = 'scrollLeft' in this[0]
				if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
				return this.each(hasScrollLeft ?
					function(){ this.scrollLeft = value } :
					function(){ this.scrollTo(value, this.scrollY) })
			},
			position: function() {
				if (!this.length) return

				var elem = this[0],
					// Get *real* offsetParent
					offsetParent = this.offsetParent(),
					// Get correct offsets
					offset       = this.offset(),
					parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

				// Subtract element margins
				// note: when an element has margin: auto the offsetLeft and marginLeft
				// are the same in Safari causing offset.left to incorrectly be 0
				offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
				offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

				// Add offsetParent borders
				parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
				parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

				// Subtract the two offsets
				return {
					top:  offset.top  - parentOffset.top,
					left: offset.left - parentOffset.left
				}
			},
			offsetParent: function() {
				return this.map(function(){
					var parent = this.offsetParent || document.body
					while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
						parent = parent.offsetParent
					return parent
				})
			}
		}

		// for now
		$.fn.detach = $.fn.remove

		// Generate the `width` and `height` functions
		;['width', 'height'].forEach(function(dimension){
			var dimensionProperty =
				dimension.replace(/./, function(m){ return m[0].toUpperCase() })

			$.fn[dimension] = function(value){
				var offset, el = this[0]
				if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
					isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
					(offset = this.offset()) && offset[dimension]
				else return this.each(function(idx){
					el = $(this)
					el.css(dimension, funcArg(this, value, idx, el[dimension]()))
				})
			}
		})

		function traverseNode(node, fun) {
			fun(node)
			for (var i = 0, len = node.childNodes.length; i < len; i++)
				traverseNode(node.childNodes[i], fun)
		}

		// Generate the `after`, `prepend`, `before`, `append`,
		// `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
		adjacencyOperators.forEach(function(operator, operatorIndex) {
			var inside = operatorIndex % 2 //=> prepend, append

			$.fn[operator] = function(){
				// arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
				var argType, nodes = $.map(arguments, function(arg) {
						var arr = []
						argType = type(arg)
						if (argType == "array") {
							arg.forEach(function(el) {
								if (el.nodeType !== undefined) return arr.push(el)
								else if ($.zepto.isZ(el)) return arr = arr.concat(el.get())
								arr = arr.concat(zepto.fragment(el))
							})
							return arr
						}
						return argType == "object" || arg == null ?
							arg : zepto.fragment(arg)
					}),
					parent, copyByClone = this.length > 1
				if (nodes.length < 1) return this

				return this.each(function(_, target){
					parent = inside ? target : target.parentNode

					// convert all methods to a "before" operation
					target = operatorIndex == 0 ? target.nextSibling :
						operatorIndex == 1 ? target.firstChild :
							operatorIndex == 2 ? target :
								null

					var parentInDocument = $.contains(document.documentElement, parent)

					nodes.forEach(function(node){
						if (copyByClone) node = node.cloneNode(true)
						else if (!parent) return $(node).remove()

						parent.insertBefore(node, target)
						if (parentInDocument) traverseNode(node, function(el){
							if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
								(!el.type || el.type === 'text/javascript') && !el.src){
								var target = el.ownerDocument ? el.ownerDocument.defaultView : window
								target['eval'].call(target, el.innerHTML)
							}
						})
					})
				})
			}

			// after    => insertAfter
			// prepend  => prependTo
			// before   => insertBefore
			// append   => appendTo
			$.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
				$(html)[operator](this)
				return this
			}
		})

		zepto.Z.prototype = Z.prototype = $.fn

		// Export internal API functions in the `$.zepto` namespace
		zepto.uniq = uniq
		zepto.deserializeValue = deserializeValue
		$.zepto = zepto

		return $
	})()

	// If `$` is not yet defined, point it to `Zepto`
	window.Zepto = Zepto
	window.$ === undefined && (window.$ = Zepto)
	//     Zepto.js
	//     (c) 2010-2016 Thomas Fuchs
	//     Zepto.js may be freely distributed under the MIT license.

	;(function($){
		var _zid = 1, undefined,
			slice = Array.prototype.slice,
			isFunction = $.isFunction,
			isString = function(obj){ return typeof obj == 'string' },
			handlers = {},
			specialEvents={},
			focusinSupported = 'onfocusin' in window,
			focus = { focus: 'focusin', blur: 'focusout' },
			hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

		specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

		function zid(element) {
			return element._zid || (element._zid = _zid++)
		}
		function findHandlers(element, event, fn, selector) {
			event = parse(event)
			if (event.ns) var matcher = matcherFor(event.ns)
			return (handlers[zid(element)] || []).filter(function(handler) {
				return handler
					&& (!event.e  || handler.e == event.e)
					&& (!event.ns || matcher.test(handler.ns))
					&& (!fn       || zid(handler.fn) === zid(fn))
					&& (!selector || handler.sel == selector)
			})
		}
		function parse(event) {
			var parts = ('' + event).split('.')
			return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
		}
		function matcherFor(ns) {
			return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
		}

		function eventCapture(handler, captureSetting) {
			return handler.del &&
				(!focusinSupported && (handler.e in focus)) ||
				!!captureSetting
		}

		function realEvent(type) {
			return hover[type] || (focusinSupported && focus[type]) || type
		}

		function add(element, events, fn, data, selector, delegator, capture){
			var id = zid(element), set = (handlers[id] || (handlers[id] = []))
			events.split(/\s/).forEach(function(event){
				if (event == 'ready') return $(document).ready(fn)
				var handler   = parse(event)
				handler.fn    = fn
				handler.sel   = selector
				// emulate mouseenter, mouseleave
				if (handler.e in hover) fn = function(e){
					var related = e.relatedTarget
					if (!related || (related !== this && !$.contains(this, related)))
						return handler.fn.apply(this, arguments)
				}
				handler.del   = delegator
				var callback  = delegator || fn
				handler.proxy = function(e){
					e = compatible(e)
					if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) return
					e.data = data
					var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
					if (result === false) e.preventDefault(), e.stopPropagation()
					return result
				}
				handler.i = set.length
				set.push(handler)
				if ('addEventListener' in element)
					element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
			})
		}
		function remove(element, events, fn, selector, capture){
			var id = zid(element)
				;(events || '').split(/\s/).forEach(function(event){
				findHandlers(element, event, fn, selector).forEach(function(handler){
					delete handlers[id][handler.i]
					if ('removeEventListener' in element)
						element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
				})
			})
		}

		$.event = { add: add, remove: remove }

		$.proxy = function(fn, context) {
			var args = (2 in arguments) && slice.call(arguments, 2)
			if (isFunction(fn)) {
				var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
				proxyFn._zid = zid(fn)
				return proxyFn
			} else if (isString(context)) {
				if (args) {
					args.unshift(fn[context], fn)
					return $.proxy.apply(null, args)
				} else {
					return $.proxy(fn[context], fn)
				}
			} else {
				throw new TypeError("expected function")
			}
		}

		$.fn.bind = function(event, data, callback){
			return this.on(event, data, callback)
		}
		$.fn.unbind = function(event, callback){
			return this.off(event, callback)
		}
		$.fn.one = function(event, selector, data, callback){
			return this.on(event, selector, data, callback, 1)
		}

		var returnTrue = function(){return true},
			returnFalse = function(){return false},
			ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
			eventMethods = {
				preventDefault: 'isDefaultPrevented',
				stopImmediatePropagation: 'isImmediatePropagationStopped',
				stopPropagation: 'isPropagationStopped'
			}

		function compatible(event, source) {
			if (source || !event.isDefaultPrevented) {
				source || (source = event)

				$.each(eventMethods, function(name, predicate) {
					var sourceMethod = source[name]
					event[name] = function(){
						this[predicate] = returnTrue
						return sourceMethod && sourceMethod.apply(source, arguments)
					}
					event[predicate] = returnFalse
				})

				event.timeStamp || (event.timeStamp = Date.now())

				if (source.defaultPrevented !== undefined ? source.defaultPrevented :
						'returnValue' in source ? source.returnValue === false :
						source.getPreventDefault && source.getPreventDefault())
					event.isDefaultPrevented = returnTrue
			}
			return event
		}

		function createProxy(event) {
			var key, proxy = { originalEvent: event }
			for (key in event)
				if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

			return compatible(proxy, event)
		}

		$.fn.delegate = function(selector, event, callback){
			return this.on(event, selector, callback)
		}
		$.fn.undelegate = function(selector, event, callback){
			return this.off(event, selector, callback)
		}

		$.fn.live = function(event, callback){
			$(document.body).delegate(this.selector, event, callback)
			return this
		}
		$.fn.die = function(event, callback){
			$(document.body).undelegate(this.selector, event, callback)
			return this
		}

		$.fn.on = function(event, selector, data, callback, one){
			var autoRemove, delegator, $this = this
			if (event && !isString(event)) {
				$.each(event, function(type, fn){
					$this.on(type, selector, data, fn, one)
				})
				return $this
			}

			if (!isString(selector) && !isFunction(callback) && callback !== false)
				callback = data, data = selector, selector = undefined
			if (callback === undefined || data === false)
				callback = data, data = undefined

			if (callback === false) callback = returnFalse

			return $this.each(function(_, element){
				if (one) autoRemove = function(e){
					remove(element, e.type, callback)
					return callback.apply(this, arguments)
				}

				if (selector) delegator = function(e){
					var evt, match = $(e.target).closest(selector, element).get(0)
					if (match && match !== element) {
						evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
						return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
					}
				}

				add(element, event, callback, data, selector, delegator || autoRemove)
			})
		}
		$.fn.off = function(event, selector, callback){
			var $this = this
			if (event && !isString(event)) {
				$.each(event, function(type, fn){
					$this.off(type, selector, fn)
				})
				return $this
			}

			if (!isString(selector) && !isFunction(callback) && callback !== false)
				callback = selector, selector = undefined

			if (callback === false) callback = returnFalse

			return $this.each(function(){
				remove(this, event, callback, selector)
			})
		}

		$.fn.trigger = function(event, args){
			event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
			event._args = args
			return this.each(function(){
				// handle focus(), blur() by calling them directly
				if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
				// items in the collection might not be DOM elements
				else if ('dispatchEvent' in this) this.dispatchEvent(event)
				else $(this).triggerHandler(event, args)
			})
		}

		// triggers event handlers on current element just as if an event occurred,
		// doesn't trigger an actual event, doesn't bubble
		$.fn.triggerHandler = function(event, args){
			var e, result
			this.each(function(i, element){
				e = createProxy(isString(event) ? $.Event(event) : event)
				e._args = args
				e.target = element
				$.each(findHandlers(element, event.type || event), function(i, handler){
					result = handler.proxy(e)
					if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) return false
				})
			})
			return result
		}

		// shortcut methods for `.bind(event, fn)` for each event type
		;('focusin focusout focus blur load resize scroll unload click dblclick '+
		'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
		'change select keydown keypress keyup error').split(' ').forEach(function(event) {
			$.fn[event] = function(callback) {
				return (0 in arguments) ?
					this.bind(event, callback) :
					this.trigger(event)
			}
		})

		$.Event = function(type, props) {
			if (!isString(type)) props = type, type = props.type
			var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
			if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
			event.initEvent(type, bubbles, true)
			return compatible(event)
		}

	})(Zepto)
	/* eslint-enable */

	var x = Zepto;

	(function() {
		var counters={};
		x.call_counter = function(funcname, args) {
			args = args || "";
			var id = funcname+"("+args+")";
			counters[id] = (counters[id]||0) + 1;
			if (counters[id]%50===0) {
				x.log("X Calls ["+counters[id]+": "+id);
			}
		}
	})();

		// Zepto extensions
	x.fn.innerText = function(nodeFilter_obj, joiner) {
		if (!(0 in this)) { return null; }
		joiner = (typeof joiner == 'string') ? joiner : ' ';
		return x.map(this, function(el) {
			var node, text = [];
			var whatToShow = nodeFilter_obj ? NodeFilter.SHOW_ALL : NodeFilter.SHOW_TEXT;
			var walker = document.createTreeWalker(el, whatToShow, nodeFilter_obj, false);
			while (node = walker.nextNode()) {
				text.push(node.nodeValue);
			}
			return text.join(joiner);
		}).join(joiner).replace(/\n+/g, joiner);
	};
	// Get the text content of only this node, not child nodes
	x.fn.shallowText = function(joiner) {
		if (!(0 in this)) { return null; }
		joiner = (typeof joiner == 'string') ? joiner : ' ';
		return x.map(this, function(el) {
			if (!el.childNodes) { return ''; }
			var text = [], children=el.childNodes;
			for (var i=0; i<children.length; i++) {
				var child = children[i];
				if (3===child.nodeType) {
					text.push(child.nodeValue);
				}
			}
			return text.join(joiner);
		}).join(joiner).replace(/\n+/g, joiner);
	};
	x.fn.outerHTML = function() {
		if (!(0 in this)) { return null; }
		return x('<div>').append(this[0].cloneNode(true)).html();
	};
	x.fn.tagHTML = function() {
		return x('<div>').append(this[0].cloneNode(false)).html().replace(/>.*/,'>');
	};
	x.fn.select = function(copy) {
		if (!(0 in this)) { return null; }
		var el = this[0];
		if (window.getSelection && document.createRange) { //Browser compatibility
			var s = window.getSelection();
			setTimeout(function(){
				var r = document.createRange();
				r.selectNodeContents(el);
				s.removeAllRanges();
				s.addRange(r);
				if (copy) {
					x.clipboard.copy();
				}
			},1);
		}
	};

	// Are we running in the page context or extension context?
	x.pagecontext = args.pagecontext || false;

	// Set an attribute on an Object using a possible deeply-nested path
	// Stole this from lodash _.set(object, path, value)
	// eslint-disable-next-line
	x.set=(function(){var h='[object Array]',g='[object Function]',p='[object String]';var k=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,m=/^\w*$/,l=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;var o=/\\(\\)?/g;var q=/^\d+$/;function n(b){return b==null?'':(b+'')}function f(b){return!!b&&typeof b=='object'}var j=Object.prototype;var b=j.toString;var d=9007199254740991;function r(b,c){b=(typeof b=='number'||q.test(b))?+b:-1;c=c==null?d:c;return b>-1&&b%1==0&&b<c}function t(b,d){var c=typeof b;if((c=='string'&&m.test(b))||c=='number'){return true}if(e(b)){return false}var f=!k.test(b);return f||(d!=null&&b in i(d))}function v(b){return typeof b=='number'&&b>-1&&b%1==0&&b<=d}function i(b){return c(b)?b:Object(b)}function s(b){if(e(b)){return b}var c=[];n(b).replace(l,function(d,b,f,e){c.push(f?e.replace(o,'$1'):(b||d))});return c}var e=function(c){return f(c)&&v(c.length)&&b.call(c)==h};function w(d){return c(d)&&b.call(d)==g}function c(c){var b=typeof c;return!!c&&(b=='object'||b=='function')}function x(c){return typeof c=='string'||(f(c)&&b.call(c)==p)}function u(e,d,k){if(e==null){return e}var i=(d+'');d=(e[i]!=null||t(d,e))?[i]:s(d);var f=-1,h=d.length,j=h-1,b=e;while(b!=null&&++f<h){var g=d[f];if(c(b)){if(f==j){b[g]=k}else if(b[g]==null){b[g]=r(d[f+1])?[]:{}}}b=b[g]}return e}return u})();

	// Test if a property is defined.
	x.def=function(o) {
		return typeof o!="undefined";
	};

	// Simple Pub/Sub
	x.pubsub_handlers = {};
	x.pubsub_messages = {}; // A list of all messages
	x.publish = function(event,data,republish,persist_messages) {
		if (typeof republish!="boolean") { republish=true; }
		if (typeof persist_messages!="boolean") { persist_messages=true; }
		data = data || {};
		var funcs = x.pubsub_handlers[event];
		if (funcs) {
			funcs.forEach(function(f) {
				try {
					f.call(x,event,data);
				} catch(e) {
					console.log(e);
				}
			});
		}
		// If we are running in the page context, send a message back to the extension code
		if (republish) {
			// Clone data before posting, to make sure that object references are not passed
			try {
				// If the data has refs to React elements, circular refs will cause this to fail. Ignore it.
				window.postMessage( {"sfx":true, "pagecontext":x.pagecontext, "message": { "event":event, "data":x.clone(data) } } , "*");
			}
			catch(e) { }
		}
		// Store this message in case a subscriber appears later and wants all past messages?
		if (persist_messages) {
			x.pubsub_messages[event] = x.pubsub_messages[event] || [];
			var messages = x.pubsub_messages[event];
			messages.push( {"event":event, "data":data} );
		}
	};
	// TODO: Wildcard subscriptions
	x.subscribe = function(event,func,receive_past_messages) {
		if (typeof receive_past_messages!="boolean") { receive_past_messages=false; }
		var events = (typeof event=="string") ? [event] : event;
		events.forEach(function(ev) {
			if (typeof x.pubsub_handlers[ev]=="undefined") {
				x.pubsub_handlers[ev]=[];
			}
			x.pubsub_handlers[ev].push(func);
			// If past messages are requested, fire this function for each of the past messages
			if (receive_past_messages) {
				var messages = x.pubsub_messages[ev];
				if (typeof messages!="undefined") {
					messages.forEach(function(msg) {
						func.call(x,msg.event,msg.data);
					});
				}
			}
		});
	};
	// Allow for passing of messages between extension and page contexts, using window.postMessage
	window.addEventListener('message', function(event) {
		if (event.data.sfx && event.data.pagecontext!=x.pagecontext) {
			// A message has been received from the other context
			x.publish(event.data.message.event, event.data.message.data, false);
		}
	});

	// A Generalized storage/persistence mechanism
	var ls = window.localStorage;
	x.storage = {
		"prefix":null,
		"data":{}, // keys are options, stats, etc
		"set":function(key,prop,val,callback,save) {
			// update stored value in memory
			if (typeof x.storage.data[key]=="undefined") {
				x.storage.data[key] = {};
			}
			var container = x.storage.data[key];
			// Single value set
			if (typeof prop!="object" && (typeof callback=="undefined"||typeof callback=="function"||callback==null)) {
				x.storage.set_or_delete(container,prop,val);
			}
			// Multiset
			else if (typeof prop=="object" && (typeof val=="undefined"||typeof val=="function")) {
				save=callback;
				callback = val;
				var prop2;
				for (prop2 in prop) {
					x.storage.set_or_delete(container,prop2,prop[prop2]);
				}
			}
			else {
			}
			if (false!==save) {
				x.storage.save(key, null, callback);
			}
			else if (typeof callback=="function") {
				callback(key,null);
			}
		},
		"set_or_delete":function(container,prop,val) {
			// Delete a value by setting it to undefined
			if (prop in container && typeof val=="undefined") {
				delete container[prop];
			}
			else {
				x.set(container, prop, val);
			}
		},
		"save":function(key,val,callback) {
			if (val==null && typeof x.storage.data[key]!="undefined") {
				val = x.storage.data[key];
			}
			else {
				x.storage.data[key] = val;
			}
			// persist
			Extension.storage.set(key, val, function (key, val, ret) {
				// post to localstorage to trigger updates in other windows
				var o = {"time": x.now(), "key": key};
				ls.setItem('x-storage', JSON.stringify(o));
				// Call the callback
				if (typeof callback == "function") {
					callback(key, val, ret);
				}
			}, (x.storage.prefix != null ? x.storage.prefix + '/' : ''));
		},
		"get":function(keys, defaultValue, callback, use_cache) {
			if (!!use_cache && typeof keys=="string" && typeof x.storage.data[keys]!="undefined") {
				if (typeof callback=="function") { return callback(x.storage.data[keys]); }
			}
			// TODO: Get multi values from cache!
			Extension.storage.get(keys, defaultValue, function(values,err) {
				var key, i;
				if (!err) {
					// Store the data in memory
					if (typeof keys == "string") {
						// Single value
						if (typeof x.storage.data[keys] == "undefined") {
							x.storage.update(keys, values);
						}
					} else {
						// Multi value
						for (i = 0; i < keys.length; i++) {
							key = keys[i];
							x.storage.update(key, values[key]);
						}
					}
				}
				if (typeof callback=="function") {
					callback(values,err);
				}
			}, (x.storage.prefix!=null?x.storage.prefix+'/':'') );
		},
		"refresh":function(key,callback) {
			if (typeof x.storage.data[key]!="undefined") {
				x.storage.get(key, null, callback, false);
			}
		}
		,"update":function(key,value) {
			x.storage.data[key] = value;
		}
	};
	// Use localStorage to communicate storage changes between windows and tabs.
	// Changes to localStorage trigger the 'storage' event in other windows on the same site.
	if (!x.pagecontext) {
		window.addEventListener('storage', function (e) {
			if ("x-storage"==e.key && e.newValue) {
				var json;
				try {
					json = JSON.parse(e.newValue); // {"time":123,"key":"key_name"}
					if (json.key) {
						x.storage.refresh(json.key, function(data) {
							// Publish a message
							x.publish("storage/refresh", {"key":json.key,"data":data});
						});
					}
				} catch(err) {
					console.log('storage event',e,'error',err,'json',json);
				}
			}
		},true);
	}

	// Sanitize HTML using the DOMPurify library, if available
	x.sanitize = function(html) {
		return (typeof DOMPurify!="undefined" ? DOMPurify.sanitize(html) : html);
	};
	x.fn.safe_html = function(html) {
		html = x.sanitize(html);
		return this.each(function(){ x(this).html(html); });
	};


	// http/ajax
	x.ajax = function(urlOrObject,callback) {
		// TODO: Allow for ajax from pagecontext
		Extension.ajax(urlOrObject,function(content,status,headers) {
			if (headers && /application\/json/.test(headers['content-type'])) {
				content = JSON.parse(content);
			}
			callback(content,status);
		});
	};

	x.ajax_dom = function(urlOrObject, callback) {
		x.ajax(urlOrObject, function(data) {
			var $dom = x('<div>');
			try {
				$dom.append(data);
			}
			catch(e) {}
			callback($dom);
		});
	};

	// css
	x.css = function(css,id) {
		x.when('head',function($head) {
			var s;
			if (id) {
				s = document.getElementById(id);
				if (s) {
					if (css) {
						s.textContent = css;
					}
					else {
						x(s).remove();
					}
					return;
				}
			}
			s = document.createElement('style');
			s.textContent = css;
			if (id) {
				s.id=id;
			}
			$head.append(s);
		});

	};

	// function execution in a <script> block (in page context)
	x.inject = function(code,args,windowVar) {
		if (!document || !document.createElement || !document.documentElement || !document.documentElement.appendChild) { return false; }
		var s = document.createElement('script');
		s.type = 'text/javascript';
		args = JSON.stringify(args||{});
		var result = windowVar?'window.'+windowVar+'=':'';
		code = result+'('+code.toString()+')('+args+');';
		if (windowVar) {
			// Post a window notification saying this variable is now defined
			code += 'window.postMessage({"sfxready":"'+windowVar+'"} , "*");';
		}
		s.text = code;
		document.documentElement.appendChild(s);
		s.parentNode.removeChild(s);
		return true;
	};

	// POLLING
	// Call a function repeatedly until it doesn't throw an exception or returns non-false
	x.poll = function(func,interval,max){
		x.call_counter("poll",func.toString().substring(10));
		interval=interval||500;
		max=max||50;
		var count=0;
		var f=function(){
			if(count++>max){return;}
			try{
				if (func(count)===false){
					setTimeout(f,interval);
				}
			}
			catch(e){
				setTimeout(f,interval);
			}
		};
		f();
	};
	// A function that executes a function only when a selector returns a result
	x.when = function(selector, func, interval, max) {
		// Keep default from previous implementation, but now allow for limits
		interval = interval || 200;
		max = max || 999999999;
		x.poll(function() {
			x.call_counter("when", selector);
			var $results = x(selector);
			if ($results.length > 0) {
				func($results);
			} else {
				return false;
			}
		},interval,max);
	};

	// Cookies
	x.cookie = {
		'get':function(n) {
			try {
				return unescape(document.cookie.match('(^|;)?'+n+'=([^;]*)(;|$)')[2]);
			} catch(e) {
				return null;
			}
		},
		'set':function() {}
	};

	// Logging
	x.logs = [];
	x.log = function(){
		if (arguments && arguments.length>0) {
			// Default meta-data
			var data = {"module":null, "color":"black"};
			var i=0;
			var info = arguments[0];
			var args = [];
			if (typeof info=="object" && info!=null && (info.module||info.color)) {
				// Meta-data about the logging
				i=1;
				data.module = info.module || data.module;
				data.level = info.level || data.level;
				data.color = info.color || data.color;
			}
			for (; i < arguments.length; i++) {
				if (typeof arguments[i] == "object") {
					args.push(JSON.stringify(arguments[i], null, 3));
				}
				else if (typeof arguments[i]!="undefined") {
					args.push(arguments[i]);
				}
			}
			data.log = args;
			data.timestamp = (new Date()).getTime();
			x.logs.push(data);
			x.publish("log/entry",data,false,false);
		}
	};
	// Get a module-specific logger for use in modules
	x.logger = function(label,props) {
		var info = props || {};
		info.module = label;
		return function(a,b,c,d,e,f,g) {
			x.log.call(x,info,a,b,c,d,e,f,g);
		}
	};
	x.alert = function(msg) {
		if (typeof msg=="object") { msg=JSON.stringify(msg,null,3); }
		alert(msg);
	};

	// A "bind" function to support event capture mode
	x.bind = function(el, ev, func, capture) {
		if (typeof el == "string") {
			el = x(el);
			if (!el || el.length<1) { return ; }
			el = el[0];
		}
		else {
			el = X(el)[0];
		}
		if (typeof capture != "boolean") {
			capture = false;
		}
		if (el && el.addEventListener) {
			el.addEventListener(ev, func, capture);
		}
	};
	x.capture = function(el,ev,func) {
		x.bind(el,ev,func,true);
	};

	// A backwards-compatible replacement for the old QSA() function
	x.QSA = function(context,selector,func) {
		if (typeof selector=="function") {
			func=selector;
			selector=context;
			context=document;
		}
		x(selector,context).each(function() {
			func(this);
		});
	};

	// A util method to find a single element matching a selector
	x.find = function(selector) {
		var o = x(selector);
		return (o.length>0) ? o[0] : null;
	};

	// Find the real target of an event
	x.target = function(e,wrap){ var t=e.target; if (t.nodeType == 3){t=t.parentNode;} return wrap?x(t):t; };
	x.parent = function(el){ if(el&&el.parentNode) { return el.parentNode; } return null; };

	// A util method to clone a simple object
	x.clone = function(o) { if (!o) { return o; } return JSON.parse(JSON.stringify(o)); };

	// Some useful string methods
	x.match = function (str, regex, func) {
		if (typeof str != "string") {
			return null;
		}
		var m = str.match(regex);
		if (m && m.length) {
			if (typeof func == "function") {
				for (var i = regex.global ? 0 : 1; i < m.length; i++) {
					func(m[i]);
				}
				return m;
			} else {
				return m.length > 1 ? m[regex.global ? 0 : 1] : null;
			}
		}
		return null;
	};

	// Get a timestamp
	x.time = function() { return Date.now(); };
	x.now = x.time;
	x.today = function() {
		var d = new Date();
		return d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
	};
	// Express a timestamp as a relative time "ago"
	x.ago = function(when, now, shortened, higher_resolution) {
		now = now || x.now();
		if (typeof shortened!="boolean") { shortened=true; }
		var diff = "";
		var delta = (now - when);
		var seconds = delta / x.seconds;
		if (seconds < 60) {
			return "just now";
		}
		var days = Math.floor(delta / x.days);
		if (days > 0) {
			diff += days+" day"+(days>1?"s":"")+" ";
			delta -= (days*x.days);
		}

		var hours = Math.floor(delta / x.hours );
		if (hours>0 && (higher_resolution || !diff)) {
			diff += hours + " " + (shortened ? "hr" : "hours")+" ";
			delta -= (hours*x.hours);
		}

		var minutes = Math.floor(delta / x.minutes);
		if (minutes>0 && (!diff || (higher_resolution && days<1))) {
			diff += minutes + " " + (shortened ? "mins" : "minutes") + " ";
		}
		if (!diff) {
			diff = "a while ";
		}
		return diff+"ago";
	};

	// Recurring tasks execute only at certain intervals
	x.seconds = 1000;
	x.minutes = x.seconds * 60;
	x.hours = x.minutes * 60;
	x.days = x.hours * 24;
	x.task = function(key, frequency, callback, elsecallback) {
		// Internally store the state of each task in a user pref
		x.storage.get('tasks',{},function(tasks) {
			if (typeof tasks[key]=="undefined") {
				tasks[key] = {"run_on": null};
			}
			var t = tasks[key];
			var now = x.now();
			// If we are past due, update the task and execute the callback
			if (!t.run_on || ((t.run_on+frequency) < now)) {
				t.run_on = now;
				x.storage.set('tasks',key, t, function() {
					callback();
				});
			}
			else if (typeof elsecallback=="function") {
				elsecallback(t.run_on);
			}
		},true);
	};

	// Semver Compare
	x.semver_compare = function (a, b) {
		var pa = a.split('.');
		var pb = b.split('.');
		for (var i = 0; i < 3; i++) {
			var na = Number(pa[i]);
			var nb = Number(pb[i]);
			if (na > nb) return 1;
			if (nb > na) return -1;
			if (!isNaN(na) && isNaN(nb)) return 1;
			if (isNaN(na) && !isNaN(nb)) return -1;
		}
		return 0;
	};

	// UI methods to simulate user actions
	x.ui = {
		"click": function(selector,bubble) {
			if (typeof bubble != "boolean") {
				bubble = true;
			}
			x(selector).each(function() {
				var e = document.createEvent('MouseEvents');
				e.initEvent('click', bubble, true, window, 0);
				this.dispatchEvent(e);
			});
		},
		"keypress": function(selector,code,type) {
			type = type || "keypress";
			x(selector).each(function() {
				var e = document.createEvent('KeyboardEvent');
				if (typeof code == "string") {
					code = code.charCodeAt(0);
				}
				if (e.initKeyboardEvent) {
					e.initKeyboardEvent(type, true, true, window, code, null, null);
				}
				else if (e.initKeyEvent) {
					e.initKeyEvent(type, true, true, window, false, false, false, false, false, code);
				}
				this.dispatchEvent(e);
			});
		},
		"scroll":function(pixels,el) {
			var $el = X(el || window);
			var scrollTop = $el.scrollTop();
			if (typeof scrollTop=="number") {
				$el.scrollTop(scrollTop+pixels);
			}
		},
		"mouseover":function(el) {
			//el.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
			el.dispatchEvent(new PointerEvent('pointerover', {bubbles: true}));
		}
	};

	// Draggable Objects
	x.draggable = function(el,dragend) {
		var $el = X(el);
		el = $el[0];
		$el.attr('draggable',true);
		var $undraggables = $el.find('*[draggable="false"]');
		if ($undraggables.length>0) {
			$undraggables.css({'cursor': 'auto'}).mouseenter(function() {$el.attr('draggable',false);}).mouseleave(function(e) {$el.attr('draggable',true);});
		}
		$el.on('dragstart',function(ev) {
			x.draggable.dragend = dragend;
			ev.dataTransfer.setData("text/plain",(el.offsetLeft - ev.clientX) + ',' + (el.offsetTop - ev.clientY));
			x.draggable.target = el;
		});
	};
	x.draggable.target = null;
	x.draggable.dragend = null;
	x(window).on('dragover',function(ev) {
		if (x.draggable.target) {
			ev.preventDefault();
			return false;
		}
	}).on('drop',function(ev){
		if (x.draggable.target) {
			var offset = ev.dataTransfer.getData("text/plain").split(',');
			var $el = x(x.draggable.target);
			var left = (ev.clientX + +offset[0]);
			if (left<0) { left=0; }
			var top = (ev.clientY + +offset[1]);
			if (top<0) { top=0; }
			$el.css('left', left + 'px');
			$el.css('top', top + 'px');
			$el.css('right', 'auto');
			$el.css('bottom', 'auto');
			ev.preventDefault();
			x.draggable.target = null;
			if (typeof x.draggable.dragend=="function") {
				x.draggable.dragend($el,left,top);
			}
			return false;
		}
	});
	// ELEMENT CREATION
	//
	// Create a document fragment, then optionally run a function with it as an argument
	x.fragment = function(html,func) {
		var frag = document.createDocumentFragment();
		var div = document.createElement('div');
		var selector;
		div.innerHTML = x.sanitize(html);
		while(div && div.firstChild) {
			frag.appendChild( div.firstChild );
		}
		if (typeof func=="function") {
			func(frag);
		}
		else if (typeof func=="object") {
			for (selector in func) {
				click(QS(frag,selector),func[selector],true,true);
			}
		}
		return frag;
	};

	// Observe DOM Changes
	x.on_attribute_change = function(el,attr,callback) {
		(new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (!attr || (mutation.attributeName==attr && el.getAttribute(attr)!=mutation.oldValue)) {
					callback(mutation.attributeName, mutation.oldValue, mutation.target[mutation.attributeName]);
				}
			});
		})).observe(el, {attributes: true, attributeOldValue: true});
	};
	x.on_childlist_change = function(el,callback) {
		(new MutationObserver(function(records) {
			for (var i=0; i<records.length; i++) {
				var r = records[i];
				if (r.type!=="childList" || !r.addedNodes || !r.addedNodes.length) { continue; }
				var added = r.addedNodes;
				for (var j=0; j<added.length; j++) {
					callback(added[j]);
				}
			}
		})).observe(el, { childList: true, subtree: true });
	};

	x.return_false = function(){return false;};

	x.is_document_ready = function() {
		if(document && document.readyState) { return (document.readyState=="interactive"||document.readyState=="complete"); }
		return (document && document.getElementsByTagName && document.getElementsByTagName('BODY').length>0);
	};

	// Notes to be emitted in any sort of Support report
	x.support_note = function(who, what) {
		if (typeof x.support_notes == "undefined") {
			x.support_notes = {};
		}
		x.support_notes[who] = { who: who, what: what, when: x.now() };
		x.log(who, what);
	};

	x.getContentValue = function(node,style) {
		if (!style || !style.content || style.content==='none') return '';
		var content = style.content || '';
		content=content.replace(/\s*attr\(([^)]+)\)\s*/g, function(x,m) {
			var a = node.getAttribute(m);
			return a ? '"' + a + '"' : '';
		});
		// Unquote quoted strings
		content = content.replace(/"(.*?[^\\])"/g,'$1');
		content = content.replace(/\\"/g,'"');
		return content;
	};

	x.getNodeVisibleText = function(node) {
		var val = "";
		if (!node || !node.nodeType) {
			return val;
		}
		if (node.nodeType===3) {
			return node.nodeValue.replace(/\n+/g," ");
		}
		if (node.nodeType!==1) { return val; }
		// Make sure it's not hidden
		var st = getComputedStyle(node);
		if (('none'===st.display)
			|| ('hidden'===st.visibility)
			|| ('absolute'===st.position)
			|| ('fixed'===st.position)
			//|| (typeof st.opacity!=='undefined' && st.opacity < 0.1)
			|| (typeof st.fontSize!=='undefined' && st.fontSize !== 'auto' && parseFloat(st.fontSize) < 3.5)
			//|| (typeof st.height!='undefined' && st.height !== 'auto' && parseFloat(st.height) < 2)
			|| (typeof st.width!=='undefined' && st.width !== 'auto' && parseFloat(st.width) < 2)
		//|| (typeof st.left!=='undefined' && st.left !== 'auto' && (parseFloat(st.left) < -1000 || parseFloat(st.left) > 1500))
		//|| (typeof st.marginLeft!=='undefined' && st.marginLeft !== 'auto' && (parseFloat(st.marginLeft) < -1000 || parseFloat(st.marginLeft) > 1500))
		//|| (typeof st.right!=='undefined' && st.right != 'auto' && (parseFloat(st.right) > 1000 || parseFloat(st.right) < -1500))
		//|| (typeof st.lineHeight!=='undefined' && st.lineHeight !== 'normal' && parseFloat(st.lineHeight) < 2)
		)
		{
			return '';
		}
		// Get the :before content, if any
		var before_content = x.getContentValue(node, getComputedStyle(node,"::before"));
		before_content = before_content.replace(/^"(.*)"$/,"$1");
		val += before_content;

		// Process child nodes, including text
		var children = node.childNodes;
		if (children && children.length) {
			for (var i=0; i<children.length; i++) {
				val += x.getNodeVisibleText(children[i]);
			}
		}

		// Get the :after content, if any
		var after_content = x.getContentValue(node, getComputedStyle(node,"::after"));
		after_content = after_content.replace(/^"(.*)"$/,"$1");
		val += after_content;

		return val;
	};

	x.clipboard = {
		// Copies whatever is passed or selected on screen
		copy: function(txt) {
			try {
				if (!txt) {
					txt = window.getSelection().toString();
				}
				if (!txt) {
					return;
				}
				if (navigator && navigator.clipboard) {
					return navigator.clipboard.writeText(txt);
				} else if (document.execCommand) {
					document.execCommand("copy");
				}
			} catch(e) {
				x.log("Could not copy text: "+e.toString());
			}
		}
	};

	// A "Ready" queue of functions to run once the event is triggered
	x.ready = (function() {
		var queue=[];
		var ready=false;
		var fire = function(o) {
			try {
				o.func();
			}
			catch(e) {
				x.log("Error in module: "+o.label);
			}
		};
		return function(label,f) {
			if (typeof label=="undefined") {
				// No arg passed, fire the queue
				ready = true;
				queue.forEach(function(o) {
					fire(o);
				});
				queue=[];
				return;
			}
			if (typeof label=="function") {
				f=label;
				label=null;
			}
			if (typeof f=="function") {
				f.label = label;
				var o = {"label":label, "func":f};
				if (ready) {
					fire(o);
				}
				else {
					queue.push( o );
				}
			}
		};
	})();

	// beforeReady() allows modules to halt execution or do things before normal execution
	x.beforeReady = (function() {
		var i,queue=[];
		return function(f) {
			if (typeof f!="function") {
				// fire the queue
				for (i=0; i<queue.length; i++) {
					if (queue[i](f)===false) {
						return false;
					}
				}
			}
			else {
				queue.push( f );
			}
		};
	})();

	// A text-based query that can run methods, not just selectors
	x.query = function(q,run_funcs_for_each_element) {
		run_funcs_for_each_element = run_funcs_for_each_element || true;
		var i,j ;
		// If this query doesn't need special processings, just run it as a CSS selector
		//if (typeof q!="string" || !/\|/.test(q)) { return x(q); }
		var parts = q.split("|");
		var n = parts.length;
		var $els = x(parts[0]);
		var $collections = [];
		for (i=0; i<$els.length; i++) {
			$collections.push(X($els[i]));
		}
		var args=[];
		var part = null;
		for (i=1; i<n; i++) {
			args = [];
			part = parts[i];
			// Parse out function arguments
			part = part.replace(/\((.*?)\)/, function(m,m1) {
				args = (m1||'').split(/,/);
				return '';
			});
			if (typeof x.fn[part]!="function") { throw "Invalid X function: "+part; }
			if (run_funcs_for_each_element) {
				for (j=0; j<$collections.length; j++) {
					var $el = $collections[j];
					$collections[j] = X($el)[part].apply($el,args);
				}
			}
			else {
				$els = $els[part].apply($els, args);
			}
		}
		if (run_funcs_for_each_element) {
			return $collections;
		}
		return $els;
	};

	return x;
};
var X = XLib();
/*
// Causes a bug in Facebook Settings when injected. Not needed yet anyway.
X.when('head',function() {
	X.inject(XLib,{pagecontext:true},'X');
});
*/


/*!
 * Vue.js v1.0.28
 * (c) 2016 Evan You
 * Released under the MIT License.
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.Vue=e()}(this,function(){"use strict";function t(e,n,r){if(i(e,n))return void(e[n]=r);if(e._isVue)return void t(e._data,n,r);var s=e.__ob__;if(!s)return void(e[n]=r);if(s.convert(n,r),s.dep.notify(),s.vms)for(var o=s.vms.length;o--;){var a=s.vms[o];a._proxy(n),a._digest()}return r}function e(t,e){if(i(t,e)){delete t[e];var n=t.__ob__;if(!n)return void(t._isVue&&(delete t._data[e],t._digest()));if(n.dep.notify(),n.vms)for(var r=n.vms.length;r--;){var s=n.vms[r];s._unproxy(e),s._digest()}}}function i(t,e){return Mi.call(t,e)}function n(t){return Wi.test(t)}function r(t){var e=(t+"").charCodeAt(0);return 36===e||95===e}function s(t){return null==t?"":t.toString()}function o(t){if("string"!=typeof t)return t;var e=Number(t);return isNaN(e)?t:e}function a(t){return"true"===t||"false"!==t&&t}function h(t){var e=t.charCodeAt(0),i=t.charCodeAt(t.length-1);return e!==i||34!==e&&39!==e?t:t.slice(1,-1)}function l(t){return t.replace(Vi,c)}function c(t,e){return e?e.toUpperCase():""}function u(t){return t.replace(Bi,"$1-$2").replace(Bi,"$1-$2").toLowerCase()}function f(t){return t.replace(zi,c)}function p(t,e){return function(i){var n=arguments.length;return n?n>1?t.apply(e,arguments):t.call(e,i):t.call(e)}}function d(t,e){e=e||0;for(var i=t.length-e,n=new Array(i);i--;)n[i]=t[i+e];return n}function v(t,e){for(var i=Object.keys(e),n=i.length;n--;)t[i[n]]=e[i[n]];return t}function m(t){return null!==t&&"object"==typeof t}function g(t){return Ui.call(t)===Ji}function _(t,e,i,n){Object.defineProperty(t,e,{value:i,enumerable:!!n,writable:!0,configurable:!0})}function y(t,e){var i,n,r,s,o,a=function a(){var h=Date.now()-s;h<e&&h>=0?i=setTimeout(a,e-h):(i=null,o=t.apply(r,n),i||(r=n=null))};return function(){return r=this,n=arguments,s=Date.now(),i||(i=setTimeout(a,e)),o}}function b(t,e){for(var i=t.length;i--;)if(t[i]===e)return i;return-1}function w(t){var e=function e(){if(!e.cancelled)return t.apply(this,arguments)};return e.cancel=function(){e.cancelled=!0},e}function C(t,e){return t==e||!(!m(t)||!m(e))&&JSON.stringify(t)===JSON.stringify(e)}function $(t){return/native code/.test(t.toString())}function k(t){this.size=0,this.limit=t,this.head=this.tail=void 0,this._keymap=Object.create(null)}function x(){return fn.charCodeAt(vn+1)}function A(){return fn.charCodeAt(++vn)}function O(){return vn>=dn}function T(){for(;x()===Tn;)A()}function N(t){return t===kn||t===xn}function j(t){return Nn[t]}function E(t,e){return jn[t]===e}function S(){for(var t,e=A();!O();)if(t=A(),t===On)A();else if(t===e)break}function F(t){for(var e=0,i=t;!O();)if(t=x(),N(t))S();else if(i===t&&e++,E(i,t)&&e--,A(),0===e)break}function D(){for(var t=vn;!O();)if(mn=x(),N(mn))S();else if(j(mn))F(mn);else if(mn===An){if(A(),mn=x(),mn!==An){gn!==bn&&gn!==$n||(gn=wn);break}A()}else{if(mn===Tn&&(gn===Cn||gn===$n)){T();break}gn===wn&&(gn=Cn),A()}return fn.slice(t+1,vn)||null}function P(){for(var t=[];!O();)t.push(R());return t}function R(){var t,e={};return gn=wn,e.name=D().trim(),gn=$n,t=L(),t.length&&(e.args=t),e}function L(){for(var t=[];!O()&&gn!==wn;){var e=D();if(!e)break;t.push(H(e))}return t}function H(t){if(yn.test(t))return{value:o(t),dynamic:!1};var e=h(t),i=e===t;return{value:i?t:e,dynamic:i}}function I(t){var e=_n.get(t);if(e)return e;fn=t,pn={},dn=fn.length,vn=-1,mn="",gn=bn;var i;return fn.indexOf("|")<0?pn.expression=fn.trim():(pn.expression=D().trim(),i=P(),i.length&&(pn.filters=i)),_n.put(t,pn),pn}function M(t){return t.replace(Sn,"\\$&")}function W(){var t=M(Mn.delimiters[0]),e=M(Mn.delimiters[1]),i=M(Mn.unsafeDelimiters[0]),n=M(Mn.unsafeDelimiters[1]);Dn=new RegExp(i+"((?:.|\\n)+?)"+n+"|"+t+"((?:.|\\n)+?)"+e,"g"),Pn=new RegExp("^"+i+"((?:.|\\n)+?)"+n+"$"),Fn=new k(1e3)}function V(t){Fn||W();var e=Fn.get(t);if(e)return e;if(!Dn.test(t))return null;for(var i,n,r,s,o,a,h=[],l=Dn.lastIndex=0;i=Dn.exec(t);)n=i.index,n>l&&h.push({value:t.slice(l,n)}),r=Pn.test(i[0]),s=r?i[1]:i[2],o=s.charCodeAt(0),a=42===o,s=a?s.slice(1):s,h.push({tag:!0,value:s.trim(),html:r,oneTime:a}),l=n+i[0].length;return l<t.length&&h.push({value:t.slice(l)}),Fn.put(t,h),h}function B(t,e){return t.length>1?t.map(function(t){return z(t,e)}).join("+"):z(t[0],e,!0)}function z(t,e,i){return t.tag?t.oneTime&&e?'"'+e.$eval(t.value)+'"':U(t.value,i):'"'+t.value+'"'}function U(t,e){if(Rn.test(t)){var i=I(t);return i.filters?"this._applyFilters("+i.expression+",null,"+JSON.stringify(i.filters)+",false)":"("+t+")"}return e?t:"("+t+")"}function J(t,e,i,n){G(t,1,function(){e.appendChild(t)},i,n)}function q(t,e,i,n){G(t,1,function(){et(t,e)},i,n)}function Q(t,e,i){G(t,-1,function(){nt(t)},e,i)}function G(t,e,i,n,r){var s=t.__v_trans;if(!s||!s.hooks&&!rn||!n._isCompiled||n.$parent&&!n.$parent._isCompiled)return i(),void(r&&r());var o=e>0?"enter":"leave";s[o](i,r)}function Z(t){if("string"==typeof t){t=document.querySelector(t)}return t}function X(t){if(!t)return!1;var e=t.ownerDocument.documentElement,i=t.parentNode;return e===t||e===i||!(!i||1!==i.nodeType||!e.contains(i))}function Y(t,e){var i=t.getAttribute(e);return null!==i&&t.removeAttribute(e),i}function K(t,e){var i=Y(t,":"+e);return null===i&&(i=Y(t,"v-bind:"+e)),i}function tt(t,e){return t.hasAttribute(e)||t.hasAttribute(":"+e)||t.hasAttribute("v-bind:"+e)}function et(t,e){e.parentNode.insertBefore(t,e)}function it(t,e){e.nextSibling?et(t,e.nextSibling):e.parentNode.appendChild(t)}function nt(t){t.parentNode.removeChild(t)}function rt(t,e){e.firstChild?et(t,e.firstChild):e.appendChild(t)}function st(t,e){var i=t.parentNode;i&&i.replaceChild(e,t)}function ot(t,e,i,n){t.addEventListener(e,i,n)}function at(t,e,i){t.removeEventListener(e,i)}function ht(t){var e=t.className;return"object"==typeof e&&(e=e.baseVal||""),e}function lt(t,e){Ki&&!/svg$/.test(t.namespaceURI)?t.className=e:t.setAttribute("class",e)}function ct(t,e){if(t.classList)t.classList.add(e);else{var i=" "+ht(t)+" ";i.indexOf(" "+e+" ")<0&&lt(t,(i+e).trim())}}function ut(t,e){if(t.classList)t.classList.remove(e);else{for(var i=" "+ht(t)+" ",n=" "+e+" ";i.indexOf(n)>=0;)i=i.replace(n," ");lt(t,i.trim())}t.className||t.removeAttribute("class")}function ft(t,e){var i,n;if(vt(t)&&bt(t.content)&&(t=t.content),t.hasChildNodes())for(pt(t),n=e?document.createDocumentFragment():document.createElement("div");i=t.firstChild;)n.appendChild(i);return n}function pt(t){for(var e;e=t.firstChild,dt(e);)t.removeChild(e);for(;e=t.lastChild,dt(e);)t.removeChild(e)}function dt(t){return t&&(3===t.nodeType&&!t.data.trim()||8===t.nodeType)}function vt(t){return t.tagName&&"template"===t.tagName.toLowerCase()}function mt(t,e){var i=Mn.debug?document.createComment(t):document.createTextNode(e?" ":"");return i.__v_anchor=!0,i}function gt(t){if(t.hasAttributes())for(var e=t.attributes,i=0,n=e.length;i<n;i++){var r=e[i].name;if(Bn.test(r))return l(r.replace(Bn,""))}}function _t(t,e,i){for(var n;t!==e;)n=t.nextSibling,i(t),t=n;i(e)}function yt(t,e,i,n,r){function s(){if(a++,o&&a>=h.length){for(var t=0;t<h.length;t++)n.appendChild(h[t]);r&&r()}}var o=!1,a=0,h=[];_t(t,e,function(t){t===e&&(o=!0),h.push(t),Q(t,i,s)})}function bt(t){return t&&11===t.nodeType}function wt(t){if(t.outerHTML)return t.outerHTML;var e=document.createElement("div");return e.appendChild(t.cloneNode(!0)),e.innerHTML}function Ct(t,e){var i=t.tagName.toLowerCase(),n=t.hasAttributes();if(zn.test(i)||Un.test(i)){if(n)return $t(t,e)}else{if(jt(e,"components",i))return{id:i};var r=n&&$t(t,e);if(r)return r}}function $t(t,e){var i=t.getAttribute("is");if(null!=i){if(jt(e,"components",i))return t.removeAttribute("is"),{id:i}}else if(i=K(t,"is"),null!=i)return{id:i,dynamic:!0}}function kt(e,n){var r,s,o;for(r in n)s=e[r],o=n[r],i(e,r)?m(s)&&m(o)&&kt(s,o):t(e,r,o);return e}function xt(t,e){var i=Object.create(t||null);return e?v(i,Tt(e)):i}function At(t){if(t.components)for(var e,i=t.components=Tt(t.components),n=Object.keys(i),r=0,s=n.length;r<s;r++){var o=n[r];zn.test(o)||Un.test(o)||(e=i[o],g(e)&&(i[o]=Di.extend(e)))}}function Ot(t){var e,i,n=t.props;if(qi(n))for(t.props={},e=n.length;e--;)i=n[e],"string"==typeof i?t.props[i]=null:i.name&&(t.props[i.name]=i);else if(g(n)){var r=Object.keys(n);for(e=r.length;e--;)i=n[r[e]],"function"==typeof i&&(n[r[e]]={type:i})}}function Tt(t){if(qi(t)){for(var e,i={},n=t.length;n--;){e=t[n];var r="function"==typeof e?e.options&&e.options.name||e.id:e.name||e.id;r&&(i[r]=e)}return i}return t}function Nt(t,e,n){function r(i){var r=Jn[i]||qn;o[i]=r(t[i],e[i],n,i)}At(e),Ot(e);var s,o={};if(e.extends&&(t="function"==typeof e.extends?Nt(t,e.extends.options,n):Nt(t,e.extends,n)),e.mixins)for(var a=0,h=e.mixins.length;a<h;a++){var l=e.mixins[a],c=l.prototype instanceof Di?l.options:l;t=Nt(t,c,n)}for(s in t)r(s);for(s in e)i(t,s)||r(s);return o}function jt(t,e,i,n){if("string"==typeof i){var r,s=t[e],o=s[i]||s[r=l(i)]||s[r.charAt(0).toUpperCase()+r.slice(1)];return o}}function Et(){this.id=Qn++,this.subs=[]}function St(t){Yn=!1,t(),Yn=!0}function Ft(t){if(this.value=t,this.dep=new Et,_(t,"__ob__",this),qi(t)){var e=Qi?Dt:Pt;e(t,Zn,Xn),this.observeArray(t)}else this.walk(t)}function Dt(t,e){t.__proto__=e}function Pt(t,e,i){for(var n=0,r=i.length;n<r;n++){var s=i[n];_(t,s,e[s])}}function Rt(t,e){if(t&&"object"==typeof t){var n;return i(t,"__ob__")&&t.__ob__ instanceof Ft?n=t.__ob__:Yn&&(qi(t)||g(t))&&Object.isExtensible(t)&&!t._isVue&&(n=new Ft(t)),n&&e&&n.addVm(e),n}}function Lt(t,e,i){var n=new Et,r=Object.getOwnPropertyDescriptor(t,e);if(!r||r.configurable!==!1){var s=r&&r.get,o=r&&r.set,a=Rt(i);Object.defineProperty(t,e,{enumerable:!0,configurable:!0,get:function(){var e=s?s.call(t):i;if(Et.target&&(n.depend(),a&&a.dep.depend(),qi(e)))for(var r,o=0,h=e.length;o<h;o++)r=e[o],r&&r.__ob__&&r.__ob__.dep.depend();return e},set:function(e){var r=s?s.call(t):i;e!==r&&(o?o.call(t,e):i=e,a=Rt(e),n.notify())}})}}function Ht(t){t.prototype._init=function(t){t=t||{},this.$el=null,this.$parent=t.parent,this.$root=this.$parent?this.$parent.$root:this,this.$children=[],this.$refs={},this.$els={},this._watchers=[],this._directives=[],this._uid=tr++,this._isVue=!0,this._events={},this._eventsCount={},this._isFragment=!1,this._fragment=this._fragmentStart=this._fragmentEnd=null,this._isCompiled=this._isDestroyed=this._isReady=this._isAttached=this._isBeingDestroyed=this._vForRemoving=!1,this._unlinkFn=null,this._context=t._context||this.$parent,this._scope=t._scope,this._frag=t._frag,this._frag&&this._frag.children.push(this),this.$parent&&this.$parent.$children.push(this),t=this.$options=Nt(this.constructor.options,t,this),this._updateRef(),this._data={},this._callHook("init"),this._initState(),this._initEvents(),this._callHook("created"),t.el&&this.$mount(t.el)}}function It(t){if(void 0===t)return"eof";var e=t.charCodeAt(0);switch(e){case 91:case 93:case 46:case 34:case 39:case 48:return t;case 95:case 36:return"ident";case 32:case 9:case 10:case 13:case 160:case 65279:case 8232:case 8233:return"ws"}return e>=97&&e<=122||e>=65&&e<=90?"ident":e>=49&&e<=57?"number":"else"}function Mt(t){var e=t.trim();return("0"!==t.charAt(0)||!isNaN(t))&&(n(e)?h(e):"*"+e)}function Wt(t){function e(){var e=t[c+1];if(u===ur&&"'"===e||u===fr&&'"'===e)return c++,n="\\"+e,p[ir](),!0}var i,n,r,s,o,a,h,l=[],c=-1,u=or,f=0,p=[];for(p[nr]=function(){void 0!==r&&(l.push(r),r=void 0)},p[ir]=function(){void 0===r?r=n:r+=n},p[rr]=function(){p[ir](),f++},p[sr]=function(){if(f>0)f--,u=cr,p[ir]();else{if(f=0,r=Mt(r),r===!1)return!1;p[nr]()}};null!=u;)if(c++,i=t[c],"\\"!==i||!e()){if(s=It(i),h=vr[u],o=h[s]||h.else||dr,o===dr)return;if(u=o[0],a=p[o[1]],a&&(n=o[2],n=void 0===n?i:n,a()===!1))return;if(u===pr)return l.raw=t,l}}function Vt(t){var e=er.get(t);return e||(e=Wt(t),e&&er.put(t,e)),e}function Bt(t,e){return Yt(e).get(t)}function zt(e,i,n){var r=e;if("string"==typeof i&&(i=Wt(i)),!i||!m(e))return!1;for(var s,o,a=0,h=i.length;a<h;a++)s=e,o=i[a],"*"===o.charAt(0)&&(o=Yt(o.slice(1)).get.call(r,r)),a<h-1?(e=e[o],m(e)||(e={},t(s,o,e))):qi(e)?e.$set(o,n):o in e?e[o]=n:t(e,o,n);return!0}function Ut(){}function Jt(t,e){var i=Nr.length;return Nr[i]=e?t.replace($r,"\\n"):t,'"'+i+'"'}function qt(t){var e=t.charAt(0),i=t.slice(1);return yr.test(i)?t:(i=i.indexOf('"')>-1?i.replace(xr,Qt):i,e+"scope."+i)}function Qt(t,e){return Nr[e]}function Gt(t){wr.test(t),Nr.length=0;var e=t.replace(kr,Jt).replace(Cr,"");return e=(" "+e).replace(Or,qt).replace(xr,Qt),Zt(e)}function Zt(t){try{return new Function("scope","return "+t+";")}catch(t){return Ut}}function Xt(t){var e=Vt(t);if(e)return function(t,i){zt(t,e,i)}}function Yt(t,e){t=t.trim();var i=gr.get(t);if(i)return e&&!i.set&&(i.set=Xt(i.exp)),i;var n={exp:t};return n.get=Kt(t)&&t.indexOf("[")<0?Zt("scope."+t):Gt(t),e&&(n.set=Xt(t)),gr.put(t,n),n}function Kt(t){return Ar.test(t)&&!Tr.test(t)&&"Math."!==t.slice(0,5)}function te(){Er.length=0,Sr.length=0,Fr={},Dr={},Pr=!1}function ee(){for(var t=!0;t;)t=!1,ie(Er),ie(Sr),Er.length?t=!0:(Zi&&Mn.devtools&&Zi.emit("flush"),te())}function ie(t){for(var e=0;e<t.length;e++){var i=t[e],n=i.id;Fr[n]=null,i.run()}t.length=0}function ne(t){var e=t.id;if(null==Fr[e]){var i=t.user?Sr:Er;Fr[e]=i.length,i.push(t),Pr||(Pr=!0,ln(ee))}}function re(t,e,i,n){n&&v(this,n);var r="function"==typeof e;if(this.vm=t,t._watchers.push(this),this.expression=e,this.cb=i,this.id=++Rr,this.active=!0,this.dirty=this.lazy,this.deps=[],this.newDeps=[],this.depIds=new cn,this.newDepIds=new cn,this.prevError=null,r)this.getter=e,this.setter=void 0;else{var s=Yt(e,this.twoWay);this.getter=s.get,this.setter=s.set}this.value=this.lazy?void 0:this.get(),this.queued=this.shallow=!1}function se(t,e){var i=void 0,n=void 0;e||(e=Lr,e.clear());var r=qi(t),s=m(t);if((r||s)&&Object.isExtensible(t)){if(t.__ob__){var o=t.__ob__.dep.id;if(e.has(o))return;e.add(o)}if(r)for(i=t.length;i--;)se(t[i],e);else if(s)for(n=Object.keys(t),i=n.length;i--;)se(t[n[i]],e)}}function oe(t){return vt(t)&&bt(t.content)}function ae(t,e){var i=e?t:t.trim(),n=Ir.get(i);if(n)return n;var r=document.createDocumentFragment(),s=t.match(Vr),o=Br.test(t),a=zr.test(t);if(s||o||a){var h=s&&s[1],l=Wr[h]||Wr.efault,c=l[0],u=l[1],f=l[2],p=document.createElement("div");for(p.innerHTML=u+t+f;c--;)p=p.lastChild;for(var d;d=p.firstChild;)r.appendChild(d)}else r.appendChild(document.createTextNode(t));return e||pt(r),Ir.put(i,r),r}function he(t){if(oe(t))return ae(t.innerHTML);if("SCRIPT"===t.tagName)return ae(t.textContent);for(var e,i=le(t),n=document.createDocumentFragment();e=i.firstChild;)n.appendChild(e);return pt(n),n}function le(t){if(!t.querySelectorAll)return t.cloneNode();var e,i,n,r=t.cloneNode(!0);if(Ur){var s=r;if(oe(t)&&(t=t.content,s=r.content),i=t.querySelectorAll("template"),i.length)for(n=s.querySelectorAll("template"),e=n.length;e--;)n[e].parentNode.replaceChild(le(i[e]),n[e])}if(Jr)if("TEXTAREA"===t.tagName)r.value=t.value;else if(i=t.querySelectorAll("textarea"),i.length)for(n=r.querySelectorAll("textarea"),e=n.length;e--;)n[e].value=i[e].value;return r}function ce(t,e,i){var n,r;return bt(t)?(pt(t),e?le(t):t):("string"==typeof t?i||"#"!==t.charAt(0)?r=ae(t,i):(r=Mr.get(t),r||(n=document.getElementById(t.slice(1)),n&&(r=he(n),Mr.put(t,r)))):t.nodeType&&(r=he(t)),r&&e?le(r):r)}function ue(t,e,i,n,r,s){this.children=[],this.childFrags=[],this.vm=e,this.scope=r,this.inserted=!1,this.parentFrag=s,s&&s.childFrags.push(this),this.unlink=t(e,i,n,r,this);var o=this.single=1===i.childNodes.length&&!i.childNodes[0].__v_anchor;o?(this.node=i.childNodes[0],this.before=fe,this.remove=pe):(this.node=mt("fragment-start"),this.end=mt("fragment-end"),this.frag=i,rt(this.node,i),i.appendChild(this.end),this.before=de,this.remove=ve),this.node.__v_frag=this}function fe(t,e){this.inserted=!0;var i=e!==!1?q:et;i(this.node,t,this.vm),X(this.node)&&this.callHook(me)}function pe(){this.inserted=!1;var t=X(this.node),e=this;this.beforeRemove(),Q(this.node,this.vm,function(){t&&e.callHook(ge),e.destroy()})}function de(t,e){this.inserted=!0;var i=this.vm,n=e!==!1?q:et;_t(this.node,this.end,function(e){n(e,t,i)}),X(this.node)&&this.callHook(me)}function ve(){this.inserted=!1;var t=this,e=X(this.node);this.beforeRemove(),yt(this.node,this.end,this.vm,this.frag,function(){e&&t.callHook(ge),t.destroy()})}function me(t){!t._isAttached&&X(t.$el)&&t._callHook("attached")}function ge(t){t._isAttached&&!X(t.$el)&&t._callHook("detached")}function _e(t,e){this.vm=t;var i,n="string"==typeof e;n||vt(e)&&!e.hasAttribute("v-if")?i=ce(e,!0):(i=document.createDocumentFragment(),i.appendChild(e)),this.template=i;var r,s=t.constructor.cid;if(s>0){var o=s+(n?e:wt(e));r=Gr.get(o),r||(r=qe(i,t.$options,!0),Gr.put(o,r))}else r=qe(i,t.$options,!0);this.linker=r}function ye(t,e,i){var n=t.node.previousSibling;if(n){for(t=n.__v_frag;!(t&&t.forId===i&&t.inserted||n===e);){if(n=n.previousSibling,!n)return;t=n.__v_frag}return t}}function be(t){for(var e=-1,i=new Array(Math.floor(t));++e<t;)i[e]=e;return i}function we(t,e,i,n){return n?"$index"===n?t:n.charAt(0).match(/\w/)?Bt(i,n):i[n]:e||i}function Ce(t){var e=t.node;if(t.end)for(;!e.__vue__&&e!==t.end&&e.nextSibling;)e=e.nextSibling;return e.__vue__}function $e(t,e,i){for(var n,r,s,o=e?[]:null,a=0,h=t.options.length;a<h;a++)if(n=t.options[a],s=i?n.hasAttribute("selected"):n.selected){if(r=n.hasOwnProperty("_value")?n._value:n.value,!e)return r;o.push(r)}return o}function ke(t,e){for(var i=t.length;i--;)if(C(t[i],e))return i;return-1}function xe(t,e){var i=e.map(function(t){var e=t.charCodeAt(0);return e>47&&e<58?parseInt(t,10):1===t.length&&(e=t.toUpperCase().charCodeAt(0),e>64&&e<91)?e:ms[t]});return i=[].concat.apply([],i),function(e){if(i.indexOf(e.keyCode)>-1)return t.call(this,e)}}function Ae(t){return function(e){return e.stopPropagation(),t.call(this,e)}}function Oe(t){return function(e){return e.preventDefault(),t.call(this,e)}}function Te(t){return function(e){if(e.target===e.currentTarget)return t.call(this,e)}}function Ne(t){if(ws[t])return ws[t];var e=je(t);return ws[t]=ws[e]=e,e}function je(t){t=u(t);var e=l(t),i=e.charAt(0).toUpperCase()+e.slice(1);Cs||(Cs=document.createElement("div"));var n,r=_s.length;if("filter"!==e&&e in Cs.style)return{kebab:t,camel:e};for(;r--;)if(n=ys[r]+i,n in Cs.style)return{kebab:_s[r]+t,camel:n}}function Ee(t){var e=[];if(qi(t))for(var i=0,n=t.length;i<n;i++){var r=t[i];if(r)if("string"==typeof r)e.push(r);else for(var s in r)r[s]&&e.push(s)}else if(m(t))for(var o in t)t[o]&&e.push(o);return e}function Se(t,e,i){if(e=e.trim(),e.indexOf(" ")===-1)return void i(t,e);for(var n=e.split(/\s+/),r=0,s=n.length;r<s;r++)i(t,n[r])}function Fe(t,e,i){function n(){++s>=r?i():t[s].call(e,n)}var r=t.length,s=0;t[0].call(e,n)}function De(t,e,i){for(var r,s,o,a,h,c,f,p=[],d=i.$options.propsData,v=Object.keys(e),m=v.length;m--;)s=v[m],r=e[s]||Hs,h=l(s),Is.test(h)&&(f={name:s,path:h,options:r,mode:Ls.ONE_WAY,raw:null},o=u(s),null===(a=K(t,o))&&(null!==(a=K(t,o+".sync"))?f.mode=Ls.TWO_WAY:null!==(a=K(t,o+".once"))&&(f.mode=Ls.ONE_TIME)),null!==a?(f.raw=a,c=I(a),a=c.expression,f.filters=c.filters,n(a)&&!c.filters?f.optimizedLiteral=!0:f.dynamic=!0,f.parentPath=a):null!==(a=Y(t,o))?f.raw=a:d&&null!==(a=d[s]||d[h])&&(f.raw=a),p.push(f));return Pe(p)}function Pe(t){return function(e,n){e._props={};for(var r,s,l,c,f,p=e.$options.propsData,d=t.length;d--;)if(r=t[d],f=r.raw,s=r.path,l=r.options,e._props[s]=r,p&&i(p,s)&&Le(e,r,p[s]),null===f)Le(e,r,void 0);else if(r.dynamic)r.mode===Ls.ONE_TIME?(c=(n||e._context||e).$get(r.parentPath),Le(e,r,c)):e._context?e._bindDir({name:"prop",def:Ws,prop:r},null,null,n):Le(e,r,e.$get(r.parentPath));else if(r.optimizedLiteral){var v=h(f);c=v===f?a(o(f)):v,Le(e,r,c)}else c=l.type===Boolean&&(""===f||f===u(r.name))||f,Le(e,r,c)}}function Re(t,e,i,n){var r=e.dynamic&&Kt(e.parentPath),s=i;void 0===s&&(s=Ie(t,e)),s=We(e,s,t);var o=s!==i;Me(e,s,t)||(s=void 0),r&&!o?St(function(){n(s)}):n(s)}function Le(t,e,i){Re(t,e,i,function(i){Lt(t,e.path,i)})}function He(t,e,i){Re(t,e,i,function(i){t[e.path]=i})}function Ie(t,e){var n=e.options;if(!i(n,"default"))return n.type!==Boolean&&void 0;var r=n.default;return m(r),"function"==typeof r&&n.type!==Function?r.call(t):r}function Me(t,e,i){if(!t.options.required&&(null===t.raw||null==e))return!0;var n=t.options,r=n.type,s=!r,o=[];if(r){qi(r)||(r=[r]);for(var a=0;a<r.length&&!s;a++){var h=Ve(e,r[a]);o.push(h.expectedType),s=h.valid}}if(!s)return!1;var l=n.validator;return!(l&&!l(e))}function We(t,e,i){var n=t.options.coerce;return n&&"function"==typeof n?n(e):e}function Ve(t,e){var i,n;return e===String?(n="string",i=typeof t===n):e===Number?(n="number",i=typeof t===n):e===Boolean?(n="boolean",i=typeof t===n):e===Function?(n="function",i=typeof t===n):e===Object?(n="object",i=g(t)):e===Array?(n="array",i=qi(t)):i=t instanceof e,{valid:i,expectedType:n}}function Be(t){Vs.push(t),Bs||(Bs=!0,ln(ze))}function ze(){for(var t=document.documentElement.offsetHeight,e=0;e<Vs.length;e++)Vs[e]();return Vs=[],Bs=!1,t}function Ue(t,e,i,n){this.id=e,this.el=t,this.enterClass=i&&i.enterClass||e+"-enter",this.leaveClass=i&&i.leaveClass||e+"-leave",this.hooks=i,this.vm=n,this.pendingCssEvent=this.pendingCssCb=this.cancel=this.pendingJsCb=this.op=this.cb=null,this.justEntered=!1,this.entered=this.left=!1,this.typeCache={},this.type=i&&i.type;var r=this;["enterNextTick","enterDone","leaveNextTick","leaveDone"].forEach(function(t){r[t]=p(r[t],r)})}function Je(t){if(/svg$/.test(t.namespaceURI)){var e=t.getBoundingClientRect();return!(e.width||e.height)}return!(t.offsetWidth||t.offsetHeight||t.getClientRects().length)}function qe(t,e,i){var n=i||!e._asComponent?ti(t,e):null,r=n&&n.terminal||gi(t)||!t.hasChildNodes()?null:oi(t.childNodes,e);return function(t,e,i,s,o){var a=d(e.childNodes),h=Qe(function(){n&&n(t,e,i,s,o),r&&r(t,a,i,s,o)},t);return Ze(t,h)}}function Qe(t,e){e._directives=[];var i=e._directives.length;t();var n=e._directives.slice(i);Ge(n);for(var r=0,s=n.length;r<s;r++)n[r]._bind();return n}function Ge(t){if(0!==t.length){var e,i,n,r,s={},o=0,a=[];for(e=0,i=t.length;e<i;e++){var h=t[e],l=h.descriptor.def.priority||ro,c=s[l];c||(c=s[l]=[],a.push(l)),c.push(h)}for(a.sort(function(t,e){return t>e?-1:t===e?0:1}),e=0,i=a.length;e<i;e++){var u=s[a[e]];for(n=0,r=u.length;n<r;n++)t[o++]=u[n]}}}function Ze(t,e,i,n){function r(r){Xe(t,e,r),i&&n&&Xe(i,n)}return r.dirs=e,r}function Xe(t,e,i){for(var n=e.length;n--;)e[n]._teardown()}function Ye(t,e,i,n){var r=De(e,i,t),s=Qe(function(){r(t,n)},t);return Ze(t,s)}function Ke(t,e,i){var n,r,s=e._containerAttrs,o=e._replacerAttrs;return 11!==t.nodeType&&(e._asComponent?(s&&i&&(n=pi(s,i)),o&&(r=pi(o,e))):r=pi(t.attributes,e)),e._containerAttrs=e._replacerAttrs=null,function(t,e,i){var s,o=t._context;o&&n&&(s=Qe(function(){n(o,e,null,i)},o));var a=Qe(function(){r&&r(t,e)},t);return Ze(t,a,o,s)}}function ti(t,e){var i=t.nodeType;return 1!==i||gi(t)?3===i&&t.data.trim()?ii(t,e):null:ei(t,e)}function ei(t,e){if("TEXTAREA"===t.tagName){if(null!==Y(t,"v-pre"))return ui;var i=V(t.value);i&&(t.setAttribute(":value",B(i)),t.value="")}var n,r=t.hasAttributes(),s=r&&d(t.attributes);return r&&(n=ci(t,s,e)),n||(n=hi(t,e)),n||(n=li(t,e)),!n&&r&&(n=pi(s,e)),n}function ii(t,e){if(t._skip)return ni;var i=V(t.wholeText);if(!i)return null;for(var n=t.nextSibling;n&&3===n.nodeType;)n._skip=!0,n=n.nextSibling;for(var r,s,o=document.createDocumentFragment(),a=0,h=i.length;a<h;a++)s=i[a],r=s.tag?ri(s,e):document.createTextNode(s.value),o.appendChild(r);return si(i,o,e)}function ni(t,e){nt(e)}function ri(t,e){function i(e){if(!t.descriptor){var i=I(t.value);t.descriptor={name:e,def:Ds[e],expression:i.expression,filters:i.filters}}}var n;return t.oneTime?n=document.createTextNode(t.value):t.html?(n=document.createComment("v-html"),i("html")):(n=document.createTextNode(" "),i("text")),n}function si(t,e){return function(i,n,r,o){for(var a,h,l,c=e.cloneNode(!0),u=d(c.childNodes),f=0,p=t.length;f<p;f++)a=t[f],h=a.value,a.tag&&(l=u[f],a.oneTime?(h=(o||i).$eval(h),a.html?st(l,ce(h,!0)):l.data=s(h)):i._bindDir(a.descriptor,l,r,o));st(n,c)}}function oi(t,e){for(var i,n,r,s=[],o=0,a=t.length;o<a;o++)r=t[o],i=ti(r,e),n=i&&i.terminal||"SCRIPT"===r.tagName||!r.hasChildNodes()?null:oi(r.childNodes,e),s.push(i,n);return s.length?ai(s):null}function ai(t){return function(e,i,n,r,s){for(var o,a,h,l=0,c=0,u=t.length;l<u;c++){o=i[c],a=t[l++],h=t[l++];var f=d(o.childNodes);a&&a(e,o,n,r,s),h&&h(e,f,n,r,s)}}}function hi(t,e){var i=t.tagName.toLowerCase();if(!zn.test(i)){var n=jt(e,"elementDirectives",i);return n?fi(t,i,"",e,n):void 0}}function li(t,e){var i=Ct(t,e);if(i){var n=gt(t),r={name:"component",ref:n,expression:i.id,def:Ys.component,modifiers:{literal:!i.dynamic}},s=function(t,e,i,s,o){n&&Lt((s||t).$refs,n,null),t._bindDir(r,e,i,s,o)};return s.terminal=!0,s}}function ci(t,e,i){if(null!==Y(t,"v-pre"))return ui;if(t.hasAttribute("v-else")){var n=t.previousElementSibling;if(n&&n.hasAttribute("v-if"))return ui}for(var r,s,o,a,h,l,c,u,f,p,d=0,v=e.length;d<v;d++)r=e[d],s=r.name.replace(io,""),(h=s.match(eo))&&(f=jt(i,"directives",h[1]),f&&f.terminal&&(!p||(f.priority||so)>p.priority)&&(p=f,c=r.name,a=di(r.name),o=r.value,l=h[1],u=h[2]));return p?fi(t,l,o,i,p,c,u,a):void 0}function ui(){}function fi(t,e,i,n,r,s,o,a){var h=I(i),l={name:e,arg:o,expression:h.expression,filters:h.filters,raw:i,attr:s,modifiers:a,def:r};"for"!==e&&"router-view"!==e||(l.ref=gt(t));var c=function(t,e,i,n,r){l.ref&&Lt((n||t).$refs,l.ref,null),t._bindDir(l,e,i,n,r)};return c.terminal=!0,c}function pi(t,e){function i(t,e,i){var n=i&&mi(i),r=!n&&I(s);v.push({name:t,attr:o,raw:a,def:e,arg:l,modifiers:c,expression:r&&r.expression,filters:r&&r.filters,interp:i,hasOneTime:n})}for(var n,r,s,o,a,h,l,c,u,f,p,d=t.length,v=[];d--;)if(n=t[d],r=o=n.name,s=a=n.value,f=V(s),l=null,c=di(r),r=r.replace(io,""),f)s=B(f),l=r,i("bind",Ds.bind,f);else if(no.test(r))c.literal=!Ks.test(r),i("transition",Ys.transition);else if(to.test(r))l=r.replace(to,""),i("on",Ds.on);else if(Ks.test(r))h=r.replace(Ks,""),"style"===h||"class"===h?i(h,Ys[h]):(l=h,i("bind",Ds.bind));else if(p=r.match(eo)){if(h=p[1],l=p[2],"else"===h)continue;u=jt(e,"directives",h,!0),u&&i(h,u)}if(v.length)return vi(v)}function di(t){var e=Object.create(null),i=t.match(io);if(i)for(var n=i.length;n--;)e[i[n].slice(1)]=!0;return e}function vi(t){return function(e,i,n,r,s){for(var o=t.length;o--;)e._bindDir(t[o],i,n,r,s)}}function mi(t){for(var e=t.length;e--;)if(t[e].oneTime)return!0}function gi(t){return"SCRIPT"===t.tagName&&(!t.hasAttribute("type")||"text/javascript"===t.getAttribute("type"))}function _i(t,e){return e&&(e._containerAttrs=bi(t)),vt(t)&&(t=ce(t)),e&&(e._asComponent&&!e.template&&(e.template="<slot></slot>"),e.template&&(e._content=ft(t),t=yi(t,e))),bt(t)&&(rt(mt("v-start",!0),t),t.appendChild(mt("v-end",!0))),t}function yi(t,e){var i=e.template,n=ce(i,!0);if(n){var r=n.firstChild;if(!r)return n;var s=r.tagName&&r.tagName.toLowerCase();return e.replace?(t===document.body,n.childNodes.length>1||1!==r.nodeType||"component"===s||jt(e,"components",s)||tt(r,"is")||jt(e,"elementDirectives",s)||r.hasAttribute("v-for")||r.hasAttribute("v-if")?n:(e._replacerAttrs=bi(r),wi(t,r),r)):(t.appendChild(n),t)}}function bi(t){if(1===t.nodeType&&t.hasAttributes())return d(t.attributes)}function wi(t,e){for(var i,n,r=t.attributes,s=r.length;s--;)i=r[s].name,n=r[s].value,e.hasAttribute(i)||oo.test(i)?"class"===i&&!V(n)&&(n=n.trim())&&n.split(/\s+/).forEach(function(t){ct(e,t)}):e.setAttribute(i,n)}function Ci(t,e){if(e){for(var i,n,r=t._slotContents=Object.create(null),s=0,o=e.children.length;s<o;s++)i=e.children[s],(n=i.getAttribute("slot"))&&(r[n]||(r[n]=[])).push(i);for(n in r)r[n]=$i(r[n],e);if(e.hasChildNodes()){var a=e.childNodes;if(1===a.length&&3===a[0].nodeType&&!a[0].data.trim())return;r.default=$i(e.childNodes,e)}}}function $i(t,e){var i=document.createDocumentFragment();t=d(t);for(var n=0,r=t.length;n<r;n++){var s=t[n];!vt(s)||s.hasAttribute("v-if")||s.hasAttribute("v-for")||(e.removeChild(s),s=ce(s,!0)),i.appendChild(s)}return i}function ki(t){function e(){}function n(t,e){var i=new re(e,t,null,{lazy:!0});return function(){return i.dirty&&i.evaluate(),Et.target&&i.depend(),i.value}}Object.defineProperty(t.prototype,"$data",{get:function(){return this._data},set:function(t){t!==this._data&&this._setData(t)}}),t.prototype._initState=function(){this._initProps(),this._initMeta(),this._initMethods(),this._initData(),this._initComputed()},t.prototype._initProps=function(){var t=this.$options,e=t.el,i=t.props;e=t.el=Z(e),this._propsUnlinkFn=e&&1===e.nodeType&&i?Ye(this,e,i,this._scope):null},t.prototype._initData=function(){var t=this.$options.data,e=this._data=t?t():{};g(e)||(e={});var n,r,s=this._props,o=Object.keys(e);for(n=o.length;n--;)r=o[n],s&&i(s,r)||this._proxy(r);Rt(e,this)},t.prototype._setData=function(t){t=t||{};var e=this._data;this._data=t;var n,r,s;for(n=Object.keys(e),s=n.length;s--;)r=n[s],r in t||this._unproxy(r);for(n=Object.keys(t),s=n.length;s--;)r=n[s],i(this,r)||this._proxy(r);e.__ob__.removeVm(this),Rt(t,this),this._digest()},t.prototype._proxy=function(t){if(!r(t)){var e=this;Object.defineProperty(e,t,{configurable:!0,enumerable:!0,get:function(){return e._data[t]},set:function(i){e._data[t]=i}})}},t.prototype._unproxy=function(t){r(t)||delete this[t]},t.prototype._digest=function(){for(var t=0,e=this._watchers.length;t<e;t++)this._watchers[t].update(!0)},t.prototype._initComputed=function(){var t=this.$options.computed;if(t)for(var i in t){var r=t[i],s={enumerable:!0,configurable:!0};"function"==typeof r?(s.get=n(r,this),s.set=e):(s.get=r.get?r.cache!==!1?n(r.get,this):p(r.get,this):e,s.set=r.set?p(r.set,this):e),Object.defineProperty(this,i,s)}},t.prototype._initMethods=function(){var t=this.$options.methods;if(t)for(var e in t)this[e]=p(t[e],this)},t.prototype._initMeta=function(){var t=this.$options._meta;if(t)for(var e in t)Lt(this,e,t[e])}}function xi(t){function e(t,e){for(var i,n,r,s=e.attributes,o=0,a=s.length;o<a;o++)i=s[o].name,ho.test(i)&&(i=i.replace(ho,""),n=s[o].value,Kt(n)&&(n+=".apply(this, $arguments)"),r=(t._scope||t._context).$eval(n,!0),r._fromParent=!0,t.$on(i.replace(ho),r))}function i(t,e,i){if(i){var r,s,o,a;for(s in i)if(r=i[s],qi(r))for(o=0,a=r.length;o<a;o++)n(t,e,s,r[o]);else n(t,e,s,r)}}function n(t,e,i,r,s){var o=typeof r;if("function"===o)t[e](i,r,s);else if("string"===o){var a=t.$options.methods,h=a&&a[r];h&&t[e](i,h,s)}else r&&"object"===o&&n(t,e,i,r.handler,r)}function r(){this._isAttached||(this._isAttached=!0,this.$children.forEach(s))}function s(t){!t._isAttached&&X(t.$el)&&t._callHook("attached")}function o(){this._isAttached&&(this._isAttached=!1,this.$children.forEach(a))}function a(t){t._isAttached&&!X(t.$el)&&t._callHook("detached")}t.prototype._initEvents=function(){var t=this.$options;t._asComponent&&e(this,t.el),i(this,"$on",t.events),i(this,"$watch",t.watch)},t.prototype._initDOMHooks=function(){this.$on("hook:attached",r),this.$on("hook:detached",o)},t.prototype._callHook=function(t){this.$emit("pre-hook:"+t);var e=this.$options[t];if(e)for(var i=0,n=e.length;i<n;i++)e[i].call(this);this.$emit("hook:"+t)}}function Ai(){}function Oi(t,e,i,n,r,s){this.vm=e,this.el=i,this.descriptor=t,this.name=t.name,this.expression=t.expression,this.arg=t.arg,this.modifiers=t.modifiers,this.filters=t.filters,this.literal=this.modifiers&&this.modifiers.literal,this._locked=!1,this._bound=!1,this._listeners=null,this._host=n,this._scope=r,this._frag=s}function Ti(t){t.prototype._updateRef=function(t){var e=this.$options._ref;if(e){var i=(this._scope||this._context).$refs;t?i[e]===this&&(i[e]=null):i[e]=this}},t.prototype._compile=function(t){var e=this.$options,i=t;if(t=_i(t,e),this._initElement(t),1!==t.nodeType||null===Y(t,"v-pre")){var n=this._context&&this._context.$options,r=Ke(t,e,n);Ci(this,e._content);var s,o=this.constructor;e._linkerCachable&&(s=o.linker,s||(s=o.linker=qe(t,e)));var a=r(this,t,this._scope),h=s?s(this,t):qe(t,e)(this,t);
this._unlinkFn=function(){a(),h(!0)},e.replace&&st(i,t),this._isCompiled=!0,this._callHook("compiled")}},t.prototype._initElement=function(t){bt(t)?(this._isFragment=!0,this.$el=this._fragmentStart=t.firstChild,this._fragmentEnd=t.lastChild,3===this._fragmentStart.nodeType&&(this._fragmentStart.data=this._fragmentEnd.data=""),this._fragment=t):this.$el=t,this.$el.__vue__=this,this._callHook("beforeCompile")},t.prototype._bindDir=function(t,e,i,n,r){this._directives.push(new Oi(t,this,e,i,n,r))},t.prototype._destroy=function(t,e){if(this._isBeingDestroyed)return void(e||this._cleanup());var i,n,r=this,s=function(){!i||n||e||r._cleanup()};t&&this.$el&&(n=!0,this.$remove(function(){n=!1,s()})),this._callHook("beforeDestroy"),this._isBeingDestroyed=!0;var o,a=this.$parent;for(a&&!a._isBeingDestroyed&&(a.$children.$remove(this),this._updateRef(!0)),o=this.$children.length;o--;)this.$children[o].$destroy();for(this._propsUnlinkFn&&this._propsUnlinkFn(),this._unlinkFn&&this._unlinkFn(),o=this._watchers.length;o--;)this._watchers[o].teardown();this.$el&&(this.$el.__vue__=null),i=!0,s()},t.prototype._cleanup=function(){this._isDestroyed||(this._frag&&this._frag.children.$remove(this),this._data&&this._data.__ob__&&this._data.__ob__.removeVm(this),this.$el=this.$parent=this.$root=this.$children=this._watchers=this._context=this._scope=this._directives=null,this._isDestroyed=!0,this._callHook("destroyed"),this.$off())}}function Ni(t){t.prototype._applyFilters=function(t,e,i,n){var r,s,o,a,h,l,c,u,f;for(l=0,c=i.length;l<c;l++)if(r=i[n?c-l-1:l],s=jt(this.$options,"filters",r.name,!0),s&&(s=n?s.write:s.read||s,"function"==typeof s)){if(o=n?[t,e]:[t],h=n?2:1,r.args)for(u=0,f=r.args.length;u<f;u++)a=r.args[u],o[u+h]=a.dynamic?this.$get(a.value):a.value;t=s.apply(this,o)}return t},t.prototype._resolveComponent=function(e,i){var n;if(n="function"==typeof e?e:jt(this.$options,"components",e,!0))if(n.options)i(n);else if(n.resolved)i(n.resolved);else if(n.requested)n.pendingCallbacks.push(i);else{n.requested=!0;var r=n.pendingCallbacks=[i];n.call(this,function(e){g(e)&&(e=t.extend(e)),n.resolved=e;for(var i=0,s=r.length;i<s;i++)r[i](e)},function(t){})}}}function ji(t){function i(t){return JSON.parse(JSON.stringify(t))}t.prototype.$get=function(t,e){var i=Yt(t);if(i){if(e){var n=this;return function(){n.$arguments=d(arguments);var t=i.get.call(n,n);return n.$arguments=null,t}}try{return i.get.call(this,this)}catch(t){}}},t.prototype.$set=function(t,e){var i=Yt(t,!0);i&&i.set&&i.set.call(this,this,e)},t.prototype.$delete=function(t){e(this._data,t)},t.prototype.$watch=function(t,e,i){var n,r=this;"string"==typeof t&&(n=I(t),t=n.expression);var s=new re(r,t,e,{deep:i&&i.deep,sync:i&&i.sync,filters:n&&n.filters,user:!i||i.user!==!1});return i&&i.immediate&&e.call(r,s.value),function(){s.teardown()}},t.prototype.$eval=function(t,e){if(lo.test(t)){var i=I(t),n=this.$get(i.expression,e);return i.filters?this._applyFilters(n,null,i.filters):n}return this.$get(t,e)},t.prototype.$interpolate=function(t){var e=V(t),i=this;return e?1===e.length?i.$eval(e[0].value)+"":e.map(function(t){return t.tag?i.$eval(t.value):t.value}).join(""):t},t.prototype.$log=function(t){var e=t?Bt(this._data,t):this._data;if(e&&(e=i(e)),!t){var n;for(n in this.$options.computed)e[n]=i(this[n]);if(this._props)for(n in this._props)e[n]=i(this[n])}console.log(e)}}function Ei(t){function e(t,e,n,r,s,o){e=i(e);var a=!X(e),h=r===!1||a?s:o,l=!a&&!t._isAttached&&!X(t.$el);return t._isFragment?(_t(t._fragmentStart,t._fragmentEnd,function(i){h(i,e,t)}),n&&n()):h(t.$el,e,t,n),l&&t._callHook("attached"),t}function i(t){return"string"==typeof t?document.querySelector(t):t}function n(t,e,i,n){e.appendChild(t),n&&n()}function r(t,e,i,n){et(t,e),n&&n()}function s(t,e,i){nt(t),i&&i()}t.prototype.$nextTick=function(t){ln(t,this)},t.prototype.$appendTo=function(t,i,r){return e(this,t,i,r,n,J)},t.prototype.$prependTo=function(t,e,n){return t=i(t),t.hasChildNodes()?this.$before(t.firstChild,e,n):this.$appendTo(t,e,n),this},t.prototype.$before=function(t,i,n){return e(this,t,i,n,r,q)},t.prototype.$after=function(t,e,n){return t=i(t),t.nextSibling?this.$before(t.nextSibling,e,n):this.$appendTo(t.parentNode,e,n),this},t.prototype.$remove=function(t,e){if(!this.$el.parentNode)return t&&t();var i=this._isAttached&&X(this.$el);i||(e=!1);var n=this,r=function(){i&&n._callHook("detached"),t&&t()};if(this._isFragment)yt(this._fragmentStart,this._fragmentEnd,this,this._fragment,r);else{var o=e===!1?s:Q;o(this.$el,this,r)}return this}}function Si(t){function e(t,e,n){var r=t.$parent;if(r&&n&&!i.test(e))for(;r;)r._eventsCount[e]=(r._eventsCount[e]||0)+n,r=r.$parent}t.prototype.$on=function(t,i){return(this._events[t]||(this._events[t]=[])).push(i),e(this,t,1),this},t.prototype.$once=function(t,e){function i(){n.$off(t,i),e.apply(this,arguments)}var n=this;return i.fn=e,this.$on(t,i),this},t.prototype.$off=function(t,i){var n;if(!arguments.length){if(this.$parent)for(t in this._events)n=this._events[t],n&&e(this,t,-n.length);return this._events={},this}if(n=this._events[t],!n)return this;if(1===arguments.length)return e(this,t,-n.length),this._events[t]=null,this;for(var r,s=n.length;s--;)if(r=n[s],r===i||r.fn===i){e(this,t,-1),n.splice(s,1);break}return this},t.prototype.$emit=function(t){var e="string"==typeof t;t=e?t:t.name;var i=this._events[t],n=e||!i;if(i){i=i.length>1?d(i):i;var r=e&&i.some(function(t){return t._fromParent});r&&(n=!1);for(var s=d(arguments,1),o=0,a=i.length;o<a;o++){var h=i[o],l=h.apply(this,s);l!==!0||r&&!h._fromParent||(n=!0)}}return n},t.prototype.$broadcast=function(t){var e="string"==typeof t;if(t=e?t:t.name,this._eventsCount[t]){var i=this.$children,n=d(arguments);e&&(n[0]={name:t,source:this});for(var r=0,s=i.length;r<s;r++){var o=i[r],a=o.$emit.apply(o,n);a&&o.$broadcast.apply(o,n)}return this}},t.prototype.$dispatch=function(t){var e=this.$emit.apply(this,arguments);if(e){var i=this.$parent,n=d(arguments);for(n[0]={name:t,source:this};i;)e=i.$emit.apply(i,n),i=e?i.$parent:null;return this}};var i=/^hook:/}function Fi(t){function e(){this._isAttached=!0,this._isReady=!0,this._callHook("ready")}t.prototype.$mount=function(t){if(!this._isCompiled)return t=Z(t),t||(t=document.createElement("div")),this._compile(t),this._initDOMHooks(),X(this.$el)?(this._callHook("attached"),e.call(this)):this.$once("hook:attached",e),this},t.prototype.$destroy=function(t,e){this._destroy(t,e)},t.prototype.$compile=function(t,e,i,n){return qe(t,this.$options,!0)(this,t,e,i,n)}}function Di(t){this._init(t)}function Pi(t,e,i){return i=i?parseInt(i,10):0,e=o(e),"number"==typeof e?t.slice(i,i+e):t}function Ri(t,e,i){if(t=po(t),null==e)return t;if("function"==typeof e)return t.filter(e);e=(""+e).toLowerCase();for(var n,r,s,o,a="in"===i?3:2,h=Array.prototype.concat.apply([],d(arguments,a)),l=[],c=0,u=t.length;c<u;c++)if(n=t[c],s=n&&n.$value||n,o=h.length){for(;o--;)if(r=h[o],"$key"===r&&Hi(n.$key,e)||Hi(Bt(s,r),e)){l.push(n);break}}else Hi(n,e)&&l.push(n);return l}function Li(t){function e(t,e,i){var r=n[i];return r&&("$key"!==r&&(m(t)&&"$value"in t&&(t=t.$value),m(e)&&"$value"in e&&(e=e.$value)),t=m(t)?Bt(t,r):t,e=m(e)?Bt(e,r):e),t===e?0:t>e?s:-s}var i=null,n=void 0;t=po(t);var r=d(arguments,1),s=r[r.length-1];"number"==typeof s?(s=s<0?-1:1,r=r.length>1?r.slice(0,-1):r):s=1;var o=r[0];return o?("function"==typeof o?i=function(t,e){return o(t,e)*s}:(n=Array.prototype.concat.apply([],r),i=function(t,r,s){return s=s||0,s>=n.length-1?e(t,r,s):e(t,r,s)||i(t,r,s+1)}),t.slice().sort(i)):t}function Hi(t,e){var i;if(g(t)){var n=Object.keys(t);for(i=n.length;i--;)if(Hi(t[n[i]],e))return!0}else if(qi(t)){for(i=t.length;i--;)if(Hi(t[i],e))return!0}else if(null!=t)return t.toString().toLowerCase().indexOf(e)>-1}function Ii(i){function n(t){return new Function("return function "+f(t)+" (options) { this._init(options) }")()}i.options={directives:Ds,elementDirectives:fo,filters:mo,transitions:{},components:{},partials:{},replace:!0},i.util=Kn,i.config=Mn,i.set=t,i.delete=e,i.nextTick=ln,i.compiler=ao,i.FragmentFactory=_e,i.internalDirectives=Ys,i.parsers={path:mr,text:Ln,template:qr,directive:En,expression:jr},i.cid=0;var r=1;i.extend=function(t){t=t||{};var e=this,i=0===e.cid;if(i&&t._Ctor)return t._Ctor;var s=t.name||e.options.name,o=n(s||"VueComponent");return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.cid=r++,o.options=Nt(e.options,t),o.super=e,o.extend=e.extend,Mn._assetTypes.forEach(function(t){o[t]=e[t]}),s&&(o.options.components[s]=o),i&&(t._Ctor=o),o},i.use=function(t){if(!t.installed){var e=d(arguments,1);return e.unshift(this),"function"==typeof t.install?t.install.apply(t,e):t.apply(null,e),t.installed=!0,this}},i.mixin=function(t){i.options=Nt(i.options,t)},Mn._assetTypes.forEach(function(t){i[t]=function(e,n){return n?("component"===t&&g(n)&&(n.name||(n.name=e),n=i.extend(n)),this.options[t+"s"][e]=n,n):this.options[t+"s"][e]}}),v(i.transition,Vn)}var Mi=Object.prototype.hasOwnProperty,Wi=/^\s?(true|false|-?[\d\.]+|'[^']*'|"[^"]*")\s?$/,Vi=/-(\w)/g,Bi=/([^-])([A-Z])/g,zi=/(?:^|[-_\/])(\w)/g,Ui=Object.prototype.toString,Ji="[object Object]",qi=Array.isArray,Qi="__proto__"in{},Gi="undefined"!=typeof window&&"[object Object]"!==Object.prototype.toString.call(window),Zi=Gi&&window.__VUE_DEVTOOLS_GLOBAL_HOOK__,Xi=Gi&&window.navigator.userAgent.toLowerCase(),Yi=Xi&&Xi.indexOf("trident")>0,Ki=Xi&&Xi.indexOf("msie 9.0")>0,tn=Xi&&Xi.indexOf("android")>0,en=Xi&&/iphone|ipad|ipod|ios/.test(Xi),nn=void 0,rn=void 0,sn=void 0,on=void 0;if(Gi&&!Ki){var an=void 0===window.ontransitionend&&void 0!==window.onwebkittransitionend,hn=void 0===window.onanimationend&&void 0!==window.onwebkitanimationend;nn=an?"WebkitTransition":"transition",rn=an?"webkitTransitionEnd":"transitionend",sn=hn?"WebkitAnimation":"animation",on=hn?"webkitAnimationEnd":"animationend"}var ln=function(){function t(){i=!1;var t=e.slice(0);e.length=0;for(var n=0;n<t.length;n++)t[n]()}var e=[],i=!1,n=void 0;if("undefined"!=typeof Promise&&$(Promise)){var r=Promise.resolve(),s=function(){};n=function(){r.then(t),en&&setTimeout(s)}}else if("undefined"!=typeof MutationObserver){var o=1,a=new MutationObserver(t),h=document.createTextNode(String(o));a.observe(h,{characterData:!0}),n=function(){o=(o+1)%2,h.data=String(o)}}else n=setTimeout;return function(r,s){var o=s?function(){r.call(s)}:r;e.push(o),i||(i=!0,n(t,0))}}(),cn=void 0;"undefined"!=typeof Set&&$(Set)?cn=Set:(cn=function(){this.set=Object.create(null)},cn.prototype.has=function(t){return void 0!==this.set[t]},cn.prototype.add=function(t){this.set[t]=1},cn.prototype.clear=function(){this.set=Object.create(null)});var un=k.prototype;un.put=function(t,e){var i,n=this.get(t,!0);return n||(this.size===this.limit&&(i=this.shift()),n={key:t},this._keymap[t]=n,this.tail?(this.tail.newer=n,n.older=this.tail):this.head=n,this.tail=n,this.size++),n.value=e,i},un.shift=function(){var t=this.head;return t&&(this.head=this.head.newer,this.head.older=void 0,t.newer=t.older=void 0,this._keymap[t.key]=void 0,this.size--),t},un.get=function(t,e){var i=this._keymap[t];if(void 0!==i)return i===this.tail?e?i:i.value:(i.newer&&(i===this.head&&(this.head=i.newer),i.newer.older=i.older),i.older&&(i.older.newer=i.newer),i.newer=void 0,i.older=this.tail,this.tail&&(this.tail.newer=i),this.tail=i,e?i:i.value)};var fn,pn,dn,vn,mn,gn,_n=new k(1e3),yn=/^in$|^-?\d+/,bn=0,wn=1,Cn=2,$n=3,kn=34,xn=39,An=124,On=92,Tn=32,Nn={91:1,123:1,40:1},jn={91:93,123:125,40:41},En=Object.freeze({parseDirective:I}),Sn=/[-.*+?^${}()|[\]\/\\]/g,Fn=void 0,Dn=void 0,Pn=void 0,Rn=/[^|]\|[^|]/,Ln=Object.freeze({compileRegex:W,parseText:V,tokensToExp:B}),Hn=["{{","}}"],In=["{{{","}}}"],Mn=Object.defineProperties({debug:!1,silent:!1,async:!0,warnExpressionErrors:!0,devtools:!1,_delimitersChanged:!0,_assetTypes:["component","directive","elementDirective","filter","transition","partial"],_propBindingModes:{ONE_WAY:0,TWO_WAY:1,ONE_TIME:2},_maxUpdateCount:100},{delimiters:{get:function(){return Hn},set:function(t){Hn=t,W()},configurable:!0,enumerable:!0},unsafeDelimiters:{get:function(){return In},set:function(t){In=t,W()},configurable:!0,enumerable:!0}}),Wn=void 0,Vn=Object.freeze({appendWithTransition:J,beforeWithTransition:q,removeWithTransition:Q,applyTransition:G}),Bn=/^v-ref:/,zn=/^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer)$/i,Un=/^(slot|partial|component)$/i,Jn=Mn.optionMergeStrategies=Object.create(null);Jn.data=function(t,e,i){return i?t||e?function(){var n="function"==typeof e?e.call(i):e,r="function"==typeof t?t.call(i):void 0;return n?kt(n,r):r}:void 0:e?"function"!=typeof e?t:t?function(){return kt(e.call(this),t.call(this))}:e:t},Jn.el=function(t,e,i){if(i||!e||"function"==typeof e){var n=e||t;return i&&"function"==typeof n?n.call(i):n}},Jn.init=Jn.created=Jn.ready=Jn.attached=Jn.detached=Jn.beforeCompile=Jn.compiled=Jn.beforeDestroy=Jn.destroyed=Jn.activate=function(t,e){return e?t?t.concat(e):qi(e)?e:[e]:t},Mn._assetTypes.forEach(function(t){Jn[t+"s"]=xt}),Jn.watch=Jn.events=function(t,e){if(!e)return t;if(!t)return e;var i={};v(i,t);for(var n in e){var r=i[n],s=e[n];r&&!qi(r)&&(r=[r]),i[n]=r?r.concat(s):[s]}return i},Jn.props=Jn.methods=Jn.computed=function(t,e){if(!e)return t;if(!t)return e;var i=Object.create(null);return v(i,t),v(i,e),i};var qn=function(t,e){return void 0===e?t:e},Qn=0;Et.target=null,Et.prototype.addSub=function(t){this.subs.push(t)},Et.prototype.removeSub=function(t){this.subs.$remove(t)},Et.prototype.depend=function(){Et.target.addDep(this)},Et.prototype.notify=function(){for(var t=d(this.subs),e=0,i=t.length;e<i;e++)t[e].update()};var Gn=Array.prototype,Zn=Object.create(Gn);["push","pop","shift","unshift","splice","sort","reverse"].forEach(function(t){var e=Gn[t];_(Zn,t,function(){for(var i=arguments.length,n=new Array(i);i--;)n[i]=arguments[i];var r,s=e.apply(this,n),o=this.__ob__;switch(t){case"push":r=n;break;case"unshift":r=n;break;case"splice":r=n.slice(2)}return r&&o.observeArray(r),o.dep.notify(),s})}),_(Gn,"$set",function(t,e){return t>=this.length&&(this.length=Number(t)+1),this.splice(t,1,e)[0]}),_(Gn,"$remove",function(t){if(this.length){var e=b(this,t);return e>-1?this.splice(e,1):void 0}});var Xn=Object.getOwnPropertyNames(Zn),Yn=!0;Ft.prototype.walk=function(t){for(var e=Object.keys(t),i=0,n=e.length;i<n;i++)this.convert(e[i],t[e[i]])},Ft.prototype.observeArray=function(t){for(var e=0,i=t.length;e<i;e++)Rt(t[e])},Ft.prototype.convert=function(t,e){Lt(this.value,t,e)},Ft.prototype.addVm=function(t){(this.vms||(this.vms=[])).push(t)},Ft.prototype.removeVm=function(t){this.vms.$remove(t)};var Kn=Object.freeze({defineReactive:Lt,set:t,del:e,hasOwn:i,isLiteral:n,isReserved:r,_toString:s,toNumber:o,toBoolean:a,stripQuotes:h,camelize:l,hyphenate:u,classify:f,bind:p,toArray:d,extend:v,isObject:m,isPlainObject:g,def:_,debounce:y,indexOf:b,cancellable:w,looseEqual:C,isArray:qi,hasProto:Qi,inBrowser:Gi,devtools:Zi,isIE:Yi,isIE9:Ki,isAndroid:tn,isIOS:en,get transitionProp(){return nn},get transitionEndEvent(){return rn},get animationProp(){return sn},get animationEndEvent(){return on},nextTick:ln,get _Set(){return cn},query:Z,inDoc:X,getAttr:Y,getBindAttr:K,hasBindAttr:tt,before:et,after:it,remove:nt,prepend:rt,replace:st,on:ot,off:at,setClass:lt,addClass:ct,removeClass:ut,extractContent:ft,trimNode:pt,isTemplate:vt,createAnchor:mt,findRef:gt,mapNodeRange:_t,removeNodeRange:yt,isFragment:bt,getOuterHTML:wt,mergeOptions:Nt,resolveAsset:jt,checkComponentAttr:Ct,commonTagRE:zn,reservedTagRE:Un,warn:Wn}),tr=0,er=new k(1e3),ir=0,nr=1,rr=2,sr=3,or=0,ar=1,hr=2,lr=3,cr=4,ur=5,fr=6,pr=7,dr=8,vr=[];vr[or]={ws:[or],ident:[lr,ir],"[":[cr],eof:[pr]},vr[ar]={ws:[ar],".":[hr],"[":[cr],eof:[pr]},vr[hr]={ws:[hr],ident:[lr,ir]},vr[lr]={ident:[lr,ir],0:[lr,ir],number:[lr,ir],ws:[ar,nr],".":[hr,nr],"[":[cr,nr],eof:[pr,nr]},vr[cr]={"'":[ur,ir],'"':[fr,ir],"[":[cr,rr],"]":[ar,sr],eof:dr,else:[cr,ir]},vr[ur]={"'":[cr,ir],eof:dr,else:[ur,ir]},vr[fr]={'"':[cr,ir],eof:dr,else:[fr,ir]};var mr=Object.freeze({parsePath:Vt,getPath:Bt,setPath:zt}),gr=new k(1e3),_r="Math,Date,this,true,false,null,undefined,Infinity,NaN,isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,parseInt,parseFloat",yr=new RegExp("^("+_r.replace(/,/g,"\\b|")+"\\b)"),br="break,case,class,catch,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,let,return,super,switch,throw,try,var,while,with,yield,enum,await,implements,package,protected,static,interface,private,public",wr=new RegExp("^("+br.replace(/,/g,"\\b|")+"\\b)"),Cr=/\s/g,$r=/\n/g,kr=/[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\"']|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g,xr=/"(\d+)"/g,Ar=/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/,Or=/[^\w$\.](?:[A-Za-z_$][\w$]*)/g,Tr=/^(?:true|false|null|undefined|Infinity|NaN)$/,Nr=[],jr=Object.freeze({parseExpression:Yt,isSimplePath:Kt}),Er=[],Sr=[],Fr={},Dr={},Pr=!1,Rr=0;re.prototype.get=function(){this.beforeGet();var t,e=this.scope||this.vm;try{t=this.getter.call(e,e)}catch(t){}return this.deep&&se(t),this.preProcess&&(t=this.preProcess(t)),this.filters&&(t=e._applyFilters(t,null,this.filters,!1)),this.postProcess&&(t=this.postProcess(t)),this.afterGet(),t},re.prototype.set=function(t){var e=this.scope||this.vm;this.filters&&(t=e._applyFilters(t,this.value,this.filters,!0));try{this.setter.call(e,e,t)}catch(t){}var i=e.$forContext;if(i&&i.alias===this.expression){if(i.filters)return;i._withLock(function(){e.$key?i.rawValue[e.$key]=t:i.rawValue.$set(e.$index,t)})}},re.prototype.beforeGet=function(){Et.target=this},re.prototype.addDep=function(t){var e=t.id;this.newDepIds.has(e)||(this.newDepIds.add(e),this.newDeps.push(t),this.depIds.has(e)||t.addSub(this))},re.prototype.afterGet=function(){Et.target=null;for(var t=this.deps.length;t--;){var e=this.deps[t];this.newDepIds.has(e.id)||e.removeSub(this)}var i=this.depIds;this.depIds=this.newDepIds,this.newDepIds=i,this.newDepIds.clear(),i=this.deps,this.deps=this.newDeps,this.newDeps=i,this.newDeps.length=0},re.prototype.update=function(t){this.lazy?this.dirty=!0:this.sync||!Mn.async?this.run():(this.shallow=this.queued?!!t&&this.shallow:!!t,this.queued=!0,ne(this))},re.prototype.run=function(){if(this.active){var t=this.get();if(t!==this.value||(m(t)||this.deep)&&!this.shallow){var e=this.value;this.value=t;this.prevError;this.cb.call(this.vm,t,e)}this.queued=this.shallow=!1}},re.prototype.evaluate=function(){var t=Et.target;this.value=this.get(),this.dirty=!1,Et.target=t},re.prototype.depend=function(){for(var t=this.deps.length;t--;)this.deps[t].depend()},re.prototype.teardown=function(){if(this.active){this.vm._isBeingDestroyed||this.vm._vForRemoving||this.vm._watchers.$remove(this);for(var t=this.deps.length;t--;)this.deps[t].removeSub(this);this.active=!1,this.vm=this.cb=this.value=null}};var Lr=new cn,Hr={bind:function(){this.attr=3===this.el.nodeType?"data":"textContent"},update:function(t){this.el[this.attr]=s(t)}},Ir=new k(1e3),Mr=new k(1e3),Wr={efault:[0,"",""],legend:[1,"<fieldset>","</fieldset>"],tr:[2,"<table><tbody>","</tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"]};Wr.td=Wr.th=[3,"<table><tbody><tr>","</tr></tbody></table>"],Wr.option=Wr.optgroup=[1,'<select multiple="multiple">',"</select>"],Wr.thead=Wr.tbody=Wr.colgroup=Wr.caption=Wr.tfoot=[1,"<table>","</table>"],Wr.g=Wr.defs=Wr.symbol=Wr.use=Wr.image=Wr.text=Wr.circle=Wr.ellipse=Wr.line=Wr.path=Wr.polygon=Wr.polyline=Wr.rect=[1,'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events"version="1.1">',"</svg>"];var Vr=/<([\w:-]+)/,Br=/&#?\w+?;/,zr=/<!--/,Ur=function(){if(Gi){var t=document.createElement("div");return t.innerHTML="<template>1</template>",!t.cloneNode(!0).firstChild.innerHTML}return!1}(),Jr=function(){if(Gi){var t=document.createElement("textarea");return t.placeholder="t","t"===t.cloneNode(!0).value}return!1}(),qr=Object.freeze({cloneNode:le,parseTemplate:ce}),Qr={bind:function(){8===this.el.nodeType&&(this.nodes=[],this.anchor=mt("v-html"),st(this.el,this.anchor))},update:function(t){t=s(t),this.nodes?this.swap(t):this.el.innerHTML=t},swap:function(t){for(var e=this.nodes.length;e--;)nt(this.nodes[e]);var i=ce(t,!0,!0);this.nodes=d(i.childNodes),et(i,this.anchor)}};ue.prototype.callHook=function(t){var e,i;for(e=0,i=this.childFrags.length;e<i;e++)this.childFrags[e].callHook(t);for(e=0,i=this.children.length;e<i;e++)t(this.children[e])},ue.prototype.beforeRemove=function(){var t,e;for(t=0,e=this.childFrags.length;t<e;t++)this.childFrags[t].beforeRemove(!1);for(t=0,e=this.children.length;t<e;t++)this.children[t].$destroy(!1,!0);var i=this.unlink.dirs;for(t=0,e=i.length;t<e;t++)i[t]._watcher&&i[t]._watcher.teardown()},ue.prototype.destroy=function(){this.parentFrag&&this.parentFrag.childFrags.$remove(this),this.node.__v_frag=null,this.unlink()};var Gr=new k(5e3);_e.prototype.create=function(t,e,i){var n=le(this.template);return new ue(this.linker,this.vm,n,t,e,i)};var Zr=700,Xr=800,Yr=850,Kr=1100,ts=1500,es=1500,is=1750,ns=2100,rs=2200,ss=2300,os=0,as={priority:rs,terminal:!0,params:["track-by","stagger","enter-stagger","leave-stagger"],bind:function(){var t=this.expression.match(/(.*) (?:in|of) (.*)/);if(t){var e=t[1].match(/\((.*),(.*)\)/);e?(this.iterator=e[1].trim(),this.alias=e[2].trim()):this.alias=t[1].trim(),this.expression=t[2]}if(this.alias){this.id="__v-for__"+ ++os;var i=this.el.tagName;this.isOption=("OPTION"===i||"OPTGROUP"===i)&&"SELECT"===this.el.parentNode.tagName,this.start=mt("v-for-start"),this.end=mt("v-for-end"),st(this.el,this.end),et(this.start,this.end),this.cache=Object.create(null),this.factory=new _e(this.vm,this.el)}},update:function(t){this.diff(t),this.updateRef(),this.updateModel()},diff:function(t){var e,n,r,s,o,a,h=t[0],l=this.fromObject=m(h)&&i(h,"$key")&&i(h,"$value"),c=this.params.trackBy,u=this.frags,f=this.frags=new Array(t.length),p=this.alias,d=this.iterator,v=this.start,g=this.end,_=X(v),y=!u;for(e=0,n=t.length;e<n;e++)h=t[e],s=l?h.$key:null,o=l?h.$value:h,a=!m(o),r=!y&&this.getCachedFrag(o,e,s),r?(r.reused=!0,r.scope.$index=e,s&&(r.scope.$key=s),d&&(r.scope[d]=null!==s?s:e),(c||l||a)&&St(function(){r.scope[p]=o})):(r=this.create(o,p,e,s),r.fresh=!y),f[e]=r,y&&r.before(g);if(!y){var b=0,w=u.length-f.length;for(this.vm._vForRemoving=!0,e=0,n=u.length;e<n;e++)r=u[e],r.reused||(this.deleteCachedFrag(r),this.remove(r,b++,w,_));this.vm._vForRemoving=!1,b&&(this.vm._watchers=this.vm._watchers.filter(function(t){return t.active}));var C,$,k,x=0;for(e=0,n=f.length;e<n;e++)r=f[e],C=f[e-1],$=C?C.staggerCb?C.staggerAnchor:C.end||C.node:v,r.reused&&!r.staggerCb?(k=ye(r,v,this.id),k===C||k&&ye(k,v,this.id)===C||this.move(r,$)):this.insert(r,x++,$,_),r.reused=r.fresh=!1}},create:function(t,e,i,n){var r=this._host,s=this._scope||this.vm,o=Object.create(s);o.$refs=Object.create(s.$refs),o.$els=Object.create(s.$els),o.$parent=s,o.$forContext=this,St(function(){Lt(o,e,t)}),Lt(o,"$index",i),n?Lt(o,"$key",n):o.$key&&_(o,"$key",null),this.iterator&&Lt(o,this.iterator,null!==n?n:i);var a=this.factory.create(r,o,this._frag);return a.forId=this.id,this.cacheFrag(t,a,i,n),a},updateRef:function(){var t=this.descriptor.ref;if(t){var e,i=(this._scope||this.vm).$refs;this.fromObject?(e={},this.frags.forEach(function(t){e[t.scope.$key]=Ce(t)})):e=this.frags.map(Ce),i[t]=e}},updateModel:function(){if(this.isOption){var t=this.start.parentNode,e=t&&t.__v_model;e&&e.forceUpdate()}},insert:function(t,e,i,n){t.staggerCb&&(t.staggerCb.cancel(),t.staggerCb=null);var r=this.getStagger(t,e,null,"enter");if(n&&r){var s=t.staggerAnchor;s||(s=t.staggerAnchor=mt("stagger-anchor"),s.__v_frag=t),it(s,i);var o=t.staggerCb=w(function(){t.staggerCb=null,t.before(s),nt(s)});setTimeout(o,r)}else{var a=i.nextSibling;a||(it(this.end,i),a=this.end),t.before(a)}},remove:function(t,e,i,n){if(t.staggerCb)return t.staggerCb.cancel(),void(t.staggerCb=null);var r=this.getStagger(t,e,i,"leave");if(n&&r){var s=t.staggerCb=w(function(){t.staggerCb=null,t.remove()});setTimeout(s,r)}else t.remove()},move:function(t,e){e.nextSibling||this.end.parentNode.appendChild(this.end),t.before(e.nextSibling,!1)},cacheFrag:function(t,e,n,r){var s,o=this.params.trackBy,a=this.cache,h=!m(t);r||o||h?(s=we(n,r,t,o),a[s]||(a[s]=e)):(s=this.id,i(t,s)?null===t[s]&&(t[s]=e):Object.isExtensible(t)&&_(t,s,e)),e.raw=t},getCachedFrag:function(t,e,i){var n,r=this.params.trackBy,s=!m(t);if(i||r||s){var o=we(e,i,t,r);n=this.cache[o]}else n=t[this.id];return n&&(n.reused||n.fresh),n},deleteCachedFrag:function(t){var e=t.raw,n=this.params.trackBy,r=t.scope,s=r.$index,o=i(r,"$key")&&r.$key,a=!m(e);if(n||o||a){var h=we(s,o,e,n);this.cache[h]=null}else e[this.id]=null,t.raw=null},getStagger:function(t,e,i,n){n+="Stagger";var r=t.node.__v_trans,s=r&&r.hooks,o=s&&(s[n]||s.stagger);return o?o.call(t,e,i):e*parseInt(this.params[n]||this.params.stagger,10)},_preProcess:function(t){return this.rawValue=t,t},_postProcess:function(t){if(qi(t))return t;if(g(t)){for(var e,i=Object.keys(t),n=i.length,r=new Array(n);n--;)e=i[n],r[n]={$key:e,$value:t[e]};return r}return"number"!=typeof t||isNaN(t)||(t=be(t)),t||[]},unbind:function(){if(this.descriptor.ref&&((this._scope||this.vm).$refs[this.descriptor.ref]=null),this.frags)for(var t,e=this.frags.length;e--;)t=this.frags[e],this.deleteCachedFrag(t),t.destroy()}},hs={priority:ns,terminal:!0,bind:function(){var t=this.el;if(t.__vue__)this.invalid=!0;else{var e=t.nextElementSibling;e&&null!==Y(e,"v-else")&&(nt(e),this.elseEl=e),this.anchor=mt("v-if"),st(t,this.anchor)}},update:function(t){this.invalid||(t?this.frag||this.insert():this.remove())},insert:function(){this.elseFrag&&(this.elseFrag.remove(),this.elseFrag=null),this.factory||(this.factory=new _e(this.vm,this.el)),this.frag=this.factory.create(this._host,this._scope,this._frag),this.frag.before(this.anchor)},remove:function(){this.frag&&(this.frag.remove(),this.frag=null),this.elseEl&&!this.elseFrag&&(this.elseFactory||(this.elseFactory=new _e(this.elseEl._context||this.vm,this.elseEl)),this.elseFrag=this.elseFactory.create(this._host,this._scope,this._frag),this.elseFrag.before(this.anchor))},unbind:function(){this.frag&&this.frag.destroy(),this.elseFrag&&this.elseFrag.destroy()}},ls={bind:function(){var t=this.el.nextElementSibling;t&&null!==Y(t,"v-else")&&(this.elseEl=t)},update:function(t){this.apply(this.el,t),this.elseEl&&this.apply(this.elseEl,!t)},apply:function(t,e){function i(){t.style.display=e?"":"none"}X(t)?G(t,e?1:-1,i,this.vm):i()}},cs={bind:function(){var t=this,e=this.el,i="range"===e.type,n=this.params.lazy,r=this.params.number,s=this.params.debounce,a=!1;if(tn||i||(this.on("compositionstart",function(){a=!0}),this.on("compositionend",function(){a=!1,n||t.listener()})),this.focused=!1,i||n||(this.on("focus",function(){t.focused=!0}),this.on("blur",function(){t.focused=!1,t._frag&&!t._frag.inserted||t.rawListener()})),this.listener=this.rawListener=function(){if(!a&&t._bound){var n=r||i?o(e.value):e.value;t.set(n),ln(function(){t._bound&&!t.focused&&t.update(t._watcher.value)})}},s&&(this.listener=y(this.listener,s)),this.hasjQuery="function"==typeof jQuery,this.hasjQuery){var h=jQuery.fn.on?"on":"bind";jQuery(e)[h]("change",this.rawListener),n||jQuery(e)[h]("input",this.listener)}else this.on("change",this.rawListener),n||this.on("input",this.listener);!n&&Ki&&(this.on("cut",function(){ln(t.listener)}),this.on("keyup",function(e){46!==e.keyCode&&8!==e.keyCode||t.listener()})),(e.hasAttribute("value")||"TEXTAREA"===e.tagName&&e.value.trim())&&(this.afterBind=this.listener)},update:function(t){t=s(t),t!==this.el.value&&(this.el.value=t)},unbind:function(){var t=this.el;if(this.hasjQuery){var e=jQuery.fn.off?"off":"unbind";jQuery(t)[e]("change",this.listener),jQuery(t)[e]("input",this.listener)}}},us={bind:function(){var t=this,e=this.el;this.getValue=function(){if(e.hasOwnProperty("_value"))return e._value;var i=e.value;return t.params.number&&(i=o(i)),i},this.listener=function(){t.set(t.getValue())},this.on("change",this.listener),e.hasAttribute("checked")&&(this.afterBind=this.listener)},update:function(t){this.el.checked=C(t,this.getValue())}},fs={bind:function(){var t=this,e=this,i=this.el;this.forceUpdate=function(){e._watcher&&e.update(e._watcher.get())};var n=this.multiple=i.hasAttribute("multiple");this.listener=function(){var t=$e(i,n);t=e.params.number?qi(t)?t.map(o):o(t):t,e.set(t)},this.on("change",this.listener);var r=$e(i,n,!0);(n&&r.length||!n&&null!==r)&&(this.afterBind=this.listener),this.vm.$on("hook:attached",function(){ln(t.forceUpdate)}),X(i)||ln(this.forceUpdate)},update:function(t){var e=this.el;e.selectedIndex=-1;for(var i,n,r=this.multiple&&qi(t),s=e.options,o=s.length;o--;)i=s[o],n=i.hasOwnProperty("_value")?i._value:i.value,i.selected=r?ke(t,n)>-1:C(t,n)},unbind:function(){this.vm.$off("hook:attached",this.forceUpdate)}},ps={bind:function(){function t(){var t=i.checked;return t&&i.hasOwnProperty("_trueValue")?i._trueValue:!t&&i.hasOwnProperty("_falseValue")?i._falseValue:t}var e=this,i=this.el;this.getValue=function(){return i.hasOwnProperty("_value")?i._value:e.params.number?o(i.value):i.value},this.listener=function(){var n=e._watcher.get();if(qi(n)){var r=e.getValue(),s=b(n,r);i.checked?s<0&&e.set(n.concat(r)):s>-1&&e.set(n.slice(0,s).concat(n.slice(s+1)))}else e.set(t())},this.on("change",this.listener),i.hasAttribute("checked")&&(this.afterBind=this.listener)},update:function(t){var e=this.el;qi(t)?e.checked=b(t,this.getValue())>-1:e.hasOwnProperty("_trueValue")?e.checked=C(t,e._trueValue):e.checked=!!t}},ds={text:cs,radio:us,select:fs,checkbox:ps},vs={priority:Xr,twoWay:!0,handlers:ds,params:["lazy","number","debounce"],bind:function(){this.checkFilters(),this.hasRead&&!this.hasWrite;var t,e=this.el,i=e.tagName;if("INPUT"===i)t=ds[e.type]||ds.text;else if("SELECT"===i)t=ds.select;else{if("TEXTAREA"!==i)return;t=ds.text}e.__v_model=this,t.bind.call(this),this.update=t.update,this._unbind=t.unbind},checkFilters:function(){var t=this.filters;if(t)for(var e=t.length;e--;){var i=jt(this.vm.$options,"filters",t[e].name);("function"==typeof i||i.read)&&(this.hasRead=!0),i.write&&(this.hasWrite=!0)}},unbind:function(){this.el.__v_model=null,this._unbind&&this._unbind()}},ms={esc:27,tab:9,enter:13,space:32,delete:[8,46],up:38,left:37,right:39,down:40},gs={priority:Zr,acceptStatement:!0,keyCodes:ms,bind:function(){if("IFRAME"===this.el.tagName&&"load"!==this.arg){var t=this;this.iframeBind=function(){ot(t.el.contentWindow,t.arg,t.handler,t.modifiers.capture)},this.on("load",this.iframeBind)}},update:function(t){if(this.descriptor.raw||(t=function(){}),"function"==typeof t){this.modifiers.stop&&(t=Ae(t)),this.modifiers.prevent&&(t=Oe(t)),this.modifiers.self&&(t=Te(t));var e=Object.keys(this.modifiers).filter(function(t){return"stop"!==t&&"prevent"!==t&&"self"!==t&&"capture"!==t});e.length&&(t=xe(t,e)),this.reset(),this.handler=t,this.iframeBind?this.iframeBind():ot(this.el,this.arg,this.handler,this.modifiers.capture)}},reset:function(){var t=this.iframeBind?this.el.contentWindow:this.el;this.handler&&at(t,this.arg,this.handler)},unbind:function(){this.reset()}},_s=["-webkit-","-moz-","-ms-"],ys=["Webkit","Moz","ms"],bs=/!important;?$/,ws=Object.create(null),Cs=null,$s={deep:!0,update:function(t){"string"==typeof t?this.el.style.cssText=t:qi(t)?this.handleObject(t.reduce(v,{})):this.handleObject(t||{})},handleObject:function(t){var e,i,n=this.cache||(this.cache={});for(e in n)e in t||(this.handleSingle(e,null),delete n[e]);for(e in t)i=t[e],i!==n[e]&&(n[e]=i,this.handleSingle(e,i))},handleSingle:function(t,e){if(t=Ne(t))if(null!=e&&(e+=""),e){var i=bs.test(e)?"important":"";i?(e=e.replace(bs,"").trim(),this.el.style.setProperty(t.kebab,e,i)):this.el.style[t.camel]=e;
}else this.el.style[t.camel]=""}},ks="http://www.w3.org/1999/xlink",xs=/^xlink:/,As=/^v-|^:|^@|^(?:is|transition|transition-mode|debounce|track-by|stagger|enter-stagger|leave-stagger)$/,Os=/^(?:value|checked|selected|muted)$/,Ts=/^(?:draggable|contenteditable|spellcheck)$/,Ns={value:"_value","true-value":"_trueValue","false-value":"_falseValue"},js={priority:Yr,bind:function(){var t=this.arg,e=this.el.tagName;t||(this.deep=!0);var i=this.descriptor,n=i.interp;n&&(i.hasOneTime&&(this.expression=B(n,this._scope||this.vm)),(As.test(t)||"name"===t&&("PARTIAL"===e||"SLOT"===e))&&(this.el.removeAttribute(t),this.invalid=!0))},update:function(t){if(!this.invalid){var e=this.arg;this.arg?this.handleSingle(e,t):this.handleObject(t||{})}},handleObject:$s.handleObject,handleSingle:function(t,e){var i=this.el,n=this.descriptor.interp;if(this.modifiers.camel&&(t=l(t)),!n&&Os.test(t)&&t in i){var r="value"===t&&null==e?"":e;i[t]!==r&&(i[t]=r)}var s=Ns[t];if(!n&&s){i[s]=e;var o=i.__v_model;o&&o.listener()}return"value"===t&&"TEXTAREA"===i.tagName?void i.removeAttribute(t):void(Ts.test(t)?i.setAttribute(t,e?"true":"false"):null!=e&&e!==!1?"class"===t?(i.__v_trans&&(e+=" "+i.__v_trans.id+"-transition"),lt(i,e)):xs.test(t)?i.setAttributeNS(ks,t,e===!0?"":e):i.setAttribute(t,e===!0?"":e):i.removeAttribute(t))}},Es={priority:ts,bind:function(){if(this.arg){var t=this.id=l(this.arg),e=(this._scope||this.vm).$els;i(e,t)?e[t]=this.el:Lt(e,t,this.el)}},unbind:function(){var t=(this._scope||this.vm).$els;t[this.id]===this.el&&(t[this.id]=null)}},Ss={bind:function(){}},Fs={bind:function(){var t=this.el;this.vm.$once("pre-hook:compiled",function(){t.removeAttribute("v-cloak")})}},Ds={text:Hr,html:Qr,for:as,if:hs,show:ls,model:vs,on:gs,bind:js,el:Es,ref:Ss,cloak:Fs},Ps={deep:!0,update:function(t){t?"string"==typeof t?this.setClass(t.trim().split(/\s+/)):this.setClass(Ee(t)):this.cleanup()},setClass:function(t){this.cleanup(t);for(var e=0,i=t.length;e<i;e++){var n=t[e];n&&Se(this.el,n,ct)}this.prevKeys=t},cleanup:function(t){var e=this.prevKeys;if(e)for(var i=e.length;i--;){var n=e[i];(!t||t.indexOf(n)<0)&&Se(this.el,n,ut)}}},Rs={priority:es,params:["keep-alive","transition-mode","inline-template"],bind:function(){this.el.__vue__||(this.keepAlive=this.params.keepAlive,this.keepAlive&&(this.cache={}),this.params.inlineTemplate&&(this.inlineTemplate=ft(this.el,!0)),this.pendingComponentCb=this.Component=null,this.pendingRemovals=0,this.pendingRemovalCb=null,this.anchor=mt("v-component"),st(this.el,this.anchor),this.el.removeAttribute("is"),this.el.removeAttribute(":is"),this.descriptor.ref&&this.el.removeAttribute("v-ref:"+u(this.descriptor.ref)),this.literal&&this.setComponent(this.expression))},update:function(t){this.literal||this.setComponent(t)},setComponent:function(t,e){if(this.invalidatePending(),t){var i=this;this.resolveComponent(t,function(){i.mountComponent(e)})}else this.unbuild(!0),this.remove(this.childVM,e),this.childVM=null},resolveComponent:function(t,e){var i=this;this.pendingComponentCb=w(function(n){i.ComponentName=n.options.name||("string"==typeof t?t:null),i.Component=n,e()}),this.vm._resolveComponent(t,this.pendingComponentCb)},mountComponent:function(t){this.unbuild(!0);var e=this,i=this.Component.options.activate,n=this.getCached(),r=this.build();i&&!n?(this.waitingFor=r,Fe(i,r,function(){e.waitingFor===r&&(e.waitingFor=null,e.transition(r,t))})):(n&&r._updateRef(),this.transition(r,t))},invalidatePending:function(){this.pendingComponentCb&&(this.pendingComponentCb.cancel(),this.pendingComponentCb=null)},build:function(t){var e=this.getCached();if(e)return e;if(this.Component){var i={name:this.ComponentName,el:le(this.el),template:this.inlineTemplate,parent:this._host||this.vm,_linkerCachable:!this.inlineTemplate,_ref:this.descriptor.ref,_asComponent:!0,_isRouterView:this._isRouterView,_context:this.vm,_scope:this._scope,_frag:this._frag};t&&v(i,t);var n=new this.Component(i);return this.keepAlive&&(this.cache[this.Component.cid]=n),n}},getCached:function(){return this.keepAlive&&this.cache[this.Component.cid]},unbuild:function(t){this.waitingFor&&(this.keepAlive||this.waitingFor.$destroy(),this.waitingFor=null);var e=this.childVM;return!e||this.keepAlive?void(e&&(e._inactive=!0,e._updateRef(!0))):void e.$destroy(!1,t)},remove:function(t,e){var i=this.keepAlive;if(t){this.pendingRemovals++,this.pendingRemovalCb=e;var n=this;t.$remove(function(){n.pendingRemovals--,i||t._cleanup(),!n.pendingRemovals&&n.pendingRemovalCb&&(n.pendingRemovalCb(),n.pendingRemovalCb=null)})}else e&&e()},transition:function(t,e){var i=this,n=this.childVM;switch(n&&(n._inactive=!0),t._inactive=!1,this.childVM=t,i.params.transitionMode){case"in-out":t.$before(i.anchor,function(){i.remove(n,e)});break;case"out-in":i.remove(n,function(){t.$before(i.anchor,e)});break;default:i.remove(n),t.$before(i.anchor,e)}},unbind:function(){if(this.invalidatePending(),this.unbuild(),this.cache){for(var t in this.cache)this.cache[t].$destroy();this.cache=null}}},Ls=Mn._propBindingModes,Hs={},Is=/^[$_a-zA-Z]+[\w$]*$/,Ms=Mn._propBindingModes,Ws={bind:function(){var t=this.vm,e=t._context,i=this.descriptor.prop,n=i.path,r=i.parentPath,s=i.mode===Ms.TWO_WAY,o=this.parentWatcher=new re(e,r,function(e){He(t,i,e)},{twoWay:s,filters:i.filters,scope:this._scope});if(Le(t,i,o.value),s){var a=this;t.$once("pre-hook:created",function(){a.childWatcher=new re(t,n,function(t){o.set(t)},{sync:!0})})}},unbind:function(){this.parentWatcher.teardown(),this.childWatcher&&this.childWatcher.teardown()}},Vs=[],Bs=!1,zs="transition",Us="animation",Js=nn+"Duration",qs=sn+"Duration",Qs=Gi&&window.requestAnimationFrame,Gs=Qs?function(t){Qs(function(){Qs(t)})}:function(t){setTimeout(t,50)},Zs=Ue.prototype;Zs.enter=function(t,e){this.cancelPending(),this.callHook("beforeEnter"),this.cb=e,ct(this.el,this.enterClass),t(),this.entered=!1,this.callHookWithCb("enter"),this.entered||(this.cancel=this.hooks&&this.hooks.enterCancelled,Be(this.enterNextTick))},Zs.enterNextTick=function(){var t=this;this.justEntered=!0,Gs(function(){t.justEntered=!1});var e=this.enterDone,i=this.getCssTransitionType(this.enterClass);this.pendingJsCb?i===zs&&ut(this.el,this.enterClass):i===zs?(ut(this.el,this.enterClass),this.setupCssCb(rn,e)):i===Us?this.setupCssCb(on,e):e()},Zs.enterDone=function(){this.entered=!0,this.cancel=this.pendingJsCb=null,ut(this.el,this.enterClass),this.callHook("afterEnter"),this.cb&&this.cb()},Zs.leave=function(t,e){this.cancelPending(),this.callHook("beforeLeave"),this.op=t,this.cb=e,ct(this.el,this.leaveClass),this.left=!1,this.callHookWithCb("leave"),this.left||(this.cancel=this.hooks&&this.hooks.leaveCancelled,this.op&&!this.pendingJsCb&&(this.justEntered?this.leaveDone():Be(this.leaveNextTick)))},Zs.leaveNextTick=function(){var t=this.getCssTransitionType(this.leaveClass);if(t){var e=t===zs?rn:on;this.setupCssCb(e,this.leaveDone)}else this.leaveDone()},Zs.leaveDone=function(){this.left=!0,this.cancel=this.pendingJsCb=null,this.op(),ut(this.el,this.leaveClass),this.callHook("afterLeave"),this.cb&&this.cb(),this.op=null},Zs.cancelPending=function(){this.op=this.cb=null;var t=!1;this.pendingCssCb&&(t=!0,at(this.el,this.pendingCssEvent,this.pendingCssCb),this.pendingCssEvent=this.pendingCssCb=null),this.pendingJsCb&&(t=!0,this.pendingJsCb.cancel(),this.pendingJsCb=null),t&&(ut(this.el,this.enterClass),ut(this.el,this.leaveClass)),this.cancel&&(this.cancel.call(this.vm,this.el),this.cancel=null)},Zs.callHook=function(t){this.hooks&&this.hooks[t]&&this.hooks[t].call(this.vm,this.el)},Zs.callHookWithCb=function(t){var e=this.hooks&&this.hooks[t];e&&(e.length>1&&(this.pendingJsCb=w(this[t+"Done"])),e.call(this.vm,this.el,this.pendingJsCb))},Zs.getCssTransitionType=function(t){if(!(!rn||document.hidden||this.hooks&&this.hooks.css===!1||Je(this.el))){var e=this.type||this.typeCache[t];if(e)return e;var i=this.el.style,n=window.getComputedStyle(this.el),r=i[Js]||n[Js];if(r&&"0s"!==r)e=zs;else{var s=i[qs]||n[qs];s&&"0s"!==s&&(e=Us)}return e&&(this.typeCache[t]=e),e}},Zs.setupCssCb=function(t,e){this.pendingCssEvent=t;var i=this,n=this.el,r=this.pendingCssCb=function(s){s.target===n&&(at(n,t,r),i.pendingCssEvent=i.pendingCssCb=null,!i.pendingJsCb&&e&&e())};ot(n,t,r)};var Xs={priority:Kr,update:function(t,e){var i=this.el,n=jt(this.vm.$options,"transitions",t);t=t||"v",e=e||"v",i.__v_trans=new Ue(i,t,n,this.vm),ut(i,e+"-transition"),ct(i,t+"-transition")}},Ys={style:$s,class:Ps,component:Rs,prop:Ws,transition:Xs},Ks=/^v-bind:|^:/,to=/^v-on:|^@/,eo=/^v-([^:]+)(?:$|:(.*)$)/,io=/\.[^\.]+/g,no=/^(v-bind:|:)?transition$/,ro=1e3,so=2e3;ui.terminal=!0;var oo=/[^\w\-:\.]/,ao=Object.freeze({compile:qe,compileAndLinkProps:Ye,compileRoot:Ke,transclude:_i,resolveSlots:Ci}),ho=/^v-on:|^@/;Oi.prototype._bind=function(){var t=this.name,e=this.descriptor;if(("cloak"!==t||this.vm._isCompiled)&&this.el&&this.el.removeAttribute){var i=e.attr||"v-"+t;this.el.removeAttribute(i)}var n=e.def;if("function"==typeof n?this.update=n:v(this,n),this._setupParams(),this.bind&&this.bind(),this._bound=!0,this.literal)this.update&&this.update(e.raw);else if((this.expression||this.modifiers)&&(this.update||this.twoWay)&&!this._checkStatement()){var r=this;this.update?this._update=function(t,e){r._locked||r.update(t,e)}:this._update=Ai;var s=this._preProcess?p(this._preProcess,this):null,o=this._postProcess?p(this._postProcess,this):null,a=this._watcher=new re(this.vm,this.expression,this._update,{filters:this.filters,twoWay:this.twoWay,deep:this.deep,preProcess:s,postProcess:o,scope:this._scope});this.afterBind?this.afterBind():this.update&&this.update(a.value)}},Oi.prototype._setupParams=function(){if(this.params){var t=this.params;this.params=Object.create(null);for(var e,i,n,r=t.length;r--;)e=u(t[r]),n=l(e),i=K(this.el,e),null!=i?this._setupParamWatcher(n,i):(i=Y(this.el,e),null!=i&&(this.params[n]=""===i||i))}},Oi.prototype._setupParamWatcher=function(t,e){var i=this,n=!1,r=(this._scope||this.vm).$watch(e,function(e,r){if(i.params[t]=e,n){var s=i.paramWatchers&&i.paramWatchers[t];s&&s.call(i,e,r)}else n=!0},{immediate:!0,user:!1});(this._paramUnwatchFns||(this._paramUnwatchFns=[])).push(r)},Oi.prototype._checkStatement=function(){var t=this.expression;if(t&&this.acceptStatement&&!Kt(t)){var e=Yt(t).get,i=this._scope||this.vm,n=function(t){i.$event=t,e.call(i,i),i.$event=null};return this.filters&&(n=i._applyFilters(n,null,this.filters)),this.update(n),!0}},Oi.prototype.set=function(t){this.twoWay&&this._withLock(function(){this._watcher.set(t)})},Oi.prototype._withLock=function(t){var e=this;e._locked=!0,t.call(e),ln(function(){e._locked=!1})},Oi.prototype.on=function(t,e,i){ot(this.el,t,e,i),(this._listeners||(this._listeners=[])).push([t,e])},Oi.prototype._teardown=function(){if(this._bound){this._bound=!1,this.unbind&&this.unbind(),this._watcher&&this._watcher.teardown();var t,e=this._listeners;if(e)for(t=e.length;t--;)at(this.el,e[t][0],e[t][1]);var i=this._paramUnwatchFns;if(i)for(t=i.length;t--;)i[t]();this.vm=this.el=this._watcher=this._listeners=null}};var lo=/[^|]\|[^|]/;Ht(Di),ki(Di),xi(Di),Ti(Di),Ni(Di),ji(Di),Ei(Di),Si(Di),Fi(Di);var co={priority:ss,params:["name"],bind:function(){var t=this.params.name||"default",e=this.vm._slotContents&&this.vm._slotContents[t];e&&e.hasChildNodes()?this.compile(e.cloneNode(!0),this.vm._context,this.vm):this.fallback()},compile:function(t,e,i){if(t&&e){if(this.el.hasChildNodes()&&1===t.childNodes.length&&1===t.childNodes[0].nodeType&&t.childNodes[0].hasAttribute("v-if")){var n=document.createElement("template");n.setAttribute("v-else",""),n.innerHTML=this.el.innerHTML,n._context=this.vm,t.appendChild(n)}var r=i?i._scope:this._scope;this.unlink=e.$compile(t,i,r,this._frag)}t?st(this.el,t):nt(this.el)},fallback:function(){this.compile(ft(this.el,!0),this.vm)},unbind:function(){this.unlink&&this.unlink()}},uo={priority:is,params:["name"],paramWatchers:{name:function(t){hs.remove.call(this),t&&this.insert(t)}},bind:function(){this.anchor=mt("v-partial"),st(this.el,this.anchor),this.insert(this.params.name)},insert:function(t){var e=jt(this.vm.$options,"partials",t,!0);e&&(this.factory=new _e(this.vm,e),hs.insert.call(this))},unbind:function(){this.frag&&this.frag.destroy()}},fo={slot:co,partial:uo},po=as._postProcess,vo=/(\d{3})(?=\d)/g,mo={orderBy:Li,filterBy:Ri,limitBy:Pi,json:{read:function(t,e){return"string"==typeof t?t:JSON.stringify(t,null,arguments.length>1?e:2)},write:function(t){try{return JSON.parse(t)}catch(e){return t}}},capitalize:function(t){return t||0===t?(t=t.toString(),t.charAt(0).toUpperCase()+t.slice(1)):""},uppercase:function(t){return t||0===t?t.toString().toUpperCase():""},lowercase:function(t){return t||0===t?t.toString().toLowerCase():""},currency:function(t,e,i){if(t=parseFloat(t),!isFinite(t)||!t&&0!==t)return"";e=null!=e?e:"$",i=null!=i?i:2;var n=Math.abs(t).toFixed(i),r=i?n.slice(0,-1-i):n,s=r.length%3,o=s>0?r.slice(0,s)+(r.length>3?",":""):"",a=i?n.slice(-1-i):"",h=t<0?"-":"";return h+e+o+r.slice(s).replace(vo,"$1,")+a},pluralize:function(t){var e=d(arguments,1),i=e.length;if(i>1){var n=t%10-1;return n in e?e[n]:e[i-1]}return e[0]+(1===t?"":"s")},debounce:function(t,e){if(t)return e||(e=300),y(t,e)}};return Ii(Di),Di.version="1.0.28",setTimeout(function(){Mn.devtools&&Zi&&Zi.emit("init",Di)},0),Di});
//# sourceMappingURL=vue.min.js.map
// Vue Customizations specific to Social Fixer
Vue.directive('tooltip', function (o) {
    this.el.setAttribute('data-hover','tooltip');
    // If a config object is passed, o will be parsed and populated
    if (o) {
        if (o.content) {
            this.el.setAttribute('title', o.content);
            this.el.setAttribute('data-tooltip-content', o.content);
        }
        o.uri && this.el.setAttribute('data-tooltip-uri',o.uri);
        this.el.setAttribute('data-tooltip-delay', (typeof o.delay!="undefined") ? o.delay : 1 * X.seconds);
        o.position && this.el.setAttribute('data-tooltip-position', o.position);
        o.align && this.el.setAttribute('data-tooltip-alignh', o.align);
        if (o.icon) {
            this.el.className="sfx-help-icon";
            this.el.setAttribute('data-tooltip-delay',1);
        }
    }
    else {
        this.el.setAttribute('data-tooltip-content', this.expression);
        this.el.setAttribute('title', this.expression);
        if (this.el.getAttribute('data-tooltip-delay')==null) {
            this.el.setAttribute('data-tooltip-delay', "1000");
        }
    }
});
Vue.filter('highlight', function(words, query){
    var iQuery = new RegExp(query, "ig");
    return words.toString().replace(iQuery, function(matchedTxt,a,b){
        return ('<span class=\'sfx_highlight\'>' + matchedTxt + '</span>');
    });
});
Vue.filter('date', function(val){
    return (new Date(val)).toString().replace(/\s*GMT.*/,'');
});
Vue.filter('ago', function(val){
	return X.ago(val);
});

// Vue's 'json' filter, but return {} instead of '' on parse failure.
// Lets `v-model="my_obj | json+"` not fail when input buffer is empty.
Vue.filter('json+', {
    read: function (t, e) {
        return 'string' == typeof t ? t : JSON.stringify(t, null, arguments.length > 1 ? e : 2)
    },
    write: function (t) {
        try {
            return JSON.parse(t)
        } catch (e) {
            return {}
        }
    }
});

// Custom Components

// Option Checkbox
Vue.component('sfx-checkbox', {
    template:`<span><input id="sfx-cb-{{key}}" type="checkbox" v-on:click="click"/><label for="sfx-cb-{{key}}"></label></span>`,
    props: ['key'],
    activate: function(done) {
        this.$cb = X(this.$el.firstChild);
        this.$cb.prop('checked', FX.option(this.key));
        done();
    },
    methods: {
        click:function() {
            this.$cb.addClass('sfx_saving');
            FX.option(this.key, this.$cb.prop('checked'), true, function() {
                this.$cb.removeClass('sfx_saving');
            });
        }
    }

});
// For Vue Templates
// =============================
function template(appendTo,template,data,methods,computed,events) {
    var frag = document.createDocumentFragment();
    var ready = function(){};
    var v = new Vue(X.extend({
        "el":frag
        ,"template":template
        ,"data":data
        ,"methods":methods
        ,"computed":computed
        ,"replace":false
        ,"ready":function() { ready(v); }
    },events));
    if (appendTo) {
        v.$appendTo(appendTo); // Content has already been sanitized
    }
    var o = {
        "$view":v,
        "fragment":frag,
        "ready": function(func) {
            if (v._isReady) { func(); }
            else { ready=func; }
            return o;
        }
    };
    return o;
}

/*
 * This is a small library specific to Facebook functionality / extensions
 */
var FX = (function() {
    var css_queue = [];
    var on_page_load_queue = [];
    var on_page_unload_queue = [];
    var on_content_loaded_queue = [];
    var on_options_load_queue = [];
    var html_class_names = [];

    var fire_queue = function (arr, reset, arg) {
        if (!arr || !arr.length) {
            return;
        }
        arr.forEach(function (func) {
            try {
                func(arg);
            } catch(e) {
                console.log(e);
                console.log(e.toString());
                console.log(e.stack);
            }
        });
        if (reset) {
            arr.length = 0;
        }
    };

    // Monitor for hash change to detect when navigation has happened
    // TODO: Even for popups like photo viewer?!
    var page_transitioning = false;
    var page_transition = function() {
        if (page_transitioning) { return; } // Already initiated
        page_transitioning = true;
        // Fire the unload queue
        fire_queue(on_page_unload_queue);
        page_transitioning = false;
        fire_queue(on_page_load_queue);
    };
    // Monkey patch the pushState/replaceState calls in the main window to capture the event.
    // This will tell us if navigation happened that wasn't a full page reload
    // Detect changes through window.addEventListener(pushState|replaceState)
    var watch_history = function() {
        var _wr = function (type) {
            var orig = history[type];
            return function (state,title,url) {
                var url_change = (url && url!=location.href && !/theater/.test(url));
                var rv = orig.apply(this, arguments);
                if (url_change) {
                    var e = new Event(type);
                    e.arguments = arguments;
                    window.dispatchEvent(e);
                }
                return rv;
            };
        };
        window.history.pushState = _wr('pushState');
        window.history.replaceState = _wr('replaceState');
    };
    X.inject(watch_history);
    // Now listen for the state change events
    window.addEventListener("pushState",page_transition,false);
    window.addEventListener("replaceState",page_transition,false);

    // Facebook uses the HTML5 window.history.pushState() method to change url's in newer browsers.
    // Older browsers will use the hashchange approach
    window.addEventListener('hashchange',page_transition,false);
    window.addEventListener('popstate',page_transition,false);
    window.addEventListener('DOMContentLoaded',function() {
    });

    // Public API
    var fx = {};
    fx.css = function(css_text) {
        css_queue.push(css_text);
    };
    fx.css_dump = function() {
        if (css_queue.length==0) { return; }
        var css = css_queue.join('');
        X.css(css,'sfx_css');
    };

    // OPTIONS
    // -------
    // options : A hash of ALL available options, as defined by modules, along with default values
    fx.options = {};
    // is_options_loaded : Once options is loaded, this flag flips
    fx.is_options_loaded = false;
    fx.add_option = function(key,o) {
        o = o || {};
        o.key = key;
        o.type = o.type || 'checkbox';
        if (typeof o['default']=="undefined" && o.type=="checkbox") {
            o['default'] = false;
        }
        this.options[key] = o;
    };
    fx.option =function(key,value,save,callback) {
        // The defined option
        var o = fx.options[key];
        if (typeof value!="undefined") {
            // SET the value
            X.storage.set('options',key,value,function() {
                fx.fire_option_update(key,value);
                if (typeof callback=="function") {
                    callback();
                }
            },save);
            return value;
        }
        // GET the value
        // If it's defined in the storage layer, get that
        if (typeof X.storage.data.options!="undefined" && typeof X.storage.data.options[key]!="undefined") {
            return X.storage.data.options[key];
        }
        // Else if it's defined as an option, return the default value
        if (typeof o!="undefined" && typeof o['default']!="undefined") {
            return o['default'];
        }
        // Default return null
        return null;
    };
    // Attach event listeners to controls in the DOM to change Options
    fx.attach_options = function($dom) {
        $dom=X($dom);
        $dom.find('*[sfx-option]').each(function(i,input) {
            var $input = X(input);
            if ($input.attr('sfx-option-attached')) { return; }
            var type = input.type;
            var option_key = $input.attr('sfx-option');
            if (!option_key || !fx.options[option_key]) { return; }
            var val = fx.option(option_key);
            $input.attr('sfx-option-attached','true');
            if (type=="checkbox") {
                // Checked by default?
                if (val) {
                    input.checked = true;
                }
                $input.click(function() {
                    val = !val;
                    fx.option(option_key,val);
                });
            }
            else if (type=="number") {
                if (val) {
                    input.value = val;
                }
                $input.change(function() {
                    fx.option(option_key,input.value);
                });
            }
            else {
                alert("FX.attach_options - Unhandled input type "+type);
            }
        });
    };
    fx.save_options = function(callback) {
        X.storage.save('options',null,callback);
    };
    fx.options_loaded = function(options) {
        fire_queue(on_options_load_queue,false,options);
        fx.css_dump();
        fx.html_class_dump();
        fx.is_options_loaded=true;
    };
    fx.on_options_load = function(func) {
        // If options are already loaded, just fire the func
        if (fx.is_options_loaded) {
            func();
        }
        else {
            on_options_load_queue.push(func);
        }
    };
    fx.on_option = function(option_name, value, func) {
        if (typeof value=="function") {
            func = value;
            value = true;
        }
        fx.on_options_load(function() {
            if (fx.option(option_name)==value) {
                func(fx.option(option_name));
            }
        });
    };
    var option_update_listeners = {};
    fx.on_option_update = function(option_name, func) {
        if (typeof option_update_listeners[option_name]=="undefined") { option_update_listeners[option_name]=[]; }
        option_update_listeners[option_name].push(func);
    };
    fx.fire_option_update = function(option_name,val) {
        var listeners = option_update_listeners[option_name];
        if (typeof listeners=="undefined") { return; }
        listeners.forEach(function(f) {
            f(val, option_name);
        });
    };
    fx.on_option_live = function(option_name, func) {
        if (Array.isArray(option_name)) {
            return option_name.forEach(opt => fx.on_option_live(opt, func));
        }
        fx.on_option_update(option_name, func);
        fx.fire_option_update(option_name, fx.option(option_name));
    };
    // Pass-through to non-option storage
    fx.storage = function(key) {
        return X.storage.data[key];
    };

    fx.add_html_class = function(name) {
        html_class_names.push(name);
        if (X.is_document_ready()) {
            fx.html_class_dump();
        }
    };
    fx.html_class_dump = function() {
        // Add HTML classes to the HTML tag
        if (html_class_names.length>0) {
            var h=document.getElementsByTagName('HTML')[0];
            h.className = (h.className?h.className:'') + ' ' + html_class_names.join(' ');
            html_class_names.length = 0;
        }
    };
    fx.on_page_load = function(func) {
        on_page_load_queue.push(func);
    };
    fx.on_page_unload = function(func) {
        on_page_unload_queue.push(func);
    };
    fx.on_content_loaded = function(func,isPriority) {
        if (fx.dom_content_loaded) {
            func();
        }
        else {
            if (isPriority) {
                on_content_loaded_queue.unshift(func);
            }
            else {
                on_content_loaded_queue.push(func);
            }
        }
    };
    fx.dom_content_loaded = false;
    fx.fire_content_loaded = function() {
        // Queue or Fire the DOMContentLoaded functions
        var content_loaded = function() {
            fx.dom_content_loaded = true;
            fx.html_class_dump();
            fire_queue(on_content_loaded_queue,true);
            fire_queue(on_page_load_queue);
            fx.html_class_dump();
        };
        if (X.is_document_ready()) {
            content_loaded();
        }
        else {
            window.addEventListener('DOMContentLoaded',function() {
                content_loaded();
            },false);
        }
    };

    // Dynamic content insertion
    fx.domNodeInsertedHandlers = [];
    fx.on_content_inserted = function(func) {
        fx.domNodeInsertedHandlers.push(func);
    };
    fx.on_content = function(func) {
        // Inserted content
        fx.on_content_inserted(func);
        // Static content on page load
        fx.on_content_loaded(function() {
            func(X(document.body));
        });
    };
    fx.on_selector = function(selector,func) {
        var f = function($o) {
            var $items = $o.find(selector);
            if ($o.is(selector)) {
                $items = $items.add($o);
            }
            $items.forEach(function(item) {
                func(X(item));
            });
        };
        fx.on_content(f);
    };

    // Remove newlines & leading whitespace from a tagged template literal:
    //     var x = "?"; fx.oneLineLtrim(`foo${x} \n    bar`) ==> "foo? bar"
    // Trailing spaces are intentionally retained.
    //
    // Purpose: Facebook's HTML is all crammed together; do the same to ours,
    // while still allowing nice indented, readable HTML in our source.
    fx.oneLineLtrim = function(str) {
        return str.replace(/[\n\r]+\s*/g, '');
    }

    fx.sfx_support_groups = [
        'SocialFixerUserSupport',
        'SocialFixerUsersSupport',
    ];
    // Navigation Context
    fx.context = {"type":null, "id":null};
    fx.on_page_load(function() {
        var set_html_context = function () {
            X(document.documentElement).attr({
                sfx_url: window.location.pathname,
                sfx_context_type: fx.context.type,
                sfx_context_id: fx.context.id,
                sfx_context_permalink: fx.context.permalink,
            });
            X.support_note('sfx_context', `{ url: ${window.location.pathname}, type: ${fx.context.type}, id: ${fx.context.id}, permalink: ${fx.context.permalink} }`);
            if (fx.context.type == 'groups' && !fx.option('support_groups_normal_pinned') &&
                fx.sfx_support_groups.includes(fx.context.id)) {
                    X('html').addClass('sfx_support_group');
            }
        };

        // https://www.facebook.com/foo/bar/baz?abc=def => ['foo','bar','baz']
        var context = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');

        if (!context || !context[0] || context[0] == 'home.php') {
            // facebook.com
            // facebook.com/home.php
            fx.context.type = "newsfeed";
            fx.context.id = null;
        } else if (context[0] == 'messages') {
            // facebook.com/messages/t/$id
            // facebook.com/messages/[anything else] ==> id = null
            fx.context.type = "messages";
            fx.context.id = (context[1] == 't') ? context[2] : null;
        } else if (/messenger\.com$/.test(window.location.hostname)) {
            // messenger.com/t/$id
            // messenger.com/[anything else] ==> id = null
            fx.context.type = "messages";
            fx.context.id = (context[0] == 't') ? context[1] : null;
        } else if (context.length == 1 || context[1] == 'posts') {
            // facebook.com/$id
            // facebook.com/$id/posts  [ obsolete? ]
            fx.context.type = "profile";
            fx.context.id = context[0];
        } else if (context[0] == 'pg' && context[2] == 'posts') {
            // facebook.com/pg/$id/posts
            fx.context.type = "profile";
            fx.context.id = context[1];
        } else if (context[0] == 'groups') {
            // facebook.com/groups/$id/...
            fx.context.type = 'groups';
            fx.context.id = context[1];
            if (/^\d+$/.test(fx.context.id)) {
                // Collect the group's URL *name* when visited by *number*, e.g.
                // facebook.com/groups/412712822130938 => 'SocialFixerUserSupport'.
                // This ID is used to prevent filtering on SFx Support Groups, to
                // highlight the pinned post, and as a datum in the Support info.
                var group_href = X('a._5pcq[href^="/groups/"]').attr('href');
                if (group_href) {
                    // If href contains numeric ID, the Group's name *is* numeric
                    fx.context.id = group_href.split('/')[2];
                } else {
                    // Numeric ID and no posts have been loaded yet; try later.
                    // Might filter some posts on Support Groups; user should
                    // use Group's real name!  And pinned post highlighting may
                    // be delayed.  And 2s might not be long enough?
                    setTimeout(function () {
                        var group_href = X('a._5pcq[href^="/groups/"]').attr('href');
                        if (group_href) {
                            fx.context.id = group_href.split('/')[2];
                            set_html_context();
                        }
                    }, 2 * X.seconds);
                }
            }
        } else {
            // context.length >= 2
            // facebook.com/$type/$id
            fx.context.type = context[0];
            fx.context.id = context[1];
        }

        var query = window.location.search.replace(/^\?/, '');
        fx.context.permalink = (
            context[1] == 'posts' && /^\d/.test(context[2]) ||  // facebook.com/$user/posts/$id
            context[0] == 'permalink.php' ||        // facebook.com/permalink.php?story_fbid=$id
            /notif_id=/.test(query) ||              // facebook.com/media/set/?set=$id&...&notif_id=$id, etc.
            context[0] == 'groups' && (
                /view=permalink/.test(query) ||     // facebook.com/groups/$group?view=permalink&id=$id
                /multi_permalinks=/.test(query) ||  // facebook.com/groups/$group/?multi_permalinks=$id
                context[2] == 'permalink'           // facebook.com/groups/$group/permalink/$id
            )
        );

        set_html_context();
        X.publish("context/ready", {});
    });

    // "Reflow" a news feed page when posts have been hidden/shown, so Facebook's code kicks in and resizes containers
    // 2018-10-18 Bela: this no longer appears to be necessary or helpful.
    // It clashes mightily with FB's de-duplication 'feature' (to hide their server-side bugs);
    // it also, somehow, makes scrolling through posts much slower, feels like it leaves the
    // memory manager in an unhappy state.
    // So, function remains for its callers, but does only the 'scroll_to_top' feature.

    fx.reflow = function(scroll_to_top) {
        if (scroll_to_top) {
            window.scrollTo(0, 3);
        }
    };

    fx.mutations_disabled = false;
    fx.disable_mutations = function() { fx.mutations_disabled=true; };
    fx.enable_mutations = function() { fx.mutations_disabled=false; };
    var ignoreDomInsertedRegex = /(sfx|DOMControl_shadow|highlighterContent|uiContextualDialogPositioner|UFIList|timestampContent|tooltipText)/i;
    var ignoreDomInsertedParentRegex = /(highlighter|fbChatOrderedList)/;
    var ignoreTagNamesRegex = /^SCRIPT|LINK|INPUT|BR|STYLE|META|IFRAME|AUDIO|EMBED$/i;
    var ignoreMutation = function(o) {
        if (o.nodeType!=1) { return true; }
        if (ignoreTagNamesRegex.test(o.tagName)) { return true; }
        if (ignoreDomInsertedRegex.test(o.className) || /sfx/.test(o.id)) { return true; }
        if (o.parentNode && o.parentNode.className && ignoreDomInsertedParentRegex.test(o.parentNode.className)) {
            return true;
        }
        return fx.mutations_disabled;
    };
    var domnodeinserted = function (o) {
        if (ignoreMutation(o)) { return; }
        var $o = X(o);
        for (var i=0; i<fx.domNodeInsertedHandlers.length; i++) {
            // If a handler returns true, it has handled it, no need to continue to other handlers
            if (fx.domNodeInsertedHandlers[i]($o)) {
                return;
            }
        }
    };
    if (typeof MutationObserver!="undefined" || global_options.use_mutation_observers) {
        var _observer = function(records) {
            for (var i=0; i<records.length; i++) {
                var r = records[i];
                if (r.type!="childList" || !r.addedNodes || !r.addedNodes.length) { continue; }
                var added = r.addedNodes;
                for (var j=0; j<added.length; j++) {
                    domnodeinserted(added[j]);
                }
            }
        };
        X(function() {
            new MutationObserver(_observer).observe(document.body, { childList: true, subtree: true });
        });
    } else {
        X(document).on('DOMNodeInserted',function(e) {
            domnodeinserted(e.target);
        });
    }

    // Return the API
    // ==============
    return fx;
})();


// Main Source
// ===========
FX.add_option('run_on_apps', {"title": 'Run On Apps and Games Pages', "description": 'Run Social Fixer on apps and games pages from apps.facebook.com.', "default": true});
X.beforeReady(function(options) {
    if (/apps.facebook.com/.test(location.href)) {
        if (!options) {
            // Don't run modules yet until prefs are loaded
            return false;
        }
        else {
            //Otherwise check prefs to see if modules should run
            return FX.option('run_on_apps');
        }
    }
});

// =============================================
// "Bubble" Notes are panels to display... notes
// =============================================
function bubble_note(content,options) {
    options = options || {};
    options.position = options.position || "top_right";
    if (typeof options.close!="boolean") { options.close=false; }
    options.id = options.id||"";
    if (typeof options.draggable!="boolean") { options.draggable=true; }
    // If ID is passed, remove old one if it exists
    if (options.id) {
        X('#'+options.id).remove();
    }

    // Bubble note content is generated entirely from within code and is untainted - safe
    var c = X(`<div id="${options.id}" style="${options.style}" class="sfx_bubble_note sfx_bubble_note_${options.position} ${options.className}"></div>`);
    if (options.close) {
        c.append(`<div class="sfx_sticky_note_close"></div>`);
    }
    if (options.title) {
        c.append(`<div class="sfx_bubble_note_title">${options.title}</div>`);
    }
    if (typeof content=="string") {
        c.append(`<div class="sfx_bubble_note_content">${content}</div>`);
    }
    else {
        c.append(content);
    }
    // Close functionality
    c.find('.sfx_sticky_note_close, .sfx_button_close').click(function() {
        if (typeof options.callback=="function") {
            options.callback(c);
        }
        c.remove();
    });

    FX.on_content_loaded(function() {
        X(document.body).append(c);
        if (options.draggable) {
            X.draggable(c[0]);
        }
    });
    return c;
}
// Hide all bubble notes when ESC is pressed
X(window).keyup(function(event) {
    if (event.keyCode==27) {
        X('.sfx_bubble_note').remove();
    }
});

// A popup that remembers not to show itself next time
function context_message(key,content,options) {
    options = options || {};
    X.storage.get('messages',{},function(messages) {
        if (typeof messages[key]=="undefined") {
            // Show the message
            // Add an option to not show the message in the future
            content += FX.oneLineLtrim(`
                <div style="margin:15px 0 15px 0;"><input type="checkbox" class="sfx_dont_show" checked> Don't show this message again</div>
                <div><input type="button" class="sfx_button sfx_button_close" value="OK, Got It"></div>
            `);
            options.close = true;
            options.id = "sfx_content_message_"+key;
            options.title = `<div class="sfx_info_icon">i</div>${options.title}`;
            options.style="padding-left:35px;";
            options.callback = function($popup) {
                if ($popup.find('.sfx_dont_show').prop('checked')) {
                    X.storage.set('messages',key,X.now(),function() {});
                }
            };
            return bubble_note(content,options);
        }
    },true);
}

// ========================================================
// Fix Comments
// ========================================================
X.ready('comment_button', function () {
  var title = "Fix Enter In Comments, Replies & Chat";
  FX.add_option('comment_button', {"title": title, "order": 1, "description": "Use Enter to add a new line instead of submitting comments & replies.", "default": false, "verified":true});
  FX.add_option('comment_button_msgs', {"title": title, "order": 2, "description": "Use Enter to add a new line instead of submitting chat / messages.", "default": false, "verified":true});
  FX.add_option('comment_button_ctrl', {"title": title, "order": 3, "description": "Use Ctrl+Enter to submit comments, replies & chat / messages.", "default": false, "verified":true});
  FX.add_option('comment_button_emergency', {"title": title, "order": 4, "description": "Use alternate method (no Submit buttons; Ctrl+Enter submits).", "default": false, "verified":true});
  FX.add_option('comment_button_hint', {"hidden": true, "default": true});

  /* Changed settings might fix a failure mode, so let's try again */
  var fix_comments_failing = false;
  FX.on_option_live(['comment_button', 'comment_button_msgs', 'comment_button_ctrl', 'comment_button_emergency'], () => (fix_comments_failing = false));

  FX.on_options_load(function () {
    var nested_enter_event = false;
    var nested_enter_count = 0;

    var dispatch_enter_event = function (e, $target, shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      // Set a timeout so if it fails, revert back to default behavior
      var saved_enter_count = nested_enter_count;
      setTimeout(function () {
        if (nested_enter_count > saved_enter_count) {
          return;  // It worked!
        }

        // Tell Fix Enter to stop trying; retract Submit buttons & messages
        fix_comments_failing = true;
        X('.sfx_comment_button').forEach(el => el.style.display = "none");
        X('.sfx_comment_button_msg').forEach(el => el.textContent = "Press 'Enter' to submit");

        // Then alert the user and offer some proposed solutions
        var proposed_solution = (FX.option('comment_button_emergency')) ?
                                "disable all 'Fix Enter' options" :
                                "enable the 'Use alternate method' option";
        var proposed_limitation = (FX.option('comment_button_emergency')) ?
                                `For now, 'Enter' submits and 'Shift+Enter' makes new lines
(Facebook's normal behavior)` :
                                `Enter will add new lines, Ctrl+Enter will submit,
but there will be no visible comment/reply Submit button`;
        // 0-timeout to allow button/msg retraction to redraw
        setTimeout(function () {
          alert(`Message from Social Fixer: it looks like 'Fix Enter' is failing.

Please ${proposed_solution}, and watch
the Support group, socialfixer.com/support, for announcements.

No need to report it, you won't be the first.

${proposed_limitation}.`.replace(/\n/g,' \n')); // Opera ^C-to-copy omits newlines
        });
        X.support_note('comment_button', 'failing');
      }, 250);
      nested_enter_event = true;
      $target[0].dispatchEvent(new KeyboardEvent('keydown', {
            bubbles: true
          , cancelable: true
          , charCode: 0
          , code: 'Enter'
          , key: 'Enter'
          , keyCode: 13
          , shiftKey: shiftKey
          , which: 13
      }));
      nested_enter_event = false;
      e.preventDefault();
      e.stopPropagation();
    };

    var comment_button_data = {};

    var comment_button_actions = {
      "comment_button_options": function () {
        X.publish("menu/options", {"highlight_title": title});
      },
      "comment_button_hint_off": function () {
        X.storage.set("options", "comment_button_hint", false);
        X('.sfx_comment_button_hint').remove();
      },
      "dispatch_enter_event": dispatch_enter_event,
    };

    var comment_id = 0;

    X.capture(window, 'keydown', function (e) {
      // This handler is invoked for every input key; bail
      // out early if we have nothing to do...
      // [[[ ==>

      // ==> If we already know our events aren't getting through
      if (fix_comments_failing) {
        return;
      }

      // ==> If this is a nested call (we're on the dispatch chain for
      //    our own injected Enter keys!)
      if (nested_enter_event) {
        nested_enter_count++;
        return;
      }

      // Find the target of the keypress
      var $target = X.target(e, true);

      // ==> If this isn't an editable field
      if ('true' != $target.attr('contenteditable') && 'textbox' != $target.attr('role')) {
        return;
      }

      // The containing element of the input and the submit button we will insert
      var $container = null;
      // Figure out if this is a comment or Message/Chat
      var comment_type = "comment";
      $container = $target.closest('form');
      if (!$container.length) {
        return;
      }
      if ("presentation" != $container.attr('role')) {
        comment_type = 'message';
      }

      // ==> In emergency mode, just fiddle with shift-state of Enter (no UI)
      if (FX.option('comment_button_emergency')) {
        if (e.keyCode != 13 ||
            (comment_type == 'comment' && !FX.option('comment_button')) ||
            (comment_type == 'message' && !FX.option('comment_button_msgs'))) {
          // let FB handle it normally
          return;
        }
        // Force Ctrl+Enter = submit, else no way to submit comment / reply!
        // Although chat/msgs have native FB submit button, act consistently.
        return dispatch_enter_event(e, $target, !e.ctrlKey);
      }

      // ==> If this isn't the sort of comment container we know about
      if (!$container.length) {
        return;
      }

      // ==> If we should avoid it for some other reason
      // (#birthday_reminders_dialog appears to be obsolete 2018-11-01)
      if ($target.closest('#birthday_reminders_dialog').length) {
        return;
      }
      // <== ]]]

      var this_comment_id = $target.attr('sfx_comment_id');
      if (!this_comment_id) {
        this_comment_id = comment_id++;
        $target.attr('sfx_comment_id', this_comment_id);
        comment_button_data[this_comment_id] = {
          "comment_button": null,
          "comment_button_ctrl": null,
          "comment_button_hint": null,
          // can't use $ in Vue data property names
          "Xtarget": $target,
        };
      }
      var cbd = comment_button_data[this_comment_id];

      // Communicate any option changes to Vue -- without triggering
      // any events if they *haven't* changed...
      ['comment_button','comment_button_ctrl','comment_button_hint','comment_button_msgs'].forEach(function(opt) {
        var opt_val = FX.option(opt);
        if (cbd[opt] != opt_val) {
          cbd[opt] = opt_val;
        }
      });
      // Only add our own Submit button to the post-comment/reply cases
      if (comment_type == 'comment') {
        var tabIndex = 9900 + 2 * this_comment_id;
        $target[0].tabIndex = tabIndex;
        var $note_container = null;
        $note_container = $container.parent();

        var $wrapper = $note_container.find('.sfx_comment_button_present');
        // If there is no comment text, remove the submit button after a slight delay (ex: the user erased the comment)
        // The delay is needed because we catch the keydown event, and the actual content doesn't exist in the DOM yet
        // so we can't check if there is any comment text
        setTimeout(function() {
          var $present = $note_container.find('.sfx_comment_button_present');
          if ($present.length) {
            if (
              // No text entered
              !$note_container.find('span[data-text]').text()
              // No image
              && !$note_container.find('form .uiScaledImageContainer').length)
            {
              // The logic for this isn't perfect yet, so don't remove the button
              //$present.remove();
            }
          }
        },250);
        if (!$wrapper.length) {
          var html = FX.oneLineLtrim(`
            <div class="sfx_comment_button_present sfx_clearfix">
              <input v-if="comment_button" class="sfx_comment_button" type="button" value="Submit ${/reply/.test($target.attr('data-testid')) ? 'Reply' : 'Comment'}" data-hover="tooltip" data-tooltip-delay="100" data-tooltip-position="below" data-tooltip-content="${cbd.comment_button_ctrl ? 'Click or press Ctrl+Enter to Submit' : ''}" style="cursor:pointer;" tabIndex="${9901 + 2 * this_comment_id}" @click="dispatch_enter_event($event, Xtarget, false)">
              <!--<span v-if="comment_button && comment_button_ctrl" class="sfx_comment_button_msg">(Ctrl+Enter also submits)</span>-->
              <span v-if="!comment_button && comment_button_hint" class="sfx_comment_button_msg sfx_comment_button_hint">
                Social Fixer can prevent Enter from submitting comments & replies!<br>
                <a class="sfx_link" style="color:inherit;" @click="comment_button_options">
                  'Fix Enter' Options
                </a>
                &nbsp;&nbsp;
                <a class="sfx_link" style="color:inherit;" @click="comment_button_hint_off">
                  Don't show this
                </a>
              </span>
            </div>
          `);
          var $vue = template(null, html, cbd, comment_button_actions);
          $note_container.append($vue.fragment);
        }
      } else if (comment_type == 'message' && cbd.comment_button_msgs) {
        // FB add their Chat / Messages / Messenger 'Send' tooltip after the first
        // char is in the input buffer; and may remove it (and later re-add it) if
        // the user backspaces the buffer empty.  Replace theirs with ours; do not
        // write to the DOM if ours is already in place.  Don't try to parse their
        // string, which could be in any language.  (Our tooltip is always English
        // (at the moment).)
        setTimeout(function() {
          var tooltip_str = `Enter adds new lines\n${cbd.comment_button_ctrl ? 'Press Ctrl+Enter or\n' : ''}Click here to send`;
          var $tooltip = $target.closest('._kmc').parent().find('[data-tooltip-content]');
          $tooltip.length || ($tooltip = $container.find('[label="send"]'));
          if ($tooltip.length && $tooltip.attr('data-tooltip-content') != tooltip_str) {
            $tooltip.attr('data-tooltip-content', tooltip_str);
          }
        }, 0.5 * X.seconds);  // Messages / Messenger 0.05s; chat popup is slow...
      }

      if (e.keyCode != 13 ||
          (comment_type == 'comment' && !cbd.comment_button) ||
          (comment_type == 'message' && !cbd.comment_button_msgs)) {
        // let FB handle it normally
        return;
      }
      dispatch_enter_event(e, cbd.Xtarget, !(cbd.comment_button_ctrl && e.ctrlKey));
    });
  });
});

// =====================================
// Post Filter: Move/Copy To Tab
// =====================================
X.ready( 'control_panel', function() {
    FX.add_option('control_panel_x', {"hidden": true, "default": 0});
    FX.add_option('control_panel_y', {"hidden": true, "default": 50});
    FX.add_option('control_panel_right', {"hidden": true, "default": false});
    FX.add_option('control_panel_bottom', {"hidden": true, "default": false});
    FX.add_option('reset_control_panel_position', {"title": ' Control Panel', "section": "Advanced", "description": "Reset the position of the Control Panel to the upper left", "type": "action", "action_text": "Find Control Panel", "action_message": "cp/reset_position"});

    var data;
    var reset = function () {
        X('#sfx_control_panel').remove();
        data = {
            "sections": []
        };
        control_panel_created = false;
    };
    reset();

    // Reset the position
    X.subscribe("cp/reset_position", function () {
        FX.option('control_panel_x', null, false);
        FX.option('control_panel_y', null, false);
        FX.option('control_panel_right', null, false);
        FX.option('control_panel_bottom', null, false);
        X.storage.save("options");
        position_control_panel(null, null, false);
    });

    // Add a SECTION
    X.subscribe("cp/section/add", function (msg, section_data) {
        create_control_panel();
        section_data.order = section_data.order || 999;
        // {"name", "id", "help", "order"}
        data.sections.push(section_data);
    });

    var control_panel_created = false;
    var create_control_panel = function () {
        if (control_panel_created || X.find('#sfx_control_panel')) {
            return;
        }

        // Don't create the control panel on some pages
        if (/\/memories\//.test(location.href) || /\/messages\//.test(location.href)) {
            return;
        }

        control_panel_created = true;

        var html = FX.oneLineLtrim(`<div id="sfx_control_panel">
                <div class="sfx_cp_header" v-tooltip="{icon:false,content:'The Social Fixer Control Panel (CP) may contain filter tabs and controls such as Mark All Read &amp; Undo. Click X to disable associated features and hide it. Drag to move.',delay:750}"><span @click="close" style="float:right;display:inline-block;width:10px;cursor:pointer;text-align:center;border:1px solid #aaa;border-radius:4px;font-weight:normal;letter-spacing:0;">X</span>SFX Control Panel</div>
                <div class="sfx_cp_data">
                    <div class="sfx_cp_section" v-for="section in sections | orderBy 'order'">
                        <div class="sfx_cp_section_label" v-tooltip="{content:section.help,position:'right',delay:300}">{{{section.name}}}</div>
                        <div class="sfx_cp_section_content" id="{{section.id}}"></div>
                    </div>
                </div>
            </div>
            `);
        var actions = {
            "close":function() {
                var msg = "Hiding the Control Panel will:\n\n";
                msg += (FX.option('show_mark_all_read')?"     - Disable 'Mark All Read'\n":"");
                msg += (FX.option('always_show_tabs')?"     - Always Show Tab List\n":"");
                var filters = FX.storage('filters');
                var tab_filters = [];
                (filters||[]).forEach(function(f) {
                    try {
                        if (!f.enabled) { return; }
                        f.actions.forEach(function(a) {
                            if ("move-to-tab"==a.action || "copy-to-tab"==a.action) {
                                tab_filters.push(f);
                                return false;
                            }
                        });
                    } catch(e) {
                        // Ignore errors
                    }
                });
                if (tab_filters.length) {
                    msg += "     - Disable the following filters because their actions move posts to tabs:\n";
                    tab_filters.forEach(function(f) {
                        msg += "          "+f.title+"\n";
                    });
                }
                if (confirm(msg)) {
                    FX.option('show_mark_all_read',false);
                    FX.option('always_show_tabs',false);
                    tab_filters.forEach(function(f) {
                        f.enabled = false;
                    });
                    X.storage.save('filters',null,function() {
                        alert("Refresh the page for the changes to take effect");
                    });
                }

            }
        };
        template(document.body, html, data, actions).ready(function () {
            // Position it
            position_control_panel(null, null, false);

            // Make it draggable
            X.draggable('#sfx_control_panel', function (el, x, y) {
                position_control_panel(x, y, true);
            });
        });
    };
    var position_control_panel = function (x, y, save) {
        var $cp = X('#sfx_control_panel');
        if (!$cp.length) {
            return;
        }
        var right = FX.option('control_panel_right');
        var bottom = FX.option('control_panel_bottom');
        var snap_tolerance = 15;
        var reposition = false;
        if (typeof x == "undefined" || x == null || typeof y == "undefined" || y == null) {
            // Re-position it with saved options
            x = +FX.option('control_panel_x');
            y = +FX.option('control_panel_y');
            reposition = true;
        }
        var h = $cp[0].offsetHeight;
        var w = $cp[0].offsetWidth;

        // Constrain it to the screen
        if (x < 1) {
            x = 1;
        }
        if (!reposition) {
            right = (window.innerWidth && x + w > (window.innerWidth - snap_tolerance)); // Off the right side, snap it to the right
        }
        if (y < 40) {
            y = 40;
        }
        if (!reposition) {
            bottom = (window.innerHeight && y + h > (window.innerHeight - snap_tolerance)); // Off the bottom, snap to bottom
        }

        // Position it
        if (right) {
            $cp.css({'right': 0, 'left': ''});
        }
        else {
            $cp.css({'left': x, 'right': ''});
        }
        if (bottom) {
            $cp.css({'bottom': 0, 'top': ''});
        }
        else {
            $cp.css({'top': y, 'bottom': ''});
        }

        // Persist the control panel location
        if (false !== save) {
            FX.option('control_panel_x', x, false);
            FX.option('control_panel_y', y, false);
            FX.option('control_panel_right', right, false);
            FX.option('control_panel_bottom', bottom, false);
            X.storage.save("options");
        }
    };
    // On window resize, make sure control panel is on the screen
    X(window).resize(function () {
        position_control_panel();
    });
    FX.on_options_load(function () {
        if (FX.option('always_show_control_panel')) {
            FX.on_page_load(function () {
                create_control_panel();
            });
        }
    });

    // If options are updated from another tab, move the control panel
    X.subscribe("storage/refresh", function (msg, data) {
        if ("options" == data.key) {
            position_control_panel(null, null, false);
        }
    });

    // When the page unloads to navigate, remove the control panel
    FX.on_page_unload(reset);
});

X.ready('debug_insertion_order', function() {
    FX.add_option('debug_show_insertion_order', {"section":"Debug", "title": 'Show Insertion Order', "description": "Highlight portions of posts that are lazily inserted after the post appears on the page.", "default": false});
    FX.on_option('debug_show_insertion_order', function() {
        FX.on_content_inserted(function ($o) {
            var insertion_step = $o.closest('.sfx_inserted').attr('sfx_step') || 0;
            insertion_step++;
            $o.attr('sfx_step', insertion_step);
            $o.addClass("sfx_insert_step_" + insertion_step);
            $o.addClass("sfx_inserted");
        });
    });
});


X.ready( 'debug_post_html', function() {
    // Add an item to the wrench PAI
    X.publish('post/action/add', {"section": "wrench", "label": "Show Post HTML", "message": "post/action/post_html"});
    X.subscribe("post/action/post_html", function (msg, data) {
        var html = X('<div>').append( X(document.getElementById(data.id)).clone(true) ).html().replace(/</g,'&lt;').replace(/>/g,'&gt;');

        var Ctrl = (/Macintosh|Mac OS X/.test(sfx_user_agent)) ? 'Command' : 'Ctrl';
        var content = FX.oneLineLtrim(`
        <div draggable="false">Click in the box, press ${Ctrl}+a to select all, then ${Ctrl}+c to copy.</div>
        <div draggable="false">
            <textarea style="white-space:pre-wrap;width:500px;height:250px;overflow:auto;background-color:white;">${html}</textarea>
        </div>
        `);
        bubble_note(content, {"position": "top_right", "title": "Post Debug HTML", "close": true});
    });
});

X.ready('debug_post_update_tracking', function() {
    FX.add_option('debug_post_update_tracking', {"section":"Debug", "title": 'Track Post Updates', "description": "Track how often a post receives DOM updates and display the timing", "default": false});
    FX.on_option('debug_post_update_tracking', function() {
        X.subscribe(['post/add','post/update'], function(msg,data) {
            var now = performance.now();
            //var data = {"id": id, "dom": $post, "sfx_id": sfx_id};
            var $post = X(data.selector);
            var size = $post.innerText().length;

            if (msg=="post/add") {
                $post.attr('sfx_update_count','0');
                $post.attr('sfx_update_start',now);
                $post.attr('sfx_update_size',size);
                $post.attr('sfx_update_tracking','');
            }
            else if (msg=="post/update") {
                var count = +$post.attr('sfx_update_count');
                $post.attr('sfx_update_count',++count);
                var time = +$post.attr('sfx_update_start');
                var elapsed = (now-time);
                var original_size = $post.attr('sfx_update_size');
                $post.attr('sfx_update_size',size);
                var size_delta = size - original_size;
                if (size_delta > 0) size_delta = '+' + size_delta;

                $post.attr('sfx_update_tracking', $post.attr('sfx_update_tracking')+` @${elapsed}ms : ${data.inserted_tag}${data.inserted_id} ${size_delta} chars`);
            }
        });
    });

    // FX.on_content_loaded(function () {
    //    let feed = document.querySelector('*[role="feed"]');
    //    X.on_childlist_change(feed,function(inserted) {
    //       console.log("Feed insert",inserted);
    //    });
    //    X.on_attribute_change(feed,null,function(attributeName, oldValue, newValue){
    //        console.log("Feed attribute change",oldValue,newValue);
    //    });
    // });
});


// ========================================================
// Provide a View Log option
// ========================================================
X.ready('debugger', function () {
  var log = X.logger('debugger');

  var viewer = null;
  var query = null;
  var property = null;
  var results = null;
  var delay = 0;

  X.publish("menu/add", {"section":"other", "item":{'html': 'Debugger', 'message': 'debugger/open'}});
  X.subscribe("debugger/open", function() {
    log("Debugger opened");
    show();
  });

  function sanitize_selector(str) {
    return str.replace(/[^\w\d -.#():^~*$"=\[\]|]/g,'');
  }
  FX.on_content_loaded(function() {
    var launch = false, str=null;
    if (/sfx_debugger_query=([^&]+)/.test(location.href)) {
      str = decodeURIComponent(RegExp.$1);
      // Sanitize
      str = sanitize_selector(str);
      log("Debugger Query set through url: "+str);
      apply_query(str);
      launch = true;
    }
    if (/sfx_debugger_property=([^&]+)/.test(location.href)) {
      str = decodeURIComponent(RegExp.$1);
      // Sanitize
      str = str.replace(/[^\w\d-]/g,'');
      log("Debugger Property set through url: "+str);
      apply_property(str);
      launch = true;
    }
    if (/sfx_debugger_delay=([^&]+)/.test(location.href)) {
      var ms = +decodeURIComponent(RegExp.$1);
      log("Debugger delay set through url: "+str);
      delay = ms;
    }
    if (launch) {
      setTimeout(function() {
        show();
        run();
      },delay);
    }
  });

  var show = function() {
    create_debugger();
    viewer.show();
  };

  var create_debugger = function() {
    if (viewer) { return; }
    viewer = X(FX.oneLineLtrim(`
      <div id="sfx_debugger">
        <div class="sfx_dialog_title_bar" style="margin:0;">
          <div class="sfx_debugger_button" id="sfx_debugger_close" title="Close">X</div>
          Social Fixer Debugger
        </div>
        <div id="sfx_debugger_controls">
          <div>CSS Query: <input id="sfx_debugger_query" value=""></div>
          <div>Computed CSS Property: <input id="sfx_debugger_property" value=""></div>
          <div>
            <input type="button" class="sfx_button" value="Run" id="sfx_debugger_run">
            <span id="sfx_debugger_url"></span>
          </div>
        </div>
        <div id="sfx_debugger_results"></div>
      </div>
    `));
    X('body').append(viewer);
    results = X('#sfx_debugger_results');
    X("#sfx_debugger_run").click(function() {
      run();
    });
    X("#sfx_debugger_close").click(function() {
      viewer.hide();
    });
    X("#sfx_debugger_query").val(query).change(function(e) {
      apply_query(X.target(e).value);
    });
    X("#sfx_debugger_property").val(property).change(function(e) {
      apply_property(X.target(e).value);
    });
  };
  var apply_query = function(str) {
    query = (str||'').trim();
  };
  var apply_property = function(str) {
    property = (str||'').trim();
  };

  var run = function() {
    results.html('');
    var els = null;
    if (!query) {
      return results.html('No query');
    }
    try {
      els = X.query(query);
    }
    catch(e) {
      return results.html('Query error: '+e.message);
    }
    if (!els.length) {
      return results.html('No results found');
    }

    // Valid query, update the url
    var url = location.href.replace(/&.*/,'');
    url += /\?/.test(url) ? '&' : '?';
    url += "sfx_debugger_query="+encodeURIComponent(query);
    if (property) {
      url += "&sfx_debugger_property=" + encodeURIComponent(property);
    }
    X('#sfx_debugger_url').html(`<a href="${url}">${url}</a>`);

    var count = 0;
    var count_limit = 100;
    var i, j, empty = false, $d=null, $d2=null, $content=null;
    var header = function(type) {
      // Each element of the returned array is an X collection, or possibly a string
      var $header = $(`<div class="sfx_debugger_text_header"></div>`);
      $header.text(type);
      var $action = $(`<span class="sfx_debugger_action">Copy</span>`);
      $action.on('click',function(e) {
        X(e.target.parentNode.nextSibling).select(true);
        return false;
      });
      $header.append($action);
      return $header;
    };
    for (i=0; i<els.length && count<count_limit; i++) {
      //str.push(X(els[i]).tagHTML());
      empty = true;
      $d = $('<div class="sfx_debugger_result sfx_clearfix">');
      if (typeof els[i]==="string") {
        if (++count<count_limit) {
          $content = $(`<div class="sfx_debugger_content sfx_debugger_text_content">`);
          $content.text(els[i]);

          $d.append(header('[Text]'));
          $d.append($content);
          empty = false;
        }
      }
      else {
        var inner_els = els[i];
        for (j=0; j<inner_els.length; j++) {
          if (++count<count_limit) {
            empty = false;
            $d2 = $('<div class="sfx_debugger_subresult sfx_clearfix">');

            $content = $(`<div class="sfx_debugger_content sfx_debugger_node_content">`);
            $content.text(X(inner_els[j]).tagHTML());

            $d2.append(header('[Node]'));
            $d2.append($content);

            (function(el) {
              $d2.on('mouseover',function() {
                el.style.outline = "3px solid blue";
              });
              $d2.on('mouseout',function() {
                el.style.outline = "";
              });
              $d2.on('click',function() {
                viewer.hide();
                el.scrollIntoView(false);
                setTimeout(function() {
                  el.style.outline="10px solid blue";
                },500);
                setTimeout(function() {
                  el.style.outline="";
                },3000);
              });
            })(inner_els[j]);
            $d.append($d2);
          }
        }
      }
      if (!empty) {
        results.append($d);
      }
    }
    if (count>=count_limit) {
      results.prepend(`<div class="sfx_debugger_warning">Result count exceeds limit. Showing the first ${count_limit}.</div>`);
    }
  };
});

X.ready( 'disable_tooltips', function() {
    FX.add_option('disable_tooltips', {"title": 'Disable Tooltips', "section": "Advanced", "description": "If you are an Advanced user and no longer need to see the helpful tooltips that pop up when hovering over some things, you can entirely disable them here.", "default": false});

    FX.on_options_load(function () {
        if (FX.option('disable_tooltips')) {
            Vue.directive('tooltip', function (/* newValue, oldValue */) {
            });
        }
    });
});

// ========================================================
// Display Tweaks
// ========================================================
X.ready( 'display_tweaks', function() {
	FX.add_option('tweaks_enabled', {
		"section": "Display Tweaks"
		, "hidden": true
		, "default": true
	});
	FX.on_options_load(function () {
		var tweaks = FX.storage('tweaks');
		if (!tweaks || !tweaks.length || !FX.option('tweaks_enabled')) {
			return;
		}
		for (var i = 0; i < tweaks.length; i++) {
			if (tweaks[i].enabled && !tweaks[i].disabled) {
				X.css(tweaks[i].css, 'sfx_tweak_style_' + i);
			}
		}
	});
});

X.ready( 'donate', function() {
    FX.add_option('sfx_option_show_donate2',
        {
            "section": "Advanced"
            , "title": 'Show Donate Message'
            , "description": 'Show a reminder every so often to support Social Fixer development through donations.'
            , "default": true
        }
    );
    FX.on_options_load(function () {
        // Before showing the donate message, wait at least 5 days after install to not annoy people
        X.storage.get('stats', {}, function (stats) {
            if (stats && stats.installed_on && (X.now() - stats.installed_on > 5 * X.days) && X.userid != "anonymous") {
                X.task('sfx_option_show_donate', 30 * X.days, function () {
                    if (FX.option('sfx_option_show_donate2')) {
                        X.when('#sfx_badge', function () {
                            X.publish("menu/options", {"section": "Donate", "data": {"sfx_option_show_donate": true}});
                        });
                    }
                });
            }
        }, true);
    });
});

X.ready('edit_buffer', function() {
    FX.add_option('edit_buffer', {
        section: 'Experiments',
        title: 'Find Edit',
        description: 'Find unsaved post / comment / reply edits.',
        type: 'action',
        action_message: 'options/close,edit_buffer/find',
        action_text: 'Find Edit In Progress',
    });

    var edit_buf_scrollto = function(buf) {
        var $buf = X(buf);

        // Multi-level scrolling was required on Opera and probably all
        // Chromium / Blink / WebKit; if I don't scroll to 'substream'
        // first, it can't find 'buf' and doesn't scroll at all.  Final
        // scroll is to put it in the middle of the screen.

        setTimeout(function () {
            $buf.parents('[id^="substream"]').forEach( el => el.scrollIntoView() );
            setTimeout(function () {
                buf.scrollIntoView();
                setTimeout(function () {
                    var offs = $buf.offset();
                    var top_tgt = offs.top - (window.innerHeight / 2);
                    window.scrollTo(0, top_tgt < 0 ? 0 : top_tgt);
                }, 50);
            }, 50);
        }, 50);
    };

    X.subscribe('edit_buffer/find', function () {
        var prev_buf = -1;

        var show_edit_buf_post = function (buf_num, is_selected) {
            if (buf_num == -1) {
                X('.sfx_edit_buf_post_show').toggleClass('sfx_edit_buf_post_show sfx_post_read_show', false);
                return;
            }
            // Highlight the selection in our menu
            X('#sfx_find_edit_dialog').find(`[_option_="${buf_num}"]`).toggleClass('selected', is_selected);

            // If selected buffer is in a post, highlight that post
            // and force it to be visible even if 'Read', hidden by
            // filter action, or in a non-current tab.
            X(dirty_buffers[buf_num]).closest('[sfx_post]').toggleClass('sfx_edit_buf_post_show sfx_post_read_show', is_selected);
        };
        var select_buf = function (e) {
            var buf_num = X(e.target).attr('_option_');
            show_edit_buf_post(prev_buf, false);
            show_edit_buf_post(buf_num, true);
            edit_buf_scrollto(dirty_buffers[buf_num]);
            prev_buf = buf_num;
        };
        var close_dialog = function () {
            if (!vue_variables.leave_visible) {
                show_edit_buf_post(-1, false);
            }
            X('#sfx_find_edit_dialog').remove();
        };
        var row_content = function (db) {
            var row = X(db).closest('[data-contents]').innerText();
            return (row.length == 0) ? '·'
                 : (row.length < 80) ? row
                                     : row.slice(0, 77) + '...';
        };

        var dirty_buffers = X('[data-contents] [data-text]:not(:empty),[data-contents] [data-editor]+[data-editor]')
                              .closest('[data-contents]');
        var db_l = dirty_buffers.length;
        var click_msg = (db_l == 0) ? 'No edits in progress' :
                        (db_l == 1) ? 'Click to show this edit' :
                                      'Click to show one of these edits';

        var html = FX.oneLineLtrim(`
            <div class="sfx_bubble_note sfx_bubble_note_top_right" draggable="true" id="sfx_find_edit_dialog">
                <div class="sfx_bubble_note_title">
                    Find Edit In Progress
                </div>
                <div>
                    ${click_msg}
                </div>
                <br>
                <template v-for="db in dirty_buffers">
                    <template v-if="db.innerText">
                        <div @click="select_buf" draggable="false" _option_="{{$index}}" class="sfx_edit_buf_button">
                            {{row_content(db)}}
                        </div>
                        <br>
                    </template>
                </template>
                <span draggable="false">
                    <input type="button" class="sfx_button" value="Done" @click="close_dialog">
                </span>
                <label class="sfx_edit_buf_toggle" @click="leave_visible = !leave_visible"
                       data-hover="tooltip" data-tooltip-delay="300"
                       data-tooltip-content="Show editing post even if 'Read' / hidden / in other tab">
                    <input type="checkbox" class="sfx_button">
                    Leave post highlighted
                </label>
            </div>
        `);
        var vue_variables = {
            dirty_buffers,
            leave_visible: false,
        };
        var vue_methods = {
            row_content,
            select_buf,
            close_dialog,
        };

        template(document.body, html, vue_variables, vue_methods).ready(function () {
            X.draggable('#sfx_find_edit_dialog');
        });
    });
});

// =========================================================
// External CSS
// =========================================================
X.ready( 'external_css', function() {
    // XXX This should have a 'Test' button to immediately request it,
    // report if it's (1) missing, (2) not HTTPS (or bad certificate
    // chain blah blah), or (3) not mime type text/css.
    // OR: automatically test whenever changed...
    FX.add_option('external_css_url', {"section": "Advanced", "type": "text", "title": 'External CSS url', "description": 'URL of external CSS to be included in the page.  NOTE: browser may require HTTPS, and that server presents MIME type text/css.', "default": ""});
    FX.on_options_load(function () {
        var url = X.sanitize(FX.option('external_css_url'));
        if (url) {
            X.when('head', function ($head) {
                $head.append(`<link id="sfx_external_css" rel="stylesheet" type="text/css" href="${url}">`);
            });
        }
    });
});

// Collect anti-CSRF token (DTSG) as early as possible.
// window.requireLazy() must be called in the root window
// scope; we also have to wait until that function exists!
X.inject(function() {
  var fb_dtsg_str = null;
  var called_fb = false;
  var cycle_count = 0;
  const cycle_interval = .5 * 1000;
  var technique;
  const gather_dtsg = function() {
    if (!called_fb && window.requireLazy) {
      // Preferred method -- get from FB's own internal API
      window.requireLazy(['DTSG'],
        function(DTSG_module) {
          if (DTSG_module && DTSG_module.getToken && !fb_dtsg_str) {
            technique = 'requireLazy()';
            fb_dtsg_str = DTSG_module.getToken();
          }
        }
      );
      called_fb = true;
    }
    if (!fb_dtsg_str) {
      // Fallback method.  'Old layout' (pre-2020) FB documents
      // have one or more [name=fb_dtsg] elements.  'New layout'
      // documents sometimes do, sometimes do not have any; so
      // the API method is primary, but this may still be useful
      // on some pages.  Also the API is ready earlier than the
      // document element(s).
      var fb_dtsg_el = document.querySelector('[name=fb_dtsg]');
      if (fb_dtsg_el && fb_dtsg_el.value) {
        technique = '[name=fb_dtsg]';
        fb_dtsg_str = fb_dtsg_el.value;
      }
    }
    if (!fb_dtsg_str && ++cycle_count >= 20) {
      technique = 'All techniques';
      fb_dtsg_str = 'failed';
    }
    if (fb_dtsg_str) {
      // Communicate back to extension
      var data = {
        "fb_dtsg":fb_dtsg_str,
        "technique": technique,
        "count": cycle_count
      };
      window.postMessage( {"sfx":true, "pagecontext":true, "message": { "event":'fb_dtsg/ready', "data": data } } , "*");

    } else {
      setTimeout(gather_dtsg, cycle_interval);
    }
  };
  // Can't use setInterval() early because FB replace the timeout
  // implementation during startup.  FB's clearInterval() doesn't
  // know about those early timer IDs and can't stop the interval
  // timer!  Using a setTimeout() chain, it doesn't matter if the
  // implementation changes: each one ends on schedule and we are
  // in manual control of whether another one is fired off.
  //
  // 0.025 * 100 is nominally 2.5s, but they don't fire that fast.
  setTimeout(gather_dtsg, cycle_interval);
});

X.ready('friend_manager', function() {
    FX.add_option('friend_tracker', {"title": 'Friend Manager', "description": "Enable Friend Manager (Friends List Tracker)", "default": true});

    FX.add_option('friend_tracker_alert_unfriend', {"hidden":true, "default": true});
    FX.add_option('friend_tracker_alert_unfriend_count', {"hidden":true, "default": 3});
    FX.add_option('friend_tracker_alert_refriend', {"hidden":true, "default": true});
    FX.add_option('friend_tracker_alert_name_change', {"hidden":true, "default": true});
    FX.add_option('friend_tracker_update_frequency', {"hidden":true, "default": 1 });

    var log = X.logger('post_processor');

    // Load the friends pref
    var friends = X.clone(FX.storage('friends'));
    var custom_fields = FX.option('friend_custom_fields');

    X.subscribe("friends/options", function(msg,d) {
        // Render the friends dialog content
        var sections = [
            {"key":"alerts", "name":"Alerts"}
            ,{"key":"options", "name":"Options"}
            ,{"key":"list", "name":"Friends List"}
            ,{"key":"details", "name":"Friend Details"}
            ,{"key":"data", "name":"Raw Data"}
        ];
        var dialog = FX.oneLineLtrim(`<div id="sfx_friend_dialog" class="sfx_dialog sfx-flex-column" style="transition: height .01s;">
	<div id="sfx_options_dialog_header" class="sfx_dialog_title_bar" style="cursor:move;" @click="collapse" v-tooltip="{content:'Click to window-shade, drag to move',position:'below'}">
		Friend Manager - Social Fixer ${sfx_version}
		<div id="sfx_options_dialog_actions" draggable="false" >
			<input draggable="false" type="button" class="sfx_button secondary" @click.stop="close" value="Close">
		</div>
	</div>
	<div id="sfx_options_dialog_body" class="sfx-flex-row" draggable="false">
		<div id="sfx_options_dialog_sections">
			<div v-for="section in sections" @click="select_section(section.key)" class="sfx_options_dialog_section {{selected_section==section.key?'selected':''}}">{{section.name}}</div>
		</div>
		<div id="sfx_options_dialog_content">
			<div class="sfx_options_dialog_content_section">
				<div v-show="selected_section=='options'" style="line-height:32px;">
					<div><sfx-checkbox key="friend_tracker_alert_unfriend"></sfx-checkbox> Track and alert when someone is not present on my Facebook Friends List</div>
					<div>Alert about absent friends after this many absences: <input class="sfx_input" type="number" min="1" max="99" v-model="uf_count" @change="update_uf_count()"/></div>
					<div><sfx-checkbox key="friend_tracker_alert_refriend"></sfx-checkbox> Track and alert when someone reappears on my Facebook Friends List</div>
					<div><sfx-checkbox key="friend_tracker_alert_name_change"></sfx-checkbox> Track and alert when a friend changes their name</div>
					<div>Check for Friends List changes after this many hours: <input class="sfx_input" type="number" min="1" max="999" v-model="frequency" @change="update_frequency()"/></div>
					<div>Update my Friends List and check for changes immediately: <input type="button" @click="check_now()" class="sfx_button" value="Check Now"></div>
				</div>
				<div v-show="selected_section=='alerts'" id="sfx_friend_alerts"></div>
				<div v-show="selected_section=='list'">
					<div v-if="!list_loaded">Loading...</div>
					<div v-if="list_loaded">
						<div style="margin-bottom:3px;">
                            <b>Filter: </b><input class="sfx_input" type="text" v-model="filter">
                            <br>
                            <span v-if="limit < 9999 && nfriends > nlimit">
                                <b>Page: </b>
                                <a @click.prevent="set_page(-1)" class="sfx_link">&lt;&lt;</a>
                                &nbsp;{{page+1}} of {{Math.trunc((nfriends + nlimit - 1) / nlimit)}}&nbsp;
                                <a @click.prevent="set_page(1)" class="sfx_link">&gt;&gt;</a>
                            </span>
                            <span v-else>
                                Showing all {{nfriends}} friends.
                            </span>
                            <b>&nbsp; Friends per page: </b>
                            &middot;&nbsp;
                            <template v-for="value in ['10','50','100','250','500','1000','all']">
                                <a @click.prevent="set_limit(value)" class="sfx_link" v-bind:class="{'sfx_button':(value==limit)}">{{value}}</a> &middot;&nbsp;
                            </template>
                        </div>
						<table class="sfx_data_table">
							<thead>
								<tr>
									<th>&nbsp;</th>
									<th class="sortable" @click="order('name')">Name</th>
									<th class="sortable" @click="order('first')">First</th>
									<th class="sortable" @click="order('last')">Last</th>
									<th class="sortable" @click="order('id')">ID</th>
									<th class="sortable" @click="order('tracker.status')">Status</th>
									<th v-for="field in custom_fields">{{field}}</th>
									<th class="sortable" @click="order('tracker.added_on')">Added</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="f in friends | filterBy filter | orderBy orderkey sortorder | limitBy nlimit (page*nlimit)">
									<td><img src="{{f.photo}}" style="height:48px;width:48px;"></td>
									<td class="sfx_hover_link" style="font-weight:bold;" @click="select_user(f.id)">{{f.name}}</td>
									<td>{{f.first}}</td>
									<td>{{f.last}}</td>
									<td>{{f.id}}</td>
									<td>{{f.tracker.status}}</td>
									<td v-for="field in custom_fields">{{f.data[field]}}</td>
									<td>{{f.tracker.added_on | date}}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div v-show="selected_section=='details'">
					<div v-if="!selected_user">
						Click on a friend in the "List" section.
					</div>
					<div v-else>
						<img src="{{selected_user.photo}}" style="float:left;margin-right:20px;"><span style="font-size:120%;font-weight:bold;">{{selected_user.name}}</span>
						<br style="clear:both;">

						This section will be used for future functionality that will enhance your Friends List even more!

						<!--
						<b>Custom Fields</b> : Fields below are created by you and maintained in the Options tab. You can define any fields, and any value in those fields per user.
						<div v-for="field in custom_fields" style="margin:10px;border:1px solid #ccc;padding:10px;">
							<b>{{field}}</b>: <input v-model="selected_user.data[field]">
						</div>
						-->
					</div>
				</div>
				<div v-show="selected_section=='data'" style="white-space:pre;font-family:monospace;">{{friends | json}}</div>
			</div>
		</div>
	</div>
</div>
`);
        var data = {
            "sections": sections
            ,"selected_section":"alerts"
            ,"friends": friends
            ,"nfriends": Object.keys(friends).length
            ,"list_loaded":false
            ,"orderkey":"name"
            ,"sortorder":1
            ,"filter":""
            ,"selected_user":null
            ,"custom_fields":X.clone(custom_fields)
            ,"frequency":FX.option("friend_tracker_update_frequency")
            ,"uf_count":FX.option("friend_tracker_alert_unfriend_count")
            ,"limit":50
            ,"nlimit":50
            ,"page":0
        };
        if (d&&d.selected) {
            data.selected_section=d.selected;
        }
        // Count friends

        var actions = {
            "select_section": function (key) {
                this.selected_section = key;
                var self = this;
                if (key == "list") {
                    // Lazy load the list for better performance
                    setTimeout(function() {
                        Vue.nextTick(function () {
                            self.list_loaded = true;
                        });
                    }, 100);
                }
            },
            "select_user": function(id) {
                this.selected_user = friends[id];
                this.select_section('details');
            },
            "order": function(key) {
                this.sortorder = (this.orderkey == key) ? -1 * this.sortorder : 1;
                this.orderkey = key;
            },
            "close": function() {
                X('#sfx_friend_dialog').remove();
            },
            "check_now": function() {
                X.publish("friends/update");
            },
            "update_frequency": function () {
                FX.option('friend_tracker_update_frequency', data.frequency, true);
            },
            "update_uf_count": function () {
                FX.option('friend_tracker_alert_unfriend_count', data.uf_count, true);
            },
            "set_limit": function(l) {
                this.limit = l;
                this.nlimit = l == 'all' ? 9999 : Number(l);
                this.page = 0;
            },
            "set_page": function(p) {
                this.page += p;
                if (this.page < 0) {
                    this.page = 0;
                }
            },
            "collapse": function () {
                X('#sfx_options_dialog_body').toggle();
            },
        };
        template(document.body, dialog, data, actions).ready(function () {
            X.draggable('#sfx_friend_dialog');
            Vue.nextTick(function() {
                var alerts = find_alerts(friends);
                render_alerts(alerts, "just now", true, X('#sfx_friend_alerts'), 'sfx_friend_changes_fm');
                if (!alerts || alerts.length == 0) {
                    actions.select_section("list");
                }
            });
        });
    });

    var fb_dtsg;
    X.subscribe('fb_dtsg/ready', (msg, data) => {
        fb_dtsg = data.fb_dtsg;
        var fb_dtsg_status = 'succeeded';
        if (fb_dtsg === 'failed') {
            fb_dtsg_status = 'failed';
        }
        X.support_note('fb_dtsg', `${data.technique} ${fb_dtsg_status} after ${(performance.now() / X.seconds).toFixed(6)} seconds`);
    }, true);

    var retrieve_friends = function(cb) {
        // This request now requires the anti-CSRF token
        if (!fb_dtsg) {
            log('retrieve_friends 0: no fb_dtsg');
            X.support_note('retrieve_friends:0', `fb_dtsg not found: [${fb_dtsg}]`);
            return cb(null);
        }
        var friends_url = FX.oneLineLtrim(`
            https://www.facebook.com/ajax/typeahead/first_degree.php
            ?viewer=${X.userid}
            &__user=${X.userid}
            &filter[0]=user
            &options[0]=friends_only
            &__a=1
            &lazy=0
            &t=${X.now()}
            &fb_dtsg=${fb_dtsg}
        `);
        X.ajax(friends_url, function(content) {
            if (typeof content !== 'string') {
                log('retrieve_friends: unexpected content type:', typeof content, content);
                X.support_note('retrieve_friends:1', `unexpected content type '${typeof content}' (see console)`);
                return cb(null);
            }
            try {
                var json = JSON.parse(content.replace(/^[^{}]*/, ''));
                if (!json || !json.payload || !json.payload.entries) {
                    log('retrieve_friends: unexpected JSON content:', json);
                    X.support_note('retrieve_friends:2', 'unexpected JSON content (see console)');
                    return cb(null);
                }
                return cb(json.payload.entries);
            } catch(e) {
                log('retrieve_friends: JSON.parse failed:', e, content);
                X.support_note('retrieve_friends:3', `JSON.parse failed: ${e} (see console)`);
                return cb(null);
            }
        });
    };

    var update_friends = function(cb) {

        // Retrieve Friends List
        var now = X.now();
        var empties = 0;
        var changes = 0;
        retrieve_friends(function(list) {
            if (list == null) {
                return cb(null);
            }

            var i, f, uid, sfx_friend;
            // For each friend, create the default record if needed
            for (i = 0; i < list.length; i++) {
                f = list[i];
                uid = f.uid;
                if (!Number(uid)) {
                    X.support_note('update_friends:1', 'non-numeric UID in FB data');
                    continue;
                }
                sfx_friend = friends[uid];
                if (typeof sfx_friend == "undefined" || typeof sfx_friend.tracker == "undefined") {
                    sfx_friend = {
                        "id":f.uid
                        ,"name":f.text
                        ,"first":f.firstname
                        ,"last":f.lastname
                        ,"photo":f.photo
                        ,"tracker": {
                            "added_on":now
                            ,"status":"friend"
                            ,"updated_on":now
                            ,"acknowledged_on":null
                        }
                    };
                    friends[uid] = sfx_friend;
                }
                // check for updated photo and name
                if (f.text != sfx_friend.name) {
                    sfx_friend.old_name = sfx_friend.name;
                    sfx_friend.name = f.text;
                    sfx_friend.first = f.firstname;
                    sfx_friend.last = f.lastname;
                    sfx_friend.dirty = true;
                }
                if (sfx_friend.photo != f.photo) {
                    sfx_friend.dirty = true;
                    sfx_friend.photo = f.photo;
                }
                sfx_friend.checked_on = now;
                sfx_friend.tracker.missing_count = 0;
            }

            // Loop over friends to check for changes
            for (uid in friends) {
                // Handle strange records due to some past bug
                if (!Number(uid)) {
                    X.support_note('update_friends:2', 'non-numeric UID in FT data');
                    delete friends[uid];
                    X.storage.set("friends", uid, undefined, null, false);
                    //++changes;
                    continue;
                }

                f = friends[uid];

                // Handle empty records due to some past bug
                if (!f.id || !f.tracker) {
                    ++empties;
                    f.id = uid;
                    f.tracker = f.tracker || {
                        added_on: now,
                        status: 'record missing',
                        updated_on: now,
                        acknowledged_on: null,
                    };
                    f.dirty = true;
                }
                var tracker = f.tracker;

                // NEW Friend
                if (tracker.added_on == now) {
                    f.dirty = true;
                }

                // RE-FRIENDED
                else if (now == f.checked_on && tracker.status != "friend") {
                    tracker.status = "refriend";
                    tracker.updated_on = now;
                    tracker.acknowledged_on = null;
                    f.dirty = true;
                }

                // REMOVED Friend
                // (Not found in new list, but they existed in old list)
                else if (now !== f.checked_on && (tracker.status == "friend" || tracker.status == "refriend")) {
                    tracker.missing_count = (tracker.missing_count) ? tracker.missing_count + 1 : 1;
                    if (tracker.missing_count >= FX.option('friend_tracker_alert_unfriend_count')) {
                        tracker.status = "unfriended";
                        tracker.updated_on = now;
                        tracker.acknowledged_on = null;
                        tracker.blocked = null;
                    }
                    f.dirty = true;
                }

                // Update this friend record?
                if (f.dirty) {
                    ++changes;
                    delete f.dirty;
                    X.storage.set("friends", uid, f, null, false);
                }
            }

            // Persist the updated Friends List
            if (changes) {
                X.storage.save("friends", null, function () {
                    if (typeof cb == "function") {
                        cb({"total":Object.keys(friends).length, "changes":changes});
                    }
                });
            } else {
                if (typeof cb == "function") {
                    cb({"total":Object.keys(friends).length, "changes":changes});
                }
            }
            X.support_note('update_friends:3', `fr:${Object.keys(friends).length} ls:${list.length} ch:${changes} em:${empties}`);
        });
    };

    var find_alerts = function(friends) {
        var alerts = [];

        for (var i in friends) {
            var f = X.clone(friends[i]);
            if (!f || !f.tracker) {
                continue;
            }
            var t = f.tracker;
            var upd = t.updated_on;
            var ack = t.acknowledged_on;

            // Unfriend
            if (FX.option('friend_tracker_alert_unfriend') && t.status == "unfriended" && (!ack || ack < upd)) {
                alerts.push({"type": "unfriend", "friend": f});
                // Fire off an ajax request to see if this person's account is still there?

                // REMOVED this check because it may fire off too many requests
                /*
                (function(friend_ref) {
                    X.ajax("https://mbasic.facebook.com/" + friend_ref.id, function(content, status) {
                        if (status == 404) {
                            friend_ref.removed = true;
                        } else if (typeof content == 'string') {
                            // Failed lookup has no instances of the user ID; but
                            // they might add a retry link, so look for a handful.
                            var instances = content.match(new RegExp(friend_ref.id + '', 'g'));
                            if (!instances || instances.length < 4) {
                                friend_ref.removed = true;
                            }
                        }
                    });
                })(f);

                 */
                // TODO: Check if blocked?
            }
            // Re-friend
            if (FX.option('friend_tracker_alert_refriend') && t.status == "refriend") {
                alerts.push({"type": "refriend", "friend": f});
            }
            // name change
            if (FX.option('friend_tracker_alert_name_change') && f.old_name) {
                alerts.push({"type": "name_change", "friend": f});
            }
        }
        return alerts;
    };

    var update_jewel_count = function(alerts) {
        if (!alerts) {
            return;
        }
        var count = alerts.length;
        var el = document.getElementById('sfx_friend_jewel_count');
        if (el) {
            if (count == 0) {
                X(el).remove();
            }
            else {
                X(el).find('span').text(count);
            }
        }
    };

    var notify_if_alerts_exist = function() {
        var alerts = find_alerts(friends);
        if (alerts && alerts.length > 0) {
            X.publish("notify/increment", {"target": "#sfx_badge"});

            // Remove the old Friend Manager link in wrench menu and replace with a new one
            X.publish("menu/remove", {"section": "options", "item": {message:"friends/options"}});
            X.publish("menu/add", {"section": "options", "item": {'html': `<span class="sfx_menu_jewelCount"><span class="count" id="sfx_friend_jewel_count">${alerts.length}</span></span><span>Friend Manager</span>`, message:"friends/options"}});
        }
    };

    var render_alerts = function(alerts, ago, show_header, $prependTo, id) {
        if (typeof render_alerts.vue_data !== 'object') {
            render_alerts.vue_data = {};
        }
        try {
            if (render_alerts.vue_data[id] && X.find(`#${id}`)) {
                Object.keys(render_alerts.vue_data).forEach(function(id) {
                    render_alerts.vue_data[id].alerts = alerts;
                    render_alerts.vue_data[id].ago = ago;
                });
                return;
            }
            X(`#${id}`).remove();
            var data = {
                "alerts": alerts
                ,"ago": ago
                ,"show_header": show_header
            };
            render_alerts.vue_data[id] = data;
            var t = FX.oneLineLtrim(`<div id="${id}">
    <div style="max-height:300px;overflow:auto;border-bottom:1px solid rgb(221,223,226);">
	<div v-if="show_header" style="padding:8px 12px 6px 12px;border-bottom:1px solid rgb(221,223,226);">
		<div style="float:right">
			<a @click.prevent="settings">Settings</a>
			<span v-if="alerts && alerts.length" role="presentation" class="f_click"> &middot; </span>
			<a v-if="alerts && alerts.length" @click.prevent="ok_all" style="font-weight:bold;">Okay All</a>
		</div>
		<div><span style="font-size:12px;font-weight:bold;">Friend Changes</span> <span style="font-size:11px;font-style:italic;">(via Social Fixer, updated {{ago}})</span></div>
	</div>
	<div v-if="alerts && alerts.length" v-for="a in alerts | orderBy 'friend.tracker.updated_on' -1" style="padding:6px 12px;border-bottom:1px solid rgb(221,223,226);">
		<div style="float:right;height:50px;vertical-align:middle;line-height:50px;">
			<span @click="ok(a)" class="sfx_button light">Okay</span>
		</div>
		<img src="{{a.friend.photo}}" style="height:48px;margin-right:10px;display:inline-block;">
		<div style="display:inline-block;height:50px;overflow:hidden;">
			<template v-if="a.type=='name_change'">
				{{a.friend.old_name}}<br>
				is now known as<br>
				<a href="/{{a.friend.id}}" style="font-weight:bold;">{{a.friend.name}}</a><br>
			</template>
			<template v-if="a.type=='unfriend'">
				<a href="/{{a.friend.id}}" style="font-weight:bold;">{{a.friend.name}}</a><br>
				no longer appears on your Facebook Friends List. <span v-show="a.friend.removed" style="color:red;text-decoration:underline;cursor:help;" v-tooltip="This account is not available. This person has either disabled or removed their account, blocked you, or this is a result of a Facebook glitch (which is not uncommon). If they are still your friend but their profile is temporarily unavailable, they will appear as re-friended when it returns.">Account Not Found!</span><br>
				<i>{{a.friend.tracker.updated_on | ago}}</i>
			</template>
			<template v-if="a.type=='refriend'">
				<a href="/{{a.friend.id}}" style="font-weight:bold;">{{a.friend.name}}</a><br>
				is now on your Facebook Friends List again! <br>
				<i>{{a.friend.tracker.updated_on | ago}}</i>
			</template>
		</div>
	</div>
	<div v-if="!alerts || alerts.length==0" style="line-height:50px;vertical-align:middle;color:rgb(117,117,117);background-color:rgb(246,247,249);text-align:center;">
		No changes
	</div>
    </div>
</div>
`);
            var actions = {
                "ok": function(a) {
                    var f = friends[a.friend.id];
                    // Resolve based on the type of the alert
                    if (a.type == "unfriend") {
                        f.tracker.acknowledged_on = X.now();
                    }
                    else if (a.type == "refriend") {
                        f.tracker.status = "friend";
                    }
                    else if (a.type == "name_change") {
                        delete f.old_name;
                    }
                    // Update and persist
                    X.storage.set("friends", f.id, f, function () {
                        // Remove the alert
                        var i = data.alerts.indexOf(a);
                        data.alerts.splice(i, 1);
                        update_jewel_count(data.alerts);
                    });
                }
                ,"ok_all": function () {
                    for (var a in alerts) {
                        actions.ok(alerts[a]);
                    }
                }
                ,"settings": function () {
                    X.publish("friends/options", {"selected": "options"});
                }
            };
            var $v = template(null, t, data, actions);
            $prependTo.prepend($v.fragment);
        } catch (e) {
            alert(e);
        }
    };

    FX.on_options_load(function() {
        if (FX.option('friend_tracker')) {
        // Add wrench menu item
            X.publish("menu/add", {"section": "options", "item": {'html': '<span id="sfx_friend_manager_menu_item">Friend Manager</span>', 'message': 'friends/options'}});

            // Update Friends List and check for changes
            X.task('friend_update', FX.option('friend_tracker_update_frequency') * X.hours, function () {
                log("Time to check for Friends List changes");
                X.subscribe('fb_dtsg/ready', function () {
                    update_friends(notify_if_alerts_exist);
                }, true);
            }, notify_if_alerts_exist);

            X.subscribe('friends/update', function () {
                update_friends(function (result) {
                    notify_if_alerts_exist();
                    if (result===null) {
                        alert("Error retrieving or updating friends list");
                    }
                    else {
                        alert(`Update Complete.\n${result.total} friends and ${result.changes} changes.`);
                    }
                });
            });
        }
    });
});

// =========================================================
// Hide parts of the page
// =========================================================
X.ready( 'hide', function() {
// Add an Option to trigger the popup in case people don't find it in the wrench menu
    FX.add_option('hide_parts_of_page',
        {
            "section": "General",
            "title": 'Hide Things',
            "description": 'Under the Wrench menu you will find an item to "Hide/Show Parts of the Page". Use this to hide or show different parts of the page that Social Fixer knows how to process. You can also access this functionality using the button to the right.',
            "type": "action",
            "action_message": "options/close,hide/on",
            "action_text": "Hide Things"
        }
    );
    FX.add_option('hide_parts_of_page_custom',
        {
            "section": "Debug",
            "title": 'Custom Hideables',
            "description": 'Define a custom JSON structure to be used instead of the server-side JSON for hideables.',
            "type": "textarea",
            "default":""
        }
    );
    FX.add_option('hide_parts_custom_merge',
        {
            "section": "Debug",
            "title": 'Merge Custom & Standard Hideables',
            "description": "Use both the server-side and custom hideables JSON.",
            "default": false
        }
    );

    FX.on_options_load(function () {
        var menu_item = {"html": 'Hide/Show Parts of the Page', "message": "hide/on", "tooltip": "Select which parts of the page you want to hide so they never show up."};
        X.publish("menu/add", {"section": "actions", "item": menu_item});

        var hiddens = FX.storage('hiddens') || {};
        if (typeof hiddens.length != "undefined") {
            hiddens = {};
        }

        var resolve = function (hideable) {
            var o = X(hideable.selector);
            if (hideable.parent) {
                o = o.closest(hideable.parent);
            }
            return o;
        };

        //  Two ways to hide things:
        // (1) Pure CSS if the hideable has no parent, or
        // (2) by watching for DOM insertions
        var id;
        var css = [], hiddens_with_parents = [];
        var set_css_rules = function () {
            css = [];
            hiddens_with_parents = [];
            for (id in hiddens) {
                var hidden = hiddens[id];
                var o = resolve(hidden);

                // (1)
                if (!hidden.parent) {
                    css.push(`html:not(.sfx_hide_show_all) ${hidden.selector} { display:none !important; }`);
                    o.addClass("sfx_hide_hidden");
                }
                // (2)
                else {
                    hiddens_with_parents.push(hidden);
                }
            }
            if (css.length > 0) {
                var csstext = css.join(' ');
                X.css(csstext, 'sfx_hideables');
            }
        };
        set_css_rules();
        // Watch for DOM insertions and check for things to hide
        FX.on_content(function (o) {
            hiddens_with_parents.forEach(function (hidden) {
                X(hidden.selector, o).closest(hidden.parent).addClass("sfx_hide_hidden");
            });
        });

        X.subscribe("hide/on", function () {
            // Display the bubble popup

            // Chars used (no HTML entities for these):
            // U+25E4 ◤ (none) BLACK UPPER LEFT TRIANGLE
            // U+25E5 ◥ (none) BLACK UPPER RIGHT TRIANGLE
            // U+25E3 ◣ (none) BLACK LOWER LEFT TRIANGLE
            // U+25E2 ◢ (none) BLACK LOWER RIGHT TRIANGLE
            // Chars not used (mismapped HTML entities; plus, solids look better):
            // U+25F8 ◸ &ultri; UPPER LEFT TRIANGLE
            // U+25F9 ◹ &urtri; UPPER RIGHT TRIANGLE
            // U+25FA ◺ &lltri; LOWER LEFT TRIANGLE
            // U+25FF ◿ (none)  LOWER RIGHT TRIANGLE
            // U+22BF ⊿ &lrtri; RIGHT TRIANGLE (entity mapped to wrong codepoint)

            var content = X(FX.oneLineLtrim(`
                    <div class="sfx_hide_bubble">
                        <span id="sfx_hide_bubble_TL" style="position:absolute; top:0; left:3px; font-size: 15px;" data-hover="tooltip" data-tooltip-content="Move to top left" data-tooltip-delay="650">&#x25E4;</span>
                        <span id="sfx_hide_bubble_TR" style="position:absolute; top:0; right:3px; font-size: 15px;" data-hover="tooltip" data-tooltip-content="Move to top right" data-tooltip-delay="650">&#x25E5;</span>
                        <span id="sfx_hide_bubble_BL" style="position:absolute; bottom:0; left:3px; font-size: 15px;" data-hover="tooltip" data-tooltip-content="Move to bottom left" data-tooltip-delay="650">&#x25E3;</span>
                        <span id="sfx_hide_bubble_BR" style="position:absolute; bottom:0; right:3px; font-size: 15px;" data-hover="tooltip" data-tooltip-content="Move to bottom right" data-tooltip-delay="650">&#x25E2;</span>
                        <div class="sfx_hide_bubble_instructions">Mouse over <span style="background-color:#CFC">green shaded</span> areas to see their names; click to hide them.  (Shaded area may be offset from the item it will hide.)</div>
                        <div class="sfx_hide_bubble_instructions">To unhide items, click 'Show Hidden Items', then click <span style="background-color:#FCC">red shaded</span> areas.</div>
                        <div class="sfx_hide_bubble_instructions">Social Fixer is updated with new hideable areas as Facebook changes. If a new area won't hide, take a screenshot in Hide/Show mode (showing that it won't highlight) and post it in the <a href="https://SocialFixer.com/support/" target="_blank">Support Group</a>.</div>
                        <span><input type="button" class="sfx_button sfx_button_done" style="margin:4px" value="Done Hiding"></span>
                        <span style="float:right">
                            <label data-hover="tooltip" data-tooltip-content="So you can unhide them" data-tooltip-delay="1000"><input type="checkbox" class="sfx_button sfx_button_show">Show Hidden Items</label>
                            <br><label data-hover="tooltip" data-tooltip-content="Shrink this box" data-tooltip-delay="1000"><input type="checkbox" class="sfx_button sfx_button_inst">Hide Instructions</label>
                        </span>
                    </div>
                `));

            var popup = bubble_note(content, {"position": "top_right", "style": "min-height: 0", "title": "Hide/Show Parts of the Page"});
            popup.find('.sfx_button_done').click(function (/* event */) {
                X.publish("hide/off");
                popup.remove();
            });
            popup.find('.sfx_button_show').click(function (/* event */) {
                X('html').toggleClass('sfx_hide_show_all');
            });
            popup.find('.sfx_button_inst').click(function (/* event */) {
                popup.find('.sfx_hide_bubble_instructions,.sfx_bubble_note_title').toggle();
            });
            popup.find('#sfx_hide_bubble_TL').click(function (/* event */) {
                popup.css({'top': 0, 'bottom': 'auto', 'left': 0, 'right': 'auto'});
            });
            popup.find('#sfx_hide_bubble_TR').click(function (/* event */) {
                popup.css({'top': 0, 'bottom': 'auto', 'left': 'auto', 'right': 0});
            });
            popup.find('#sfx_hide_bubble_BL').click(function (/* event */) {
                popup.css({'top': 'auto', 'bottom': 0, 'left': 0, 'right': 'auto'});
            });
            popup.find('#sfx_hide_bubble_BR').click(function (/* event */) {
                popup.css({'top': 'auto', 'bottom': 0, 'left': 'auto', 'right': 0});
            });

            var hider_title = function (hideable) {
                return `Click to ${hideable.action}:\n\n'${hideable.name}'`;
            };

            var show_hideables = function (hideables, warn_server) {
                if (warn_server) {
                    var json_url = 'https://matt-kruse.github.io/socialfixerdata/hideable.json';
                    popup.find('.sfx_bubble_note_title').append(FX.oneLineLtrim(`
                        <div style="color:red; outline: 2px solid red; margin: 2px; padding: 3px;">
                            Can't access Hide/Show data on:<br>
                            <a href="${json_url}">${json_url}</a><br>
                            Is it blocked by the browser, an extension, or your firewall?
                        </div>`));
                }
                if (!hideables || hideables.length == 0) {
                    return;
                }
                X('html').addClass('sfx_hide_show_all');
                hideables.forEach(function (hideable) {
                    var o = resolve(hideable);
                    for (var instance = 0; instance < o.length; instance++) {
                        var el = o[instance], $el = X(el);
                        var overflow = $el.css('overflow');
                        $el.css('overflow', 'visible'); /* auto */
                        var rect = el.getBoundingClientRect();
                        var h = rect.height;
                        var w = rect.width;
                        if (!h || !w) return;
                        h = Math.max(h, 20);
                        w = Math.max(w, 20);
                        $el.css('overflow', overflow);
                        var hidden = !!hiddens[hideable.id];
                        hideable.name = X.sanitize(hideable.name);
                        hideable.action = hidden ? "Unhide" : "Hide";
                        var position = ($el.css('position') == 'absolute' && $el.parent().css('position') == 'relative') ? 'position:relative;' : '';
                        var wrapper = X(`<span data-hover="tooltip" data-tooltip-content="${hider_title(hideable)}" data-tooltip-delay="200" class="sfx_hide_frame" style="width:${w}px;height:${h}px;font-size:${h / 1.5}px;line-height:${h}px;${position}">X</span>`);

                        if (hidden) {
                            wrapper.addClass("sfx_hide_frame_hidden sfx_hide_hidden");
                        }
                        wrapper.click(function (target) {
                            hidden = !hiddens[hideable.id];
                            hideable.action = hidden ? "Unhide" : "Hide";
                            /* tooltips & wrapper hide classes should be changed for all */
                            /* wrappers for this hider, but ... too much trouble */
                            X(target.target).attr('data-tooltip-content', hider_title(hideable));
                            wrapper.toggleClass("sfx_hide_frame_hidden sfx_hide_hidden", hidden);
                            for (var instance = 0; instance < o.length; instance++) {
                                X(o[instance]).toggleClass("sfx_hide_hidden", hidden);
                            }
                            if (hidden) {
                                hiddens[hideable.id] = hideable;
                            }
                            else {
                                delete hiddens[hideable.id];
                            }
                        });
                        $el.before(wrapper);
                    }
                });
                X('html').removeClass('sfx_hide_show_all');
            };
            var hide_parts_of_page_custom = FX.option('hide_parts_of_page_custom');
            var hide_parts_custom_merge = FX.option('hide_parts_custom_merge');

            var hideables = [];
            if (hide_parts_of_page_custom) {
                try {
                    var json = JSON.parse(hide_parts_of_page_custom);
                    if (json && json.hideables && json.hideables.length) {
                        hideables = json.hideables;
                        if (!hide_parts_custom_merge) {
                            return show_hideables(hideables, false);
                        }
                    }
                } catch(e) {
                    alert("ERROR Parsing custom JSON: "+e.toString());
                }
            }
            // hideable.json contains 'hideables': name[0] = filename, name[1] = struct name
            /* subscriptions.js: */ /* global update_subscribed_items */
            update_subscribed_items(['hideable', 'hideables'], hiddens, function (subscriptions) {
                var warn_server = (!subscriptions || !subscriptions.length);
                (subscriptions || []).forEach(function (server_item) {
                    var already_have = false;
                    hideables.forEach(function (hideable_item) {
                        if (hideable_item.id == server_item.id) {
                            already_have = true;
                        }
                    });
                    if (!already_have) {
                        hideables.push(server_item);
                    }
                });
                show_hideables(hideables, warn_server);
            });
        });

        X.subscribe("hide/off", function () {
            X('html').removeClass('sfx_hide_show_all');
            X('.sfx_hide_frame').remove();
            // Persist hidden areas
            X.storage.save('hiddens', hiddens, function () {
                set_css_rules();
            });
        });
    });
});

// ========================================================
// Provide a View Log option
// ========================================================
X.ready('logging', function () {
  var log = X.logger('logging',{"color":"#666"});
  var viewer = null;
  var entries = null;
  var index = 0;
  var filter = null;

  X.publish("menu/add", {"section":"other", "item":{'html': 'View Log', 'message': 'log/view'}});
  X.subscribe("log/view", function() {
    log("View Log Clicked in Menu");
    show();
  });
  X.subscribe("log/entry", function() {
    if (viewer) {
      populate_entries(true);
    }
  });
  FX.on_content_loaded(function() {
    if (/sfx_log_filter=([^&]+)/.test(location.href)) {
      // Sanitize
      var str = RegExp.$1.replace(/[^\w\d -.]/g,'');
      log("Log Viewer Filter set through url: "+str);
      apply_filter(str);
    }
    if (/sfx_log=true/.test(location.href)) {
      log("Log viewer launched via url");
      show();
    }
  });

  var show = function() {
    create_log_viewer();
    populate_entries(false);
    viewer.show();
  };
  var create_log_viewer = function() {
    if (viewer) { return; }
    viewer = X(FX.oneLineLtrim(`
      <div id="sfx_log_viewer">
        <div class="sfx_dialog_title_bar" style="margin:0;">
          <div class="sfx_log_button" id="sfx_log_close" title="Close">X</div>
          Social Fixer Console
        </div>
        <div id="sfx_log_controls">
          Filter: <input id="sfx_log_filter" value="${filter?filter.source:''}">
        </div>
        <div id="sfx_log_viewer_entries"></div>
      </div>
    `));
    X('body').append(viewer);
    entries = X('#sfx_log_viewer_entries');
    X("#sfx_log_close").click(function() {
      viewer.hide();
    });
    X("#sfx_log_filter").keyup(function(e) {
      apply_filter(X.target(e).value);
      populate_entries(false);
    });
  };
  var apply_filter = function(str) {
    str = (str||'').trim();
    if (str) {
      filter = new RegExp(str, "i");
    }
    else {
      filter = null;
    }
  };
  var populate_entries = function(incremental) {
    var logs = X.logs;
    var html = [];
    if (!incremental) {
      index = 0;
      entries.html('');
    }
    for (; index<logs.length; index++) {
      var entry = logs[index];
      if (!entry.html) {
        entry.html = render_log_entry(entry);
      }
      if (!filter || (filter.test(entry.module) || filter.test(entry.html))) {
        html.push(entry.html);
      }
    }
    entries.append(html.join(''));
  };
  var lz = function(d) { return d.toString().replace(/^(\d)$/,"0$1"); };
  var render_log_entry = function(data) {
    // The log property holds an array of things to log
    var html = data.log.join(",");
    var d = new Date(data.timestamp);
    var timestamp = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${lz(d.getMinutes())}:${lz(d.getSeconds())}`;
    var css = data.color ? `color:${data.color};` : '';
    return `<div class="sfx_log_entry" style="${css}">${timestamp} ${data.module?'['+data.module+']':''} ${html}</div>`;
  };

});

// Detect whether we are on a login page
FX.on_content_loaded(function () {
    const login_selectors = [
        /* On 'classic' FB as of 2020-08-13: */
        /*   - 4 of these 6 selectors appear on the plain login page */
        /*   - a different 4 appear on the inline login on a 404 page */
        /*   - 0 appear on logged-in pages */
            'body[class*=LoggedOut]',
            'form#login_form',
            "form[class*=ogin][action*='/login']",
            'input[name=login_source]',
            'button[name=login][data-testid*=login]',
            'button[id*=login][data-testid*=login]',
        /* On 'new' FB as of 2020-08-13: */
        /*   - no selectors determined yet */
    ].join(',');

    // Undefined member is effectively false until set, so can be used
    // without knowing whether this has run yet
    FX.isNonLoginPage = (X(login_selectors).length < 2);

    // For users who need to wait until definitely known
    X.publish('login_page/ready');
});

// =========================================================
// Add Post Action Icons, including Mark Read
// =========================================================
X.ready( 'mark_read', function() {
    FX.add_option('post_actions', {"title": 'Post Actions', "description": "Add actions to individual posts to Mark them as 'Read', etc.", "default": true});
    FX.add_option('show_mark_all_read', {"title": 'Mark All Read/Undo', "description": "Add a Mark All Read button and Undo button to the control panel to Mark all visible posts as 'Read' or undo Marking posts as 'Read'.", "default": false});
    FX.add_option('mark_all_read_next', {"section": "Advanced", "title": 'Mark All Read - Next', "description": "When Mark All Read is clicked and filter tabs are visible, automatically jump to the next tab with unread stories.", "default": true});
    FX.add_option('clear_cache', {"title": 'Clear "Mark Read" Story Data', "section": "Advanced", "description": "Clear all cached data about posts' 'Read' status. This will un-Mark all 'Read' posts!", "type": "action", "action_text": "Clear Data Now", "action_message": "cache/clear"});
    FX.add_option('clean_cache_frequency', {"title": '"Mark Read" Cache Cleaning Frequency', "section": "Advanced", "description": "Clean the cache of old story data every how many hours?", "type": "number", "default": 24});
    FX.add_option('clean_cache_age', {"title": '"Mark Read" Cache Cleaning Age', "section": "Advanced", "description": "When cleaning cached story data, clean post data that is this many days old.", "type": "number", "default": 4});
    FX.add_option('hide_mark_read_groups', {"title": 'Mark Read', "description": "Hide posts marked as 'Read' when viewing a Group.", "default": true});
    FX.add_option('hide_mark_read_pages', {"title": 'Mark Read', "description": "Hide posts marked as 'Read' when viewing a Page or Timeline.", "default": true});
    FX.add_option('mark_read_display_message', {"title": 'Mark Read', "description": "Display a small post timestamp where posts Marked as 'Read' and hidden would have been.", "default": true});
    FX.add_option('mark_read_style', {"section": "Advanced", "title": 'Mark Read Style', "description": "CSS style to be applied to posts that are Marked 'Read'.", "type": "text", "default": "outline:2px dashed red;"});

    (function () {
        var postdata_log = {}; // Keyed by DOM id!
        X.subscribe("log/postdata", function (msg, data) {
            if (!data.id) {
                return;
            }
            if (!postdata_log[data.id] || !postdata_log[data.id][0]) {
                postdata_log[data.id] = [performance.now()];
            }
            postdata_log[data.id].push(((performance.now() - postdata_log[data.id][0]) / X.seconds).toFixed(6) + ' ' + data.message);
        });
        X.subscribe("log/postdata/get", function (msg, data) {
            if (typeof data.callback != "function") {
                return;
            }
            data.callback(postdata_log[data.id]);
        });
    })();

    // Clear Cache
    X.subscribe("cache/clear", function (/* msg, data */) {
        X.storage.save("postdata", {}, function () {
            alert("Social Fixer cache has been cleared");
        });
    });
    FX.on_options_load(function () {
        if (!FX.option('post_actions')) {
            return;
        }

        // Write out CSS based on "mark read" style
        var mark_read_style = FX.option('mark_read_style');
        FX.css(`
        .sfx_post_read > *:not(.sfx_post_marked_read_note),
        #facebook #pagelet_soft_permalink_posts .sfx_post_read > *,
        #facebook[sfx_context_permalink="true"] .sfx_post_read > * {
            ${mark_read_style};
        }
        `);

        // Add an option to the wrench menu to toggle stories marked as read
        var menu_item = {"html": "Show posts marked 'Read'", "message": "post/toggle_read_posts", "tooltip": "If posts are Marked as 'Read' and hidden, toggle their visibility."};
        X.publish("menu/add", {"section": "actions", "item": menu_item});

        var show_read = false;
        X.subscribe("post/toggle_read_posts", function () {
            show_read = !show_read;
            menu_item.html = show_read ? "Hide posts Marked 'Read'" : "Show posts Marked 'Read'";
            X('html').toggleClass("sfx_show_read_posts", show_read);
            FX.reflow();
        });

        // Logic to handle post actions
        var postdata = FX.storage('postdata') || {};

        // On a regular interval, clean out the postdata cache of old post data
        // Also do other data cleansing tasks here
        var clean_cache_frequency = FX.option('clean_cache_frequency') || +FX.options['clean_cache_frequency']['default'] || 24;
        var clean_cache_age = FX.option('clean_cache_age') || +FX.options['clean_cache_age']['default'] || 7;
        X.task('clean_postdata_cache', clean_cache_frequency * X.hours, function () {
            var post_id, cleaned_count = 0;
            if (!postdata) {
                return;
            }
            for (post_id in postdata) {
                var data = postdata[post_id];
                var read_on = data.read_on;
                var age = X.now() - read_on;
                var clean_me = 0;
                // Purge old items
                if (age > clean_cache_age * X.days) {
                    clean_me = 1;
                }
                // post_id can be all digits or colon-separated digits like "12345:2"
                if (!/^[0-9:]+$/.test(post_id)) {
                    clean_me = 1;
                }
                // read_on is a date stamp: must be just digits
                // (could also check for plausible time range?)
                if (!/^[0-9]+$/.test(data.read_on)) {
                    clean_me = 1;
                }
                // Left over from 742eb642d241b4521a79139a5146dc3205a3c83b
                if (data.last_updated) {
                    delete postdata[post_id].last_updated;
                    cleaned_count++;
                }
                if (clean_me) {
                    delete postdata[post_id];
                    cleaned_count++;
                }
            }
            // Save the postdata back to storage
            if (cleaned_count > 0) {
                X.storage.save("postdata", postdata);
            }
        });

        var init_postdata = function (id) {
            if (typeof postdata[id] == "undefined") {
                postdata[id] = {};
            }
            return postdata[id];
        };

        var mark_all_added = false;
        FX.on_page_unload(function () {
            mark_all_added = false;
        });

        FX.on_content_loaded(function () {
            var action_data = {
                id: null,
                sfx_id: null,
                $post: null,
                read: false,
                show_mark_read: true,
                filters_enabled: FX.option('filters_enabled'),
                wrench_items: [],
                filter_items: []
            };
            var actions = {
                "mark_unmark": function (e) {
                    var data = {"sfx_id": action_data.sfx_id};
                    data.dir = e.shiftKey ? "above"
                             : e.ctrlKey || e.altKey || e.metaKey ? "below"
                             : "post";
                    X.publish("post/mark_unmark", data);
                }
                , "action_menu_click": function (item) {
                    var key, data = {"id": action_data.id, "sfx_id": action_data.sfx_id};
                    if (item.data) {
                        for (key in item.data) {
                            data[key] = item.data[key];
                        }
                    }
                    X.publish(item.message, data);
                }
            };
            var Ctrl = (/Macintosh|Mac OS X/.test(sfx_user_agent)) ? 'Command' : 'Ctrl';
            var html = FX.oneLineLtrim(`
                <div id="sfx_post_action_tray">
                    <div v-if="show_mark_read && !read" @click="mark_unmark($event)" class="mark_read_markit" v-tooltip="Social Fixer: Mark this post as 'Read', so it doesn't appear in your feed anymore. Shift+Click Marks as 'Read' all posts above here; ${Ctrl}+Click Marks here and below."></div>
                    <div v-if="read" @click="mark_unmark($event)" v-tooltip="Social Fixer: Un-Mark this post as 'Read', so it may show up in your feed again.">X</div>
                    <div v-if="!show_mark_read && !read" @click="mark_unmark($event)" class="mark_read_nomark" v-tooltip="Social Fixer: Marking this post 'Read' will only hide it in the current session, as it lacks a unique Facebook identifier. Posts like this may be Markable in the future."></div>
                    <div v-if="wrench_items.length>0" id="sfx_mark_read_wrench" class="mark_read_wrench" v-tooltip="Social Fixer: Post Actions"></div>
                    <div v-if="filters_enabled && filter_items.length>0" id="sfx_mark_read_filter" class="mark_read_filter" v-tooltip="Social Fixer: Filtering"></div>
                </div>
                <div v-if="wrench_items.length>0" id="sfx_post_wrench_menu" class="sfx_post_action_menu">
                    <div v-for="item in wrench_items" @click="action_menu_click(item)">{{item.label}}</div>
                </div>
                <div v-if="filter_items.length>0" id="sfx_post_filter_menu" class="sfx_post_action_menu">
                    <div v-for="item in filter_items" @click="action_menu_click(item)">{{item.label}}</div>
                </div>
            `);

            var undo = {
                posts_marked_read: []
                , undo_disabled: true
            };
            var hide_read = function ($post) {
                if (!$post.hasClass('sfx_post_read')) {
                    if (FX.context.type == "groups" && !FX.option('hide_mark_read_groups')) {
                        return;
                    }
                    if (FX.context.type == "profile" && !FX.option('hide_mark_read_pages')) {
                        return;
                    }
                    if (FX.option('mark_read_display_message')) {
                        var ts = $post.find('h4 a, h2 a').first();
                        ts = ts.length ? ts.text() : '<unknown>';
                        ts = `Click to view 'Read' post by ${ts}`;
                        var note = X(`<div class="sfx_post_marked_read_note" title="This post was hidden because it was previously Marked as 'Read'. Click to view. (To remove these post markers, see Options > General > Mark Read)">${ts}</div>`);
                        note.on('click', function () {
                            var new_shown = note.parent().toggleClass('sfx_post_read_show').hasClass('sfx_post_read_show');
                            note.text(note.text().replace(/hide|view/, new_shown ? 'hide' : 'view'));
                        });
                        $post.prepend(note);
                    }
                    $post.addClass('sfx_post_read');
                    X.publish("post/hide_read", {"id": $post.attr('id'), "$post": $post});
                }
            };
            var unhide_read = function ($post) {
                if ($post.hasClass('sfx_post_read')) {
                    $post.removeClass('sfx_post_read sfx_post_read_show');
                    $post.find('.sfx_post_marked_read_note').remove();
                    X.publish("post/unhide_read", {"id": $post.attr('id'), "$post": $post});
                }
            };
            // Mark Read/Unread controllers
            X.subscribe("post/mark_unread", function (msg, data) {
                var sfx_id = data.sfx_id;
                var $post = data.post || action_data.$post;

                undo.posts_marked_read = [$post];
                undo.mark = true;
                undo.undo_disabled = false;

                var pdata = postdata[sfx_id];
                delete pdata.read_on;
                update_action_tray($post);

                X.storage.set("postdata", sfx_id, pdata, function () {
                    unhide_read($post);
                }, false !== data.save);
            });
            X.subscribe("post/mark_read", function (msg, data) {
                var sfx_id = data.sfx_id;
                var $post = data.post || action_data.$post;

                undo.posts_marked_read = [$post];
                undo.mark = false;
                undo.undo_disabled = false;

                var pdata = init_postdata(sfx_id);
                pdata.read_on = X.now();
                postdata[sfx_id] = pdata;
                update_action_tray($post);

                X.storage.set("postdata", sfx_id, pdata, function () {
                    hide_read($post);
                    FX.reflow();
                }, false !== data.save);
            });
            X.subscribe(["post/mark_all_read", "post/mark_unmark"], function (msg, data) {
                if (typeof data.dir == "undefined") {
                    data.dir = "all";
                }
                var $curr_post = data.post || action_data.$post;
                var mark = (data.dir == "all") || !$curr_post || !$curr_post.hasClass('sfx_post_read');
                if (data.dir == "post") {
                    X.publish(mark ? "post/mark_read" : "post/mark_unread", data);
                    return;
                }
                var marked = 0;
                var not_marked = 0;
                var marking = (data.dir == "all" || data.dir == "above");
                var unmark_one = false;
                var posts = [];
                var pivot_post = $curr_post ? +$curr_post.attr('sfx_post') : null;
                if ($curr_post && data.dir == "above") {
                    // Any existing selection gets extended by shift-click,
                    // then distorted by hiding & reflow; just abolish it:
                    window.getSelection().removeAllRanges();
                    // and get the post we were on back onscreen:
                    setTimeout(function () {
                        $curr_post[0].scrollIntoView();
                    }, 0.15 * X.seconds);
                }
                X(`*[sfx_post]`).each(function () {
                    var $post = X(this);
                    var this_post = +$post.attr('sfx_post');
                    if (this_post == pivot_post) {
                        if (data.dir == "above") {
                            // Mark Read Above excludes the current post
                            marking = false;
                            // Must be on a 'Read' post to invoke Unmark,
                            // so it *includes* current post
                            if (!mark) {
                                unmark_one = true;
                            }
                        }
                        else if (data.dir == "below") {
                            // Mark Read Below includes the current post
                            marking = true;
                        }
                    }
                    if (!marking && !unmark_one) {
                        not_marked++;
                        return;
                    }
                    unmark_one = false;

                    // css('display') != 'none' is being used here as a
                    // proxy for 'is in the currently displayed SFx tab'.
                    // Unfortunately this also makes us skip if the post
                    // was hidden by FB's client de-duplicator; or by an
                    // ad blocker.  Exactly what to do is a bit subtle:
                    //
                    // (1) the question we should be asking is not 'is this
                    // displayed?' but 'is this in the current SFx tab?'
                    //
                    // (2) if it was hidden by the FB de-duplicator, it
                    // should be the case that the contents of the two posts
                    // were identical, therefore would have been filtered
                    // into the same tab by SFx filtering.  During this scan,
                    // we should be able to notice that a post which was
                    // previously counted as 'unread' is now counted as
                    // 'read', so that we can update the tab (unread / total)
                    // counts properly; without actually issuing a 2nd 'mark'
                    // operation.  This is currently blocked by the 'is it
                    // displayed' test, since FB's de-duplicator works by
                    // hiding (with '.hidden_elem') the duplicates.
                    //
                    // (3) posts may also be hidden by other actors, for
                    // instance an ad blocker.  These could do several
                    // things, including at least:
                    //
                    //   (a) actually deleting it from the DOM
                    //   (b) hiding it with the ad blocker's own class
                    //   (c) hiding it with FB's 'hidden_elem' class
                    //   (d) hiding it with explicit inline 'style='
                    //
                    // I don't think we can do anything sensible about (a).
                    // (c) implies that we shouldn't mark 'Read' any ID
                    // marked '.hidden_elem'.  That is: if the ID appears
                    // twice, only once with '.hidden_elem', that's an FB
                    // de-duplicator action and we naturally mark 'Read' the
                    // one which wasn't hidden.  But if the ID appears only
                    // once, it's probably an ad blocker's notation.  The
                    // user has not, in fact, 'Read' (seen at all) this post.
                    // We should not mark its ID.  Nevermind that the user
                    // probably wants that post *gone*.  If they were to turn
                    // off their ad blocker immediately after; and if their
                    // SFx config is to put Sponsored posts into a tab, not
                    // hide them completely -- they *should* see an unread
                    // copy of that ad in their Sponsored tab.
                    //
                    // (4) We currently have no cross-module way to ask 'is
                    // this in the specified tab'.  But my rewrite of the tab
                    // handler makes this easy; so I need to get that cleaned
                    // up and checked in.

                    if ("none" != $post.css('display') && mark == !$post.hasClass('sfx_post_read')) {
                        posts.push($post);
                        var pub_msg = mark ? "post/mark_read" : "post/mark_unread";
                        var pub_data = {
                            sfx_id: $post.attr('sfx_id'),
                            save: false, // Don't persist until the end
                            post: $post
                        };
                        X.publish(pub_msg, pub_data);
                        marked++;
                    }
                });
                if (marked > 0) {
                    X.storage.save("postdata");
                    undo.posts_marked_read = posts;
                    undo.mark = !mark;
                    undo.undo_disabled = false;
                    FX.reflow(data.dir == "above" && !show_read);
                }
                if (mark && not_marked == 0 && FX.option('mark_all_read_next')) {
                    X.publish("filter/tab/next");
                }
            });
            X.subscribe("post/undo_mark_read", function (/* msg, data */) {
                if (undo.posts_marked_read.length > 0) {
                    var undo_msg = undo.mark ? "post/mark_read" : "post/mark_unread";
                    undo.posts_marked_read.forEach(function ($post) {
                        var sfx_id = $post.attr('sfx_id');
                        X.publish(undo_msg, {"sfx_id": sfx_id, "save": false, "post": $post});
                    });
                    X.storage.save("postdata");
                    undo.posts_marked_read = [];
                    undo.undo_disabled = true;
                    FX.reflow();
                }
                else {
                    alert("Nothing to Undo!");
                }
            });

            var add_post_action_tray = function () {
                if (document.getElementById('sfx_post_action_tray') == null) {
                    template(document.body, html, action_data, actions);
                    X('#sfx_mark_read_wrench').click(function (ev) {
                        X('#sfx_post_filter_menu').hide();
                        X('#sfx_post_wrench_menu')
                            .css('left', ev.pageX + 'px')
                            .css('top', ev.pageY + 'px')
                            .toggle()
                        ;
                        ev.stopPropagation();
                    });
                    X('#sfx_mark_read_filter').click(function (ev) {
                        X('#sfx_post_wrench_menu').hide();
                        X('#sfx_post_filter_menu')
                            .css('left', ev.pageX + 'px')
                            .css('top', ev.pageY + 'px')
                            .toggle()
                        ;
                        ev.stopPropagation();
                    });
                }
            };

            X(window).click(function () {
                X('#sfx_post_filter_menu, #sfx_post_wrench_menu').hide();
            });

            var move_action_tray_to_post = function ($post) {
                action_data.$post = $post;
                action_data.id = $post.attr('id');
                action_data.sfx_id = $post.attr('sfx_id');
                action_data.read = (postdata[action_data.sfx_id] && postdata[action_data.sfx_id].read_on);
                action_data.show_mark_read = action_data.sfx_id ? true : false;
                add_post_action_tray();
                $post.append(document.getElementById('sfx_post_action_tray'));
            };

            // Change action tray checkmark-vs-X & tooltip
            // when the state of the post it's on changes.
            var update_action_tray = function ($post) {
                if (action_data.$post != $post) {
                    return;
                }
                move_action_tray_to_post($post);
            };

            X.subscribe("post/resolve-id", function (msg, data) {
                // If it's already read, hide it
                var sfx_id = data.sfx_id;
                if (sfx_id && postdata[sfx_id] && postdata[sfx_id].read_on) {
                    hide_read( X(data.selector) );
                }
            });

            X.subscribe(["post/add", "post/update"], function (msg, data) {
                if (msg == "post/add") {
                    var post = X(data.selector);
                    // Add the "Mark All Read" button to the control panel if necessary
                    if (!mark_all_added && FX.option('show_mark_all_read')) {
                        mark_all_added = true;
                        X.publish("cp/section/add", {
                            "name": "Post Controller"
                            , "order": 10
                            , "id": "sfx_cp_post_controller"
                            , "help": "Act on all visible posts at once"
                        });
                        // Wait until that has been rendered before attaching to it
                        Vue.nextTick(function () {
                            // The content container will have been created by now
                            var html = FX.oneLineLtrim(`
                                <div class="sfx_cp_mark_all_read" style="text-align:center;">
                                    <input type="button" class="sfx_button" value="Mark All Read" @click="mark_all_read">
                                    <input type="button" class="sfx_button" v-bind:disabled="undo_disabled" value="Undo ({{posts_marked_read.length}})" @click="undo_mark_read">
                                </div>`);
                            var methods = {
                                "mark_all_read": function () {
                                    X.publish("post/mark_all_read");
                                },
                                "undo_mark_read": function () {
                                    X.publish("post/undo_mark_read");
                                }
                            };
                            template('#sfx_cp_post_controller', html, undo, methods);
                        });
                    }

                    // When the mouse moves over the post, add the post action tray
                    post.on('mouseenter', function (e) {
                        // Don't add it if it's already present.
                        // Also allow user control: adding PAI can be slow with
                        // many posts loaded.
                        // Not Shift- or Ctrl- as those are mark-all-above/below
                        // and might well be pressed 'on descent into' a post's
                        // prospective PAI.
                        if (e.altKey || e.metaKey || action_data.$post == post) {
                            return;
                        }
                        move_action_tray_to_post(post);
                    });
                }
            }, true);

            X.subscribe("post/action/add", function (msg, data) {
                if (data.section == "wrench") {
                    action_data.wrench_items.push(data);
                }
                else if (data.section == "filter") {
                    action_data.filter_items.push(data);
                }
            }, true);

            X.publish('post/action/add', {"section": "wrench", "label": "Post Data", "message": "post/action/postdata"});
            X.subscribe('post/action/postdata', function (msg, data) {
                var log = [];
                X.publish("log/postdata/get", {
                    "id": data.id, "callback": function (pdata) {
                        log = pdata;
                    }
                });
                log = log.slice(1).join('<br>');
                var data_content = JSON.stringify(postdata[data.sfx_id] || {}, null, 3);
                var content = FX.oneLineLtrim(`
                    <div draggable="false">
                        <div>This popup shows what Social Fixer remembers about this post.</div>
                        <div class="sfx_bubble_note_data">Post ID: ${data.sfx_id}<br>DOM ID: ${data.id}</div>
                        <div>Data stored for this post:</div>
                        <div class="sfx_bubble_note_data">${data_content}</div>
                        <div>Processing Log:</div>
                        <div class="sfx_bubble_note_data">${log}</div>
                    </div>
                `);
                // Remove the previous one, if it exists
                X('#sfx_post_data_bubble').remove();
                bubble_note(content, {"position": "top_right", "title": "Post Data", "id": "sfx_post_data_bubble", "close": true});
            });
        });
    });
});

/* sticky_note.js:   */ /* global sticky_note_remove */

FX.add_option('disabled', {"hidden": true, "default":false});
X.beforeReady(function(options) {
	// Prevent modules from running until we decide if SFX is disabled, which we can't do until options are loaded
	if (!options) { return false; }
	// Check to see if SFX is disabled
	if (FX.option('disabled')) {
		// If we're disabled, we still need to add the wrench
		init_wrench(true);
		FX.fire_content_loaded();
		return false;
	}
});
X.ready( 'menu', function() {
	init_wrench(false);
});
var init_wrench = function(disabled) {
	FX.add_option('badge_x', {"hidden": true, "default": -64});
	FX.add_option('badge_y', {"hidden": true, "default": 5});
	FX.add_option('reset_wrench_position', {"title": '  Wrench Menu', "section": "Advanced", "description": "If your wrench menu badge somehow gets positioned so you can't see it, click here to reset its position to the upper right corner.", "type": "action", "action_text": "Find Wrench Menu", "action_message": "menu/reset_position"});
	FX.add_option('news_alerts', {"title": 'Social Fixer News', "section": "Advanced", "description": "Check for official news or blog posts from the Social Fixer team so you don't miss out on updates, updated filters, important news, etc. (Estimated frequency is one post a week)", "default": true});
	var actions = {
		"add": function (section, menu_item) {
			data.sections[section].items.push(menu_item);
		}
		,"remove": function(section, menu_item) {
			var items = data.sections[section].items;
			for( var i = 0; i < items.length; i++){
				var existing_item = items[i];
				if (menu_item.message===existing_item.message) {
					items.splice(i, 1);
					i--;
				}
			}
		}
		, "click": function (message) {
			if (message) {
				X.publish(message);
			}
		}
		, "toggle": function () {
			var $badge = X('#sfx_badge');
			var $menu = X('#sfx_badge_menu');
			if ($menu.css('display') == 'none') {
				$menu.css('visibility', 'hidden');
				$menu.show();
				// Figure out which direction to pop the menu
				var window_width = document.body.clientWidth || window.innerWidth;
				var window_height = window.innerHeight;
				var left = $badge[0].offsetLeft;
				var top = $badge[0].offsetTop;

				if (left <= window_width / 2) {
					$menu.addClass('right').removeClass('left');
				}
				else {
					$menu.addClass('left').removeClass('right');
				}

				if (top <= window_height / 2) {
					$menu.addClass('down').removeClass('up');
				}
				else {
					$menu.addClass('up').removeClass('down');
				}
				$menu.css('visibility', '');
			}
			else {
				X('#sfx_badge_menu').hide();
			}
		}
		, "hide": function () {
			X('#sfx_badge_menu').hide();
		}
		, "notify": function (id, count) {
			if (count > 0) {
				X.publish("notify/set", {"target": '#' + id, "count": count});
			}
			else {
				X.publish("notify/clear", {"target": '#' + id});
			}
			update_total_notify();
		}
	};
	var update_total_notify = function () {
		var count = 0;
		X('#sfx_badge_menu').find('.sfx_notification_count').forEach(function (c) {
			count += (+c.innerHTML || 0);
		});
		data.notify_count = count;
	};
	var data = {
		"notify_count": 0,
		"sections": {
			"options": {
				"title": "Options",
				"items": [],
				"order": 1
			},
			"actions": {
				"title": "Actions",
				"items": [],
				"order": 2
			},
			"links": {
				"title": "Links",
				"items": [],
				"order": 3
			},
			"debug": {
				"title": "Debug",
				"items": [],
				"order": 4
			},
			"other": {
				"title": "Other",
				"items": [],
				"order": 5
			}
		}
	};
	var html = FX.oneLineLtrim(`
		<div id="sfx_badge" @click.stop="toggle" v-tooltip="{content:'Drag to move Social Fixer wrench menu badge',delay:1500}">
			<div class="sfx_notification_count" v-if="notify_count>0">{{notify_count}}</div>
			<div id="sfx_badge_menu">
				<div id="sfx_badge_menu_wrap">
					<div v-for="section in sections | orderBy 'order'" class="sfx_menu_section" id="sfx_menu_section_{{$key}}">
						<div v-if="section.items.length" class="sfx_menu_section_title">{{section.title}}</div>
						<div v-for="item in section.items" id="{{item.id}}" class="sfx_menu_item" @click="click(item.message);" data-hover="tooltip" data-tooltip-position="left" data-tooltip-delay="500" data-tooltip-content="{{item.tooltip}}">
							<a v-if="item.url" href="{{item.url}}" target="{{item.target}}" class="sfx_menu_item_content" style="display:block;">{{{item.html}}}</a>
							<div v-else class="sfx_menu_item_content">{{{item.html}}}</div>
						</div>
					</div>
				</div>
			</div>
			<div id="sfx_badge_logo"></div>
		</div>
	`);

	var badge_greetings = function ($badge) {
		// If this is the first install, show the user where the badge is
		FX.on_options_load(function () {
			var stats = FX.storage('stats');
			if (!stats.installed_on) {
				var note = sticky_note("#sfx_badge", "left", "Social Fixer is installed! Start here &rarr;", {"close": false});
				$badge.mouseover(function () {
					//sticky_note_remove(note, '#sfx_badge');
					note.remove();
					stats.installed_on = X.now();
					X.storage.set('stats', "installed_on", X.now());
				});
			}
		});
	};

	var made_badge = false;

	var make_badge = function () {
		// Don't try if document body not yet created;
		// don't show on login page (or before we know whether it is one).
		// FUTURE: wrench might give menu noting that pre-login settings
		// apply only to the login page.  Users may wish to use Hide/Show
		// or Display Tweaks to improve the login page.  (In that event,
		// 'is installed!' banner should still defer until logged in.)
		if (!X.find('body') || !FX.isNonLoginPage) {
			return null;
		}

		// If the badge already exists for some reason, remove it and re-add it
		// Only known reason is >1 SFX running at once.  Collect version of other
		// SFX, then save our version in the DOM to facilitate warning about it.
		var $old_badge = X('#sfx_badge');
		if ($old_badge.length) {
			// other SFX's name (or older nameless, call it 'old')
			var old_buildstr = $old_badge.attr('sfx_buildstr') || 'old';
			$old_badge.remove();
		}

		// Attach the menu template to the DOM
		template("body", html, data, actions).ready(function () {
			position_badge(null, null, false);
			X.draggable('#sfx_badge', function (el, x, y) {
				position_badge(x, y);
			});
		});
		var $new_badge = X('#sfx_badge');
		$new_badge.attr('sfx_buildstr', sfx_buildstr);
		if (old_buildstr) {
			$new_badge.attr('old_buildstr', old_buildstr);
		}
		badge_greetings($new_badge);
		made_badge = true;
		return $new_badge;
	};

	// Try rapidly to make the badge appear as early as we can.
	var check_badge = function() {
		if (!made_badge &&			// Only make it once
			check_badge.tries-- > 0 &&	// Don't be a permanent burden
			FX.isNonLoginPage) {		// Never on the FB login page!
				make_badge();
				setTimeout(check_badge, check_badge.cadence * X.seconds);
		}
	};
	check_badge.cadence = 0.5;			// 2x a second
	check_badge.tries = 10 / check_badge.cadence;	// for max 10 seconds
	setTimeout(check_badge, check_badge.cadence * X.seconds);

	// This content_loaded call normally happens long after the
	// check_badge timer series has succeeded; it's just a suspender
	// to go with the belt.
	FX.on_content_loaded(() => made_badge || make_badge());

	var position_badge = function (x, y, save) {
		var $badge = X('#sfx_badge');
		if (!$badge.length) {
			$badge = make_badge();
			if (!$badge) {
				return;
			}
		}
		var reposition = false;
		if (typeof x == "undefined" || x == null || typeof y == "undefined" || y == null) {
			// Re-position it with saved options
			x = +FX.option('badge_x');
			y = +FX.option('badge_y');
			reposition = true;
		}
		var h = $badge[0].offsetHeight, w = $badge[0].offsetWidth;
		var window_width = document.body.clientWidth || window.innerWidth;
		var window_height = window.innerHeight;
		// If dragged, adjust
		if (!reposition) {
			if (x < 1) {
				x = 1;
			}
			else if (x > (window_width - w)) {
				x = window_width - w;
			}
			if (y < 1) {
				y = 1;
			}
			else if (y > (window_height - h)) {
				y = window_height - h;
			}

			// If the position is on the right half or bottom half of the screen, store it as negative so it's relative to the opposite edge
			if (x > window_width / 2) {
				x = x - window_width;
			}
			if (y > window_height / 2) {
				y = y - window_height;
			}
		}
		else {
			// Make sure it's on the screen
			if (x > (window_width - w)) {
				x = window_width - w;
			}
			else if (x < -window_width) {
				x = 0;
			}
			if (y > (window_height - h)) {
				y = window_height - h;
			}
			else if (y < -window_height) {
				y = 0;
			}
		}

		// Position it
		$badge.css({'left': (x > 0 ? x : (window_width + x)), 'top': (y > 0 ? y : (window_height + y))});

		// Persist the control panel location
		if (false !== save) {
			FX.option('badge_x', x, false);
			FX.option('badge_y', y, false);
			X.storage.save("options");
		}
	};

	actions.add('links', {'id': 'sfx_badge_menu_item_page', 'html': 'Social Fixer News/Blog', url: 'https://www.facebook.com/socialfixer', 'message': 'menu/news_clicked'});
	actions.add('links', {'html': 'Support Group', 'url': 'https://socialfixer.com/support/'});
	if (disabled) {
		actions.add('options', {'html': 'Social Fixer is <span style="color:red;font-weight:bold;">Disabled</span>.<br>Click here to Enable.</span>', 'message': 'menu/enable'});
	}
	else {
		actions.add('options', {'html': 'Social Fixer Options <span style="font-size:10px;color:#aaa;">(Ctrl+Shift+X)</span>', 'message': 'menu/options'});
		actions.add('links', {'html': 'Donate To Support Development', 'url': 'http://socialfixer.com/donate.html'});
		actions.add('other', {'html': 'Version ' + sfx_buildstr, 'message': 'menu/about_clicked'});
		actions.add('other', {'html': 'Disable Social Fixer', 'message': 'menu/disable'});
	}

	// Keyboard shortcut to Options (enable-only menu when disabled)
	X(window).keyup(function(e) {
		// Opera & sometimes Firefox have Ctrl-Shift-X shortcuts,
		// so accept this without minding any extra modifiers.
		if (!e.ctrlKey || !e.shiftKey || (e.key != 'x' && e.key != 'X')) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		if (disabled) {
			// Reset badge position: menu we're opening must be visible
			X.publish("menu/reset_position");
			// Pause so menu open-direction is based on new position
			setTimeout(function () {
				X('#sfx_badge').click();
			}, 0.1 * X.seconds);
			return;
		}
		// Re-display wrench in user's position (it sometimes disappears)
		// then open Options.  If harder reset desired, do it in Options.
		position_badge(null, null, false);
		X.publish("menu/options");
	});

	// Listen for enable/disable
	X.subscribe('menu/disable', function() {
		if (confirm("This will disable all Social Fixer functionality, but the wrench will still appear so you can re-enable.\n\nThe page will be automatically refreshed after disabling.\n\nAre you sure you want to disable?")) {
			X.storage.set('options','disabled',true,function() {
				window.location.reload();
			});
		}
	});
	X.subscribe('menu/enable', function() {
		X.storage.set('options','disabled',false,function() {
			window.location.reload();
		});
	});

	// Listen for messages to add items to the menu
	X.subscribe('menu/add', function (msg, data) {
		actions.add(data.section, data.item);
	}, true);
	// Listen for messages to REMOVE items from the menu
	X.subscribe('menu/remove', function (msg, data) {
		actions.remove(data.section, data.item);
	}, true);

	X(window).click(actions.hide);
	window.addEventListener('resize', function () {
		position_badge();
	});
	// If options are updated from another tab, move the control panel
	X.subscribe("storage/refresh", function (msg, data) {
		if ("options" == data.key) {
			position_badge(null, null, false);
		}
	});

	X.subscribe("menu/reset_position", function (/* msg, data */) {
		var undef;
		X.storage.set('options', {'badge_x': undef, 'badge_y': undef}, function () {
			position_badge();
		});
	});

	// About
	X.subscribe('menu/about_clicked', function () {
		X.publish("menu/options", {"section": "About"});
	});

	// If disabled, stop now!
	if (disabled) { return; }

	// NEWS CHECK
	// Check for Posts to the Social Fixer Page and alert if there are new ones
	FX.on_options_load(function () {
		X.task('news_alerts', 1 * X.seconds, function () {
			if (FX.option('news_alerts')) {
				X.when('#sfx_badge_menu_item_page', function ($item) {
					var now = X.now();
					X.storage.get('stats', {}, function (stats) {
						if (!stats || !stats.sfx_news_checked_on) {
							X.storage.set("stats", "sfx_news_checked_on", now, function () {
							});
						}
						else {
							X.ajax("https://matt-kruse.github.io/socialfixerdata/news.json", function (json) {
								if (!json || !json.news) {
									return;
								}
								var count = 0, title = null;
								json.news.reverse().forEach(function (news) {
									if (news.time > stats.sfx_news_checked_on) {
										$item.find('a').attr('href', news.href);
										title = X.sanitize(news.title);
										count++;
									}
								});
								actions.notify('sfx_badge_menu_item_page', count);

								if (count>0) {
									// Add a "clear notification" link
									var $clear = X(`<div style="text-align:right;font-size:11px;color:#777;" class="sfx_link sfx_clear_notification_link">clear notification</div>`);
									$clear.click(function () {
										clear_news_notification();
									});
									$item.before($clear);
								}
								if (count == 1) {
									if (title) {
										$item.find('.sfx_menu_item_content').append('<div class="sfx_news_title">' + title + '</div>'); // sanitized
									}
								}
							});
						}
					});
				});
			}
		});
	});
	var clear_news_notification = function() {
		X.storage.set("stats", "sfx_news_checked_on", X.now(), function () {
			actions.notify('sfx_badge_menu_item_page', 0);
			X('.sfx_news_title,.sfx_clear_notification_link').remove();
		});
	};
	X.subscribe('menu/news_clicked', function (/* msg, data */) {
		// Clear when clicked
		clear_news_notification();
	});
};

/* sticky_note.js:   */ /* global sticky_note_remove */

// =========================================================
// Force the main Newsfeed to the Most Recent view
// =========================================================
X.ready( 'most_recent', function() {
	FX.add_option('auto_switch_to_recent_stories', {"title": 'Automatically Switch to Most Recent view of the main Newsfeed', "description": "Facebook defaults to Top Posts. This option detects this view and automatically switches you to the chronological Most Recent view.", "default": false, "verified":true});
	FX.add_option('auto_switch_hide_message', {"section":"Advanced", "title": 'Hide Most Recent switch messages', "description": "When automatically switched to the Most Recent news feed, hide the message that appears to inform you of the switch.", "default": false, "verified":true});
	FX.add_option('redirect_home_links', {"section": "Advanced", "title": 'Redirect Home Links', "description": 'Try to keep links to the Home Page in your current view - Most Recent or Top Posts.', "default": true, "verified":true});
	FX.on_options_load(function () {
		var already_most_recent = function(href) {
			return (/sk=h_chr/.test(href));
		};
		if (FX.option('redirect_home_links')) {
			FX.on_content_loaded(function () {
				X.capture(document.body, 'mousedown', function (e) {
					var $e = X.target(e, true);
					if (!$e.is('a')) {
						$e = $e.closest('a');
					}
					var href = $e.attr('href');
					if (href=="/" || /facebook\.com\/$/.test(href)) {
						// Don't force Most Recent link if clicking "Back to Top Posts" which only exists in the Main container
						// Force Top Posts instead
						if ($e.closest('*[role="main"]').length) {
							e.preventDefault();
							e.stopPropagation();
							location.href = "/?sk=h_nor";
						}
						// This is a link from somewhere to the News Feed, so make sure it's a Most Recent link
						else if (FX.option('auto_switch_to_recent_stories')) {
							e.preventDefault();
							e.stopPropagation();
							location.href = "/?sk=h_chr";
						}
					}
				});
			});
		}

		// Force Most Recent
		FX.on_content_loaded(function () {
			if (FX.option('auto_switch_to_recent_stories')) {
				var href = window.location.href;
				if (/sfx_switch=true/.test(href)) {
					if (!FX.option('auto_switch_hide_message')) {
						var note = sticky_note('#sfx_badge', 'left', 'Auto-switched to Most Recent', {close: false});
						setTimeout(function () {
								//sticky_note_remove(note, '#sfx_badge');
							note.remove();
						}, 3.0 * X.seconds);
					}
					return;
				}
				if (already_most_recent(href)) {
					return;
				}
				var redirect_now = function () {
					// Failsafe in case redirect doesn't cause reload
					setTimeout(function () {
						X(document.body).css('opacity', '1');
					}, 2.0 * X.seconds);
					X(document.body).css('opacity', '.2');
					// Remove the setTimeout so this doesn't wait so long to
					// run, after other async processes in the queue run
						window.location.href = "/?sk=h_chr&sfx_switch=true"; // recent_href(href, 'sfx_switch=true');
				};
				// If you specifically asked for Top News, don't redirect
				if (/sk=h_nor/.test(href)) {
					return;
				}
				if (location.pathname=="/") {
					// The new layout always has sk=h_chr in Most Recent view
					// If we're on root Facebook, redirect
					redirect_now();
				}
			}
		});
	});
});

// ========================================================
// Hide the notification bubble in the lower left
// ========================================================
X.ready('notification_bubble', function () {

});

X.ready('notify', function() {
    X.subscribe("notify/set", function (msg, data) {
        X.poll(function() {
            var $target = X(data.target);
            if (!$target.length) { return false; }
            var position = $target.css('position');
            if (position == "static") {
                $target.attr('sfx_position', position);
                $target.css('position', 'relative');
            }
            var $counter = $target.find('.sfx_notification_count');
            if (!$counter.length) {
                $target.prepend('<div class="sfx_notification_count">0</div>');
                $counter = $target.find('.sfx_notification_count');
            }
            var count = +$counter.html() || 0;
            if (typeof data.count != "undefined") {
                count = data.count;
            }
            if (typeof data.increment != "undefined") {
                count++;
            }
            $counter.text(count);
        },500,10);
    });

    X.subscribe("notify/increment", function (msg, data) {
        data.increment = true;
        X.publish("notify/set", data);
    });

    X.subscribe("notify/clear", function (msg, data) {
        var $target = X(data.target);
        $target.find('.sfx_notification_count').remove();
        if ($target.attr('sfx_position')) {
                $target.css('position', $target.attr('sfx_position'));
                $target.removeAttr('sfx_position');
        }
    });
});

X.ready('options', function() {
    /* index.js:         */ /* global sfx_version */
    /* subscriptions.js: */ /* global update_subscribed_items */
    /* subscriptions.js: */ /* global mark_subscribed_items */
    /* subscriptions.js: */ /* global retrieve_item_subscriptions */
    /* sticky_note.js:   */ /* global sticky_note_remove */
    FX.add_option('show_filtering_tooltips', {"hidden":true, "default": true});
	FX.on_options_load(function () {
		// Update Tweaks and Filters in the background every so often
		X.task('update_filter_subscriptions', 4 * X.hours, function () {
			update_subscribed_items('filters', FX.storage('filters'));
		});
		X.task('update_tweak_subscriptions', 4 * X.hours, function () {
			update_subscribed_items('tweaks', FX.storage('tweaks'));
		});

		// Options Dialog
		var sections = [
			{'name': 'Search', 'description': 'Options with a title or description matching your search text (at least 3 characters) will appear below.'}
			, {'name': 'General', 'description': ''}
			, {'name': 'Hide Posts', 'description': '', "verified":true}
			, {'name': 'Filters', 'description': '', "verified":true}
//			, {'name': 'User Interface', 'description': ''}
			, {'name': 'Display Tweaks', 'description': ''}
//			, {'name': 'Tips', 'description': 'These are not features of Social Fixer - they are useful Facebook tips that users may not know about, or that I think are especially useful.'}
			, {'name': 'Advanced', 'description': ''}
			, {'name': 'Experiments', 'description': 'These features are a work in progress, not fully functional, or possibly confusing to users.'}
			, {'name': 'Data Import/Export', 'description': ''}
			, {'name': 'Support', 'url': 'https://matt-kruse.github.io/socialfixerdata/support.html', 'property': 'content_support'}
			, {'name': 'Donate', 'url': 'https://matt-kruse.github.io/socialfixerdata/donate.html', 'property': 'content_donate'}
			, {'name': 'About', 'url': 'https://matt-kruse.github.io/socialfixerdata/about.html', 'property': 'content_about'}
			, {'name': 'Debug', 'className':'sfx_debug_tab', 'description':`These are debugging tools to help developers and those needing support. These are not normal features. Play with them if you wish, or visit them if asked to by the Support Team.`}
		];
		var data = {
			"action_button": null
			, "show_action_buttons": true
			, "sections": sections
			, "filters": null
			, "show_filtering_tooltips": FX.option('show_filtering_tooltips')
			, "editing_meta": {}
			, "editing_filter": null
			, "filter_subscriptions": null
			, "tweak_subscriptions": null
			, "tweaks": null
			, "editing_tweak": null
			, "show_advanced": false
			, "options": FX.options
			, "user_options": ""
			, "user_options_message": null
			, "storage_size": JSON.stringify(X.storage.data).length
			, "supports_download_attribute": 'download' in document.createElement('a') // https://stackoverflow.com/a/12112905
			, "content_about": "Loading..."
			, "content_donate": "Loading..."
			, "sfx_option_show_donate": false
			, "content_support": "Loading..."
			, "buildstr": sfx_buildstr
			, "user_agent": sfx_user_agent
			, "userscript_agent": sfx_userscript_agent
			, "support_notes": null
			, "searchtext":null
		};
		X.subscribe('menu/options', function (event, event_data) {
			if (!event_data) { event_data={}; }
			try {
				if (X('#sfx_options_dialog').length) {
					return;
				}

				// Prepare data for options dialog display.
				// We can't work on the real options object, in case the user cancels.
				// So we need to work on a copy, then overlay it when they save.

				// Convert the options into section-based options
				sections.forEach(function (section_object) {
					var sectionName = section_object.name;
					section_object.options = [];
					if (event_data.section) {
						section_object.selected = (event_data.section == sectionName);
					}
					else {
						section_object.selected = (sectionName == 'General');
					}
					for (var k in FX.options) {
						var opt = FX.options[k];
						if ((sectionName == 'General' && !opt.section) || (sectionName == opt.section)) {
							opt.newValue = opt.value = FX.option(opt.key);
							section_object.options.push(opt);
						}
						if (opt.title && opt.title==event_data.highlight_title) {
							opt.highlighted=true;
						}
					}

					section_object.options = section_object.options.sort(function (a, b) {
						var x = (a.title || "") + " " + (a.order || "") + " " + (a.description || "");
						var y = (b.title || "") + " " + (b.order || "") + " " + (b.description || "");
						if (x < y)
							return -1;
						if (x > y)
							return 1;
						return 0;
					});
				});

				var filters = X.clone(X.storage.data['filters']);
				filters.forEach(function (o) {
					// Make sure every filter has rules and actions
					if (!X.def(o.rules)) {
						o.rules = [];
					}
					if (!X.def(o.actions)) {
						o.actions = [];
					}
				});
				data.filters = filters;

				var tweaks = X.clone(X.storage.data['tweaks']);
				data.tweaks = tweaks;

				if (X.support_notes) {
					data.support_notes = X.support_notes;
				}

				// Render the options dialog content
				var dialog = FX.oneLineLtrim(`<div id="sfx_options_dialog" class="sfx_dialog sfx-flex-column" style="transition: height .01s;">
	<div id="sfx_options_dialog_header" class="sfx_dialog_title_bar" style="cursor:move;" @click="collapse" v-tooltip="{content:'Click to window-shade, drag to move',position:'below'}">
		Social Fixer ${sfx_version}
		<div id="sfx_options_dialog_actions" v-if="show_action_buttons" draggable="false" >
			<input draggable="false" v-if="action_button=='done_editing_filter'" class="sfx_options_dialog_panel_button sfx_button" type="button" value="Done Editing Filter" @click.stop="close_filter">
			<input draggable="false" v-if="action_button=='done_editing_tweak'" class="sfx_options_dialog_panel_button sfx_button" type="button" value="Done Editing Tweak" @click.stop="close_tweak">
			<input draggable="false" v-if="!action_button" class="sfx_button" type="button" @click.stop="save" value="Save Changes">
			<input draggable="false" type="button" class="sfx_button secondary" @click.stop="cancel" value="Cancel">
		</div>
	</div>
	<div id="sfx_options_dialog_body" class="sfx-flex-row" draggable="false">
		<div id="sfx_options_dialog_sections">
			<template v-for="section in sections">
				<template v-if="section.name=='Search'">
					<div @click="select_section(section)" class="sfx_options_dialog_section {{section.selected?'selected':''}} {{section.className}}"><input class="sfx_input" style="width:90%;" placeholder="Search..." @keyup="search" v-model="searchtext"></div>
				</template>
				<template v-else>
					<div @click="select_section(section)" class="sfx_options_dialog_section {{section.selected?'selected':''}} {{section.className}}">{{section.name}}</div>
				</template>
			</template>
		</div>
		<div id="sfx_options_dialog_content">
			<div v-if="section.selected" v-for="section in sections" class="sfx_options_dialog_content_section">
				<template v-if="section.name=='Filters'">
					<div id="sfx_options_dialog_filters" class="sfx_options_dialog_filters">

					    <div v-if="!editing_filter" class="sfx_options_dialog_filter_list">
					        <div class="">
					            <span class="sfx_button" style="float:right;background-color:green;" onclick="window.open('https://github.com/matt-kruse/SocialFixer/wiki/Post-Filtering#filter-list','SFX_FILTER_HELP','width=1024,height=600');"><b>[?]</b> Open Filter Help</span>
					            Post Filters let you hide posts, put them in tabs, or change their appearance based on their content. They execute in the order below for each post.
					            <br style="clear:both;">
					        </div>
					        <div class="sfx_option" style="margin:10px 10px;font-size:14px;float:left;">
					            <input id="filters_enabled" type="checkbox" v-model="options.filters_enabled.newValue"/><label for="filters_enabled"></label> Post Filtering enabled
					        </div>
					        <div class="sfx_option" style="margin:10px 10px;font-size:14px;float:left;">
					            <input id="filters_enabled_pages" type="checkbox" v-model="options.filters_enabled_pages.newValue"/><label for="filters_enabled_pages"></label> Filter on Pages/Timelines
					        </div>
					        <div class="sfx_option" style="margin:10px 10px;font-size:14px;float:left;">
					            <input id="filters_enabled_groups" type="checkbox" v-model="options.filters_enabled_groups.newValue"/><label for="filters_enabled_groups"></label> Filter in Groups
					        </div>
					        <div class="sfx_options_dialog_panel_header" style="clear:both;">Active Filters</div>
					        <div>
					            <input type="button" class="sfx_button" value="Create A New Filter" @click="add_filter">
					        </div>
					        <table class="sfx_options_dialog_table">
					            <thead>
					            <tr>
					                <th>Title</th>
					                <th>Description</th>
					                <th style="text-align:center;">Actions</th>
					                <th style="text-align:center;">Stop On<br>Match</th>
					                <th style="text-align:center;">Enabled</th>
					            </tr>
					            </thead>
					            <tbody>
					            <tr v-for="filter in filters" v-bind:class="{'!sfx_options_dialog_option_enabled':filter.disabled}">
					                <td class="sfx_options_dialog_option_title">{{filter.title}}<span v-if="filter.id" style="font-weight:normal;font-style:italic;color:green;margin-top:5px;" v-tooltip="{content:'Click \\'x\\' to unsubscribe',delay:250}"> (Subscribed)</span></td>
					                <td class="sfx_options_dialog_option_description">
					                    {{filter.description}}
					                    <div v-if="filter.id && filter.subscription_last_updated_on" style="font-style:italic;color:#999;margin-top:5px;">Subscription last updated: {{ago(filter.subscription_last_updated_on)}}</div>
					                </td>
					                <td class="sfx_options_dialog_option_action" style="white-space:nowrap;">
					                    <span class="sfx_square_control" v-tooltip="Edit" @click="edit_filter(filter,$index)">&#9998;</span>
					                    <span class="sfx_square_control sfx_square_delete"  v-tooltip="Delete" @click="delete_filter(filter)">&times;</span>
					                    <span class="sfx_square_control" v-tooltip="Move Up (Hold Ctrl to move to top)" @click="up(filter, $event)">&utrif;</span>
					                    <span v-if="$index<filters.length-1" class="sfx_square_control" v-tooltip="Move Down" @click="down(filter)">&dtrif;</span>
					                </td>
					                <td style="text-align:center;">
					                    <input id="sfx_stop_{{$index}}" type="checkbox" v-model="filter.stop_on_match"/><label for="sfx_stop_{{$index}}" data-tooltip-delay="100" v-tooltip="If a post matches this filter, don't process the filters that follow, to prevent it from being double-processed. For most situations, this should remain checked."></label>
					                </td>
					                <td style="text-align:center;">
					                    <input id="sfx_filter_{{$index}}" type="checkbox" v-model="filter.enabled"/><label for="sfx_filter_{{$index}}"></label>
					                </td>
					            </tr>
					            </tbody>
					        </table>

					        <div v-if="filter_subscriptions">
					            <div class="sfx_options_dialog_panel_header">Filter Subscriptions</div>
					            <div>The pre-defined filters below are available for you to use. These "Filter Subscriptions" will be automatically maintained for you, so as Facebook changes or more keywords are needed to match a specific topic, your filters will be updated without you needing to do anything!</div>
					            <table class="sfx_options_dialog_table">
					                <thead>
					                <tr>
					                    <th>Title</th>
					                    <th>Description</th>
					                    <th>Actions</th>
					                </tr>
					                </thead>
					                <tbody>
					                <tr v-for="filter in filter_subscriptions" v-bind:class="{'sfx_filter_subscribed':filter.subscribed}">
					                    <template v-if="version_check(filter)">
					                    <td class="sfx_options_dialog_option_title">{{filter.title}}<span v-if="filter.subscribed" style="font-weight:900;font-style:italic;color:green;margin-top:5px;" v-tooltip="{content:'To unsubscribe, click \\'x\\' in the Active Filters table above',delay:250}"> (Subscribed)</span></td>
					                    <td class="sfx_options_dialog_option_description">{{filter.description}}</td>
					                    <td class="sfx_options_dialog_option_action">
					                        <span class="sfx_square_add" v-tooltip="Add To My Filters" @click="add_subscription(filter)">+</span>
					                    </td>
					                    </template>
					                </tr>
					                </tbody>
					            </table>
					        </div>
					    </div>

					    <div v-if="editing_filter" class="sfx_options_dialog_panel">
					        <div style="float:right;">
					            <!--<input type="checkbox" class="normal" v-model="show_filtering_tooltips" @click="toggle_tooltips"> Show Tooltips-->
					            <span class="sfx_button" style="background-color:green;" onclick="window.open('https://github.com/matt-kruse/SocialFixer/wiki/Post-Filtering#edit-filter','SFX_FILTER_HELP','width=1024,height=600');"><b>[?]</b> Open Filter Help</span>
					        </div>
					        <div class="sfx_panel_title_bar">
					            Edit Filter
					            <br style="clear:both;">
					        </div>
					        <div class="sfx_info" v-if="editing_filter.id">
					            This filter is a subscription, so its definition is stored on the SocialFixer.com server and updated automatically for you. If you wish to edit this filter, you can do so but it will "break" the subscription and your copy will be local and no longer updated automatically as Facebook changes.
					            <br><input type="button" class="sfx_button" value="Convert to local filter" @click="editing_filter.id=null"/>
					        </div>
					        <div class="sfx_label_value">
					            <div>Title:</div>
					            <div><input class="sfx_wide sfx_input" v-model="editing_filter.title" v-bind:disabled="editing_filter.id"/></div>
					        </div>
					        <div class="sfx_label_value">
					            <div>Description:</div>
					            <div><input class="sfx_wide sfx_input" v-model="editing_filter.description" v-bind:disabled="editing_filter.id"></div>
					        </div>
					        <div class="sfx_options_dialog_filter_conditions sfx_options_dialog_panel">
					            <div class="sfx_panel_title_bar">
					                IF ...
					                <br style="clear:both;">
					            </div>
					            <div v-for="rule in editing_filter.rules">
					                <div class="sfx-flex-row-container">
					                    <div><select v-if="$index>0" v-model="editing_filter.match" v-bind:disabled="editing_filter.id"><option value="ALL" data-tooltip-delay="100" v-tooltip="Choose whether all conditions must be met (AND) or if any of the conditions must be met (OR)">AND<option value="ANY">OR</select></div>
					                    <div><select v-model="rule.target" v-bind:disabled="editing_filter.id" data-tooltip-delay="100" v-tooltip="Which attribute of the post do you want to match on?\nSee the Filter Help for a full explanation of each type">
					                        <option value="any">Any Post Content</option>
					                        <option value="any+image">Post Text + Caption</option>
					                        <option value="content">Post Text Content</option>
					                        <option value="action">Post Action</option>
					                        <option value="author">Author</option>
					                        <option value="group">Group Posted In</option>
					                        <option value="page">Page Posted By</option>
					<!--                        <option value="app">App/Game Name</option>-->
					                        <option value="link_url">Link URL</option>
					                        <option value="link_text">Link Text</option>
					                        <!--
					                        <option value="day">Day of the Week</option>
					                        <option value="age">Post Age</option>
					                        -->
					                        <option value="image">Photo Caption</option>
					                    </select></div>
					                    <template v-if="rule.target=='day'">
					                        <div style="padding-left:10px;" data-tooltip-delay="100" v-tooltip="Choose which days of the week this filter should be active">
					                            is
					                            <input type="checkbox" class="normal" v-model="rule.condition.day_0" v-bind:disabled="editing_filter.id"> Sun
					                            <input type="checkbox" class="normal" v-model="rule.condition.day_1" v-bind:disabled="editing_filter.id"> Mon
					                            <input type="checkbox" class="normal" v-model="rule.condition.day_2" v-bind:disabled="editing_filter.id"> Tue
					                            <input type="checkbox" class="normal" v-model="rule.condition.day_3" v-bind:disabled="editing_filter.id"> Wed
					                            <input type="checkbox" class="normal" v-model="rule.condition.day_4" v-bind:disabled="editing_filter.id"> Thu
					                            <input type="checkbox" class="normal" v-model="rule.condition.day_5" v-bind:disabled="editing_filter.id"> Fri
					                            <input type="checkbox" class="normal" v-model="rule.condition.day_6" v-bind:disabled="editing_filter.id"> Sat
					                        </div>
					                    </template>
					                    <template v-if="rule.target=='age'">
					                        <div style="padding-left:10px;">
					                            is
					                            <select v-model="rule.operator" v-bind:disabled="editing_filter.id">
					                                <option value="gt">Greater Than</option>
					                                <option value="lt">Less Than</option>
					                            </select>
					                            <input class="sfx_input" type="number" min="1" style="width:40px;" v-model="rule.condition.value" size="3" v-bind:disabled="editing_filter.id">
					                            <select v-model="rule.condition.units" v-bind:disabled="editing_filter.id">
					                                <option value="h">Hours</option>
					                                <option value="d">Days</option>
					                            </select>
					                        </div>
					                    </template>
					                    <template v-if="rule.target!='day' && rule.target!='age'">
					                        <div>
					                            <select v-model="rule.operator" v-bind:disabled="editing_filter.id">
					                                <option value="contains">Contains</option>
					                                <option value="not_contains">Does NOT Contain</option>
					                                <option value="equals">Equals Exactly</option>
					                                <option value="startswith">Starts With</option>
					                                <option value="endswith">Ends With</option>
					                                <option value="matches">Matches Regex</option>
					                                <option value="not_matches">Does NOT Match Regex</option>
					                                <template v-if="rule.target=='any'">
					                                    <option value="contains_selector">Matches CSS Selector</option>
					                                    <option value="not_contains_selector">Does NOT Match CSS Selector</option>
					                                </template>
					                            </select>
					                        </div>
					                        <div class="stretch" style="white-space:nowrap;">
					                            <span v-if="rule.operator=='matches' || rule.operator=='not_matches'" style="margin-left:10px;font-weight:bold;">/</span>
					                            <input v-if="rule.operator=='contains' || rule.operator=='not_contains' || rule.operator=='equals' || rule.operator=='startswith' || rule.operator=='endswith'" class="stretch sfx_input" v-on:focus="clear_test_regex" v-on:blur="test_regex" v-model="rule.condition.text" v-bind:disabled="editing_filter.id">
					                            <input v-if="rule.operator=='contains_selector' || rule.operator=='not_contains_selector'" class="stretch sfx_input" v-model="rule.condition.text" v-bind:disabled="editing_filter.id">
					                            <input v-if="rule.operator=='matches' || rule.operator=='not_matches'" class="stretch sfx_input" v-model="rule.condition.text" style="max-width:70%;" v-bind:disabled="editing_filter.id">
					                            <div style="white-space:normal;" v-if="rule.operator=='equals' || rule.operator=='contains' || rule.operator=='not_contains'">word|or phrase|more of either|...</div>
					                            <span v-if="rule.operator=='matches' || rule.operator=='not_matches'" style="font-weight:bold;">/</span>
					                            <input class="sfx_input" v-if="rule.operator=='matches' || rule.operator=='not_matches'" v-model="rule.condition.modifier" size="2" v-bind:disabled="editing_filter.id" data-tooltip-delay="100" v-tooltip="Regular Expression modifier, such as 'i' for case-insensitive">
					                            <span v-if="rule.operator=='matches' || rule.operator=='not_matches'" class="sfx_link" @click="regex_test(rule.condition)" data-tooltip-delay="100" v-tooltip="Test your regular expression against text to make sure it matches as you expect."> [test]</span>
					                        </div>
					                        <div v-if="rule.operator=='contains' || rule.operator=='not_contains'" style="white-space:nowrap;padding-left:5px;">
					                            <input type="checkbox" class="normal" v-model="rule.match_partial_words" v-bind:disabled="editing_filter.id" data-tooltip-delay="100" v-tooltip="Check this if you want the text to be a partial match. For example, if 'book' should also match 'Facebook'. If unchecked, only whole words will be matched.">
					                            <span v-if="(!editing_filter.id || rule.match_partial_words)"> Match partial words</span>
					                        </div>
					                    </template>
					                    <span v-if="editing_filter.rules.length>1" class="sfx_square_control sfx_square_delete" style="margin:0 10px;" v-tooltip="Delete" @click="delete_rule(rule)">&times;</span>
					                </div>
					            </div>
					            <div v-if="!editing_filter.id">
					                <input type="button" class="sfx_button" value="Add A Condition" @click="add_condition">
					            </div>
					        </div>
					        <div class="sfx_options_dialog_filter_actions sfx_options_dialog_panel">
					            <div class="sfx_panel_title_bar">... THEN</div>
					            <div class="sfx_info" v-if="editing_filter.id && editing_filter.configurable_actions && editing_filter.actions[0].action==''">
					                This Filter Subscription defines the rules above, but the action to take is up to you to define. When updated automatically, the rules above will be updated but your selected actions are personal to you.
					            </div>
					            <div class="sfx_info" v-if="editing_filter.id && editing_filter.configurable_actions && editing_filter.actions[0].action!=''">
					                The Actions to take when this filter subscription matches may be changed. If you change the actions, the criteria above will continue to be updated but your customized actions will not be over-written when the filter updates itself.
					            </div>
					            <div class="sfx-flex-row-container" v-for="action in editing_filter.actions">
					                <select v-model="action.action" v-bind:disabled="editing_filter.id && !editing_filter.configurable_actions" data-tooltip-delay="100" v-tooltip="If the conditions match, what action should be taken on the post?">
					                    <option value=""></option>
					                    <option value="hide">Hide post</option>
					                    <option value="css">Add CSS</option>
					                    <option value="class">Add CSS Class</option>
					                    <option value="replace">Replace text</option>
					                    <option value="move-to-tab">Move post to tab</option>
					                    <option value="copy-to-tab">Copy post to tab</option>
					                </select>
					                <span v-if="action.action=='hide'">
					                    <input type="checkbox" class="normal" v-model="action.show_note"  data-tooltip-delay="100" v-tooltip="This will leave a small message in your feed to let you know that a post was hidden." v-bind:disabled="editing_filter.id && !editing_filter.configurable_actions"> Show a note where the post would have been.
					                    <span v-if="action.show_note"> Optional Custom Message: <input class="sfx_input" v-model="action.custom_note" size="20" data-tooltip-delay="100" v-tooltip="Customize the message displayed to be anything you wish."></span>
					                </span>
					                <span v-if="action.action=='css'">
					                    CSS: <input class="sfx_input" v-model="action.content" size="45" v-bind:disabled="editing_filter.id && !editing_filter.configurable_actions">
					                    To Selector: <input class="sfx_input" v-model="action.selector" size="25" data-tooltip-delay="100" v-tooltip="Apply the CSS to the element(s) specified by the selector. To target the whole post container, leave blank." v-bind:disabled="editing_filter.id && !editing_filter.configurable_actions">
					                </span>
					                <span class="stretch" v-if="action.action=='class'">
					                    Class: <input class="sfx_input" v-model="action.content" size="45" v-bind:disabled="editing_filter.id && !editing_filter.configurable_actions" data-tooltip-delay="100" v-tooltip="Add a class name. This is useful in conjunction with a Display Tweak to customize CSS">
					                    To Selector: <input class="sfx_input" v-model="action.selector" size="25" data-tooltip-delay="100" v-tooltip="Apply the class to the element(s) specified by the selector. To target the whole post container, leave blank." v-bind:disabled="editing_filter.id && !editing_filter.configurable_actions">
					                </span>
					                <span v-if="action.action=='replace'">
					                    Find: <input class="sfx_input" v-model="action.find" size="25" v-bind:disabled="editing_filter.id && !editing_filter.configurable_actions">
					                    Replace With: <input class="sfx_input" v-model="action.replace" size="25" v-bind:disabled="editing_filter.id && !editing_filter.configurable_actions">
					                </span>
					                <span v-if="action.action=='move-to-tab' || action.action=='copy-to-tab'">
					                    Tab Name: <input class="sfx_input" v-model="action.tab" size="45" v-bind:disabled="editing_filter.id && !editing_filter.configurable_actions">
					                </span>
					                <span v-if="editing_filter.actions.length>1" class="sfx_square_control sfx_square_delete" style="margin:0 10px;" v-tooltip="Delete" @click="delete_action(action)">&times;</span>
					            </div>
					            <div v-if="!editing_filter.id || editing_filter.configurable_actions">
					                <input type="button" class="sfx_button" value="Add An Action" @click="add_action">
					            </div>
					        </div>
					        <span data-tooltip-delay="100" v-tooltip="Directly move this filter to the given position number">
					            <input type="number" class="sfx_input" min="1" max="{{filters.length}}" v-model="editing_meta.new_number">Filter Order
					        </span>
					        <span data-tooltip-delay="100" v-tooltip="If a post matches this filter, don't process the filters that follow, to prevent it from being double-processed. For most situations, this should remain checked.">
					            <input type="checkbox" class="normal" v-model="editing_filter.stop_on_match">Stop On Match
					        </span>
					        <span data-tooltip-delay="100" v-tooltip="Should this filter be processed at all?">
					            <input type="checkbox" class="normal" v-model="editing_filter.enabled">Enabled
					        </span>
					        <div class="sfx_link" @click="show_advanced=!show_advanced" v-tooltip="{position:'above',content:'View the underlying JSON data structure for this filter. The filter can be edited manually here, or you can paste in filter code from someone else to copy their filter exactly.',delay:500}">{{show_advanced?"Hide Advanced Code &utrif;":"Show Advanced Code &dtrif;"}}</div>
					        <textarea v-if="show_advanced" style="width:90%;height:150px;font-size:11px;font-family:monospace;" v-model="editing_filter | json+" v-bind:disabled="editing_filter.id"></textarea>
					    </div>
					</div>

				</template>
				<template v-if="section.name=='Data Import/Export'">
					<div class="sfx_info">Here you can export all of Social Fixer's stored data, including options, filters, and which stories have been read. WARNING: Importing will overwrite your existing settings!</div>
					Total storage space used: {{storage_size | currency '' 0}} bytes<br><br>
					<input type="button" class="sfx_button" value="Save To File" @click="save_to_file()" v-if="supports_download_attribute"> <input type="button" class="sfx_button" value="Load From File" @click="load_from_file()"> <input type="button" class="sfx_button" value="Reset All Data" @click="reset_data()"><br><br>
					<input type="button" class="sfx_button" value="Export To Textbox" @click="populate_user_options()"> <input type="button" class="sfx_button" value="Import From Textbox" @click="import_data_from_textbox()">
					<br><br>
					<div v-if="user_options_message" class="sfx_info">{{user_options_message}}</div>
					<textarea id="sfx_user_data" v-model="user_options|json" style="width:95%;height:50vh;font-family:courier new,monospace;font-size:11px;"></textarea>
				</template>
				<template v-if="section.name!='Filters'">
					<div v-if="section.description" style="margin-bottom:15px;">{{section.description}}</div>
					<table class="sfx_options_dialog_table">
						<tr v-for="opt in section.options | filterBy !opt.hidden" v-if="!opt.hidden" class="{{opt.highlighted?'sfx_options_dialog_option_highlighted':''}}">
							<td class="sfx_options_dialog_option_title {{($index==0 || section.options[$index-1].title!=opt.title)?'':'repeat'}}">{{{opt.title | highlight searchtext}}}</td>
							<td class="sfx_options_dialog_option_description">{{{opt.description | highlight searchtext}}}
								<input class="sfx_input" v-if="opt.type=='text'" v-model="opt.newValue" style="display:block;width:{{opt.width || '50%'}};"/>
								<input class="sfx_input" v-if="opt.type=='number'" type="number" min="{{opt.min||1}}" max="{{opt.max||999}}" v-model="opt.newValue"/>
								<textarea v-if="opt.type=='textarea'" v-model="opt.newValue" style="display:block;width:95%;height:100px;"></textarea>
							</td>
							<td class="sfx_options_dialog_option_action">
								<template v-if="opt.type=='checkbox'">
									<input id="sfx_option_{{opt.key}}" class="sfx_input" type="checkbox" v-model="opt.newValue"/><label for="sfx_option_{{opt.key}}"></label>
								</template>
								<template v-if="opt.type=='link'">
									<input type="button" data-href="{{opt.url}}" onclick="window.open(this.getAttribute('data-href'));" class="sfx_button" value="GO!">
								</template>
								<template v-if="opt.type=='action'">
									<input type="button" @click="message(opt.action_message)" class="sfx_button" value="{{opt.action_text}}">
								</template>
							</td>
						</tr>
					</table>

					<!-- Custom Section Displays -->
					<template v-if="section.name=='Hide Posts'">
						<b>Easily hide posts from your feed by keyword or phrase.</b>
						<br><br>
						Just enter each keyword or phrase you want to hide on a separate line in the text box. Any post containing one of those words will be hidden, and a small message will be shown in its place. To have more control over filtering, advanced post filtering can be setup in the "Filters" tab.
						<br><br>
						<input type="checkbox" class="normal" v-model="options.hide_posts_show_hidden_message.newValue"> Show a message in place of hidden posts in the news feed
						<br>
						<input type="checkbox" class="normal" v-model="options.hide_posts_show_match.newValue"> Show the word or phrase that matched in the hidden post message
						<br>
						<input type="checkbox" class="normal" v-model="options.hide_posts_partial.newValue"> Match partial words (example: "the" will also match "them")
						<br>
						<input type="checkbox" class="normal" v-model="options.hide_posts_case_sensitive.newValue"> Match Case
						<br>
						<input type="checkbox" class="normal" v-model="options.hide_posts_caption.newValue"> Also match photo captions
						<br>
						Hide posts with these keywords or phrases (each on its own line):<br>
						<textarea v-model="options.hide_posts_text.newValue" style="width:80%;height:150px;"></textarea>

					</template>
					<template v-if="section.name=='Display Tweaks'">
						<div v-if="!editing_tweak">
						    <div class="">
						        Display Tweaks are small snippets of CSS which change the appearance of the page. They can do anything from changing colors and fonts to hiding parts of the page or completely changing the layout. Advanced users can add their own tweaks, but most users will want to select some from the list of available Tweaks.
						    </div>
						    <div class="sfx_option" style="margin:10px 0;font-size:14px;"><input id="tweaks_enabled" type="checkbox" v-model="options.tweaks_enabled.newValue" @change="show_current_tweaks()"/><label for="tweaks_enabled"></label> Tweaks enabled</div>
						    <div>
						        <input type="button" class="sfx_button" value="Create A New Tweak" @click="add_tweak">
						    </div>
						    <div v-if="tweaks.length" class="sfx_options_dialog_panel_header">Active Tweaks</div>
						    <table v-if="tweaks.length" class="sfx_options_dialog_table">
						        <thead>
						        <tr>
						            <th>Title</th>
						            <th>Description</th>
						            <th style="text-align:center;">Actions</th>
						            <th style="text-align:center;">Enabled</th>
						        </tr>
						        </thead>
						        <tbody>
						        <tr v-for="tweak in tweaks" v-bind:class="{'sfx_options_dialog_option_disabled':tweak.disabled}">
						            <td class="sfx_options_dialog_option_title">{{tweak.title}}<span v-if="tweak.id" style="font-weight:normal;font-style:italic;color:green;margin-top:5px;" v-tooltip="{content:'Click \\'x\\' to unsubscribe',delay:250}"> (Subscribed)</span></td>
						            <td class="sfx_options_dialog_option_description">
						                {{tweak.description}}
						                <div v-if="tweak.id && tweak.subscription_last_updated_on" style="font-style:italic;color:#999;margin-top:5px;">Subscription last updated: {{ago(tweak.subscription_last_updated_on)}}</div>
						            </td>
						            <td class="sfx_options_dialog_option_action" style="white-space:nowrap;">
						                <span class="sfx_square_control" title="Edit" @click="edit_tweak(tweak,$index)">&#9998;</span>
						                <span class="sfx_square_control sfx_square_delete"  title="Delete" @click="delete_tweak(tweak)">&times;</span>
						            </td>
						            <td>
						                <input id="sfx_tweak_{{$index}}" type="checkbox" @change="toggle_tweak(tweak,$index)" v-model="tweak.enabled"/><label for="sfx_tweak_{{$index}}"></label>
						            </td>
						        </tr>
						        </tbody>
						    </table>

						    <div v-if="tweak_subscriptions">
						        <div class="sfx_options_dialog_panel_header">Available Display Tweaks (Snippets)</div>
						        <div>
						            Below is a list of display tweaks maintained by the Social Fixer team which you may find useful. When you add them to your list, they will be automatically updated to continue functioning if Facebook changes its layout or code.
						        </div>
						        <table class="sfx_options_dialog_table">
						            <thead>
						            <tr>
						                <th>Title</th>
						                <th>Description</th>
						                <th>Add</th>
						            </tr>
						            </thead>
						            <tbody>
						            <tr v-for="tweak in tweak_subscriptions" v-bind:class="{'sfx_tweak_subscribed':tweak.subscribed}">
						                <td class="sfx_options_dialog_option_title">{{tweak.title}}<span v-if="tweak.subscribed" style="font-weight:900;font-style:italic;color:green;margin-top:5px;" v-tooltip="{content:'To unsubscribe, click \\'x\\' in the Active Tweaks table above',delay:250}"> (Subscribed)</span></td>
						                <td class="sfx_options_dialog_option_description">{{tweak.description}}</td>
						                <td class="sfx_options_dialog_option_action">
						                    <span class="sfx_square_add" title="Add To My Tweaks" @click="add_tweak_subscription(tweak)">+</span>
						                </td>
						            </tr>
						            </tbody>
						        </table>
						    </div>
						    <div v-else>
						        Loading Available Tweaks...
						    </div>
						</div>

						<div v-if="editing_tweak" class="sfx_options_dialog_panel">
						    <div class="sfx_panel_title_bar">Edit Tweak</div>
						    <div class="sfx_label_value">
						        <div>Title:</div>
						        <div><input class="sfx_wide" v-model="editing_tweak.title"></div>
						    </div>
						    <div class="sfx_label_value">
						        <div>Description: </div>
						        <div><input class="sfx_wide" v-model="editing_tweak.description"></div>
						    </div>
						    <span data-tooltip-delay="100" v-tooltip="Directly move this tweak to the given position number">
						        <input type="number" class="sfx_input" min="1" max="{{tweaks.length}}" v-model="editing_meta.new_number">Tweak Order
						    </span>
						    <span data-tooltip-delay="100" v-tooltip="Should this tweak be processed at all?">
						        <input type="checkbox" class="normal" v-model="editing_tweak.enabled">Enabled
						    </span>
						    <div>CSS:<br/>
						        <textarea style="width:90%;height:250px;font-size:11px;font-family:monospace;" v-model="editing_tweak.css"></textarea>
						    </div>
						</div>

					</template>
					<template v-if="section.name=='About'"><div id="sfx_options_content_about">{{{content_about}}}</div></template>
					<template v-if="section.name=='Donate'">
						<div v-if="sfx_option_show_donate" style="margin-bottom:10px;">
							<input id="sfx_option_show_donate" type="checkbox" v-model="options.sfx_option_show_donate.newValue"/><label for="sfx_option_show_donate"></label> Remind me every so often to help support Social Fixer through donations.
						</div>
						<div id="sfx_options_content_donate">{{{content_donate}}}</div>
					</template>
					<template v-if="section.name=='Support'">
						<div style="font-family:monospace;font-size:11px;border:1px solid #ccc;margin-bottom:5px;padding:7px;">{{user_agent}}<br>Social Fixer {{buildstr}}
							<br><span v-if="userscript_agent">{{userscript_agent}}</span>
							<br><span v-if="support_notes"><br>Support Notes:<br>
								<span v-for="note in support_notes">{{note.who}}: {{note.what}}<br></span>
							</span>
						</div>
						<div id="sfx_options_content_support">{{{content_support}}}</div>
					</template>
				</template>
			</div>
		</div>
	</div>
</div>
`);
				var close_options = function () {
					X('#sfx_options_dialog').remove();
				};
				X.subscribe('options/close', function () {
					close_options();
				});

				var save_options = function () {
					var undef, opt, key, options_to_save = {};
					// Iterate each option
					for (key in FX.options) {
						opt = FX.options[key];
						// Only save non-default settings that have changed
						if (opt.newValue != opt.value) {
							// If it's the default, erase it from options so it will be overriden by the default
							if (opt.newValue == opt['default']) {
								options_to_save[key] = undef;
							}
							else {
								options_to_save[key] = opt.newValue;
							}
						}
					}
					// Store the data in memory
					X.storage.data.filters = X.clone(filters);
					X.storage.data.tweaks = X.clone(tweaks);

					// persist
					X.storage.set('options', options_to_save, function () {
						X.storage.save('filters', null, function () {
							X.storage.save('tweaks', null, function () {
								Object.keys(options_to_save).forEach(
									key => FX.fire_option_update(key, FX.option(key))
								);
								close_options();
								var position = X('#sfx_badge_menu').hasClass('right') ? 'right' : 'left';
								var note = sticky_note('#sfx_badge', position, ' Saved!  <b style="color:red;">Reload all Facebook tabs</b> for changes to take effect! ', {close: false});
								setTimeout(function () {
									//sticky_note_remove(note, '#sfx_badge');
									note.remove();
								}, 6 * X.seconds);
							});
						});
					});
				};

				var import_data = function (json) {
					var key, user_data;
					var keys = [];
					this.user_options_message = null;
					try {
						user_data = JSON.parse(json);
						for (key in user_data) {
							var d = X.clone(user_data[key]);
							X.storage.data[key] = d;
							X.storage.save(key, null, function () {
							});
							keys.push(key);
						}
						var $note = X(`<div>Successfully imported keys: ${keys.join(", ")}.<br><br><span class="sfx_button">REFRESH THE PAGE</span> immediately to activate the changes!`);
						$note.find('.sfx_button').click(function() {
							window.location.reload();
						});
						data.show_action_buttons = false;
						X('#sfx_options_dialog_body').css("padding","50px").html('').append($note);
					} catch (e) {
						this.user_options_message = "Error importing data: " + e.toString();
					}
				};

				var key;
				if (event_data && event_data.data) {
					for (key in event_data.data) {
						data[key] = event_data.data[key];
					}
				}
				var methods = {
					"save": save_options
					, "cancel": function () {
						if (this.editing_filter) {
							if (this.editing_meta.new) {
								this.filters.length--;
							}
							this.action_button = null;
							this.editing_filter = null;
							this.editing_meta = {};
						}
						else if (this.editing_tweak) {
							if (this.editing_meta.new) {
								this.tweaks.length--;
							}
							this.action_button = null;
							this.editing_tweak = null;
							this.editing_meta = {};
						}
						else {
							close_options();
						}
					}
					, "collapse": function () {
						X('#sfx_options_dialog_body').toggle();
					}
					, "message": function (msg) {
						if (msg) {
							var messages = msg.split(/\s*,\s*/);
							if (messages && messages.length > 0) {
								messages.forEach(function (m) {
									X.publish(m, {});
								});
							}
						}
					}
					, "search": function() {
						var search_section = this.sections[0];
						search_section.options.splice(0,search_section.options.length);
						if (this.searchtext && this.searchtext.length>2) {
							var regex = new RegExp(this.searchtext,"i");
							for (var k in FX.options) {
								var opt = FX.options[k];
								if (regex.test(opt.title) || regex.test(opt.description)) {
									search_section.options.push(opt);
								}
							}
						}
					}
					, "select_section": function (section) {
						this.editing_filter = null;
						this.action_button = null;
						sections.forEach(function (s) {
							s.selected = false;
						});
						section.selected = true;
						X.publish("menu/options/section", section.name);
					}
					, "ago": function (when) {
						return X.ago(when);
					}
					, "version_check": function (filter) {
						return ((!filter.min_version || X.semver_compare(sfx_version, filter.min_version) >= 0) && (!filter.max_version || X.semver_compare(sfx_version, filter.max_version) <= 0));
					}
					, "clear_test_regex": function (ev) {
						var input = X(ev.target);
						input.attr('data-hover', null).css('background-color', '');
					}
					, "test_regex": function (ev) {
						var input = X(ev.target);
						try {
							new RegExp(input.val());
							input.css('background-color', '');
						}
						catch (e) {
							input.css('background-color', '#e00');
							input.attr('data-hover', 'tooltip');
							input.attr('data-tooltip-content', "Invalid Regular Expression syntax: " + e.message);
							input.attr('data-tooltip-delay', '1');
						}
					}
					, "save_to_file": function () {
						// Firefox requires link to be inserted in <body> before clicking
						// https://stackoverflow.com/a/27116581
						var $link = X('<a style="position:absolute;top:0;left:-10px;visibility:hidden;" aria-hidden="true" tabindex="-1"></a>');
						$link.attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(X.storage.data, null, '  ')));
						$link.attr('download', `Social_Fixer_Settings_${X.today()}.txt`);
						X(document.body).append($link);
						X.ui.click($link, false);
						$link.remove();
					}
					, "load_from_file": function () {
						var $input = X('<input type="file" accept="text/*">');
						$input.change(function (ev) {
							if (ev.target.files && ev.target.files[0]) {
								var reader = new FileReader();

								reader.onload = function (e) {
									import_data.call(this, e.target.result);
								}.bind(this);

								reader.onerror = function (e) {
									this.user_options_message = 'Error importing data: ' + e.toString();
								}.bind(this);

								reader.readAsText(ev.target.files[0]);
							}
						}.bind(this));
						X.ui.click($input, false);
					}
					, "populate_user_options": function () {
						this.user_options = X.clone(X.storage.data);
						this.user_options_message = null;
					}
					, "import_data_from_textbox": function () {
						import_data.call(this, X('#sfx_user_data').val());
					}
					, "reset_data": function () {
						if (confirm('Are you sure?\n\nResetting your data will ERASE all user preferences, "read" story data, installed filters, etc.')) {
							X.storage.save('options', {});
							X.storage.save('filters', []);
							X.storage.save('tweaks', []);
							X.storage.save('hiddens', {});
							X.storage.save('postdata', {});
							X.storage.save('friends', {});
							X.storage.save('stats', {});
							alert("All data has been reset. Please refresh the page.");
						}
					}
					// FILTERS
					, "edit_filter": function (filter, index) {
						this.editing_filter = X.clone(filter);
						this.editing_meta.number = index + 1;
						this.editing_meta.new_number = index + 1;
						this.action_button = 'done_editing_filter';
					}
					, "delete_filter": function (filter) {
						if (confirm('Are you sure you want to remove this filter?')) {
							this.filters.$remove(filter);
							mark_subscribed_items(data.filter_subscriptions, filters);
						}
					}
					, "up": function (filter,$event) {
						if ($event.ctrlKey) {
							this.filters.$remove(filter);
							this.filters.unshift(filter);
						}
						else {
							for (var i = 0; i < this.filters.length; i++) {
								if (this.filters[i] == filter && i > 0) {
									this.filters.$set(i, this.filters[i - 1]);
									this.filters.$set(i - 1, filter);
									return;
								}
							}
						}
					}
					, "down": function (filter) {
						for (var i = 0; i < this.filters.length; i++) {
							if (this.filters[i] == filter && i < this.filters.length - 1) {
								this.filters.$set(i, this.filters[i + 1]);
								this.filters.$set(i + 1, filter);
								return;
							}
						}
					}
					, "close_filter": function () {
						this.editing_filter.updated_on = X.time();
						// If it's a subscription and actions are configurable and they have changed, flag as such
						var orig = this.filters[this.editing_meta.number - 1];
						if (orig.id && orig.configurable_actions) {
							var original_actions = JSON.stringify(orig.actions);
							var new_actions = JSON.stringify(this.editing_filter.actions);
							if (original_actions != new_actions) {
								// Updated actions!
								this.editing_filter.custom_actions = true;
							}
						}
						var src = this.editing_meta.number - 1;
						var tgt = this.editing_meta.new_number - 1;
						// Shuffle things around if position was changed
						// splice() would break Vue
						if (src != tgt) {
							var idx, jdx, inc = (tgt - src) / Math.abs(tgt - src);
							for (idx = src; idx != tgt; idx = jdx) {
								jdx = idx + inc;
								this.filters.$set(idx, this.filters[jdx]);
							}
						}
						this.filters.$set(tgt, this.editing_filter);
						this.editing_filter = null;
						this.action_button = null;
						this.editing_meta = {};
						mark_subscribed_items(data.filter_subscriptions, filters);
					}
					, "add_filter": function () {
						var new_filter = {"match": "ALL", "enabled": true, "stop_on_match": true, "rules": [{"target": "any", "operator": "contains"}], "actions": [{"action": "hide"}]};
						new_filter.added_on = X.time();
						this.filters.push(new_filter);
						this.editing_meta.new = true;
						this.edit_filter(this.filters[this.filters.length - 1], this.filters.length - 1);
					}
					, "add_subscription": function (filter) {
						var f = X.clone(filter);
						f.enabled = true;
						if (!f.actions || !f.actions.length) {
							f.actions = [{"action": ""}];
							f.configurable_actions = true;
						}
						this.filters.push(f);
						mark_subscribed_items(data.filter_subscriptions, filters);
						//if (f.configurable_actions) {
						//	// Immediately invoke editor if it has configurable actions?
						//	this.edit_filter(this.filters[this.filters.length - 1], this.filters.length - 1);
						//}
					}
					, "add_condition": function () {
						this.editing_filter.rules.push({"target": "any", "operator": "contains"});
					}
					, "delete_rule": function (rule) {
						this.editing_filter.rules.$remove(rule);
					}
					, "add_action": function () {
						this.editing_filter.actions.push({});
					}
					, "delete_action": function (action) {
						this.editing_filter.actions.$remove(action);
					}
					, "regex_test": function (condition) {
						var text = condition.text;
						var modifier = condition.modifier;
						X.publish("test/regex", {"text": text, "modifier": modifier});
					}
					// TWEAKS
					, "edit_tweak": function (tweak, index) {
						this.editing_tweak = X.clone(tweak);
						this.editing_meta.number = index + 1;
						this.editing_meta.new_number = index + 1;
						this.action_button = 'done_editing_tweak';
					}
					, "tweak_css_on_off": function (index, enabled) {
						enabled = enabled && this.options.tweaks_enabled.newValue;
						X.css(enabled ? this.tweaks[index].css : null, 'sfx_tweak_style_' + index);
					}
					, "delete_tweak": function (tweak) {
						if (confirm('Are you sure you want to remove this tweak?')) {
							this.tweaks.$remove(tweak);
							this.show_current_tweaks();
							mark_subscribed_items(data.tweak_subscriptions, tweaks);
						}
					}
					, "close_tweak": function () {
						this.editing_tweak.updated_on = X.time();
						var src = this.editing_meta.number - 1;
						var tgt = this.editing_meta.new_number - 1;
						// Shuffle things around if position was changed
						// splice() would break Vue
						if (src != tgt) {
							var idx, jdx, inc = (tgt - src) / Math.abs(tgt - src);
							for (idx = src; idx != tgt; idx = jdx) {
								jdx = idx + inc;
								this.tweaks.$set(idx, this.tweaks[jdx]);
								this.tweak_css_on_off(idx, this.tweaks[idx].enabled);
							}
						}
						this.tweaks.$set(tgt, this.editing_tweak);
						this.tweak_css_on_off(tgt, this.editing_tweak.enabled);
						this.editing_tweak = null;
						this.action_button = null;
						this.editing_meta = {};
						mark_subscribed_items(data.tweak_subscriptions, tweaks);
					}
					, "add_tweak": function () {
						var new_tweak = {"title": "", "description": "", "enabled": true};
						new_tweak.added_on = X.time();
						var index = this.tweaks.push(new_tweak) - 1;
						this.editing_meta.new = true;
						this.edit_tweak(this.tweaks[index], index);
					}
					, "add_tweak_subscription": function (tweak) {
						var o = X.clone(tweak);
						o.enabled = true;
						var index = this.tweaks.push(o) - 1;
						mark_subscribed_items(data.tweak_subscriptions, tweaks);
						this.tweak_css_on_off(index, true);
					}
					, "toggle_tweak": function (tweak, index) {
						this.tweak_css_on_off(index, tweak.enabled);
					}
					, "show_current_tweaks": function () {
						for (var index = 0; index < this.tweaks.length; index++) {
							this.tweak_css_on_off(index, this.tweaks[index].enabled);
						}
						this.tweak_css_on_off(this.tweaks.length, false);
					}
				};
				template(document.body, dialog, data, methods).ready(function () {
					X.draggable('#sfx_options_dialog');

					// If a default section was passed in, publish that event
					if (event_data.section) {
						X.publish("menu/options/section", event_data.section);
					}
				});
			} catch (e) {
				alert(e);
			}
		}, true);

		X.subscribe("menu/options/section", function (msg, msgdata) {
			// If the section has dynamic data, load it
			sections.forEach(function (s) {
				if (s.name == msgdata && s.property && s.url) {
					X.ajax(s.url, function (content) {
						data[s.property] = X.sanitize(content);
					});
				}
			});
			if (msgdata == "Filters") {
				// Retrieve filters
				retrieve_item_subscriptions('filters', data.filters, function (subscriptions) {
					data.filter_subscriptions = subscriptions;
				});
			}
			if (msgdata == "Display Tweaks") {
				// Retrieve tweaks
				retrieve_item_subscriptions('tweaks', data.tweaks, function (subscriptions) {
					data.tweak_subscriptions = subscriptions;
				});
			}
		});

		// If opening from an "options" url, open options immediately
		FX.on_content_loaded(function () {
			if (/sfx_options=true/.test(location.href)) {
				X.publish("menu/options");
			}
		});
	});
});

// 'Permalinks' (Notifications & comment/reply timestamps) point to a
// specific comment/reply; but FB's own code only manages to scroll a
// post to the targeted item a small fraction of the time.  Fix that.

X.ready('permalink_target', function() {
  FX.add_option('permalink_target', {
    section:     'Advanced',
    title:       'Scroll To Comment',
    description: 'When opening a comment or reply link, scroll that comment / reply into view',
    order:1,
    default:     true,
  });
  FX.add_option('permalink_target_css', {
    section:     'Advanced',
    title:       'Scroll To Comment',
    description: 'CSS style to apply to that comment / reply ("this:that;other:etc"; blank for none)',
    type:        'text',
    order:2,
    default:     'background-color:#cde; border:2px dashed black;',
  });
  FX.on_option_live('permalink_target_css', function(css) {
    X.css(`.sfx_permalink_target { ${css} }`, 'sfx_permalink_target_css');
  });

  var permalink_id = '';
  var permalink_selector = '';
  // Are we looking for a new (different) permalink?
  const new_permalink = function() {
    var url_params = location.search.replace(/^\?/, '').split('&');
    // First two are for www.facebook.com
    // 'ctoken=' sometimes appears in m and/or mbasic.facebook.com comment links
    // These are also right for 'new FB' permalinks
    var notif_target = url_params.find(param => /^reply_comment_id=/.test(param)) ||
      url_params.find(param => /^comment_id=/.test(param)) ||
      url_params.find(param => /^ctoken=/.test(param));
    if (!notif_target) {
      permalink_id = '';
      return false;
    }
    var notif_target_id = notif_target.replace(/.*[=_]/, '');
    if (permalink_id == notif_target_id) {
      return false;
    } else {
      permalink_id = notif_target_id;
      // `[id="${permalink_id}"]` finds the comment on old layout;
      // `[role=article] a[href*="${notif_target}"]` on new layout, or potentially anywhere.
      permalink_selector = `[id="${permalink_id}"],[role=article] a[href*="${notif_target}"]`;
      return true;
    }
  };

  // Unmark marked permalink when option becomes disabled, or clicking a new link
  const unmark = function() {
    X('.sfx_permalink_target').removeClass('sfx_permalink_target');
  };

  // The target has appeared, scroll to it!
  const target_appears = function($target) {
    // On clicking a comment timestamp, target already exists in
    // the current page: pause to allow new page load to start.
    setTimeout(function() {
      // Re-acquire $target for that reason; and because FB
      // often replace the HTML with a new copy at this point.
      $target = X(permalink_selector).first();
      if (!$target.length) {
        return;
      }
      var $container = X(`[id="${permalink_id}"]`);
      if (!$container.length) {
        $container = $target.closest('[role=article]');
      }
      if (!$container.length) {
        $container = $target;
      }
      $container[0].scrollIntoView();
      var offs = $container.offset();
      var top_tgt = offs.top - (window.innerHeight / 2);
      window.scrollTo(0, top_tgt < 0 ? 0 : top_tgt);
      unmark();
      $container.addClass('sfx_permalink_target');
    }, 1 * X.seconds);
  };

  const visibility_changed = function() {
    if (FX.option('permalink_target') &&
      document.visibilityState == 'visible' &&
      new_permalink()) {
      X.when(permalink_selector, target_appears, 500, 100);
    }
  };
  document.addEventListener('visibilitychange', visibility_changed);
  FX.on_option_live('permalink_target', function(enabled) {
    if (enabled) {
      permalink_id = '';
      visibility_changed();
    } else {
      unmark();
    }
  });

  // This fires on each click to new venue, making this work even
  // when FB's code controls the page replacement mechanism.
  const page_loaded = function() {
    permalink_id = '';
    visibility_changed();
  };
  FX.on_page_load(page_loaded);
});

X.ready( 'photo_tags', function() {
	FX.add_option('photo_tags', {
		"section": "General"
		, "title": "Show Photo Tags"
		, "description": "Display the descriptive tags (captions) that Facebook automatically puts on photos when you hover over them."
		, "default": false
	});
	FX.on_option('photo_tags', function() {
		FX.on_selector('img[alt^="May be"]', function($img) {
			$img.closest('a').attr('sfx_photo_tags',$img.attr('alt')).addClass('sfx_photo_tags');
		});
	});
});

// =====================================================
// Apply Filters to posts when they are added or updated
// =====================================================
// Filters depend on options, so wait until they load
X.ready('post_filters', function() {
    FX.add_option('filters_enabled', {"section": "Filters", "hidden": true, "default": true});
    FX.add_option('filters_enabled_pages', {"section": "Filters", "hidden": true, "default": false});
    FX.add_option('filters_enabled_groups', {"section": "Filters", "hidden": true, "default": false});
    FX.add_option('filters_forced_processing_delay', {"type":"number", "section":"Advanced", "title":"Post Filter Force Delay", "description":"The time in ms after which post filtering will be forced even if all the content is not yet available", "default": 1 * X.seconds});

    FX.add_option('hide_posts_text', {"hidden":true, "type":"textarea", "section":"Hide Posts", "title":"Hide Posts Keywords", "default":""});
    FX.add_option('hide_posts_show_hidden_message', {"hidden":true, "section":"Hide Posts", "title":"Show hidden post message", "default":true});
    FX.add_option('hide_posts_show_match', {"hidden":true, "section":"Hide Posts", "title":"Show Matching Text", "default":true});
    FX.add_option('hide_posts_partial', {"hidden":true, "section":"Hide Posts", "title":"Match Partial Words", "default":true});
    FX.add_option('hide_posts_case_sensitive', {"hidden":true, "section":"Hide Posts", "title":"Case Sensitive", "default":false});
    FX.add_option('hide_posts_caption', {hidden:true, section:'Hide Posts', title:'Caption', default:true});

    var sfx_post_data = {};
    var sfx_filter_trace = {};
    var filter_trace = function (id, msg) {
        if (!sfx_filter_trace[id]) {
            sfx_filter_trace[id] = [];
        }
        if (!sfx_filter_trace[id][0]) {
            sfx_filter_trace[id] = [performance.now()];
        }
        sfx_filter_trace[id].push(((performance.now() - sfx_filter_trace[id][0]) / X.seconds).toFixed(6) + ' ' + msg);
    };
    X.subscribe("log/filter", function (msg, data) {
        filter_trace(data.id, data.message);
    });

    var group_link_selector = "h4 a[href*='/groups/']";

    X.subscribe("context/ready", function() {
      FX.on_options_load(function () {
        var FORCED_PROCESSING_DELAY = +FX.option('filters_forced_processing_delay');

        var show_filtering_disabled_message_displayed = false;
        var show_filtering_disabled_message = function () {
            if (show_filtering_disabled_message_displayed) {
                return;
            }
            show_filtering_disabled_message_displayed = true;
            var msg = "By default, post filtering only affects the main Newsfeed.<br>You can change this in Options if you wish.";
            context_message("filter_disabled_message", msg, {"title": "Post Filtering Disabled"});
        };
        FX.on_page_unload(function () {
            show_filtering_disabled_message_displayed = false;
        });

        var filters = X.clone(FX.storage('filters'));

        // If there are any "Hide Posts" keywords defined, create a filter to hide them
        var hide_posts_text = (FX.option('hide_posts_text') || '').trim();
        if (hide_posts_text) {
            var keywords = hide_posts_text.replace(/([^\w\s\n])/g,"\\$1").split(/\s*\n\s*/);
            var keywords_regex = "(" + keywords.join('|') + ")";
            if (!FX.option('hide_posts_partial')) {
                keywords_regex = "(?:^|\\b)" + keywords_regex + "(?:\\b|$)";
            }
            var modifier = FX.option('hide_posts_case_sensitive') ? null : "i";
            var show_note = FX.option('hide_posts_show_hidden_message');
            var filter = {
                "match": "ALL",
                "enabled": true,
                "stop_on_match": true,
                "rules": [
                    {
                        target: FX.option('hide_posts_caption') ? 'any+image' : 'any',
                        "operator": "matches",
                        "condition": {
                            "text": keywords_regex,
                            "modifier": modifier
                        }
                    }
                ],
                "actions": [
                    {
                        "action": "hide",
                        "show_note": show_note,
                        "custom_note": "Post Hidden by keyword" + (FX.option('hide_posts_show_match')?": $1":"")
                    }
                ],
                "title": "Hide Posts"
            };
            filters.unshift(filter);
        }

        var decide_filter_post = function (post, dom_id) {
            // If the post has already been properly filtered, don't do anything
            if (post.attr('sfx_filtered')) {
                return 'already';
            }

            if (!FX.option('filters_enabled')) {
                filter_trace(dom_id, 'Not filtering post because filtering is disabled');
                return false;
            }

            if (!filters || !filters.length) {
                filter_trace(dom_id, 'Not filtering post because there are no filters');
                return false;
            }

            if (!post || !post[0]) {
                filter_trace(dom_id, 'Not filtering post because it apparently doesnt exist');
                return false;
            }

            // If there are no child nodes or content, then this is a shell - don't do anything yet
            if (!post[0].childNodes || post[0].childNodes.length==0 || !post.innerText()) {
                return 'notyet';
            }

            // Special handling for SFx support groups
            // 1. Posts in regular News Feed -- hide Reply links
            if (FX.context.type != 'groups') {
                var group_hovercard = post.find(group_link_selector).last();
                var group_href = group_hovercard.attr('href') || '';
                var group_linkname = group_href.replace(/.*\/groups\/([^/]*).*/,'$1');
                if (!FX.option('support_posts_allow_reply') && FX.sfx_support_groups.includes(group_linkname))
                    post.addClass('sfx_support_post');
            }
            // 2. Posts within a support group -- hide Reply links & disable filtering
            if (FX.context.type == 'groups' &&
                FX.sfx_support_groups.includes(FX.context.id)) {
                    // Disable the 'Reply' button
                    if (!FX.option('support_posts_allow_reply')) {
                        post.addClass('sfx_support_post');
                    }
                    // Disable filtering
                    if (FX.option('filters_enabled_groups') &&
                        !FX.option('support_groups_allow_filters')) {
                        filter_trace(dom_id, "Not filtering post because filtering is automatically disabled in SFx support Groups");
                        var cmsg = "Social Fixer automatically disables filtering in its support groups,<br>to avoid confusion from posts not showing.<br>Your filters will not be applied here.";
                        context_message("filter_disabled_in_support_message", cmsg, {"title": "Post Filtering Disabled"});
                        return false;
                    }
            }

            // Don't filter on permalink (single story) pages, which are reached
            // from Notifications and must show what is being notified about
            if (FX.context.permalink) {
                filter_trace(dom_id, "Not filtering post because this is a permalink");
                return false;
            }

            // Don't filter on timelines (including Pages) if that's disabled
            if (FX.context.type == "profile" && !FX.option('filters_enabled_pages')) {
                filter_trace(dom_id, "Not filtering post because filtering is disabled on Pages/Timelines");
                show_filtering_disabled_message();
                return false;
            }

            // Don't filter in Groups if that's disabled
            if (FX.context.type == "groups" && !FX.option('filters_enabled_groups')) {
                filter_trace(dom_id, "Not filtering post because filtering is disabled in Groups");
                show_filtering_disabled_message();
                return false;
            }

            return true;
        };

        var dont_filter_post = function (post, dom_id) {
            var decision = decide_filter_post(post, dom_id);
            if (decision == true) {
                return false;
            }
            if (decision == false) {
                // Some static don't-filter condition: mark already filtered
                post.attr('sfx_filtered','true');
            }
            // decision == false, 'already', or 'notyet': don't filter right now
            return true;
        };

        var filter_post = function (msg, data) {
            var post = X(data.selector);
            var dom_id = data.id;
            var sfx_id = data.sfx_id;

            var post_data = sfx_post_data[dom_id];
            if (msg == "post/add") {
                sfx_post_data[dom_id] = {"sfx_id": sfx_id, "dom_id": dom_id, "id": dom_id};
                post_data = sfx_post_data[dom_id];
                sfx_filter_trace[dom_id] = [];
            }
            else {
                // In case of update, sfx_id might have been set
                if (sfx_id && !post_data.sfx_id) {
                    post_data.sfx_id = sfx_id;
                }
            }

            if (dont_filter_post(post, dom_id)) {
                return false;
            }

            // Wait for preprocessor if we've beaten it
            // if (!post.attr('sfx_ppa')) {
            //     setTimeout(function() {
            //         X.publish('post/preprocess', post);
            //         if (!post.attr('sfx_ppa')) {
            //             post.attr('sfx_ppa', 3);
            //         }
            //         filter_post(msg, data);
            //     }, 1 * X.seconds);
            //     return;
            // }

            // FILTER THE POST!
            // ================
            var result = apply_filters(post, post_data, filters, false);
            if (typeof result=="undefined") {
                // Couldn't apply filters, try again on post/update, since the attr will not have been set
                // Force it after a certain amount of time, if it's already been filtered the attr will have been set, so no worries
                setTimeout(function() {
                    if (post.attr('sfx_filtered')) { return; }
                    post.attr('sfx_filtered','true');
                    post.attr('sfx_filtered_forced','true');
                    apply_filters(post, post_data, filters, true);
                },FORCED_PROCESSING_DELAY);
            }
            else {
                // Filters were successfully applied, even if they didn't filter anything
                post.attr('sfx_filtered','true');
            }
        };

        // Filter all posts so [sfx_filtered] attribute is universal;
        // and to allow on-the-fly enabling
        X.subscribe(["post/add", "post/update"], filter_post, true);

      });
    });

    // Extract parts of the post that can be filtered on
    // NOTE: If a part can't be found (so its match is undefined), set the value as null.
    // If it is found but has no value, then set the value as empty string
    var extract = {
        "author": function (o, data) {
            var a;
            a = o.find('h4 a');
            if (a.length) {
                data.author = a[0].textContent;
                // Store a reference to the author link itself
                data.authorContent = [a];
            }
            return data.author;
        },
        "group": function (o, data) {
            data.group = null;
            var $el = o.find(group_link_selector);
            // Take the last-mentioned group whose link text is not 'group',
            // as FB sometimes form a sentence like 'Joe Blow shared a _group_',
            // or 'Joe Blow shared a _group_ to _Named Group_' (both are links).
            // XXX still not right for non-English UI language; do best we can.
            $el.forEach(function(a) {
                if (a.textContent != 'group') {
                  // The anchor looks good, but check to make sure there is a structure for the > character
                  if (X(a).closest('span').prev().children('i').size()>0) {
                      data.group = a.textContent;
                  }
                }
            });
            return data.group;
        },
        "page": function (o, data) {
            data.page = null;
            // 2021-3-15: Treat the same as author for now since we can't distinguish Pages anymore
            var $el = o.find("h4 a");
            if ($el.length) {
                data.page = $el[0].textContent;
            }
            return data.page;
        },
        "link_url": function (o, data) {
            var links = o.find('a[href*="l\.facebook\.com/l\.php');
            if (links.length) {
                var redirect_url = X(links[0]).attr('href');
                var dissect_url = redirect_url.match(/https:\/\/l\.facebook\.com\/l\.php\?u=([^&]*)/);
                if (dissect_url && dissect_url.length > 1) {
                    data.link_url = decodeURIComponent(dissect_url[1]);
                } else {
                    data.link_url = redirect_url;
                }
            }
            return data.link_url;
        },
        "link_text": function (o, data) {
            var links = o.find('a[href*="l.\.facebook\.com/l\.php');
            if (links.length) {
                data.link_text = X(links[0]).text();
            }
            return data.link_text;
        },
        // "type": function (o, data) {
        //     // todo?
        // },
        "all_content": function (o, data) {
            var nodeFilter_obj = {
                acceptNode: function(node) {
                    return   (!node.tagName ||
                              node.tagName == '#text' ||
                              node.tagName == 'TEXT') ? NodeFilter.FILTER_ACCEPT
                           : (node.tagName == 'FORM') ? NodeFilter.FILTER_REJECT
                           :                            NodeFilter.FILTER_SKIP;
                }
            };
            data.all_content = o.innerText(nodeFilter_obj) || '';
            return data.all_content;
        },
        "content": function (o, data) {
            var els, str = "";
            // Store a reference to all userContent areas, in case we need to manipulate them (replace text, etc)
            data.userContent = [];
            els = o.find('*[style="text-align: start;"]');
            els.forEach(function (el) {
                el = X(el);
                str += el.innerText() + ' ';
                data.userContent.push(el);
            });
            if (str) {
                data.content = str;
            }
            return data.content;
        },
        "action": function (o, data) {
            // Store a reference to all actionContent areas, in case we need to manipulate them (replace text, etc)
            data.actionContent = [];
            var str = o.find("h4").shallowText();
            if (str) {
                data.action = str;
            }
            return data.action;
        },
        "app": function (o, data) {
            //data.app = null;
            var app = o.find('a[data-appname]').attr('data-appname');
            if (app) {
                data.app = app;
            }
            return data.app;
        },
        "image": function (o, data) {
            //data.image = null;
            var image = "";
            o.find('img[alt]').forEach(function(img) {
                if (!X(img).is('.commentable_item img')) {
                    image += X(img).attr('alt') + ' ';
                }
            });
            if (image.length) {
                data.image = image;
            }
            return data.image;
        },
    };

    // Util method to replace text content in text nodes
    function replaceText(rootNode, find, replace) {
        var children = rootNode.childNodes;
        for (var i = 0; i < children.length; i++) {
            var aChild = children[i];
            if (aChild.nodeType == 3) {
                var storedText = '';
                // If the parent node has an attribute storing the text value, check it to see if it's changed.
                // This is a method to prevent text replace actions from triggering another mutation event and repeatedly changing the same text.
                // This really only happens if the replace text is a superset of the find text.
                if (aChild.parentNode) {
                    storedText = aChild.parentNode.getAttribute('sfx_node_text') || '';
                }
                var nodeValue = aChild.nodeValue;
                if (nodeValue != storedText) {
                    var newVal = nodeValue.replace(find, replace);
                    if (newVal != nodeValue) {
                        aChild.nodeValue = newVal;
                        aChild.parentNode.setAttribute('sfx_node_text', newVal);
                    }
                }
            }
            else {
                replaceText(aChild, find, replace);
            }
        }
    }

    // Run filters to take actions on a post
    function apply_filters(post, data, filters, force_processing) {
        if (!filters || filters.length == 0) {
            return false;
        }
        var k;
        var updated_post_data = {}; // With each filtering run, re-extract pieces and update the record
        var match = false;
        filter_trace(data.id, `BEGIN Filtering`);
        if (force_processing) {
            filter_trace(data.id, `Force filtering enabled`);
        }
        if (data.next_filter == undefined) {
            data.next_filter = 0;
        }
        for (; data.next_filter < filters.length; data.next_filter++) {
            var filter = filters[data.next_filter];
            if (filter.enabled === false) {
                filter_trace(data.id, `Filter #${data.next_filter + 1} (${filter.title}) Disabled`);
                continue;
            }
            filter_trace(data.id, `Filter #${data.next_filter + 1} (${filter.title})`);
            var result = apply_filter(post, data, updated_post_data, filter, force_processing);
            if (typeof result=="undefined") { // Some rules could not be executed
                filter_trace(data.id, `END Filtering because a condition could not be tested yet.`);
                match = undefined;
                break;
            }
            if (result) {
                match = true;
                if (filter.stop_on_match) {
                    filter_trace(data.id, `Filter processing stopped because "Stop on Match" is active`);
                    break;
                }
            }
        }
        if (match != undefined) {
            filter_trace(data.id, `END Filtering. Filtered=${match}`);
        }
        // Update the post's data with the new rxtracted data
        for (k in updated_post_data) {
            if (match != undefined || updated_post_data[k] != null) {
                data[k] = updated_post_data[k];
            }
        }
        return match;
    }

    // Extract one type of data from a post, to filter against
    function extract_post_data(post,extracted_data,type) {
        // If it's already been extracted in this run of filtering, return it
        if (typeof extracted_data[type]!="undefined") {
            return extracted_data[type];
        }
        if (typeof extract[type] != 'function') {
            return (extracted_data[type] = `\${${type}}`);
        }
        return extract[type](post, extracted_data);
    }

    // Execute a single filter on a post
    function apply_filter(post, data, updated_data, filter, force_processing) {
        if (!filter || !filter.rules || !filter.rules.length > 0 || !filter.actions) {
            return false;
        }
        var all_match = true;
        var any_match = false;
        var abort = false;
        // XXX Should be applied at input time so user sees the change
        // XXX May break legit pipe matchers: /foo\||bar/ or /bar|foo\|/
        // XXX Any other fun-yet-fixable mistakes users like to make?
        function fix_regexp_mistakes(regexp) {
            return regexp
                         .replace(/^\s*\|/,'')   // Leading pipe
                         .replace(/\|\|+/g,'|')  // Double (or more) pipes
                         .replace(/\|\s*$/,'')   // Trailing pipe
            ;
        }
        filter.rules.forEach(function (rule) {
            if (abort) { return; }
            var condition_text, regex, results;
            try {
                if (any_match && "ANY" === filter.match) {
                    return; // Already matched a condition
                }
                if (!all_match && "ALL" === filter.match) {
                    return; // Already failed on one rule, don't continue
                }
                var match = false;
                var operator = rule.operator;

                // Handle "NOT" operators
                var not = false;
                var NOT = '';
                if (/^not_/.test(operator)) {
                    not = true;
                    NOT = 'NOT ';
                    operator = operator.replace(/^not_/,'');
                }

                // The "selector" rule isn't text-based, special case to handle first
                if ("contains_selector" == operator) {
                    filter_trace(data.id, ` -> Looking for ${NOT}selector: ${rule.condition.text}`);
                    var contains = null;
                    var condition = rule.condition.text.replace(/:contains\((.+?)\)\s*$/, function(_,m) {
                        contains = m || "";
                        contains = contains.replace(/^["']/,"").replace(/["']$/,"");
                        return "";
                    });
                    var vcontains = null;
                    condition = condition.replace(/:has-visible-text\((.+?)\)\s*$/, function(_,m) {
                        vcontains = m || '';
                        vcontains = vcontains.replace(/^["']/,'').replace(/["']$/,'');
                        return '';
                    });
                    var hid_within = null;
                    condition = condition.replace(/:hidden-within\((.+)\)\s*$/, function(whole_match, p1) {
                        hid_within = p1 || '';
                        hid_within = hid_within.replace(/^["']/,'').replace(/["']$/,'') + ' *';
                        return '';
                    });
                    var found = false;
                    var selector_matches = [];
                    try {
                        selector_matches = post.find(condition).filter(
                            // Ignore matches in the comment area
                            function() {
                                return X(this).parents('.commentable_item').length == 0;
                            }
                        );
                    } catch(e) {
                        filter_trace(data.id, ' ---> Selector lookup failed:');
                        filter_trace(data.id, ' ---> ' + e);
                    }

                    if (contains) {
                        var contains_regex = new RegExp(contains);
                        selector_matches.each(function() {
                            if (contains_regex.test(X(this).innerText())) {
                                found = true;
                                return false;
                            }
                        });
                    }

                    if (vcontains) {
                        var vcontains_regex = new RegExp(vcontains);
                        selector_matches.each(function() {
                            if (vcontains_regex.test(X.getNodeVisibleText(this))) {
                                found = true;
                                return false;
                            }
                        });
                    }

                    if (!contains && !vcontains) {
                        if (selector_matches.length > 0) {
                            found = true;
                        }
                    }

                    if (found && hid_within) {
                        var hidden_within = false;
                        selector_matches.each(function() {
                            X(this).parents(hid_within).forEach(
                                function(ancestor) {
                                    // Should this check for anything else -- font size 0, etc.?
                                    if (X(ancestor).css('display') == 'none') {
                                        hidden_within = true;
                                    }
                                }
                            );
                        });
                        if (!hidden_within) {
                            found = false;
                        }
                    }

                    if ( (found && !not) || (!found && not) ) {
                        match = true;
                    }
                    filter_trace(data.id, ` -> ${match ? 'match!' : 'no match'}`);
                }
                else if ("day"==rule.target) {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    var dayList = dayNames.filter((name, dow) => rule.condition['day_' + dow]).join(', ');
                    filter_trace(data.id, ` -> Looking for day(s) of week: ${dayList}`);
                    var dow = (new Date()).getDay();
                    if (rule.condition["day_"+dow]) {
                        match = true;
                    }
                    filter_trace(data.id, `Day of week is ${dayNames[dow]} - ${match ? 'match!' : 'no match'}`);
                }
                else if ("age"==rule.target) {
                    //var post_time = extract_post_data(post, updated_data, 'post_time');
                    filter_trace(data.id, ` -> Looking for post age ${rule.operator} ${rule.condition.value} ${rule.condition.units == 'h' ? 'hours' : 'days'}`);
                    var post_time = (post.find('abbr[data-utime]').first().attr('data-utime') || 0) * X.seconds;
                    if (post_time) {
                        var check = rule.condition.value;
                        if (rule.condition.units=='h') { check *= X.hours; }
                        if (rule.condition.units=='d') { check *= X.days; }
                        var age = X.now() - post_time;
                        if (rule.operator=="gt" && (age>check)) {
                            match = true;
                        }
                        else if (rule.operator=="lt" && (age<check)) {
                            match = true;
                        }
                        filter_trace(data.id, `Post age is ${age}ms and must be ${rule.operator} ${check}ms - ${match ? 'match!' : 'no match'}`);
                    } else {
                        filter_trace(data.id, `Can't detect post time stamp - no match`);
                    }
                }
                // The rest are content selector rules
                else {
                    // If the regex has a leading or trailing | it will match everything - prevent that
                    condition_text = fix_regexp_mistakes(rule.condition.text);
                    var target = "";
                    if (rule.target == 'any' || rule.target == 'any+image') {
                        target = extract_post_data(post, updated_data, 'all_content');
                        if (rule.target == 'any+image') {
                            var caption = extract_post_data(post, updated_data, 'image');
                            target = [target, caption].filter(s => !!s).join(' ');
                        }
                    }
                    else {
                        target = extract_post_data(post, updated_data, rule.target);
                    }
                    if (typeof target=="undefined") {
                        if (force_processing) {
                            // Act like target's empty so /^$/ matches successfully
                            filter_trace(data.id, ` -> Rule target doesn't exist (yet): ${rule.target}; acting as if it were null`);
                            target = null;
                        }
                        else {
                            filter_trace(data.id, ` -> Rule target doesn't exist (yet): ${rule.target}; defer filtering until later`);
                            abort = true;
                            return;
                        }
                    }
                    regex = null;
                    if (target == null) {
                        match = false;
                    }
                    else if ("equals" == operator) {
                        // xxx is this *meant* to be case-sensitive?
                        regex = new RegExp("^(?:" + condition_text + ")$");
                    }
                    else if ("contains" == operator && rule.match_partial_words) {
                        regex = new RegExp(condition_text, "i");
                    }
                    else if ("contains" == operator) {
                        regex = new RegExp("(?:^|\\b)(?:" + condition_text + ")(?:\\b|$)", "i");
                    }
                    else if ("startswith" == operator) {
                        regex = new RegExp("^(?:" + condition_text + ")", "i");
                    }
                    else if ("endswith" == operator) {
                        regex = new RegExp("(?:" + condition_text + ")$", "i");
                    }
                    else if ("contains_in" == operator) {
                        regex = new RegExp(condition_text.replace(/\|/g, '\\|').replace(/,/g, '|'), 'i');
                    }
                    else if ("in" == operator) {
                        regex = new RegExp('^(?:' + condition_text.replace(/\|/g, '\\|').replace(/,/g, '|') + ')$', 'i');
                    }
                    else if ("matches" == operator) {
                        regex = new RegExp(condition_text, (rule.condition.modifier || ''));
                    }
                    if (regex) {
                        filter_trace(data.id, ` -> Testing ${NOT}RegExp: ${regex.toString()}`);
                        results = regex.exec(target);
                        if (not) {
                            match = (results == null);
                        } else {
                            match = (results != null);
                        }
                        if (match) {
                            data.regex_match = results;
                        }
                        filter_trace(data.id, match ? ` -> Matched Text: '${RegExp.lastMatch}'` : 'No match');
                    }
                }
                if (match) {
                    any_match = true;
                }
                else if (all_match) {
                    all_match = false;
                }
            } catch (e) {
                filter_trace(data.id, "ERROR: " + e.message);
            }
        });

        if (abort) {
            return; // undefined
        }

        // Were enough rules satisfied to execute the actions?
        if (!any_match || (filter.match == "ALL" && !all_match)) {
            return false;
        }

        // Filter matched! Execute the actions
        filter.actions.forEach(function (action) {
            apply_action(post, data, updated_data, action, filter);
        });

        // Filter matched
        return true;
    }

// Apply a single filter action to a post
    function apply_action(post, data, updated_data, action, filter) {
        var css_target;
        if ("class" == action.action) {
            css_target = action.selector ? post.find(action.selector) : post;
            filter_trace(data.id, `Applying CSS class '${action.content}'`);
            css_target.addClass(action.content);
        }
        else if ("css" == action.action) {
            css_target = action.selector ? post.find(action.selector) : post;
            var rules = action.content.split(/\s*;\s*/);
            filter_trace(data.id, `Applying CSS '${action.content}'`);
            rules.forEach(function (rule) {
                var parts = rule.split(/\s*:\s*/);
                if (parts && parts.length > 1) {
                    css_target.css(parts[0], parts[1]);
                }
            });
        }
        else if ("replace" == action.action) {
            filter_trace(data.id, `Replacing '${action.find}' with '${action.replace}'`);
            if (typeof updated_data.userContent=="undefined") {
                extract_post_data(post, updated_data, "content");
            }
            if (updated_data.userContent) {
                updated_data.userContent.forEach(function (usercontent) {
                    replaceText(usercontent[0], new RegExp(action.find, "gi"), action.replace);
                });
            }
            if (updated_data.authorContent) {
                updated_data.authorContent.forEach(function (authorcontent) {
                    replaceText(authorcontent[0], new RegExp(action.find, "gi"), action.replace);
                });
            }
        }
        else if ("hide" == action.action) {
            if (never_hide(post)) { return; }
            if (!post.hasClass('sfx_filter_hidden')) {
                post.addClass("sfx_filter_hidden");
                filter_trace(data.id, `Hiding Post`);
                if (action.show_note) {
                    post.prepend(filter_hidden_note(filter, action, post, data, updated_data));
                }
            }
        }
        else if ("move-to-tab" == action.action ||
                 "copy-to-tab" == action.action) {
            var tab_name = regex_replace_vars(action.tab, data.regex_match, post, updated_data);
            if (tab_name.length) {
                filter_trace(data.id, `${action.action} '${tab_name}'`);
                X.publish(`filter/tab/${action.action.slice(0,4)}`, {"tab": tab_name, "post": post, "data": data});
            }
        }
    }

    function regex_replace_vars(str, matches, post, updated_data) {
        if (typeof str !== 'string') {
            return '';
        }
        return str.replace(/\$(\d+|\{[0-9a-z_:]+\})/g, function(m) {
            var ret_str;
            var param = /* { */ m.replace(/\${?([^}]+)}?/, '$1');
            var max_len = -1;
            if (/:/.test(param)) {
                max_len = param.replace(/.*:/, '');
                param = param.replace(/:.*/, '');
            }
            if (matches && matches[param] != undefined) {
                ret_str = matches[param];
            } else {
                ret_str = extract_post_data(post, updated_data, param);
            }
            ret_str = typeof ret_str === 'string' ? ret_str : '';
            if (max_len != -1) {
                ret_str = ret_str.slice(0, max_len);
            }
            return ret_str;
        });
    }

    function never_hide($post) {
        if ($post.find('a[href*="/socialfixer/"]').length) {
            return true; // Never hide posts from Social Fixer!
        }
        return false;
    }

    function filter_hidden_note(filter, action, post, data, updated_data) {
        var css = action.css || '';
        var note;
        if (action.custom_note) {
            var note_text = regex_replace_vars(action.custom_note, data.regex_match, post, updated_data);
            note = X(`<div class="sfx_filter_hidden_note" style="${css}">${note_text}</div>`);
        }
        else {
            note = X(`<div class="sfx_filter_hidden_note" style="${css}">Post hidden by filter "${filter.title}". Click to toggle post.</div>`);
        }
        note.on('click', function () {
            note.closest('*[sfx_post]').toggleClass('sfx_filter_hidden_show');
        });
        return note;
    }

    // Add actions to the post action tray
    X.publish('post/action/add', {"section": "filter", "label": "Edit Filters", "message": "menu/options", "data": {"section": "Filters"}});
    X.publish('post/action/add', {"section": "filter", "label": "Filter Debugger", "message": "post/action/filter/debug"});
    X.subscribe('post/action/filter/debug', function (msg, data) {
        var data_content = null;
        try {
            data_content = JSON.stringify(sfx_post_data[data.id], null, 3);
        }
        catch (e) {
            data_content = "[Error calling JSON.stringify, possible circular structure in JSON]";
        }
        data_content = data_content ? data_content.replace(/\n/g, '<br>') : 'No Data';
        var trace = sfx_filter_trace[data.id];
        var trace_content = 'No Trace';
        if (trace) {
            trace_content = trace.slice(1)
                .map(str => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
                .join('<br>');
        }
        var content = FX.oneLineLtrim(`
            <div>This popup gives details about how this post was processed for filtering.</div>
            <div draggable="false" class="sfx_bubble_note_subtitle">Filtering Trace</div>
            <div draggable="false" class="sfx_bubble_note_data">${trace_content}</div>
            <div draggable="false" class="sfx_bubble_note_subtitle">Raw Extracted Post Data</div>
            <div draggable="false" class="sfx_bubble_note_data">${data_content}</div>
        `);
        bubble_note(content, {"position": "top_right", "title": "Post Filtering Debug", "close": true});
    });
});

// =====================================
// Post Filter: Move/Copy To Tab
// =====================================
X.ready('post_tabs', function() {
    FX.add_option('always_show_tabs', {
        "section": "Advanced"
        , "title": "Always Show Tab List"
        , "description": "Always show the list of Tabs in the Control Panel, even if no posts have been moved to tabs yet."
        , "default": false
    });
    var $tab_vm = null, tab_data, all_posts, unfiltered_posts, processed_posts, tab_list_added;
    var reset = function () {
        tab_data = {
            "post_count": 0,
            "post_count_read": 0,
            "filtered_count": 0,
            "filtered_count_read": 0,
            "tabs": {},
            "selected_tab": null,
            "show_all": false
        };
        all_posts = {};
        unfiltered_posts = {};
        processed_posts = {};
        tab_list_added = false;
    };
    reset();
    FX.on_page_unload(reset);
// When a post is hidden because it was 'read', update tab counts
    X.subscribe("post/hide_read", function (msg, data) {
        var id = data.id, key;
        // Look for this post in all the tabs to increase the "read count"
        for (key in tab_data.tabs) {
            if (typeof tab_data.tabs[key].posts[id] != "undefined") {
                // This post exists in this tab
                tab_data.tabs[key].read_count++;
            }
        }
        if (typeof unfiltered_posts[id] != "undefined") {
            tab_data.filtered_count_read++;
        }
        if (typeof all_posts[id] != "undefined") {
            tab_data.post_count_read++;
        }
    });
// When a post is unhidden because it was 'unread', update tab counts
    X.subscribe("post/unhide_read", function (msg, data) {
        var id = data.id, key;
        // Look for this post in all the tabs to decrease the "read count"
        for (key in tab_data.tabs) {
            if (typeof tab_data.tabs[key].posts[id] != "undefined") {
                // This post exists in this tab
                tab_data.tabs[key].read_count--;
            }
        }
        if (typeof unfiltered_posts[id] != "undefined") {
            tab_data.filtered_count_read--;
        }
        if (typeof all_posts[id] != "undefined") {
            tab_data.post_count_read--;
        }
    });
    var remove_post_from_other_tabs = function (dom_id, is_read) {
        // Look for this post in all the tabs
        var key;
        for (key in tab_data.tabs) {
            if (typeof tab_data.tabs[key].posts[dom_id] != "undefined") {
                // This post exists in this tab
                delete tab_data.tabs[key].posts[dom_id];
                //tab_data.tabs[key].read_count -= (is_read?1:0);
                tab_data.tabs[key].post_count--;
            }
        }
        if (typeof unfiltered_posts[dom_id] != "undefined") {
            delete unfiltered_posts[dom_id];
            tab_data.filtered_count--;
            tab_data.filtered_count_read -= (is_read ? 1 : 0);
        }
    };
// Move to the next tab in the list
    X.subscribe("filter/tab/next", function (/* msg, data */) {
        if (!$tab_vm) {
            return;
        }
        // Get the list of tab names, in order
        var keys = Object.keys(tab_data.tabs).sort();
        for (var i = 0; i < keys.length - 1; i++) {
            if (tab_data.tabs[keys[i]].selected) {
                for (var j = i + 1; j < keys.length; j++) {
                    if (tab_data.tabs[keys[j]].read_count < tab_data.tabs[keys[j]].post_count) {
                        $tab_vm.select_tab(tab_data.tabs[keys[j]]);
                        return;
                    }
                }
                return;
            }
        }
    });
    var create_tab_container_dom = function () {
        if (tab_list_added || X.find('#sfx_cp_filter_tabs')) {
            return;
        }
        tab_list_added = true;
        X.publish("cp/section/add", {
            "name": 'Filter Tabs <span class="sfx_count">(unread / total)</span>'
            , "id": "sfx_cp_filter_tabs"
            , "order": 50
            , "help": "The Filtered Feed shows the filtered view of the feed, with posts removed that have been moved to tabs.\n\nThe All Posts view shows every post in the feed, even if it has been filtered to a tab."
        });
        var html = FX.oneLineLtrim(`
            <div class="sfx_cp_tabs" style="max-height:60vh;overflow:auto;">
                <div v-bind:class="{'sfx_tab_selected':(show_all&&!selected_tab),'sfx_tab_occupied':(post_count>post_count_read)}" class="sfx_filter_tab" @click="select_all()">
                    All Posts&#32;
                    <span class="sfx_count">
                        (
                        <span class="sfx_unread_count" v-if="post_count_read>0">
                            {{post_count-post_count_read}}/
                        </span>
                        {{post_count}})
                    </span>
                </div>
                <div v-if="post_count!=filtered_count" v-bind:class="{'sfx_tab_selected':(!show_all&&!selected_tab),'sfx_tab_occupied':(filtered_count>filtered_count_read)}" class="sfx_filter_tab" @click="select_filtered()">
                    Filtered Feed&#32;
                    <span class="sfx_count">
                        (
                        <span class="sfx_unread_count" v-if="filtered_count_read>0">
                            {{filtered_count-filtered_count_read}}/
                        </span>
                        {{filtered_count}})
                    </span>
                </div>
                <div v-for="tab in tabs | orderBy 'name'" class="sfx_filter_tab" v-bind:class="{'sfx_tab_selected':tab.selected,'sfx_tab_occupied':(tab.post_count>tab.read_count)}" @click="select_tab(tab)">
                    {{tab.name}}&#32;
                    <span class="sfx_count">
                        (
                        <span class="sfx_unread_count" v-if="tab.read_count>0">
                            {{tab.post_count-tab.read_count}}/
                        </span>
                        {{tab.post_count}})
                    </span>
                </div>
            </div>
        `);
        var methods = {
            "select_tab": function (tab) {
                if (tab_data.selected_tab) {
                    tab_data.selected_tab.selected = false;
                }
                tab_data.selected_tab = tab;
                tab.selected = true;
                X(`*[sfx_post]`).each(function () {
                    var $post = X(this);
                    if (typeof tab.posts[$post.attr('id')] != "undefined") {
                        $post.removeClass('sfx_filter_tab_hidden');
                    }
                    else {
                        $post.addClass('sfx_filter_tab_hidden');
                    }
                });
                FX.reflow(true);
            },
            "select_all": function () {
                if (this.selected_tab) {
                    this.selected_tab.selected = false;
                }
                this.selected_tab = null;
                this.show_all = true;
                X(`*[sfx_post]`).each(function () {
                    X(this).removeClass('sfx_filter_tab_hidden');
                });
                FX.reflow(true);
            },
            "select_filtered": function () {
                if (this.selected_tab) {
                    this.selected_tab.selected = false;
                }
                this.selected_tab = null;
                this.show_all = false;

                X(`*[sfx_post]`).each(function () {
                    var $post = X(this);
                    if (typeof unfiltered_posts[$post.attr('id')] != "undefined") {
                        $post.removeClass('sfx_filter_tab_hidden');
                    }
                    else {
                        $post.addClass('sfx_filter_tab_hidden');
                    }
                });
                FX.reflow(true);
            }
        };
        // Wait until the section is added before adding the content
        Vue.nextTick(function () {
            var v = template('#sfx_cp_filter_tabs', html, tab_data, methods);
            $tab_vm = v.$view; // The Vue instance, to access the $set method below
        });
    };
    var create_tab_container = function (tablist) {
        create_tab_container_dom();
        if (tablist) {
            X.when('#sfx_cp_filter_tabs', function () {
                tablist.forEach(function (t) {
                    create_tab(t);
                });
            });
        }
    };

// When the page first loads, show the tab container if tab filters are defined or `always_show_tabs'
    FX.on_options_load(function () {
        var always = FX.option('always_show_tabs');
        var show_cp = always;
        var tabs = [];
        var tab_list_added = false;
        // Only show tab list if we're filtering & there are actual tabbing filters; or `always_show_tabs'
        // XXX should be sensitive to filters_enabled_pages, filters_enabled_groups, and support groups?
        if (!FX.context.permalink) {
            if (always && FX.option('filters_enabled')) {
                (FX.storage('filters') || []).forEach(function (filter) {
                    if (!filter.enabled) {
                        return;
                    }
                    (filter.actions || []).forEach(function (action) {
                        if ((action.action == "copy-to-tab" || action.action == "move-to-tab") && !action.tab.match(/\$(\d+|\{[0-9a-z_:]+\})/)) {
                            tabs.push(action.tab);
                            show_cp = true;
                        }
                    });
                });
            }
            if (show_cp) {
                X.subscribe("post/add", function () {
                    if (!tab_list_added) {
                        create_tab_container(tabs);
                        tab_list_added = true;
                    }
                });
                FX.on_page_unload(function () {
                    tab_list_added = false;
                });
            }
         }
    });

    var create_tab = function (tabname) {
        if (!tab_data.tabs[tabname]) {
            Vue.set(tab_data.tabs, tabname, {"name": tabname, "posts": {}, "selected": false, "post_count": 0, "read_count": 0});
        }
    };

    var add_to_tab = function (tabname, dom_id, post, copy) {
        create_tab(tabname);

        var is_read = post.hasClass('sfx_post_read') ? 1 : 0;
        // If moving, first remove the post from other tabs
        if (!copy) {
            remove_post_from_other_tabs(dom_id, is_read);
        }

        // Add the post to the new tab
        Vue.set(tab_data.tabs[tabname].posts, dom_id, {});

        tab_data.tabs[tabname].post_count++;
        // If this post has already been marked as read, increment the read_count now, because it won't be ticked later
        tab_data.tabs[tabname].read_count += is_read;

        // Show or Hide the post depending on what we are looking at now and where it should go
        if (!tab_data.selected_tab && !copy) { // Currently Showing the news feed, post shouldn't be here because it is moved to tab
            post.addClass('sfx_filter_tab_hidden');
        }
        else if (tab_data.selected_tab && tab_data.selected_tab.name == tabname) { // Showing a tab and the post belongs here
            post.removeClass('sfx_filter_tab_hidden');
        }
        else if (tab_data.selected_tab == null && copy) { // Showing the filtered feed, but the post should stay in the filtered feed too
            post.removeClass('sfx_filter_tab_hidden');
        }
        else {
            // Post is where it should be
        }
    };
    X.subscribe(["filter/tab/move", "filter/tab/copy"], function (msg, data) {
        try {
            var dom_id = data.data.dom_id;
            var tab_name = data.tab;
            var key = dom_id + dom_id + "/" + tab_name;
            // Check to see if post has already been processed to this tab, to avoid double-processing
            if (typeof processed_posts[key] == "undefined") {
                processed_posts[key] = true;
                create_tab_container();
                Vue.nextTick(function () {
                    add_to_tab(tab_name, dom_id, data.post, msg == "filter/tab/copy");
                });
            }
        } catch (e) {
            alert(e);
        }
    });
// When new posts are added, if a tab is selected, hide them so the filter can decide whether to show them
    X.subscribe("post/add", function (msg, data) {
        tab_data.post_count++;
        if (tab_data.selected_tab) {
            X(data.selector).addClass('sfx_filter_tab_hidden');
        }
        tab_data.filtered_count++;
        all_posts[data.id] = {};
        unfiltered_posts[data.id] = {};
    });
});

X.ready('post_processor', async function() {
    var post_selector = '*[role="article"]';
    var log = X.logger('post_processor');

    //var sfx_post_selector = '*[sfx_post]';
    var sfx_post_id = 1;
    var max_posts = 50;
    var post_count = 0;
    // var pager_selector = [
    //     '*[data-testid="fbfeed_placeholder_story"] ~ a', /* News Feed */
    //     '[id^=timeline_pager_container]',                /* Timeline */
    //     '[id*=_see_more_unit]',                          /* Page home, Page posts */
    //     '#pagelet_group_pager',                          /* Group */
    // ].join(',');

    FX.add_option('max_post_load_count', {"section": "Advanced", "title": 'Post Auto-Loading', "description": 'How many posts should be allowed to load before being paused.', "type": "text", "default": max_posts});
    // When options are loaded and whenever 'max_post_load_count' is set, update the max posts value
    FX.on_option_live('max_post_load_count', function(val) {
        max_posts = val || max_posts;
    });

    // When the page is first loaded, scan it for posts that exist as part of the static content
    // and also watch for new nodes to be scalled
    FX.on_content_loaded(function () {
        // Find and handle inserted posts
        FX.on_content_inserted(function (o) {
            // If the inserted node lives within a <form> then it's in
            // the reaction part of the post, we don't need to re-process
            if (o.is('form') || o.closest('form').length) {
                return;
            }
            find_and_process_posts(o);
        });
        find_and_process_posts(X(document.body));
    });

    // Find and identify posts within any DOM element
    // This can be fired at document load, or any time content is inserted.
    function find_and_process_posts(container) {
        var posts = container.find(post_selector);
        if (container.is(post_selector)) {
            posts = posts.add(container);
        }
        posts.each(function (i, post) {
            var $post = X(post);
            // If the post has an aria-posinset attribute, we know it's legit
            // If not, we need to validate it a bit
            if (!$post.attr('aria-posinset')) {
                // In the new layout, comments also show up as [role="article"] so we need
                // to make sure they are not considered a post
                if ($post.closest('*[data-visualcompletion="ignore-dynamic"],li').length) {
                    return;
                }
                // The empty "loading" posts in the news feed trick this selector, so catch that
                if ($post.find('*[role="progressbar"]').length) {
                    return;
                }
            }
            process_post($post.attr('id'),$post);
        });
        return posts;
    }

    // Do the initial process a post and mark it as being seen by SFX
    async function process_post(id,$post) {
        if (!id) {
            id = 'sfx_post_'+sfx_post_id;
            $post.attr('id', id);
        }
        if (!id) {
            return;
        }
        //$post = X(document.getElementById(id)); // Group posts have : in the id, which causes Zepto to crash
        X.publish("log/postdata", {"id": id, "message": "processing post id=" + id});

        // The initial processing recognizes a post and marks it as such
        var is_new = false;
        if (!$post.attr('sfx_post')) {
            $post.attr('sfx_post', sfx_post_id++); // Mark this post as processed
            X.publish("log/postdata", {"id": id, "message": "sfx_post=" + $post.attr('sfx_post')});
            is_new = true;
        }

        // Check for the sfx_id, which is a post's unique identifier to SFX
        var sfx_id = $post.attr('sfx_id') || null;
        var data = {
            "id": id
            ,"selector":"#"+id
            , "sfx_id": sfx_id
        };
        if (is_new) {
            X.publish("log/postdata", {"id": id, "message": "Calling post/add"});
            X.publish("post/add", data);

            // If the post unique id hasn't been resolve, do so async
            if (!sfx_id) {
                get_post_id($post, id).then(function(sfx_id) {
                    data.sfx_id = sfx_id;
                    $post.attr('sfx_id',sfx_id);
                    X.publish("log/postdata", {"id": id, "message": "Calling post/resolve-id"});
                    X.publish("post/resolve-id", data);
                });
            }

            // If we have processed too many posts, stop here
            if (post_count++ > max_posts) {
                // Find the DIVs that trigger infinite scroll
                // Luckily it stops working if it's display:none
                var find_infinite_scroll_triggers = function() {
                    var $feed_children = X('*[role="feed"]').children();
                    var $last_child = $feed_children.last();
                    var $infinite_scroll_triggers = X([]);
                    while ($last_child && $last_child[0] && !$last_child.attr('data-pagelet') && $last_child.attr('id')!=="sfx-feed-pager" && !$last_child.find('*[sfx_post]').length) {
                        $infinite_scroll_triggers.push($last_child[0]);
                        $last_child = $last_child.prev();
                    }
                    return $infinite_scroll_triggers;
                };
                var $infinite_scroll_triggers = find_infinite_scroll_triggers();
                log(`Max post count (${max_posts}) reached. Loaded ${post_count}. Trying to prevent infinite scroll.`);
                if (!$infinite_scroll_triggers.length || !$infinite_scroll_triggers.length>2) {
                    // We don't know what to do here, so don't screw anything up. Exit nicely.
                    log("Couldn't identify infinite scroll triggers definitively. Aborting.");
                    post_count = 0;
                    return;
                }
                $infinite_scroll_triggers.hide();
                var pager = X('#sfx-feed-pager');
                try {
                    if (!pager.length) {
                        pager = X(`<div id="sfx-feed-pager" class="sfx_info sfx-pager" style="cursor:pointer;"><b>Infinite Scroll Prevented</b><br>Social Fixer has paused automatic loading of more than ${max_posts} posts to prevent Facebook from going into an infinite loop. <b><u>Click this message</u></b> to continue loading about <input class="sfx_input" type="number" min="1" value="${max_posts}" style="width:7ch;" size="4" sfx-option="max_post_load_count"> more posts.<br></div>`);
                        FX.attach_options(pager);
                        pager.find('input').click(function () {
                            // Don't bubble up to pager
                            return false;
                        });
                        pager.click(function () {
                            pager.remove();
                            find_infinite_scroll_triggers().show();
                            post_count = 0;
                        });
                    }
                    // Make sure the pager is at the end and visible
                    find_infinite_scroll_triggers().first().before(pager);
                    pager.show();
                } catch (e) {
                    alert(e);
                }
            }
        }
    }

    // When navigating, reset post count
    FX.on_page_unload(function () {
        //sfx_post_id = 1;
        post_count = 0;
    });

    function sfx_touch(el,touches) {
        touches = touches || 1;
        var sfx_touch = el.getAttribute('sfx_touch');
        if (!sfx_touch) {
            el.setAttribute('sfx_touch',0);
        }
        else {
            el.setAttribute('sfx_touch',sfx_touch + touches);
        }
    }

    function trigger_timestamp(el) {
        X.ui.mouseover(el);
    }

    async function get_post_id_internal($post, id) {
        return new Promise(function(resolve) {
            // Trigger a hover over the timestamp on the post
            // This will switch the href from # to the real url
            var timestamp_selector = `span[id^="jsc"] a[role="link"][tabindex="0"]`;
            X.poll(function() {
                var $timestamp = $post.find(timestamp_selector);
                if (!$timestamp.length) {
                    //X.publish("log/postdata", {"id": id, "message": "Timestamp selector not found"});
                    return false;
                }
                var a = $timestamp[0];
                // If timestamp isn't # then we don't need to resolve the timestamp by hovering
                var href = a.getAttribute('href');
                if (href!=="" && href!=="#") {
                    //X.publish("log/postdata", {"id": id, "message": "Timestamp href is not # : "+href});
                    sfx_touch(a,2);
                    resolve(extract_post_id_from_url(href));
                    return true;
                }
                sfx_touch(a);
                // Wait for the href to change
                X.poll(function() {
                    var href = a.getAttribute('href');
                    if (!href || href==="#") {
                        X.publish("log/postdata", {"id": id, "message": "Triggering timestamp"});
                        trigger_timestamp(a);
                        return false;
                    }
                    X.publish("log/postdata", {"id": id, "message": "Triggering mouseout"});
                    a.dispatchEvent(new MouseEvent('mouseout', {bubbles: true}));
                    if (typeof PointerEvent!="undefined") {
                        a.dispatchEvent(new PointerEvent('pointerout', {bubbles: true}));
                    }
                    sfx_touch(a);
                    resolve(extract_post_id_from_url(href));
                },300,10);
            },500,10);
        });
    }

    // Take a link to a post and extract the unique identifier from it
    // If it can't be done, return the whole url as the unique id
    function extract_post_id_from_url(url) {
        // 2017-03-12: most IDs are simply long strings of digits, but some
        // are of the form digits:2, where "2" so far has only been seen to
        // be a single digit.  And ft_ent_identifier may be of the form:
        //    "846660526:10158243768475527:47:1489321690:10158243768475527:2"
        // in which "10158243768475527:2" is a proper ID; that is,
        // https://facebook.com/10158243768475527:2 points to that post.
        //
        // In a collected ID with multiple digit:digit sets, take the last
        // set of digits if it's >1 digit long; take the last two if the
        // last one is a single digit.
        if (/(\d+:\d)$/.test(url) || /:(\d+)$/.test(url)) {
            return RegExp.$1;
        }
        if (/\/(posts|permalink|video)\/(\d+)/.test(url)) {
            return RegExp.$2;
        }
        if (/fbid=(\d+)/.test(url)) {
            return RegExp.$1;
        }
        // At this point we don't have a solid lead, so let's do our best
        // Strip out url arguments so we don't accidentally match the wrong thing
        url = url.replace(/\?.*/,'');

        // Make an educated guess that this is an ID
        // Grab the last long string of digits in the url
        if (/\/(\d{6,})\D*$/.test(url)) {
            return RegExp.$1;
        }

        // As a very last resort, strip the url a bit to shorten it and use it as-is
        return url.replace(/^.*?:\/\/.*?\//,'');
    }

    async function get_post_id($post, id) {
        try {
            return get_post_id_internal($post, id).then(function(sfx_id) {
                X.publish("log/postdata", {"id": id, "message": "get_post_id=" + (sfx_id == null ? "null" : sfx_id)});
                return sfx_id;
            });
        } catch(e) {
            console.log(e);
        }
    }
});

X.ready('regex_tester', function() {
    X.subscribe("test/regex", function (msg, data) {
        var text = data.text || '';
        var modifier = data.modifier || '';
        var content = FX.oneLineLtrim(`
        <div draggable="false">Mozilla Developer Network: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions" target="_blank">Regular Expressions Documentation</a></div>
        <div draggable="false" class="sfx_label_value">
            <div>Expression: </div>
            <div><input id="sfx_regex_tester_expression" class="sfx_input" size="25" value="${text}"></div>
        </div>
        <div draggable="false" class="sfx_label_value">
            <div>Modifiers: </div>
            <div><input id="sfx_regex_tester_modifier" class="sfx_input" size="5" value="${modifier}"> [ g i m ]</div>
        </div>
        <div draggable="false"><b>Test String:</b><br>
            <textarea id="sfx_regex_tester_string" style="width:250px;height:75px;"></textarea>
        </div>
        <div draggable="false">
            <input type="button" class="sfx_button" value="Test" onclick="document.getElementById('sfx_regex_tester_results').innerHTML=document.getElementById('sfx_regex_tester_string').value.replace(new RegExp('('+document.getElementById('sfx_regex_tester_expression').value+')',document.getElementById('sfx_regex_tester_modifier').value),'<span style=&quot;background-color:cyan;font-weight:bold;&quot;>$1</span>');">        
        </div>
        <div draggable="false">
            <div><b>Results:</b></div>
            <div id="sfx_regex_tester_results" style="white-space:pre;"></div>
        </div>

    `);
        bubble_note(content, {"position": "top_right", "title": "Regular Expression Tester", "close": true});
    });
});

X.ready('sfx_collision', function () {
	// Don't run this if the page was loaded a long time ago:
	//
	// Firefox (and family?) seem to update already-installed web_extensions by
	// injecting the new script into the already running page where the old one
	// was previously injected.  Social Fixer sees that the page was previously
	// meddled with (by its own previous version!) -- but we need to ignore it.
	//
	// Collision check doesn't need to fire every time as long as it eventually
	// notifies the user on some later page load.
	//
	// Refs:
	//
	// https://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface
	// https://developer.mozilla.org/en-US/docs/Web/API/Performance/timing

	if (performance && performance.timing && performance.timing.domLoading) {
		if (X.now() - performance.timing.domLoading > 10 * X.seconds) {
			return;
		}
	}

	X.when('#sfx_badge', function () {
		// Allow all version(s) to finish init & fighting over badge
		setTimeout(function () {
			var collision_alert = function (ver_msg, advice) {
				alert(`\
WARNING: two or more copies of Social Fixer are running at once!

This one is:  version "${sfx_buildstr}".
The other is: version "${ver_msg}".

Please disable all older versions to avoid unexpected behavior!

SEE http://tiny.cc/sfx-only-1 on removing old versions.
SEE http://tiny.cc/sfx-saveprefs on saving and transferring preferences.
SEE https://socialfixer.com/support (the Support Group on FB) for help.
${advice ? "\n" + advice + "\n" : ""}
You may copy this text with CONTROL-C or COMMAND-C.`
					.replace(/\n/g,' \n') // Opera ^C-to-copy omits newlines
				);
				X.support_note('sfx_collision', `Other: '${ver_msg}'`);
			};

			var $badge = X('#sfx_badge');
			var old_buildstr = $badge.attr('old_buildstr');
			var badge_buildstr = $badge.attr('sfx_buildstr');

			// Intentionally not an else-chain: intended & tested
			// to detect multiple classes of old version at once.

			// These divs existed in at least versions 5.968 through 12.0
			if (X("div.bfb_theme_extra_div").length > 0) {
				collision_alert("below 15.0.0",
				"NOTE: preferences from this version cannot be transferred, but should be saved for manual reference."
				);
			}
			// Another >=15 SFX without collision detection
			if (!badge_buildstr || old_buildstr == "old") {
				collision_alert("between 15.0.0 and 16.0.1");
			}
			// Another >=16 SFX with collision detection who created badge 1st
			// (if we created badge 1st, he complains for us)
			if (old_buildstr && old_buildstr != "old" && old_buildstr != sfx_buildstr) {
				collision_alert(old_buildstr);
			}
		}, 8 * X.seconds);
	});
});

FX.on_options_load(function () {
    X.storage.get('stats', {}, function (stats) {
        var today = X.today();
        if (today > (stats.last_ping || 0)) {
            stats.last_ping = today;
            X.ajax("https://SocialFixer.com/version.txt", function (/* ver, status */) {
                X.storage.set('stats', "last_ping", today);
            });
        }
    }, true);
});

X.subscribe("context/ready", function() {
    FX.add_option('stay_on_page', {
        section: 'Experiments',
        title: 'Stay On Page',
        description: 'Prevent the browser from leaving the current Facebook page when you click on a link',
        default: false,
    });

    FX.on_options_load(function () {
        // Exclude some pages where this interacts badly or is unhelpful
        if (FX.context.type == 'messages' || FX.context.id == 'settings') {
            return;
        }
        if (FX.option('stay_on_page')) {
            setTimeout(function() {
                X.inject(function() {
                    window.requireLazy(['Run'], function(Run) {
                        Run.onBeforeUnload(function() {
                            return 'Social Fixer: Stay On Page is protecting you from leaving this page before you intended to.  Choose whether you want to stay or leave.';
                        });
                    });
                });
            }, 1.5 * X.seconds);
        }
    });
}, true);

// ===================================================
// STICKY NOTES
// ===================================================
// note_parent = selector or DOM object to point to
// left_right = 'left' | 'right' where to put note (default: 'left')
// content = stuff in the note (string of text or HTML source)
// data.close = boolean whether to include a close button
// data.closefunc = callback to invoke when note's close button
//                  is clicked or close_sticky_note() is called
function sticky_note(note_parent,left_right,content,data) {
	data = data || {};
	left_right = (left_right == 'right') ? 'right' : 'left';
	var note = X(FX.oneLineLtrim(`
		<div class="sfx_sticky_note sfx_sticky_note_${left_right}">
			<div class="sfx_sticky_note_close"></div>
			<div>${content}</div>
			<div class="sfx_sticky_note_arrow_border"></div>
			<div class="sfx_sticky_note_arrow"></div>
		</div>
	`));
	var $note_parent = X(note_parent);
	note_parent = $note_parent[0];
	var ps = $note_parent.css('position');
	if (ps == 'static') {
		$note_parent.attr('sfx_position', ps);
		$note_parent.css('position', 'relative');
	}
	try {
		note.css('visibility', 'hidden').appendTo(note_parent);
	} catch(e) { alert(e); }
	var height = note[0].offsetHeight;
	note[0].style.marginTop = -(height/2) + "px";
	note[0].style.visibility="visible";
	// Close functionality
	var close = note.find('.sfx_sticky_note_close');
	if (false!==data.close) {
		close.click(function() {
			sticky_note_remove(note, note_parent);
			if (typeof data.closefunc=="function") {
				data.closefunc();
			}
		});
	}
	else {
		close.remove();
	}
	return note;
}

// These two are explicitly different:
//
//   sticky_note_close() calls the provided closefunc, if any
//   sticky_note_remove() does not call closefunc, even if provided

function sticky_note_close(note, note_parent) {
	var close = X(note).find('.sfx_sticky_note_close');
	if (close.length) {
		close.click();
		// which calls sticky_note_remove()
	} else {
		sticky_note_remove(note, note_parent);
	}
}

function sticky_note_remove(note, note_parent) {
	var $note_parent = X(note_parent);
	X(note).remove();
	var old_position = $note_parent.attr('sfx_position');
	if (old_position) {
		$note_parent.removeAttr('sfx_position').css('position', old_position);
	}
}

// Check to make sure that the extension's storage is working correctly
X.ready('storage_check', function() {
    X.task('storage_check', 1*X.days, function() {
        FX.on_options_load(function () { setTimeout(function() {
            var now = X.now();
            var success = null;
            var error = function (err) {
                success = false;
                // Oops, storage didn't work!
                var error_msg="";
                if (err) {
                    error_msg = "<br><br>Error: "+err;
                }
                var version_info = "<br><br>" + sfx_user_agent + "<br>Social Fixer " + sfx_buildstr + "<br>" + sfx_userscript_agent;
                bubble_note("Social Fixer may have trouble saving your settings. If your settings won't stick, please let us know. See 'Support' under Options for contact info." + error_msg + version_info, {"close": true, "title": "Extension Storage Warning", "style": "width:300px;"});
                X.support_note('storage_check', err);
            };
            setTimeout(function () {
                if (success === null) {
                    error("Timeout waiting for storage response");
                }
            }, 8 * X.seconds);
            try {
                X.storage.set('storage_check', 'storage_checked_on', now, function () {
                    // Storage should have persisted by now
                    // Try retrieving it
                    try {
                        X.storage.get('storage_check', null, function (stats) {
                            if (!stats || !stats.storage_checked_on || (Math.abs(now - stats.storage_checked_on) > 60 * X.seconds)) {
                                var e = null;
                                if (!stats) { e="No stats"; }
                                else if (!stats.storage_checked_on) { e="stats.storage_checked_on doesn't exist"; }
                                else if ((Math.abs(now - stats.storage_checked_on) > 60 * X.seconds)) { e="stats.storage_checked_on = "+Math.abs(now - stats.storage_checked_on); }
                                return error(e);
                            }
                            success = true;
                        }, false);
                    } catch(e) {
                        error(e);
                    }
                });
            } catch(e) {
                error(e);
            }
        },1000);
        });
    });
});

// Tag each subscribable item with boolean .subscribed indicating whether
// user is subscribed to it
var mark_subscribed_items = function (subscriptions, user_items) {
    // Build up a list of user item id's
    var subscription_ids = {};
    if (user_items && user_items.length) {
        user_items.forEach(function (f) {
            if (f.id) {
                subscription_ids[f.id] = true;
            }
        });
    }
    (subscriptions || []).forEach(function (item) {
        item.subscribed = (!!subscription_ids[item.id]);
    });
};

// Retrieve the JSON list of subscribable items of this type; tag each
// item with boolean .subscribed indicating whether it was found in
// user_items; pass to callback
//
// `name' is used as both filename[.json] and field name in the JSON in
// that file; if they're different, pass in an array containing:
// [ filename, fieldname ]

var retrieve_item_subscriptions = function (name, user_items, callback) {
    var filename = name;
    if (typeof name != "string") {
        filename = name[0];
        name = name[1];
    }
    X.ajax(`https://matt-kruse.github.io/socialfixerdata/${filename}.json`, function (content) {
        if (content && content[name] && content[name].length > 0) {
            // Mark the subscribed ones
            mark_subscribed_items(content[name], user_items);
        }
        if (callback) {
            callback((content && content[name]) ? content[name] : null);
        }
    });
};

// Retrieve the JSON list of subscribable items of this type; update
// user's subscribed items with any changes found in the JSON (except
// .enabled, and a special case for customized filter actions).  If
// anything changed, write back to storage.
//
// `name' is used as both filename[.json] and field name in the JSON in
// that file; if they're different, pass in an array containing:
// [ filename, fieldname ]

var update_subscribed_items = function (name, user_items, callback) {
    retrieve_item_subscriptions(name, user_items, function (subscriptions) {
        if (typeof name != "string") {
            name = name[1];
        }
        var any_dirty = false;
        // Loop through the subscriptions to see if user items need to be updated
        var subscribed = {};
        // This was user_items.forEach(...): but `hiddens' is a non-array object
        for (var key in user_items) {
            // Don't be tricked by prototype properties
            if (!user_items.hasOwnProperty(key)) {
                continue;
            }
            var f = user_items[key];
            if (f.id) {
                subscribed[f.id] = f;
            }
        }
        (subscriptions || []).forEach(function (item) {
            var user_item = subscribed[item.id];
            if (!user_item) {
                return;
            }
            var key, dirty = false;
            // Map the properties of the subscription to the user item
            // Don't overwrite the entire object because things like 'enabled' are stored locally
            for (key in item) {
                if (key == "subscribed" || key == "enabled") {
                    continue;
                }
                // Check to see if the user item data needs updated
                // If user has customized actions, don't over-write, otherwise update
                if (name == 'filters' && key == 'actions' &&
                    item.configurable_actions && user_item.custom_actions) {
                    continue;
                }
                if (name == 'filters' && key == 'stop_on_match') {
                    continue;
                }
                if (JSON.stringify(user_item[key]) != JSON.stringify(item[key])) {
                    user_item[key] = item[key];
                    dirty = true;
                }
            }
            if (dirty) {
                user_item.subscription_last_updated_on = X.now();
                any_dirty = true;
            }
        });
        // if any of the subscriptions were dirty, save the items
        if (any_dirty) {
            X.storage.save(name, X.clone(user_items), function () {
            });
        }
        if (callback) {
            callback(subscriptions);
        }
    });
};

X.ready('unread_filtered_messages', function() {
    FX.add_option('check_unread_filtered_messages', {
        "title": "Check For Filtered Messages"
        , "description": "Facebook hides Messages from people outside your network and doesn't alert you. This feature alerts you if there are any unread messages that Facebook has filtered."
        , "default": true
        , "verified": true
    });
    FX.add_option('check_unread_filtered_messages_alt', {
        "section": "Experiments",
        "title": "Use alternate method to check for filtered messages"
        , "description": "Add this if the check for filtered messages isn't working"
        , "default": false
        , "verified": true
    });
    FX.on_option('check_unread_filtered_messages', function () {
        FX.on_content_loaded(function() {
            const norm = !FX.option('check_unread_filtered_messages_alt');
            const ajax_func = norm ? X.ajax : X.ajax_dom;
            ajax_func("https://mbasic.facebook.com/messages/?folder=other", function (ajax_result) {
                if (typeof ajax_result !== 'string') {
                    return;
                }
                var count = 0;
                if (norm) {  // Parse mbasic CSS & HTML directly
                    // Is the '.some_class { font-weight: bold; }' CSS still there?
                    var bold_matches = ajax_result.match(/\.([a-zA-Z0-9_]+)\s*{[^}]*font-weight[^:]*:[^};]*bold\s*;\s*}/);
                    if (!bold_matches || bold_matches.length < 2) {
                        // Give us a chance to notice, without an obnoxious alert() or whatever
                        X.support_note('unread_filtered_messages', 'class:bold CSS not found');
                        return;
                    }
                    var bold_class = bold_matches[1];
                    // Filtered message subjects display as <h3 class="bb"> (normal) if 'read',
                    // class="ci" (bold) if 'unread'.  Count the '<h3 class="ci">' blocks.
                    // Except 'ci' is sometimes 'cj' or maybe something else?  So now we parse
                    // out the class, first.
                    bold_matches = ajax_result.match(RegExp(`<h3[^>]*class=.[^'"]*\\b${bold_class}\\b`, 'g'));
                    bold_matches && (count = bold_matches.length);
                } else {  // Inject mbasic HTML into the DOM, use getComputedStyle()
                    X('body').append(ajax_result);
                    ajax_result.find('h3 > a[href^="/messages"]').forEach(function (msg) {
                        var fontWeight = getComputedStyle(msg).fontWeight;
                        if (fontWeight && (fontWeight >= 600 || fontWeight == "bold")) {
                            count++;
                        }
                    });
                    ajax_result.remove();
                }
                if (count) {
                    var tooltip = "When you receive Messages from people Facebook doesn't think you know, it filters them and doesn't inform you. Social Fixer adds this notification so you don't miss messages. This feature can be disabled in Options.";

                    X.publish("notify/increment", {"target": "#sfx_badge"});
                    X.publish("menu/add", {"section": "actions", "item": {'html': `<span class="sfx_menu_jewelCount"><span class="count">${count}</span></span><span title="${tooltip}">You have unread hidden Messages</span>`, url: '//m.facebook.com/messages/?folder=other', target: '_blank'}});
                }
            });
        });
    });
});

var sfx_version = "27.2.0";
var sfx_buildtype = "userscript";
var sfx_userscript_agent = undefined;
if (sfx_buildtype == "userscript") {
   var GMinfo = (typeof GM !== 'undefined' && GM.info) || GM_info;
   sfx_userscript_agent = "Script running under " +
      (!GMinfo ? "unknown v:unknown" :
         (GMinfo.scriptHandler || "Greasemonkey") + " v:" + (GMinfo.version || "unknown"));
   if (GMinfo && GMinfo.script && GMinfo.script.version && GMinfo.script.version.length) {
      sfx_version = GMinfo.script.version;
   }
}
var sfx_buildstr = sfx_version + " (" + sfx_buildtype + ")";
var sfx_user_agent = "Browser: " + navigator.userAgent;
var global_options = {
	"use_mutation_observers":true
};
var global = {};

// This actually executes module code by firing X.ready()
var run_modules = function() {
	// This tells each module to run itself
	X.ready();
	// First add any CSS that has been built up
	FX.css_dump();
	// Queue or Fire the DOMContentLoaded functions
	FX.fire_content_loaded();
};

// Should we even run at all? (see target_header.js)
if (!prevent_running) {
	// Allow modules to delay early execution of modules (until prefs are loaded) by returning false from beforeReady()
	if (X.beforeReady()!==false) {
		run_modules();
	}

  // Load Options (async)
  var bootstrap = function() {
    X.storage.get(['options', 'filters', 'tweaks', 'hiddens', 'postdata', 'friends', 'stats', 'tasks', 'messages'], [{}, [], [], {}, {}, {}, {}, {}, {}], function (options,err) {
      if (err) {
        console.log("Social Fixer Preferences could not be loaded from storage.");
        console.log(err);
      }
      else if (X.beforeReady(options) !== false) {
        run_modules();
        FX.options_loaded(options);
      }
    });
  };

  // Find out who we are
	// ===================
  X.userid = X.cookie.get('c_user') || "anonymous";
  // Prefix stored pref keys with userid so multiple FB users in the same browser can have separate prefs
  X.storage.prefix = X.userid;
  bootstrap();

}

} catch(e) {
    console.log(e);
}
