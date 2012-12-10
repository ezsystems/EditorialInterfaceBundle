// TODO: GLOBAL - apply sprite approach, when all resources will be set.
YUI.add('ez-editorial-interface', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.EditorialInterface class
     *
     * @module ez-editorial-interface
     */

    Y.namespace('eZ');

    var Lang = Y.Lang,
        pageBody = Y.one('body');

    /**
     * Constructor of the Y.eZ.EditorialInterface component. Y.eZ.EditorialInterface
     * extends <a href="http://yuilibrary.com/yui/docs/api/modules/widget.html">Y.Widget
     * documentation</a> for Y.Widget details.
     *
     * @class Y.eZ.EditorialInterface
     * @extends Widget
     * @constructor
     * @param {Object} config the configuration of the Editorial Interface
     *   @param {Number} [config.mobileBreakPoint] under this number of pixels
     *                   the interface is generated with the mobile layout
     *   @param {Object} [config.dependencies] overrides the default implementation
     *                   of components used by the editorial interface.
     */
    function eZEI(config) {
        eZEI.superclass.constructor.apply(this, arguments);

        this.CONTENT_TEMPLATE = null;

        this._operationSwitcher = null;
        this._deviceSelector = null;
        this._targetingOverlay = null;
        this._focusedOverlay = null;
        this._formEditor = null;
        this._leftSidePanel = null;
        this._rightSidePanel = null;
        this._structureInspector = null;
        this._assetsManager = null;
    }

    eZEI.NAME = 'editorialInterface';
    eZEI.CSS_PREFIX = 'ez-ei';

    eZEI.ATTRS = {
        /**
         * Stores the width under which the mobile mode is used
         *
         * @attribute mobileBreakPoint
         * @default 960
         * @type Number
         */
        mobileBreakPoint: {
            value: 960,
            validator: Lang.isNumber,
            writeOnce: true
        },

        /**
         * Holds the dependencies of the Y.eZ.EditorialInterface object and
         * the necessary configuration to instantiate each objects.
         * This allows to inject custom implementation or to tweak the
         * configuration of each widget used by the editorial interface.
         * Warning: this does NOT check if the custom class are correct
         * or not (ie implement the correct methods)
         *
         * @attribute dependencies
         * @type {Object}
         */
        dependencies: {
            value: {
                operationSwitcherMobile: {
                    constructor: Y.eZ.SwitchesSlider,
                    config: {
                        srcNode: '.ez-ei-operational-mode-switch'
                    }
                },
                operationSwitcher: {
                    constructor: Y.eZ.Switches,
                    config: {
                        srcNode: '.ez-ei-operational-mode-switch'
                    }
                },
                deviceDropdown: {
                    constructor: Y.eZ.Dropdown,
                    config: {
                        srcNode: '.ez-ei-device-selector'
                    }
                },
                targetingOverlay: {
                    constructor: Y.eZ.Overlay,
                    config: {
                        srcNode: '.ez-ei-content-wrapper'
                    }
                },
                focusedOverlay: {
                    constructor: Y.eZ.FocusedOverlay,
                    config: {
                        srcNode: '.ez-ei-content-inner-wrapper'
                    }
                },
                FOlanguageDropdown: {
                    constructor: Y.eZ.Dropdown,
                    config: {
                        srcNode: '.ez-ei-focused-overlay-language-selector'
                    }
                },
                FOversionDropdown: {
                    constructor: Y.eZ.Dropdown,
                    config: {
                        srcNode: '#ez-ei-focused-overlay-version-selector'
                    }
                },
                formEditor: {
                    constructor: Y.eZ.FormEditor,
                    config: {
                        srcNode: '.ez-ei-working-bench'
                    }
                },
                FElanguageDropdown: {
                    constructor: Y.eZ.Dropdown,
                    config: {
                        srcNode: '.ez-ei-form-editor-language-selector'
                    }
                },
                FEversionDropdown: {
                    constructor: Y.eZ.Dropdown,
                    config: {
                        srcNode: '#ez-ei-form-editor-version-selector'
                    }
                },
                leftSidePanel: {
                    constructor: Y.eZ.SidePanel,
                    config: {
                        srcNode: '#ez-ei-side-panel-left'
                    }
                },
                rightSidePanel: {
                    constructor: Y.eZ.SidePanel,
                    config: {
                        srcNode: '#ez-ei-side-panel-right',
                        mode: 'right'
                    }
                },
                structureInspector: {
                    constructor:Y.eZ.StructureInspector,
                    config: {
                        srcNode: '#ez-ei-structure-inspector'
                    }
                },
                assetsManager: {
                    constructor:Y.eZ.AssetsManager,
                    config: {
                        srcNode: '#ez-ei-side-panel-right'
                    }
                }
            },
            setter: function (val) {
                return Y.merge(eZEI.ATTRS.dependencies.value, val);
            },
            writeOnce: true
        }
    };

    eZEI.HTML_PARSER = {

    };

    Y.extend(eZEI, Y.Widget, {

        initializer: function () {

            // Appending CSS styles
            var that = this;
            Y.Get.css('nein-data/nein-css/nein-reset.css');
            Y.Get.css('nein-data/nein-css/nein-composition.css', function () {
                that.appear();
            });

            // Creating and filling wrappers
            var rootHTMLNodes = pageBody.get('children');
            var that = this;

            this.workingBench = Y.Node.create('<div class="ez-ei-working-bench"></div>');
            this.ruler = Y.Node.create('<div class="ez-ei-linear"></div>');
            this.contentWrapper = Y.Node.create('<div class="ez-ei-content-wrapper"></div>');
            this.contentInnerWrapper = Y.Node.create('<div class="ez-ei-content-inner-wrapper"></div>');

            this.contentWrapper.appendChild(this.contentInnerWrapper);
            this.workingBench.appendChild(this.ruler);
            this.workingBench.appendChild(this.contentWrapper);
            pageBody.appendChild(this.workingBench);

            rootHTMLNodes.each(function (rootNode, index){
                // TEMP: ignore ghosts and mummies
                if (!rootNode.hasClass('ezp-nein')) {
                    rootNode.remove(false);
                    that.contentInnerWrapper.appendChild(rootNode);
                }
            });

            // Generating controls nodes and injecting them into DOM
            var neinHeaderTemplateSource   = Y.one('#ezp-nein-header').getHTML(),
                neinHeaderTemplate = Y.Handlebars.compile(neinHeaderTemplateSource),
                neinLeftAsideTemplateSource = Y.one('#ezp-nein-left-aside').getHTML(),
                neinLeftAsideTemplate = Y.Handlebars.compile(neinLeftAsideTemplateSource),
                neinRightAsideTemplateSource = Y.one('#ezp-nein-right-aside').getHTML(),
                neinRightAsideTemplate = Y.Handlebars.compile(neinRightAsideTemplateSource);

            pageBody.appendChild(neinHeaderTemplate({
            }));

            pageBody.append(neinLeftAsideTemplate({
            }));

            pageBody.append(neinRightAsideTemplate({
                dialogButtons: [
                    {action: "cancel", label: "Cancel"},
                    {action: "upload", label: "Upload"}
                ]
            }));

        },

        destructor: function () {
            this._operationSwitcher = null;
            this._deviceSelector = null;
            this._targetingOverlay = null;
            
            this._focusedOverlay = null;
            this._FOlanguageDropdown = null;
            this._FOversionDropdown = null;
        },

        renderUI: function () {
            // for now not using mobile switcher
            this._operationSwitcher = this._getInstance('operationSwitcher');

            this._deviceSelector = this._getInstance('deviceDropdown');
            this._targetingOverlay = this._getInstance('targetingOverlay');

            this._focusedOverlay = this._getInstance('focusedOverlay');
            this._formEditor = this._getInstance('formEditor');

            this._leftSidePanel = this._getInstance('leftSidePanel');
            this._rightSidePanel = this._getInstance('rightSidePanel');

            this._structureInspector = this._getInstance('structureInspector');
            this._assetsManager = this._getInstance('assetsManager');

            this._prepareFeatures();
        },

        bindUI: function () {
            var that = this;
            this._deviceSelector.on('updateTrigger', function (e) {
                var n = this.get('selectedValueNode'),
                    selected = this.get('selected'),
                    selectedValue = selected.getAttribute('data-value');
                if ( Lang.isObject(n) && Lang.isObject(selected) ) {
                    e.preventDefault();
                    n.setAttribute('data-icon', selectedValue);
                }

                // Capital letter "O"
                if (selectedValue != 'O'){
                    that._notImplementedLinkClick(e);
                }

//                this._notImplementedLinkClick(null);
            });

            var that = this;
            this._operationSwitcher.on('switch', function (e) {
                console.log('Switched from', e.prevVal, 'to', e.newVal);
                
                // Not very "clean" solution - storing control values in script,
                // much better to use constants list common to HTML generator and JS or smth like that.
                // It's a prototype, though AP
                if (e.newVal == 'edit') {
                    that._targetingOverlay.showOverlays(1,'');
                    that._leftSidePanel.appear();
                    that._rightSidePanel.appear();
                    that._assetsManager.update();
                }
                else {
                    that._leftSidePanel.disappear();
                    that._rightSidePanel.disappear();
                    that._targetingOverlay.hideOverlays();
                    that._focusedOverlay.hideFocusedOverlay();
                }

                //

            });

            Y.one('.ez-ei-header').delegate('click', this._logoutLinkClick, '.ez-ei-logout',this);
            Y.one('.ez-ei-header-main-navigation').delegate('click', this._notImplementedLinkClick, 'ul li:not([class]) a');

            Y.on('windowresize', Y.bind('_prepareFeatures', this));
            
            Y.on('overlay:overlayClicked', this._dispatchTargetOverlayClick, this);
            Y.on('focusedOverlay:close', this._dispatchFocusedOverlayClose, this);
            Y.on('focusedOverlay:onCreate', this._dispatchFocusedOverlayOnCreate, this);
            Y.on('focusedOverlay:editLinkClicked', this._dispatchFocusedOverlayEditLinkClicked, this);
            Y.on('formEditor:onCreate', this._dispatchFormEditorOnCreate, this);
            Y.on('formEditor:close', this._dispatchFormEditorClose, this);
            Y.on('formEditor:overlayClicked', this._dispatchFormEditorOverlayClicked, this);
            Y.on('formEditor:topNavigationReturn', this._dispatchFormEditorTopNavigationReturn, this);
            Y.on('sidePanel:move', this._dispatchSidePanelMove, this);
            Y.on('structureInspector:pageClicked', this._dispatchStructureInspectorPageClick, this);
            
            
        },

        syncUI: function () {
            this._operationSwitcher.render();
            this._deviceSelector.render();
            
        },

        appear: function () {
            var headerNode = Y.one('.ez-ei-header'),
                htmlNode = Y.one('html.ezp-user-logged-in'),
                headerHeight = headerNode.get('offsetHeight'),
                that = this;
            headerNode.setStyle( 'marginTop', -headerHeight );
            htmlNode.setStyle( 'marginTop', 0 );

            headerNode.transition({
                    marginTop:{
                        duration: 0.8,
                        value: 0
                    }
                }
            );

            htmlNode.transition({
                    marginTop:{
                        duration: 0.8,
                        value: headerHeight + 'px'
                    },
                    marginLeft:{
                        duration: 0.8,
                        value: '30px'
                    }
                }, function(){
                    that._setContentWrapper();
                }
            );


        },

        _setContentWrapper: function () {
        // need this function to setup scrollable wrapper, where site's content is shown

            // running this function without native css is not useful (even dangerous(a little bit :))
            if (!Y.one('link[href="nein-data/nein-css/nein-composition.css"]')) {
                return false;
            }

            // header
            var headerNode = Y.one('.ez-ei-header');
            headerNode.setStyles({
               'marginTop' : 0
            });            

            // html
            Y.one('html.ezp-user-logged-in').setStyles({
               'marginTop' : parseInt(headerNode.getComputedStyle('height'),10) + 10
            });

            var workingBench = Y.one('.ez-ei-working-bench');
            var contentWrapper = Y.one('.ez-ei-content-wrapper');
            var contentInnerWrapper = Y.one('.ez-ei-content-inner-wrapper');
            
            var workingBenchPaddingTop = parseInt(workingBench.getStyle('paddingTop'),10);
            var workingBenchPaddingBottom = parseInt(workingBench.getStyle('paddingBottom'),10);

            var htmlMarginsVertical = parseInt((Y.one('html')).getStyle('marginTop'),10) + parseInt((Y.one('html')).getStyle('marginBottom'),10);
            var workingBenchPaddingsVertical = workingBenchPaddingTop + workingBenchPaddingBottom;

            var workingHeight = this._getWinHeight() - htmlMarginsVertical - workingBenchPaddingsVertical;

            this._centralizeModeSwitch();
            this._formEditor.syncFormEditor();


            // resetting inner wrapper minwidth before applying width changes to wrapper
            contentInnerWrapper.setStyles({
                minWidth: 0
            });

            workingBench.setStyles({
                height: workingHeight
            });

            // left side panel
            var leftPanel = Y.one('#ez-ei-side-panel-left');
            leftPanel.setStyles({
                'marginLeft' : 0,
                'marginTop' : parseInt(headerNode.getComputedStyle('height'),10) + 10,
                height: workingHeight + 20
            });

            // right side panel
            var rightPanel = Y.one('#ez-ei-side-panel-right');
            rightPanel.setStyles({
                'marginLeft' : 0,
                'marginTop' : parseInt(headerNode.getComputedStyle('height'),10) + 10,
                height: workingHeight + 20
            });

            // applying new minwidth to inner wrapper to avoid background breaking with horizontal scroll
            contentInnerWrapper.setStyles({
                minWidth: parseInt(contentWrapper.get('scrollWidth'),10)
            });

            contentWrapper.setStyles({
                height: workingHeight,
                width: parseInt(workingBench.getStyle('width'),10)
            });

        },

        _prepareFeatures: function () {
            
            if ( this._useMobileLayout() ) {
                this._prepareMobileFeatures();
            } else {
                this._setContentWrapper();
                // setting properties for the wrappers around site content (as we want to keep original site enclosed inside there)
            }
            
            this._targetingOverlay.syncOverlays();
            this._focusedOverlay.syncFocusedOverlay();
            this._formEditor.syncFormEditor();
            this._leftSidePanel.syncPanel();
            this._rightSidePanel.syncPanel();
        },


        _prepareMobileFeatures: function () {

            var neinNavigationBar = Y.one('header.ez-ei-header');
            // It's the bar with navigation between different sections of the interface, should scroll off on mobile

            var viewSettingsBar = Y.one('.ez-ei-operational-mode-switch');
            // This bar (or part of it on a large display) holds language and view switches, it should stay fixed to top on mobile

            var scrollableBarsHeight = parseInt(neinNavigationBar.getStyle('height'));
            // if this number is exceeded by y-scrolling, the view SettingsBar should git fixed to the top (instead of absolute positioning)

            Y.on('scroll', Y.bind('_handleScroll', this, viewSettingsBar, scrollableBarsHeight));
            
            var htmlNode = Y.one('html.ezp-user-logged-in'),
                headerNode = Y.one('.ez-ei-header')

            htmlNode.setStyles({
               'marginTop' : parseInt(headerNode.getComputedStyle('height'),10) + 10
            });            
            headerNode.setStyles({
               'marginTop' : -parseInt(headerNode.getComputedStyle('height'),10) - 10
            });            
            
            
            // resetting inner wrapper minwidth for mobile version
            var contentInnerWrapper = Y.one('.ez-ei-content-inner-wrapper'),
            contentWrapper = Y.one('.ez-ei-content-wrapper');
            contentInnerWrapper.setStyles({
                minWidth: 0
            });
            contentWrapper.setStyles({
               width: 'auto'  
            });

            
        },
        
        _centralizeModeSwitch: function () {
            var switchContainerNode = Y.one('.ez-ei-switch-container'),
                navigationElements = Y.all('.ez-ei-header-main-navigation > ul > li, .ez-ei-free-drop-down'),
                navigationElementsWidthSum = 0,
                switchContainerNodeWidth = parseInt(switchContainerNode.getComputedStyle('width'),10),
                parentWidth = (switchContainerNode.get('parentNode')).get('offsetWidth');
                
            navigationElements.each(function (node){
                navigationElementsWidthSum += this.get('offsetWidth');
            });
            
            
            var freeSpace = (parentWidth - navigationElementsWidthSum);
            var paddingModifier = (freeSpace / 2) - (switchContainerNodeWidth);
            switchContainerNode.setStyle('paddingLeft', paddingModifier + 'px');
        },

        _handleScroll: function (viewSettingsBar, scrollableBarsHeight) {
            if ( viewSettingsBar.get('docScrollY') > scrollableBarsHeight ) {
                viewSettingsBar.addClass('ez-ei-fixed');
            } else {
                viewSettingsBar.removeClass('ez-ei-fixed');
            }
        },

        /**
         * Instantiates the dependency identified by the key parameter
         *
         * @method _getInstance
         * @private
         * @param key {String} the dependency key to instantiate,
         *          see attribute dependencies
         * @return {Object} an instance of the dependency or null
         */
        _getInstance: function (key) {
            var c = this.get('dependencies.' + key);
            if ( !Lang.isObject(c) || !Lang.isFunction(c.constructor) ) {
                
                return null;
            }
            return new c.constructor(Lang.isObject(c.config) ? c.config : {});
        },

        /**
         * Check whether we should generate the interface for mobile
         * or not
         *
         * @method _useMobileLayout
         * @private
         * @return {Boolean}
         */
        _useMobileLayout: function () {
            return (this._getWinWidth() < this.get('mobileBreakPoint'));
        },

        /**
         * Returns the current width of the view port
         *
         * @method _getWinWidth
         * @private
         * @return {Number}
         */
        _getWinWidth: function () {
            return pageBody.get('winWidth');
       },


        /**
         * Returns the current height of the view port
         *
         * @method _getWinHeight
         * @private
         * @return {Number}
         */
        _getWinHeight: function () {
            return pageBody.get('winHeight');
        },

        /********************
         * EVENTS
         *
         */

        _logoutLinkClick: function (e) {
            e.preventDefault();

            // Restoring HTML styles
            Y.one('html.ezp-user-logged-in').transition({
                margin:{
                    delay: 0.2,
                    duration: 0.6,
                    value: '0px'
                }
            });

            // Removing CSS links
            Y.one('link[href="nein-data/nein-css/nein-reset.css"]').remove('true');
            Y.one('link[href="nein-data/nein-css/nein-composition.css"]').remove('true');

            // Removing controls nodes
            Y.one('#ez-ei-side-panel-left').remove(true);
            Y.one('#ez-ei-side-panel-right').remove(true);
            Y.one('.ez-ei-header').remove(true);

            // Moving actual content outside of the content wrappers
            var contentNodes = this.contentInnerWrapper.get('children');
            contentNodes.each(function (contentNode){
                if (!contentNode.hasClass('ez-ei-focused-overlay')){
                    pageBody.append(contentNode);
                }
            });

            // Erasing the content wrappers
            this.workingBench.remove(true);
        },

        _notImplementedLinkClick: function (e) {
            e.preventDefault();
            alert('Not implemented yet!');
        },

        /********************
        * DISPATCHERS
        *
        */

        _dispatchTargetOverlayClick: function (e, overlayTargetNode) {
            
            this._focusedOverlay.hideFocusedOverlay();

            if (overlayTargetNode.hasAttribute("data-ez-field-type-identifier")) {
                // Leaf node
                this._targetingOverlay.showOverlays();

                this._formEditor.showFormEditor(overlayTargetNode);
            }
            else {
                // Branch node
                this._focusedOverlay.showFocusedOverlay(overlayTargetNode);
                this._targetingOverlay.showOverlays(
                    parseInt(overlayTargetNode.getAttribute('data-ez-editable-region-level'),10) + 1,
                    overlayTargetNode.getAttribute('id'),
                    overlayTargetNode.getAttribute('data-ez-editable-region-marker')
                );

                if (this._formEditor.flagVisible) {
                    this._formEditor.showFormEditor(overlayTargetNode);
                }
            }

            this._structureInspector.update(overlayTargetNode);
                
        },
        
        _dispatchFocusedOverlayClose: function (e) {
            this._focusedOverlay.hideFocusedOverlay();
            this._targetingOverlay.showOverlays();

            this._structureInspector.update(null);
              
        },

        _dispatchFocusedOverlayOnCreate: function (e) {
            this._FOlanguageDropdown = this._getInstance('FOlanguageDropdown');
            this._FOversionDropdown = this._getInstance('FOversionDropdown');
            this._FOlanguageDropdown.render();
            this._FOversionDropdown.render();
              
            this._FOlanguageDropdown.on('change', function (e) {
                console.log(
                    'FO Language selector change from', e.prevVal.getContent(),
                    'to', e.newVal.getContent()
                );
            });
              
        },
        _dispatchFormEditorOnCreate: function (e) {
            this._FElanguageDropdown = this._getInstance('FElanguageDropdown');
            this._FEversionDropdown = this._getInstance('FEversionDropdown');
            this._FElanguageDropdown.render();
            this._FEversionDropdown.render();
              
            this._FElanguageDropdown.on('change', function (e) {
                console.log(
                    'FE Language selector change from', e.prevVal.getContent(),
                    'to', e.newVal.getContent()
                );
            });
              
        },
        
        _dispatchFocusedOverlayEditLinkClicked: function (e, focusedOverlayTargetNode) {
            
            this._focusedOverlay.hideFocusedOverlay();
            this._targetingOverlay.showOverlays();
            
            this._formEditor.showFormEditor(focusedOverlayTargetNode);
        },
        
        _dispatchFormEditorClose: function (e) {
            this._formEditor.hideFormEditor();
            this._focusedOverlay.hideFocusedOverlay();
            this._targetingOverlay.showOverlays();

            this._structureInspector.update(null);
        },
        
        _dispatchFormEditorOverlayClicked: function (e, overlayTargetNode) {
            this._formEditor.showFormEditor(overlayTargetNode);

            this._structureInspector.update(overlayTargetNode);
        },
        
        _dispatchFormEditorTopNavigationReturn: function (e, formEditorTargetNode) {
            
            this._formEditor.hideFormEditor();
            
            this._setContentWrapper();
            
            //TODO: if no targeting overlays to show (already a leaf), find the leaf's parent and show it instead.
            this._focusedOverlay.showFocusedOverlay(formEditorTargetNode);
            this._targetingOverlay.showOverlays(
                parseInt(formEditorTargetNode.getAttribute('data-ez-editable-region-level'),10) + 1,
                formEditorTargetNode.getAttribute('id'),
                formEditorTargetNode.getAttribute('data-ez-editable-region-marker')
            );
        },
        
        _dispatchSidePanelMove: function (e) {

            this._setContentWrapper();
            
            this._targetingOverlay.syncOverlays();
            this._focusedOverlay.syncFocusedOverlay();
        },

        _dispatchStructureInspectorPageClick: function (e) {

            this._formEditor.hideFormEditor();
            this._focusedOverlay.hideFocusedOverlay();
            this._targetingOverlay.showOverlays();

            this._structureInspector.update(null);
        }


    });

    Y.eZ.EditorialInterface = eZEI;

}, '0.2alpha', ['event', 'event-custom', 'node-screen', 'node-style', 'widget', 'selector-css3', 'transition', 'ez-switches']);
