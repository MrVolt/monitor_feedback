import Handlebars = require('handlebars');
import './lib/rating/jquery.star-rating-svg.js';
import './jquery.validate';
import './jquery.validate_category';
import './jquery.fileupload';
import {
    apiEndpointRepository, feedbackPath, applicationName, defaultSuccessMessage,
    feedbackObjectTitle, dialogOptions, mechanismTypes, applicationId
} from './config';
import {PaginationContainer} from '../views/pagination_container';
import {ScreenshotView} from '../views/screenshot/screenshot_view';
import {I18nHelper} from './helpers/i18n';
import i18n = require('i18next');
import {MockBackend} from '../services/backends/mock_backend';
import {RatingMechanism} from '../models/mechanisms/rating_mechanism';
import {PullConfiguration} from '../models/configurations/pull_configuration';
import {Feedback} from '../models/feedbacks/feedback';
import {PageNavigation} from './helpers/page_navigation';
import {ConfigurationInterface} from '../models/configurations/configuration_interface';
import {Application} from '../models/applications/application';
import {ApplicationService} from '../services/application_service';
import * as t from '../templates/t';
import * as compare from '../templates/compare';
var dialogTemplate = require('../templates/feedback_dialog.handlebars');
var pullDialogTemplate = require('../templates/feedback_dialog.handlebars');
var intermediateDialogTemplate = require('../templates/intermediate_dialog.handlebars');
var notificationTemplate = require('../templates/notification.handlebars');
import {GeneralConfiguration} from '../models/configurations/general_configuration';
import {RatingFeedback} from '../models/feedbacks/rating_feedback';
import {ScreenshotFeedback} from '../models/feedbacks/screenshot_feedback';
import {AttachmentFeedback} from '../models/feedbacks/attachment_feedback';
import {AudioFeedback} from '../models/feedbacks/audio_feedback';
import {ContextInformation} from '../models/feedbacks/context_information';
import {AudioView} from '../views/audio/audio_view';
import {FeedbackApp} from './feedback_app';
var mockData = require('json!../services/mocks/dev/applications_mock.json');


/* TODO REFACTORING PLAN
    - implement services as singletons --> services are passed to the views via DI --> DONE
    - implement methods on services that return cached results --> DONE
    - create view (controller) classes that --> DONE
    - create template rendering method (handlebars) to easily display data in the templates
    - split up the mechanisms in own view classes that have less dependencies
    - reduce this file here to a minimum, i.e. only initialization and configuration
 */

declare var feedbackApp: FeedbackApp;

