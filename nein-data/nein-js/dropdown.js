YUI.add('ez-dropdown', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.Dropdown class
     *
     * @module ez-dropdown
     */

    Y.namespace('eZ');

    var Lang = Y.Lang;

    var EVT_UPDATE_TRIGGER = 'updateTrigger',
        EVT_CHANGE = 'change';

    var DISABLED = 'disabled';

    /**
     * Constructor of the Y.eZ.Dropdown component. Y.eZ.Dropdown extends Y.Widget.
     * See <a href="http://yuilibrary.com/yui/docs/api/modules/widget.html">Y.Widget
     * documentation</a> for details.
     *
     * Y.eZ.Dropdown provides a way to select a value amongst several with a rich UI.
     * The minimum required markup is the following:
     *
     *      <div class="dropdown">
     *          <a href="#" class="ez-ei-dropdown-trigger ez-ei-dropdown-selected-value">
     *          The value
     *          </a>
     *          <ul class="ez-ei-dropdown-options">
     *              <li data-value="A value" class="ez-ei-dropdown-option">A rich representation value</li>
     *              <li data-value="The value" class="ez-ei-dropdown-option ez-ei-dropdown-selected">The rich representation value</li>
     *              <li data-value="Another value" class="ez-ei-dropdown-option">Another rich representation value</li>
     *          </ul>
     *      </div>
     *
     * When clicking on the .ez-ei-dropdown-trigger element, the .dropdown element gets
     * the class ez-ei-dropdown-open. The elements with .ez-ei-dropdown-option are
     * selectable. By default, when a selectable element is clicked, the .ez-ei-selected-value
     * element is filled with the content of the data-value attribute. This behaviour can
     * be changed with the 'updateTrigger' event.
     *
     * @class Y.eZ.Dropdown
     * @extends Widget
     * @construct
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode the Node where to find the HTML structure (see above)
     */
    function eZDD(config) {
        eZDD.superclass.constructor.apply(this, arguments);
    }

    eZDD.NAME = 'dropdown';
    eZDD.CSS_PREFIX = "ez-ei-" + eZDD.NAME;

    eZDD.ATTRS = {
        /**
         * NodeList of the selectable elements ie the ones with
         * the class .ez-ei-dropdown-option
         *
         * @attribute options
         * @default null
         * @type NodeList
         */
        options: {
            value: null
        },

        /**
         * Contains a reference to the current selected element, ie
         * the one with the class ez-ei-dropdown-selected
         *
         * @attribute selected
         * @default null
         * @type Node
         */
        selected: {
            value: null
        },

        /**
         * Contains a reference to the node where the selected element is
         * rendered, ie the node with the class ez-ei-dropdown-selected-value
         *
         * @attribute selectedValueNode
         * @default null
         * @type Node
         */
        selectedValueNode: {
            value: null
        },

        /**
         * Contains a reference to the node on which a click triggers the
         * opening of the widget (ie has the class ez-ei-dropdown-trigger
         *
         * @attribute trigger
         * @default null
         * @type Node
         */
        trigger: {
            value: null
        },

        /**
         * Contains the current opening state of the dropdown
         *
         * @attribute open
         * @default false
         * @type Boolean
         */
        open: {
            value: false,
            validator: Lang.isBoolean
        }
    };

    eZDD.HTML_PARSER = {
        options: ['.ez-ei-dropdown-option'],
        selected: '.ez-ei-dropdown-selected',
        selectedValueNode: '.ez-ei-dropdown-selected-value',
        trigger: '.ez-ei-dropdown-trigger',
        open: function (srcNode) {
            return srcNode.hasClass(this.getClassName('open'));
        }
    };

    Y.extend(eZDD, Y.Widget, {
        initializer: function () {

            Y.log(this.get('trigger'));

            this.publish(EVT_UPDATE_TRIGGER, {
                broadcast: false,
                emitFacade: true,
                preventable: true,
                defaultFn: Y.bind(this._defaultUpdateSelection, this)
            });

            this.publish(EVT_CHANGE, {
                broadcast: false,
                emitFacade: true,
                preventable: false
            });
        },

        destructor: function () {
        },

        renderUI: function () {
        },

        bindUI: function () {
            var options = this.get('options');

            this.get('trigger').on('click', Y.bind(this.toggle, this));
            if  ( Lang.isObject(options) ) {
                options.on('click', Y.bind(this._onOptionClick, this));
            }
            this.get('srcNode').on('clickoutside', Y.bind(this.close, this));

            this.after('openChange', this._afterOpenChange);
            this.after('selectedChange', this._afterSelectedChange);
        },

        syncUI: function () {
            this._uiHandleOpen();
            this._uiHandleSelected();
        },

        /**
         * Toggles the opening state of the dropdown
         *
         * @method toggle
         */
        toggle: function () {
            Y.log('toggle');
            this.set('open', !this.get('open'));
        },

        /**
         * Opens the dropdown
         *
         * @method open
         */
        open: function () {
            this.set('open', true);
        },

        /**
         * Closes the dropdown
         *
         * @method close
         */
        close: function () {
            this.set('open', false);
        },

        /**
         * Checks whether the opt Node is disable or not
         *
         * @private
         * @method
         * @return Boolean
         */
        _isDisabled: function (opt) {
            return opt.hasClass(this.getClassName(DISABLED));
        },

        _onOptionClick: function (e) {
            if ( !this._isDisabled(e.target) ) {
                this.set('selected', e.target);
                this.close();
            }
        },

        _afterOpenChange: function (e) {
            this._uiHandleOpen();
        },

        _afterSelectedChange: function (e) {
            if ( e.prevVal ) {
                e.prevVal.removeClass(this.getClassName('selected'));
            }
            e.newVal.addClass(this.getClassName('selected'));

            /**
             * Fired when the user change the value held by the dropdown
             *
             * @event change
             * @param {Object} facade The event object for the change event
             *                 with the following properties:
             *   @param {Node} facade.prevVal the previously selected Node
             *   @param {Node} facade.newVal the new selected Node
             */
            this.fire(EVT_CHANGE, {
                prevVal: e.prevVal,
                newVal: e.newVal
            });
            this._uiHandleSelected();
        },

        _defaultUpdateSelection: function (e) {
            var n = this.get('selectedValueNode'),
                selected = this.get('selected');
            if ( Lang.isObject(n) && Lang.isObject(selected) ) {
                n.setContent(selected.getAttribute('data-value'));
            }
        },

        _uiHandleOpen: function () {
            if ( this.get('open') ) {
                this.get('srcNode').addClass(this.getClassName('open'));
            } else {
                this.get('srcNode').removeClass(this.getClassName('open'));
            }
        },

        _uiHandleSelected: function () {
            /**
             * Fired when the trigger has to be updated. By default, this event
             * is handled by the method _defaultUpdateSelection which sets the
             * value of the trigger node with the content of the data-value
             * attribute.
             *
             * @event updateTrigger
             */
            this.fire(EVT_UPDATE_TRIGGER);
        }

    });

    Y.eZ.Dropdown = eZDD;

}, '0.1alpha', ['widget', 'event-outside']);
