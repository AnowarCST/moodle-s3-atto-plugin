YUI.add('moodle-atto_s3-button', function (Y, NAME) {

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    atto_s3
 * @copyright  2015 Eoin Campbell
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_s3-button
 */

/**
 * Atto text editor import Microsoft Word file plugin.
 *
 * This plugin adds the ability to drop a Word file in and have it automatically
 * convert the contents into XHTML and into the text box.
 *
 * @namespace M.atto_s3
 * @class Button
 * @extends M.editor_atto.EditorPlugin
 */

var COMPONENTNAME = 'atto_s3',
    // @codingStandardsIgnoreStart
    IMAGETEMPLATE = '<div {{#s3_res_width}}style="max-width: {{../s3_res_width}}" {{/s3_res_width}} >' +
        '<video-js id="my_player_{{video_id}}"' +
        '    data-video-id="{{video_id}}"' +
        '    data-account="{{account_id}}"' +
        '    data-player="{{player_id}}"' +
        '    data-embed="default"' +
        '    data-application-id' +
        '    class="vjs-big-play-centered"' +
        '    {{#s3_width}}width="{{../s3_width}}" {{/s3_width}}' +
        '    {{#s3_height}}height="{{../s3_height}}" {{/s3_height}}' +
        '    controls></video-js>' +
        '</div>',
    TEMPLATES = '<form class="mform atto_form atto_s3" id="atto_s3_form">' +
        '<label for="s3_accountid_entry">Enter Account Id</label>' +
        '<input class="form-control fullwidth " type="text" id="s3_accountid_entry"' +
        'size="32" required="true" value="{{s3_account}}"/>'+
        '<label for="s3_videoid_entry">Enter Video Id</label>' +
        '<input class="form-control fullwidth " type="text" id="s3_videoid_entry"' +
        'size="32" required="true"/>'+
        '<label for="s3_playerid_entry">Enter Player Id</label>' +
        '<input class="form-control fullwidth " type="text" id="s3_playerid_entry"' +
        'size="32" required="true" value="{{s3_player}}"/>'+
        '<div class="mb-1">' +
        '<label for="s3_sizing" class="full-width-labels">Sizing</label><br>' +
        '<div class="form-check form-check-inline">' +
        '  <input class="form-check-input" type="radio" name="s3_sizing" id="inlineRadio1" value="res" checked>' +
        '  <label class="form-check-label" for="inlineRadio1">Responsive</label>' +
        '</div>' +
        '<div class="form-check form-check-inline">' +
        '  <input class="form-check-input" type="radio" name="s3_sizing" id="inlineRadio2" value="fix">' +
        '  <label class="form-check-label" for="inlineRadio2">Fixed</label>'+
        '</div>' +
        '</div>' +
        '<div class="mb-1" >' +
        '    <label>Size</label>' +
        '    <div class="form-inline " >' +
        '        <label class="accesshide">Video width</label>' +
        '        <input type="text" class="form-control mr-1  input-mini" size="4" id="s3_width" value="960"> x' +
        '        <label class="accesshide">Video height</label>' +
        '        <input type="text" class="form-control ml-1 input-mini" size="4" id="s3_height" value="540">' +
        '        <label class="accesshide">Unit</label>' +
        '        <select class="form-control ml-1 input-mini"  id="s3_width_unit">' +
        '            <option value="px" selected>px</option>' +
        '            <option value="cm" >cm</option>' +
        '            <option value="%" >%</option>' +
        '        </select>' +
        '    </div>' +
        '</div>' +
        '<div class="clearfix"></div>' +
        '<div class="mdl-align">' +
        '<br>' +
        '<button class="btn btn-secondary submit" type="submit">Insert s3 Video</button>' +
        '</div>' +
        '</form>';
    // @codingStandardsIgnoreEnd

Y.namespace('M.atto_s3').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {

    /**
     * A reference to the current selection at the time that the dialogue
     * was opened.
     *
     * @property _currentSelection
     * @type Range
     * @private
     */
    _currentSelection: null,

    /**
     * Add event listeners.
     *
     * @method initializer
     */

    initializer: function() {
        // If we don't have the capability to view then give up.
        if (this.get('disabled')) {
            return;
        }

        this.addButton({
            icon: 's3',
            iconComponent: COMPONENTNAME,
            callback: this._handleWordFileUpload,
            callbackArgs: 's3'
        });
        // this.editor.on('drop', this._handleWordFileDragDrop, this);
    },

    /**
     * Handle a Word file upload via the filepicker
     *
     * @method _handleWordFileUpload
     * @param {object} params The parameters provided by the filepicker.
     * containing information about the file.
     * @private
     * @return {boolean} whether the uploaded file is .docx
     */
    _handleWordFileUpload: function() {
        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('pluginname', COMPONENTNAME),
            focusAfterHide: true,
            width: 660
            // focusOnShowSelector: SELECTORS.URL_INPUT
        });

        dialogue.set('bodyContent', this._getDialogueContent(this.get('host').getSelection())).show();
        M.form.shortforms({formid: 'atto_s3_form'});
    },

    /**
     * Returns the dialogue content for the tool.
     *
     * @method _getDialogueContent
     * @param  {WrappedRange[]} selection Current editor selection
     * @return {Y.Node}
     * @private
     */
    _getDialogueContent: function(selection) {
        var context = {
            s3_player: this.get('s3_player'),
            s3_account: this.get('s3_account')
        };
        var content =  Y.Node.create(
            Y.Handlebars.compile(TEMPLATES)(context)
        );
        return this._attachEvents(content,selection);
    },
    /**
     * Attaches required events to the content node.
     *
     * @method _attachEvents
     * @param  {Y.Node}         content The content to which events will be attached
     * @param  {WrappedRange[]} selection Current editor selection
     * @return {Y.Node}
     * @private
     */
    _attachEvents: function(content, selection) {
        content.one('.submit').on('click', function(e) {
            e.preventDefault();
            var mediaHTML = this._getMediaHTMLs3(e.currentTarget.ancestor('.atto_form')),
                host = this.get('host');

            this.getDialogue({
                focusAfterHide: null
            }).hide();
            if (mediaHTML) {
                host.setSelection(selection);
                host.insertContentAtFocusPoint(mediaHTML);
                var event = new Event('s3insertedtodom');
                document.dispatchEvent(event);
                this.markUpdated();
            }
        }, this);

        return content;
    },
    /**
     * Returns the HTML to be inserted to the text area for the link tab.
     *
     * @method _getMediaHTMLLink
     * @param  {Y.Node} tab The tab from which to extract data
     * @return {String} The compiled markup
     * @private
     */
    _getMediaHTMLs3: function(tab) {
        var s3_width_unit = tab.one("#s3_width_unit").get('value') || 'px';
        var s3_width = tab.one("#s3_width").get('value') + s3_width_unit;
        var s3_height = tab.one("#s3_height").get('value') + s3_width_unit;
        var s3_sizing= document.querySelector('input[name="s3_sizing"]:checked').value;

        var context = {
            account_id: tab.one("#s3_accountid_entry").get('value'),
            video_id: tab.one("#s3_videoid_entry").get('value'),
            player_id: tab.one("#s3_playerid_entry").get('value')
        };
        if (s3_sizing === 'res') {
            context.s3_res_width = s3_width;
        }else {
            context.s3_width = s3_width;
            context.s3_height = s3_height;
        }
        return context.video_id ? Y.Handlebars.compile(IMAGETEMPLATE)(context) : '';
    }


}, {
    ATTRS: {
        disabled: {
            value: true
        },
        area: {
            value: {}
        },
        s3_player:{
            value: null
        },
        s3_account: {
            value: null
        }
    }
});


}, '@VERSION@');
