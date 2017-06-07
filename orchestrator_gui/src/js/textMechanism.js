// TEXT_TYPE component extends the alpaca textarea
$.alpaca.Fields.TextInputMechanism = $.alpaca.Fields.TextAreaField.extend({
    getFieldType: function(){
        return "TEXT_TYPE";
    },
    getTitle: function () {
        return "Text Mechanism";
    },

    getSchemaOfOptions: function () {
        var myProp = this.base();
        delete myProp.properties.allowOptionalEmpty;
        delete myProp.properties.autocomplete;
        delete myProp.properties.cols;
        delete myProp.properties.data;
        delete myProp.properties.disabled;
        delete myProp.properties.disallowEmptySpaces;
        delete myProp.properties.disallowOnlyEmptySpaces;
        delete myProp.properties.fieldClass;
        delete myProp.properties.focus;
        delete myProp.properties.helper;
        delete myProp.properties.helpers;
        delete myProp.properties.hidden;
        delete myProp.properties.hideInitValidationError;
        delete myProp.properties.inputType;
        delete myProp.properties.maskString;
        delete myProp.properties.name;
        delete myProp.properties.optionLabels;
        delete myProp.properties.placeholder;
        delete myProp.properties.rows;
        delete myProp.properties.showMessages;
        delete myProp.properties.size;
        delete myProp.properties.typeahead;
        delete myProp.properties.validate;
        delete myProp.properties.view;
        delete myProp.properties.wordlimit;
        return Alpaca.merge(myProp, {
            "properties": {
                "mandatory": {
                    "title": "Mandatory",
                    "type": "boolean",
                    "default": false
                },
                "hidden": {
                    "title": "Hidden",
                    "type": "boolean",
                    "default": false,
                    "description": "Field will be hidden if true."
                },
                "disabled": {
                    "title": "Disabled",
                    "type": "boolean",
                    "default": false,
                    "description": "Field will be disabled if true."
                },
                "fieldHeight": {
                    "title": "Input height",
                    "type": "number",
                    "default": "5",
                    "description": "Height of the input field"
                },
                "fieldWidth": {
                    "title": "Input width",
                    "type": "number",
                    "default": "40",
                    "description": "Width of the text input field"
                },
                "maxLength": {
                    "title": "Maximum number of characters",
                    "type": "number",
                    "description": "Maximum number of characters allowed in the text input"
                },
                "maxLengthStrict": {
                    "title": "Strict length of character",
                    "type": "boolean",
                    "default": false,
                    "description": "Whether to prevent typing if max length is reached"
                },
                "maxLengthVisible": {
                    "title": "Display max number of characters",
                    "type": "boolean",
                    "default": false,
                    "description": "If the maximum number of allowed characters is visible in the text input field"
                },
                "textLengthVisible": {
                    "title": "Display character counter",
                    "type": "boolean",
                    "default": false,
                    "description": "If the current characters counter is visible in the text input field"
                },
                "hint": {
                    "title": "Tooltip",
                    "type": "string",
                    "description": "Hint of the field"
                },
                "validation": {
                    "title": "Input validation: (none: 0; Email: 1; Number: 2)",
                    "type": "number",
                    "default": 0
                 }
            }
        });
    },

    getSchemaOfSchema: function(){
        var mySchema = this.base();
        delete mySchema.properties.default;
        delete mySchema.properties.disallow;
        delete mySchema.properties.enum;
        delete mySchema.properties.format;
        delete mySchema.properties.minLength;
        delete mySchema.properties.pattern;
        delete mySchema.properties.readonly;
        delete mySchema.properties.type;
        return mySchema;
    },

    setup: function() {
        this.base();
        if(!this.options.mandatory) {
            this.options.mandatory = false;
        }

        if(!this.options.hidden){
            this.options.hidden = false;
        }

        if(!this.options.disabled){
            this.options.disabled = false;
        }

        if(!this.options.fieldHeight) {
            this.options.fieldHeight = 5;
            this.options.rows = this.options.fieldHeight;
        }

        if(!this.options.fieldWidth){
            this.options.fieldWidth = 40;
            this.options.cols = this.options.fieldWidth;
        }

        if(!this.options.maxLength){
            this.options.maxLength = -1;
        }

        if(!this.options.maxLengthStrict){
            this.options.maxLengthStrict = false;
        }

        if(!this.options.maxLengthVisible){
            this.options.maxLengthVisible = false;
        }

        if(!this.options.textLengthVisible){
            this.options.textLengthVisible = false;
        }

        if(!this.options.hint){
            this.options.hint = "";
        }

        if(!this.options.validation){
            this.options.validation = 0;
        }
    }

});
Alpaca.registerFieldClass("TEXT_TYPE", Alpaca.Fields.TextInputMechanism);