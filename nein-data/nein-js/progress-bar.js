YUI.add('ez-progress-bar', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.ProgressBar class
     *
     * @module ez-progress-bar
     */

    Y.namespace('eZ');

    var Lang = Y.Lang;


    /**
     *  Widget is generating simple progress bar with palette adjustable via CSS.
     *
     *
     * @class Y.eZ.ProgressBar
     * @extends Widget
     * @construct
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode - position of breadcrumbs visual
     *   @param {Color} config.focusedNode - the region we want to build the "path" to.
     */
    function eZProgressBar(config) {
        eZProgressBar.superclass.constructor.apply(this, arguments);
    }

    eZProgressBar.NAME = 'progress-bar';
    eZProgressBar.CSS_PREFIX = "ez-ei";

    eZProgressBar.ATTRS = {

    };

    eZProgressBar.HTML_PARSER = {
    };

    Y.extend(eZProgressBar, Y.Widget, {

        initializer: function () {

            var cssPrefix = eZProgressBar.CSS_PREFIX,
                progressBarTemplateSource = Y.one('#ezp-nein-progress-bar').getHTML(),
                progressBarTemplate = Y.Handlebars.compile(progressBarTemplateSource);
            this.sourceNode = this.get("srcNode");
            this.sourceNode.append(progressBarTemplate());

            this.theBar = Y.one('.ez-ei-media-progress-bar');

        },

        destructor: function () {
        },

        renderUI: function () {
        },

        bindUI: function () {
        },

        syncUI: function () {
        },

        update: function (progress) {

            this.theBar.setStyle('width', progress + '%');

            if (progress == 100) {
                this.theBar.addClass('completed');
            } else {
                this.theBar.removeClass('completed');
            }

        },

        startSimpleProgress: function () {

            // just a running "loader", without distinct progress value

        },

        stopSimpleProgress: function () {



        },


        _syncNodes: function () {

        }

    });

    Y.eZ.ProgressBar = eZProgressBar;

}, '0.1alpha', ['widget']);
