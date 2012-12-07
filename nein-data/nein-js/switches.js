YUI.add('ez-switches', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.Switches class
     *
     * @module ez-switches
     */

    Y.namespace('eZ');

    var Lang = Y.Lang;

    var EVT_SWITCH = 'switch';

    /**
     * Constructor of the Y.eZ.Switches component. Y.eZ.Switches extends
     * <a href="http://yuilibrary.com/yui/docs/api/modules/widget.html">Y.Widget
     * documentation</a> for Y.Widget details.
     *
     * Y.eZ.Switches allows to manage a set of radio buttons and reflect the
     * checked state of each radio button in the parent element's class.
     * Example:
     *
     *      <div class="switches">
     *          <div class="choice">
     *              <input type="radio" value="1" />
     *          </div>
     *          <div class="choice">
     *              <input type="radio" value="2" />
     *          </div>
     *      </div>
     *
     * if one of the radio button is selected, the parent div will get the
     * class `ez-ei-switches-current`.
     * It's also possible to disabled the whole widget, in such case, the
     * bounding box div (automatically created by YUI3 widget infrastructure)
     * will get the class `ez-ei-switches-disabled`.
     *
     * @class Y.eZ.Switches
     * @extends Widget
     * @constructor
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode the Node where to find the HTML structure (see above)
     */
    function eZSwitches(config) {
        eZSwitches.superclass.constructor.apply(this, arguments);

        this.subscriptions = [];
    }

    eZSwitches.NAME = 'switches';
    eZSwitches.CSS_PREFIX = "ez-ei-" + eZSwitches.NAME;

    eZSwitches.ATTRS = {
        /**
         * Contains a reference to the currently checked radio button or false
         *
         * @attribute checkedRadio
         * @default false
         * @type Node
         */
        checkedRadio: {
            value: false
        },

        /**
         * Contains the list of radio buttons
         *
         * @attribute radios
         * @default []
         * @type NodeList
         */
        radios: {
            value: []
        }
    };

    eZSwitches.HTML_PARSER = {
        radios: ['input[type=radio]'],
        checkedRadio: 'input[type=radio][checked]',
        disabled: function (srcNode) {
            var res = srcNode.hasClass(this.getClassName('disabled'));
            this.set('disabled', res);
            return res;
        }
    };

    Y.extend(eZSwitches, Y.Widget, {
        initializer: function () {
            this.publish(EVT_SWITCH, {
                broadcast: false,
                emitFacade: true,
                preventable: false
            });
        },

        destructor: function () {
            this.subscriptions.each(function () {
                this.detach();
            });
        },

        renderUI: function () {
        },

        bindUI: function () {
            this.subscriptions.push(
                Y.on(
                    'change',
                    Y.bind(this._inputChange, this),
                    this.get('radios')
                )
            );
            this.after('checkedRadioChange', this._afterCheckedRadioChange);
            this.after('disabledChange', this._afterDisabledChange);
        },

        syncUI: function () {
            this._uiHandleDisabled();
            this._uiHandleChecked();
        },

        _isChecked: function (radio) {
            var checked = this.get('checkedRadio');
            if ( !checked )
                return false;
            if ( Lang.isString(radio) ) {
                return (checked.get('id') == radio);
            } else if ( Lang.isObject(radio) ) {
                return (checked.get('id') == radio.get('id'));
            }
            return false;
        },

        _inputChange: function (e) {
            this.set('checkedRadio', e.target);
        },

        _afterCheckedRadioChange: function (e) {
            var prevVal = false, newVal = false;
            // the change might be triggered by a JS call
            // so we make sure the checked attribute is removed
            if ( e && Lang.isObject(e.prevVal) ) {
                e.prevVal.removeAttribute('checked');
                prevVal = e.prevVal.get('value');
            }
            if ( e && Lang.isObject(e.newVal) ) {
                e.newVal.setAttribute('checked');
                newVal = e.newVal.get('value');
            }

            this._uiHandleChecked();

            /**
             * Fired when the user switch from one option to another
             *
             * @event switch
             * @param {Object} facade The event object for the switch event with the
             *                 following properties:
             *  @param {String} facade.prevVal the previously selected value or false
             *  @param {String} facade.newVal the new selected value
             */
            this.fire(EVT_SWITCH, {
                prevVal: prevVal,
                newVal: newVal
            });

        },

        _afterDisabledChange: function (e) {
            this._uiHandleDisabled();
        },

        /**
         * Disables or enables the whole widget
         *
         * @method toggleDisabled
         */
        toggleDisabled: function () {
            this.set('disabled', !this.get('disabled'));
        },

        /**
         * Select a given option by its value
         *
         * @method select
         * @param {String} value Select the corresponding radio button by its value
         */
        select: function (value) {
            var that = this;
            this.get('radios').each(function () {
                if ( this.get('value') == value ) {
                    if ( !this.getAttribute('disabled') && !that._isChecked(this) ) {
                        that.set('checkedRadio', this);
                    }
                }
            });
        },

        _uiHandleDisabled: function () {
            var src = this.get('srcNode'),
                dclass = this.getClassName('disabled'),
                radios = this.get('radios');

            if ( this.get('disabled') ) {
                src.addClass(dclass);
                radios.each(function () {
                    this.setAttribute('disabled', 'disabled');
                });
            } else {
                src.removeClass(dclass);
                radios.each(function () {
                    this.removeAttribute('disabled');
                });
            }
        },

        _uiHandleChecked: function () {
            var checked = this.get('checkedRadio'),
                currentClass = this.getClassName('current');

            this.get('radios').each(function () {
                if ( !checked || (checked && this.get('id') != checked.get('id')) ) {
                    this.get('parentNode').removeClass(currentClass);
                } else if ( checked && this.get('id') == checked.get('id') ) {
                    checked.get('parentNode').addClass(currentClass);
                }
            });

        }

    });

    Y.eZ.Switches = eZSwitches;

}, '0.1alpha', ['selector-css3','widget']);
