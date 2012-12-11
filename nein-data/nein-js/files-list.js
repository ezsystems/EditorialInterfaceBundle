YUI.add('ez-files-list', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.FilesList class
     *
     * @module ez-FilesList
     */

    Y.namespace('eZ');
    var Lang = Y.Lang;


    /**
     * Visual Representation of files list, with previews whenever possible.
     * Several modes supported
     *
     * @class Y.eZ.FilesList
     * @extends Widget
     * @construct
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode
     */
    function eZFilesList(config) {
        eZFilesList.superclass.constructor.apply(this, arguments);
    }

    eZFilesList.NAME = 'files-list';
    eZFilesList.CSS_PREFIX = "ez-ei";

    eZFilesList.ATTRS = {

    };

    eZFilesList.HTML_PARSER = {
    };

    Y.extend(eZFilesList, Y.Widget, {

        initializer: function () {

//            var singleFileTemplateSource = Y.one('#ezp-nein-single-file').getHTML();
//            this.singleFileTemplate = Y.Handlebars.compile(singleFileTemplateSource);

            this.sourceNode = this.get("srcNode");
        },

        destructor: function () {
        },

        renderUI: function () {
        },

        bindUI: function () {
        },

        syncUI: function () {
        },

        update: function (focusedNode) {

            this.sourcNode.empty();
            this.sourceNode.append("Files List!");

        },

        _syncNodes: function () {

            var cssPrefix = eZFilesList.CSS_PREFIX;

        },

        /// EVENTS
        _fileClick: function (e){
            e.preventDefault();
            alert("Not implemented yet!");
        }


    });

    Y.eZ.FilesList = eZFilesList;

}, '0.1alpha', ['widget']);