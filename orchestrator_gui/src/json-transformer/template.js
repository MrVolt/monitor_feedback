var tmpl = {
    path: '.',
    aggregate: {
        total: function(key, value, existing) {
            if (!isArray(value)) {
                return value;
            } else {
                return value.sort().reverse()[0];
            }
        },
        pages: function(key, value, existing) {
            if (!isArray(value)) {
                return value;
            } else {
                return value.sort().reverse()[0];
            }
        }
    },

    as: {
        configurations: {
            as: {
                mechanisms: {
                    path: "options.fields",
                    as: {
                        type: "type",
                        parameters: { // TODO: parameters should become an array
                            path: ".",

                            as: {
                                key: "label", // TODO: set fix string "title" as key.value
                                value: "label"
                            }

                        }
                    }

                }
            }
        }
    }

};


/* important!!!
for the uzh json; all integer values must be set in the format i.0: ex: 200.0
boolean values must be set as 1.0 and 0.0
 */