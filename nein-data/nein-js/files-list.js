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
        phpDisabled: {
            value : false
        },
        mode: {
            value : "tiles"
        }
    };

    eZFilesList.HTML_PARSER = {
    };

    Y.extend(eZFilesList, Y.Widget, {

        initializer: function () {

            this.mode = this.get("mode");

            var singleFileTemplateSource = Y.one('#ezp-nein-single-file').getHTML(),
                singleImageFileTemplateSource = Y.one('#ezp-nein-single-image-file').getHTML(),
                singleStringTemplateSource = Y.one('#ezp-nein-single-string').getHTML();
            this.singleFileTemplate = Y.Handlebars.compile(singleFileTemplateSource);
            this.singleImageFileTemplate = Y.Handlebars.compile(singleImageFileTemplateSource);
            this.singleStringTemplate = Y.Handlebars.compile(singleStringTemplateSource);

            this.sourceNode = this.get("srcNode");
            this.phpDisabled = this.get("phpDisabled");

            this.update();
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
            this._syncNodes();
        },

        switchMode: function (newMode){
            this.mode = newMode;
            this.update();
        },

        _syncNodes: function () {

            var cssPrefix = eZFilesList.CSS_PREFIX,
                that = this;

            this.sourceNode.empty();

            if (this.phpDisabled){
                return false;
            }

            Y.io('/nein-data/files.php', {
                method: 'GET',
                on: {
                    success: function (id, result) {
                        var json = Y.JSON.parse(result.responseText),
                            stringOddity = 'odd';
                        Y.Array.each(json.files, function (file) {

                            var singleFileNode;

                            switch (that.mode){
                                case 'tiles':
                                    switch (file.type){
                                        case 'image':
                                            singleFileNode = that.singleImageFileTemplate({
                                                name: file.name,
                                                src: '/nein-data/uploads/' + file.name
                                            });
                                            break;
                                        default :
                                            singleFileNode = that.singleFileTemplate({
                                                name: file.name
                                            });
                                            //TODO: add custom class for every supported file type.
                                            break;
                                    }
                                    break;

                                case 'table':
                                    singleFileNode = that.singleStringTemplate({
                                        name: file.name,
                                        class: stringOddity
                                    });
                                    break;

                            }

                            that.sourceNode.append(singleFileNode);
                            stringOddity = stringOddity == 'odd' ? 'even' : 'odd';

                        });
                    }
                }
            });
        },

        /// EVENTS
        _fileClick: function (e){
            e.preventDefault();
            alert("Not implemented yet!");
        }


    });

    Y.eZ.FilesList = eZFilesList;

}, '0.1alpha', ['widget']);
