YUI.add('ez-breadcrumbs', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.Breadcrumbs class
     *
     * @module ez-breadcrumbs
     */

    Y.namespace('eZ');

    var Lang = Y.Lang;


    /**
     *  Widget which receives source(some node in interface) and focused(some node in the content) nodes as parameters and builds breadcrumbs navigation
     *  via the whole hierarchy of region's parents.
     *  Creates clickable path to the region indicating it's every ancestor.
     *
     *
     *
     *
     * @class Y.eZ.Breadcrumbs
     * @extends Widget
     * @construct
     * @param {Object} config the configuration of the widget
     *   @param {String} config.callerID - unique ID of widget, that is calling up (to separate BCs on the same page)
     *   @param {Node} config.srcNode - position of breadcrumbs visual
     *   @param {Node} config.focusedNode - the region we want to build the "path" to.
     *   @param {Function} config.linkClickCallback - callback we should call when user clicks on a BC link.
     *   @param {Function} config.focusedNode - callback we should call when user clicks on closing link.
     */
    function eZBreadcrumbs(config) {
        eZBreadcrumbs.superclass.constructor.apply(this, arguments);
    }

    eZBreadcrumbs.NAME = 'breadcrumbs';
    eZBreadcrumbs.CSS_PREFIX = "ez-ei";

    eZBreadcrumbs.ATTRS = {

        callerID:{
            value: ""
        },
        focusedNode:{
            value: ""
        },
        linkClickCallback:{
            value: ""
        },
        closeClickCallback:{
            value: ""
        },

        breadCrumbsCloseLinkId:{
            value: '-breadcrumbs-close'
        },
        breadCrumbsId:{
            value: '-breadcrumbs'
        },
        breadCrumbsRootId:{
            value: '-breadcrumbs-root'
        },
        breadCrumbsPathId:{
            value: '-breadcrumbs-path'
        },
        breadCrumbsPathStepClass:{
            value: '-breadcrumbs-path-step'
        },
        breadCrumbsPlugId:{
            value: '-breadcrumbs-plug'
        },
        breadCrumbsCurrentId:{
            value: '-breadcrumbs-current'
        },
        breadCrumbsLinkClass:{
            value: '-breadcrumbs-link'
        }


    };

    eZBreadcrumbs.HTML_PARSER = {
    };

    Y.extend(eZBreadcrumbs, Y.Widget, {

        initializer: function () {

            var cssPrefix = eZBreadcrumbs.CSS_PREFIX,
                breadcrumbsTemplateSource = Y.one('#ezp-nein-dialog-breadcrumbs').getHTML(),
                breadcrumbsTemplate = Y.Handlebars.compile(breadcrumbsTemplateSource),
                breadcrumbsStepTemplateSource = Y.one('#ezp-nein-dialog-breadcrumbs-step').getHTML();

            this.breadcrumbsStepTemplate = Y.Handlebars.compile(breadcrumbsStepTemplateSource);
            this.showOnlyMarkers = false;
            this.focusedNode = this.get("focusedNode");

            this._linkClickCallback = this.get("linkClickCallback"); // Storage for callback we should call, when user clicks on a BC link
            this._closeClickCallback = this.get("closeClickCallback"); // Storage for callback we should call, when user clicks on a closing link

            this.uniqueClass = "for-" + this.get("callerID");

            this.sourceNode = this.get("srcNode");
            this.sourceNode.setHTML(breadcrumbsTemplate({
                cssPrefix: cssPrefix,
                uniqueClass: this.uniqueClass
            }));

            this.sourceNode.delegate('click', this._linkClick ,'.' + cssPrefix + this.get('breadCrumbsLinkClass') + '.' + this.uniqueClass, this );
            this.sourceNode.delegate('click', this._closeClick ,'.' + cssPrefix + this.get("breadCrumbsCloseLinkId") + '.' + this.uniqueClass, this );
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

            this.focusedNode = focusedNode;

            var breadCrumbsNode = Y.one('.' + eZBreadcrumbs.CSS_PREFIX + this.get('breadCrumbsId') + '.' + this.uniqueClass),
                breadCrumbsCurrentNode = Y.one('.' + eZBreadcrumbs.CSS_PREFIX + this.get('breadCrumbsCurrentId') + '.' + this.uniqueClass);

            this.showOnlyMarkers = false;
            this._syncNodes();

            // checking if all breadcrumbs text fits:
            if (breadCrumbsCurrentNode.getY() > breadCrumbsNode.getY() ){
                this.showOnlyMarkers = true;
                this._syncNodes();
            }
        },

        _syncNodes: function () {

            var cssPrefix = eZBreadcrumbs.CSS_PREFIX,
                breadCrumbsPathNode = Y.one('.' + cssPrefix + this.get('breadCrumbsPathId') + '.' + this.uniqueClass),
                breadCrumbsCurrentNode = Y.one('.' + cssPrefix + this.get('breadCrumbsCurrentId') + '.' + this.uniqueClass),
                breadCrumbsPlugNode = Y.one('.' + cssPrefix + this.get('breadCrumbsPlugId') + '.' + this.uniqueClass);

            breadCrumbsPathNode.empty();

            breadCrumbsCurrentNode.setHTML(this.focusedNode.getAttribute('data-ez-editable-region-marker') + '. ' + this.focusedNode.getAttribute('data-ez-field-identifier'));

            var parentNode = Y.one('#' + this.focusedNode.getAttribute('data-ez-editable-region-parent')),
                currentNode;

            while (parentNode)
                {
                currentNode = parentNode;

                var textLabel = (this.showOnlyMarkers)?'':' ' + currentNode.getAttribute('data-ez-field-identifier');

                breadCrumbsPathNode.prepend(Y.Node.create(this.breadcrumbsStepTemplate({
                    cssPrefix: cssPrefix,
                    uniqueClass: this.uniqueClass,
                    rel: currentNode.getAttribute('id'),
                    marker: currentNode.getAttribute('data-ez-editable-region-marker'),
                    label: textLabel
                })));

                parentNode = Y.one('#' + currentNode.getAttribute('data-ez-editable-region-parent'));
                }

            // controlling "Page" link to be always white.
            if ( this.focusedNode.getAttribute('data-ez-editable-region-parent') ) {
                breadCrumbsPlugNode.removeClass('white');
            }
            else {
                breadCrumbsPlugNode.addClass('white');
            }
        },

        /// EVENTS
        _linkClick: function (e){
            e.preventDefault();
            var clickedLink = e.currentTarget._node;
            this._linkClickCallback( Y.one( '#' + clickedLink.getAttribute("rel")) );
        },
        _closeClick: function (e){
            e.preventDefault();
            this._closeClickCallback();

        }

    });

    Y.eZ.Breadcrumbs = eZBreadcrumbs;

}, '0.1alpha', ['widget']);
