YUI.add('ez-switches-slider', function (Y) {
    "use strict";

    /**
     * Provides the Y.eZ.SwitchesSlider class
     *
     * @module ez-switches-slider
     */

    Y.namespace('eZ');

    var Lang = Y.Lang;

    var CLASS_SKIN = 'ez-skin-boolean-switch',
        DIV = '<div class="'+ CLASS_SKIN +'"></div>',
        MIN = 0,
        BREAK_POINT = 50,
        MAX = 100;

    /**
     * Constructor of the Y.eZ.SwitchesSlider components.
     *
     * Y.eZ.SwitchesSlider extends Y.eZ.Switches to provide a slider GUI in
     * order to switch between two radio buttons.
     *
     * @class Y.eZ.SwitchesSlider
     * @extends Y.eZ.Switches
     * @constructor
     * @param {Object} config the configuration of the widget
     *   @param {Node} config.srcNode the Node where to find the HTML structure (see above)
     */
    function eZSwitchesSlider(config) {
        eZSwitchesSlider.superclass.constructor.apply(this, arguments);

        this._slider = null;
    }

    eZSwitchesSlider.NAME = 'switches-slider';
    eZSwitchesSlider.CSS_PREFIX = "ez-ei-" + eZSwitchesSlider.NAME;

    eZSwitchesSlider.ATTRS = Y.eZ.Switches.ATTRS;
    eZSwitchesSlider.HTML_PARSER = Y.eZ.Switches.HTML_PARSER;

    Y.extend(eZSwitchesSlider, Y.eZ.Switches, {

        destructor: function () {
            eZSwitchesSlider.superclass.destructor.apply(this, arguments);
            this._slider = null;
        },

        renderUI: function () {
            var sliderNode = Y.Node.create(DIV);
            eZSwitchesSlider.superclass.renderUI.apply(this, arguments);

            sliderNode.insertBefore(sliderNode, this.get('radios').item(1).get('parentNode'));
            this._slider = new Y.Slider({
                length: '50px',
                render: sliderNode,
                min: MIN,
                max: MAX,
                clickableRail: true
            });
        },

        bindUI: function () {
            var sl = this._slider;

            eZSwitchesSlider.superclass.bindUI.apply(this, arguments);
            sl.on('slideEnd', Y.bind(this._sliderManualChange, this));
            sl.after('railMouseDown', Y.bind(this._sliderManualChange, this));
        },

        _sliderManualChange: function (e) {
            var sl = this._slider,
                val = sl.get('value');

            if ( val != MIN && val != MAX ) {
                if ( val > BREAK_POINT ) {
                    sl.set('value', MAX);
                    val = MAX;
                } else {
                    sl.set('value', MIN);
                    val = MIN;
                }
                sl.syncUI();
            }
            if ( val == MIN ) {
                this.set('checkedRadio', this.get('radios').item(0));
            } else {
                this.set('checkedRadio', this.get('radios').item(1));
            }
        },

        syncUI: function () {
            eZSwitchesSlider.superclass._afterCheckedRadioChange.apply(this, arguments);
            this._uiSliderSetValue();
            this._uiSliderToggleDisabled();
        },

        _afterCheckedRadioChange: function (e) {
            eZSwitchesSlider.superclass._afterCheckedRadioChange.apply(this, arguments);
            this._uiSliderSetValue();
        },

        _uiSliderSetValue: function () {
            if ( this._isChecked(this.get('radios').item(0)) ) {
                this._slider.set('value', MIN);
            } else {
                this._slider.set('value', MAX);
            }
            this._slider.syncUI();
        },

        _afterDisabledChange: function (e) {
            eZSwitchesSlider.superclass._afterDisabledChange.apply(this, arguments);
            this._uiSliderToggleDisabled();
        },

        _uiSliderToggleDisabled: function (e) {
            this._slider.set('disabled', this.get('disabled'));
        }
    });

    Y.eZ.SwitchesSlider = eZSwitchesSlider;

}, '0.1alpha', ['ez-switches','slider']);