export var feedbackPluginModule = function ($, window, document) {
    var dialog;
    var pushConfigurationDialogId = "pushConfiguration";
    var pullDialog;
    var pullConfigurationDialogId = "pullConfiguration";
    var active = false;
    var dropArea;
    var dialogCSSClass;
    var colorPickerCSSClass;
    var defaultStrokeWidth;
    var audioView;

    // TODO refactoring: I don't know how yet
    // TODO check which part of the configuration is really needed by the other modules --> use DI to pass this configuration to other modules as well as to allow to pass testing configuration that way
    /**
     * @param applicationObject
     *  The current application object that configures the library.
     */
    var initApplication = function (applicationObject:Application) {
        initPushMechanisms(application.getPushConfiguration(), application.generalConfiguration);

    };

    // TODO refactoring: move to dialog view
    /**
     * @param configuration
     *  PushConfiguration data retrieved from the feedback orchestrator
     *
     * Initializes the mechanism objects with the configuration data. It then constructs the context variable for the
     * template and invokes the feedbackDialog template with the configuration data.
     * Furthermore, the pagination inside the dialog is initialized, the rating component is configured, the dialog
     * is configured and displayed and some events are added to the UI.
     * All events on the HTML have to be added after the template is appended to the body (if not using live binding).
     */
    var initPushMechanisms = function (configuration, generalConfiguration:GeneralConfiguration) {
        var context = prepareTemplateContext(configuration.getContextForView());

        var pageNavigation = new PageNavigation(configuration, $('#' + pushConfigurationDialogId));
        dialog = initTemplate(dialogTemplate, pushConfigurationDialogId, context, configuration, pageNavigation, generalConfiguration);
    };

    // TODO refactoring: I don't know how yet
    var showPullDialog = function (configuration:PullConfiguration, generalConfiguration:GeneralConfiguration) {
        configuration.wasTriggered();
        var pageNavigation = new PageNavigation(configuration, $('#' + pullConfigurationDialogId));

        var context = prepareTemplateContext(configuration.getContextForView());

        pullDialog = initTemplate(pullDialogTemplate, pullConfigurationDialogId, context, configuration, pageNavigation, generalConfiguration);
        var delay = 0;
        if (configuration.generalConfiguration.getParameterValue('delay')) {
            delay = configuration.generalConfiguration.getParameterValue('delay');
        }
        if (configuration.generalConfiguration.getParameterValue('intermediateDialog')) {
            var intermediateDialog = initIntermediateDialogTemplate(intermediateDialogTemplate, 'intermediateDialog', configuration, pullDialog, generalConfiguration);
            if (intermediateDialog !== null) {
                setTimeout(function () {
                    if (!active) {
                        intermediateDialog.dialog('open');
                    }
                }, delay * 1000);
            }
        } else {
            setTimeout(function () {
                if (!active) {
                    openDialog(pullDialog, configuration);
                }
            }, delay * 1000);
        }
    };

    // TODO refactoring: I don't know how yet
    var initTemplate = function (template, dialogId, context, configuration, pageNavigation,
                                 generalConfiguration:GeneralConfiguration):HTMLElement {
        var html = template(context);
        $('body').append(html);

        // after template is loaded
        new PaginationContainer($('#' + dialogId + '.feedback-container .pages-container'), pageNavigation);
        pageNavigation.screenshotViews = [];

        for (var ratingMechanism of configuration.getMechanismConfig(mechanismTypes.ratingType)) {
            initRating("#" + dialogId + " #ratingMechanism" + ratingMechanism.id + " .rating-input", ratingMechanism);
        }

        for (var screenshotMechanism of configuration.getMechanismConfig(mechanismTypes.screenshotType)) {
            var screenshotView = initScreenshot(screenshotMechanism, dialogId);
            pageNavigation.screenshotViews.push(screenshotView);
        }

        var audioMechanism = configuration.getMechanismConfig(mechanismTypes.audioType).filter(mechanism => mechanism.active === true)[0];
        if (audioMechanism) {
            var audioContainer = $("#" + dialogId + " #audioMechanism" + audioMechanism.id);
            audioView = new AudioView(audioMechanism, audioContainer, distPath);
        }

        for (var attachmentMechanism of configuration.getMechanismConfig(mechanismTypes.attachmentType)) {
            if (attachmentMechanism.active) {
                var sectionSelector = "#attachmentMechanism" + attachmentMechanism.id;
                dropArea = $('' + sectionSelector).find('.drop-area');
                dropArea.fileUpload(distPath);
            }
        }

        var title = "Feedback";
        if (generalConfiguration.getParameterValue('dialogTitle') !== null && generalConfiguration.getParameterValue('dialogTitle') !== "") {
            title = generalConfiguration.getParameterValue('dialogTitle');
        }

        var modal = false;
        if (generalConfiguration.getParameterValue('dialogModal') !== null && generalConfiguration.getParameterValue('dialogModal') !== "") {
            modal = generalConfiguration.getParameterValue('dialogModal');
        }

        var dialog = initDialog($('#' + dialogId), title, modal, dialogId);
        addEvents(dialogId, configuration, generalConfiguration);
        return dialog;
    };

    // TODO refactoring: I don't know how yet
    var initIntermediateDialogTemplate = function (template, dialogId, configuration, pullDialog,
                                                   generalConfiguration:GeneralConfiguration):HTMLElement {
        var html = template({});
        $('body').append(html);

        var dialog = initDialog($('#' + dialogId), generalConfiguration.getParameterValue('dialogTitle'), true, dialogId);
        $('#feedbackYes').on('click', function () {
            dialog.dialog('close');
            openDialog(pullDialog, configuration);
        });
        $('#feedbackNo').on('click', function () {
            dialog.dialog('close');
        });
        $('#feedbackLater').on('click', function () {
            dialog.dialog('close');
        });
        return dialog;
    };

    // TODO adjust comment
    // TODO refactoring: move to FeedbackService
    /**
     * This method takes the data from the text mechanism and the rating mechanism and composes a feedback object with
     * the help of this data.
     * Then an AJAX request is done to send the submitted feedback to the feedback repository. A success or failure
     * message is shown after the request is done.
     */
    var sendFeedback = function (formData:FormData, configuration:ConfigurationInterface, generalConfiguration:GeneralConfiguration) {
        $.ajax({
            url: apiEndpointRepository + 'feedback_repository/' + language + '/applications/' + applicationId + '/feedbacks/',
            type: 'POST',
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: function (data) {
                resetPlugin(configuration);
                if (generalConfiguration.getParameterValue('closeDialogOnSuccess')) {
                    dialog.dialog('close');
                    pageNotification(defaultSuccessMessage);
                } else {
                    $('.server-response').addClass('success').text(defaultSuccessMessage);
                }
            },
            error: function (data) {
                $('.server-response').addClass('error').text('Failure: ' + JSON.stringify(data));
            }
        });
    };

    // TODO refactoring: move to own jquery plugin or view class
    var pageNotification = function (message:string) {
        var html = notificationTemplate({message: message});
        $('html').append(html);
        setTimeout(function () {
            $(".feedback-notification").remove();
        }, 3000);
    };

    // TODO refactoring: move reset() to every mechanism view
    // TODO refactoring: move resetPlugin() to FeedbackDialog (pay attention to not create a high dependency between dialog and these function that could also be used in other views)
    var resetPlugin = function (configuration) {
        $('textarea.text-type-text').val('');
        for (var screenshotMechanism of configuration.getMechanismConfig(mechanismTypes.screenshotType)) {
            screenshotMechanism.screenshotView.reset();
        }
        for (var ratingMechanism of configuration.getMechanismConfig(mechanismTypes.ratingType)) {
            initRating("#" + configuration.dialogId + " #ratingMechanism" + ratingMechanism.id + " .rating-input", ratingMechanism);
        }
    };

    // TODO refactoring: move initRating() to RatingView
    /**
     * @param selector
     *  The jQuery selector that matches the element the star rating should be applied on
     * @param ratingMechanism
     *  The rating mechanism object that contains the configuration
     *
     * Applies the jQuery star rating plugin on a specified element with the configuration from the rating mechanism.
     */
    var initRating = function (selector, ratingMechanism:RatingMechanism) {
        if (ratingMechanism !== null && ratingMechanism.active) {
            var options = ratingMechanism.getRatingElementOptions();
            $('' + selector).starRating(options);
            // reset to default rating
            if (ratingMechanism.initialRating) {
                $('' + selector + ' .jq-star:nth-child(' + ratingMechanism.initialRating + ')').click();
            }
        }
    };

    // TODO refactoring: I don't know how yet
    var initScreenshot = function (screenshotMechanism, containerId):ScreenshotView {
        if (screenshotMechanism == null) {
            return;
        }

        var elementToCaptureSelector = 'body';
        if (screenshotMechanism.getParameterValue('elementToCapture') !== null && screenshotMechanism.getParameterValue('elementToCapture') !== "") {
            elementToCaptureSelector = screenshotMechanism.getParameterValue('elementToCapture');
        }

        var container = $('#' + containerId);
        var dialogSelector = '[aria-describedby="' + containerId + '"]';

        var screenshotPreview = container.find('.screenshot-preview'),
            screenshotCaptureButton = container.find('button.take-screenshot'),
            elementToCapture = $('' + elementToCaptureSelector),
            elementsToHide = ['.ui-widget-overlay.ui-front', dialogSelector];
        // TODO attention: circular dependency
        var screenshotView = new ScreenshotView(screenshotMechanism, screenshotPreview, screenshotCaptureButton,
            elementToCapture, container, distPath, elementsToHide, screenshotMechanism.getParameterValue('manipulationOnObject'));
        screenshotView.colorPickerCSSClass = colorPickerCSSClass;
        screenshotView.setDefaultStrokeWidth(defaultStrokeWidth);

        screenshotMechanism.setScreenshotView(screenshotView);
        return screenshotView;
    };


    // TODO refactoring: see inside function
    /**
     * @param containerId
     *  The ID of the surrounding element that contains the feedback mechanisms
     * @param configuration
     *  Configuration used to set the events
     *
     * Adds the following events:
     * - Send event for the feedback form
     * - Character count event for the text mechanism
     */
    var addEvents = function (containerId, configuration:ConfigurationInterface, generalConfiguration:GeneralConfiguration) {
        var container = $('#' + containerId);
        var textareas = container.find('textarea.text-type-text');
        var textMechanisms = configuration.getMechanismConfig(mechanismTypes.textType);
        var categoryMechanisms = configuration.getMechanismConfig(mechanismTypes.categoryType);

        // TODO refactoring: move to feedbackDialog
        container.find('button.submit-feedback').unbind().on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            // validate anyway before sending
            if (textMechanisms.length > 0) {
                textareas.each(function () {
                    $(this).validate();
                });

                var invalidTextareas = container.find('textarea.text-type-text.invalid');
                if (invalidTextareas.length == 0) {
                    prepareFormData(container, configuration, function (formData) {
                        sendFeedback(formData, configuration, generalConfiguration);
                    });
                }
            } else {
                prepareFormData(container, configuration, function (formData) {
                    sendFeedback(formData, configuration, generalConfiguration);
                });
            }
        });

        // TODO refactoring: move to TextMechanismView
        // character length
        for (var textMechanism of textMechanisms) {
            var sectionSelector = "textMechanism" + textMechanism.id;
            var textarea = container.find('section#' + sectionSelector + ' textarea.text-type-text');
            var maxLength = textMechanism.getParameterValue('maxLength');
            var isMaxLengthStrict = textMechanism.getParameterValue('maxLengthStrict');

            textarea.on('keyup focus paste blur', function () {
                container.find('section#' + sectionSelector + ' span.text-type-max-length').text($(this).val().length + '/' + maxLength);
            });

            if (isMaxLengthStrict) {
                // prevent typing if max length is reached
                textarea.on('keypress', function (e) {
                    if (e.which < 0x20) {
                        // e.which < 0x20, then it's not a printable character
                        // e.which === 0 - Not a character
                        return;     // Do nothing
                    }
                    if (this.value.length === maxLength) {
                        e.preventDefault();
                    } else if (this.value.length > maxLength) {
                        this.value = this.value.substring(0, maxLength);
                    }
                });
                // prevent pasting more characters
                textarea.on('change blur', function () {
                    if (this.value.length > maxLength) {
                        this.value = this.value.substring(0, maxLength - 1);
                    }
                });
            }

            // text clear button
            container.find('section#' + sectionSelector + ' .text-type-text-clear').on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                textarea.val('');
            });
        }

        // TODO refactoring: move to FeedbackDialog
        container.find('.discard-feedback').on('click', function () {
            if (configuration.dialogId === 'pushConfiguration') {
                dialog.dialog("close");
            } else if (configuration.dialogId === 'pullConfiguration') {
                pullDialog.dialog("close");
            }
            resetPlugin(configuration);
        });

        // TODO refactoring: move to CategoryMechanismView
        for (var categoryMechanism of categoryMechanisms) {
            categoryMechanism.coordinateOwnInputAndRadioBoxes();
        }
    };

    // TODO refactoring: the mechanism views should return their feedback data
    /**
     * Creates the multipart form data containing the data of the active mechanisms.
     */
    var prepareFormData = function (container:JQuery, configuration:ConfigurationInterface, callback?:any) {
        var formData = new FormData();

        var textMechanisms = configuration.getMechanismConfig(mechanismTypes.textType);
        var ratingMechanisms = configuration.getMechanismConfig(mechanismTypes.ratingType);
        var screenshotMechanisms = configuration.getMechanismConfig(mechanismTypes.screenshotType);
        var categoryMechanisms = configuration.getMechanismConfig(mechanismTypes.categoryType);
        var attachmentMechanisms = configuration.getMechanismConfig(mechanismTypes.attachmentType);
        var audioMechanisms = configuration.getMechanismConfig(mechanismTypes.audioType);

        var hasAudioMechanism = audioMechanisms.filter(audioMechanism => audioMechanism.active === true).length > 0;

        container.find('.server-response').removeClass('error').removeClass('success');
        var feedbackObject = new Feedback(feedbackObjectTitle, userId, language, applicationId, configuration.id, [], [], [], [], null, [], []);
        feedbackObject.contextInformation = ContextInformation.create();

        for (var textMechanism of textMechanisms) {
            if (textMechanism.active) {
                feedbackObject.textFeedbacks.push(textMechanism.getTextFeedback());
            }
        }

        for (var ratingMechanism of ratingMechanisms) {
            if (ratingMechanism.active) {
                var rating = new RatingFeedback(ratingMechanism.currentRatingValue, ratingMechanism.id);
                feedbackObject.ratingFeedbacks.push(rating);
            }
        }

        for (var screenshotMechanism of screenshotMechanisms) {
            if (screenshotMechanism.active) {
                if (screenshotMechanism.screenshotView.getScreenshotAsBinary() === null) {
                    continue;
                }
                var partName = "screenshot" + screenshotMechanism.id;
                var screenshotFeedback = new ScreenshotFeedback(partName, screenshotMechanism.id, partName, 'png');
                feedbackObject.screenshotFeedbacks.push(screenshotFeedback);
                formData.append(partName, screenshotMechanism.screenshotView.getScreenshotAsBinary());
            }
        }

        for (var categoryMechanism of categoryMechanisms) {
            if (categoryMechanism.active) {
                var categoryFeedbacks = categoryMechanism.getCategoryFeedbacks();
                for (var categoryFeedback of categoryFeedbacks) {
                    feedbackObject.categoryFeedbacks.push(categoryFeedback);
                }
            }
        }

        for (var attachmentMechanism of attachmentMechanisms) {
            if (attachmentMechanism.active) {
                var sectionSelector = "attachmentMechanism" + attachmentMechanism.id;
                var input = container.find('section#' + sectionSelector + ' input[type=file]');
                var files = dropArea.currentFiles;

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    let partName = 'attachment' + i;
                    var attachmentFeedback = new AttachmentFeedback(partName, file.name, file.type, attachmentMechanism.id);
                    formData.append(partName, file, file.name);
                    feedbackObject.attachmentFeedbacks.push(attachmentFeedback);
                }
            }
        }

        // TODO assumes only one audio mechanism --> support multiple
        for (var audioMechanism of audioMechanisms.filter(mechanism => mechanism.active === true)) {
            let partName = "audio" + audioMechanism.id;
            var audioElement = jQuery('section#audioMechanism' + audioMechanism.id + ' audio')[0];
            if (!audioElement || Fr.voice.recorder === null) {
                formData.append('json', JSON.stringify(feedbackObject));
                callback(formData);
            }

            try {
                var duration = Math.ceil(audioElement.duration === undefined || audioElement.duration === 'NaN' ? 0 : audioElement.duration);
                if (duration === 0) {
                    hasAudioMechanism = false;
                    break;
                }
                var audioFeedback = new AudioFeedback(partName, duration, "wav", audioMechanism.id);
                audioView.getBlob(function (blob) {
                    var date = new Date();
                    formData.append(partName, blob, "recording" + audioMechanism.id + "_" + date.getTime());
                    feedbackObject.audioFeedbacks.push(audioFeedback);
                    formData.append('json', JSON.stringify(feedbackObject));
                    callback(formData);
                });
            } catch (e) {
                formData.append('json', JSON.stringify(feedbackObject));
                callback(formData);
                console.log((<Error>e).message);
            }
        }

        if (!hasAudioMechanism) {
            formData.append('json', JSON.stringify(feedbackObject));
            callback(formData);
        }
    };

    // TODO refactoring: move to FeedbackDialog
    /**
     * The configuration data is fetched from the API if the feedback mechanism is not currently active. In the other
     * case the feedback mechanism dialog is closed. The active variable is toggled on each invocation.
     */
    var toggleDialog = function (pushConfiguration) {
        if (!active) {
            openDialog(dialog, pushConfiguration);
        } else {
            dialog.dialog("close");
        }
        active = !active;
    };

    // TODO refactoring: move to FeedbackDialog
    var openDialog = function (dialog, configuration) {
        for (var screenshotMechanism of configuration.getMechanismConfig(mechanismTypes.screenshotType)) {
            if (screenshotMechanism !== null && screenshotMechanism !== undefined && screenshotMechanism.screenshotView !== null) {
                screenshotMechanism.screenshotView.checkAutoTake();
            }
        }
        dialog.dialog('open');
    };

    // TODO refactoring: move to FeedbackDialog?
    var prepareTemplateContext = function (context) {
        var contextWithApplicationContext = $.extend({}, applicationContext, context);
        var pluginContext = {
            'distPath': distPath
        };
        return $.extend({}, pluginContext, contextWithApplicationContext);
    };

    /**
     * @param options
     *  Client side configuration of the feedback library
     * @returns {jQuery}
     *
     * The feedbackPlugin() function can get applied to a HTML element. This element is then configured via the passed
     * options and the default options. If a click event on this element happens the configuration is fetched from the
     * server and the feedback mechanism is invoked.
     */
    $.fn.feedbackPlugin = function (options) {
        I18nHelper.initializeI18n(options);
        var language = I18nHelper.getLanguage(options);
        var options = $.extend({}, $.fn.feedbackPlugin.defaults, options);
        feedbackApp = new FeedbackApp(new ApplicationService(language), applicationId, options, this);

        return this;
    };

    $.fn.feedbackPlugin.defaults = {
        'color': '#fff',
        'lang': 'de',
        'backgroundColor': '#7c9009',
        'fallbackLang': 'en',
        'distPath': 'dist/',
        'userId': '',
        'dialogCSSClass': 'feedback-dialog',
        'colorPickerCSSClass': 'color-picker',
        'defaultStrokeWidth': 4
    };
};

(function ($, window, document) {
    feedbackPluginModule($, window, document);
})(jQuery, window, document);

requirejs.config({
    "shim": {
        "feedbackPlugin": ["jquery"]
    }
});