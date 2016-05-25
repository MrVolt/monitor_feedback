;(function ($, window, document, undefined) {
    var dialog;

    initMechanisms = function (data) {
        var textConfig = data[0];

        $('span#textTypeMaxLength').text($('textarea#textTypeText').val.length + '/' + textConfig.parameters[2].value);
        $('#serverResponse').removeClass().text('');

        var currentRatingValue = 0;
        $(".rating-input").starRating({
            starSize: 25,
            useFullStars: true,
            disableAfterRate: false,
            callback: function(currentRating, $el) {
                currentRatingValue = currentRating;
            }
        });

        $('#feedbackContainer').dialog('option', 'title', textConfig.parameters[0].value);
        dialog.dialog("open");

        $('button#submitFeedback').on('click', function (event) {
            event.preventDefault();

            var text = $('textarea#textTypeText').val();

            $('#serverResponse').removeClass();

            var feedbackObject =  {
                "title": "Feedback",
                "application": "energiesparkonto.de",
                "user": "uid12839120",
                "text": text,
                "configVersion": 1.0,
                "ratings":
                    [
                        {
                            "title": $('.rating-text').text().trim(),
                            "rating": currentRatingValue
                        }
                    ]
            };

            $.ajax({
                url: 'http://ec2-54-175-37-30.compute-1.amazonaws.com/feedback_repository/example/feedback',
                type: 'POST',
                data: JSON.stringify(feedbackObject),
                success: function (data) {
                    $('#serverResponse').addClass('success').text('Your feedback was successfully sent');
                    $('textarea#textTypeText').val('');
                },
                error: function (data) {
                    $('#serverResponse').addClass('error').text('Failure: ' + JSON.stringify(data));
                }
            });
        });

        var maxLength = textConfig.parameters[2].value;
        $('textarea#textTypeText').on('keyup focus', function() {
            $('span#textTypeMaxLength').text($(this).val().length + '/' + maxLength);
        });
    };

    $.fn.feedback = function (options) {
        this.options = $.extend({}, $.fn.feedback.defaults, options);
        var currentOptions = this.options;
        var active = false;
        var dialogContainer = $('#feedbackContainer');

        this.css('background-color', currentOptions.backgroundColor);
        this.css('color', currentOptions.color);

        dialog = dialogContainer.dialog({
            autoOpen: false,
            height: 'auto',
            width: 'auto',
            minWidth: 500,
            modal: true,
            title: 'Feedback',
            buttons: {
            },
            close: function() {
                dialog.dialog("close");
                active = false;
            }
        });

        dialogContainer.find('.feedback-page').hide();
        dialogContainer.find('.feedback-page[data-feedback-page="1"]').show();

        dialogContainer.find('.feedback-dialog-forward').on('click', function(event) {
            event.preventDefault();
            event.stopPropagation();

            var feedbackPage = $(this).closest('.feedback-page');
            var pageNumber = feedbackPage.data('feedback-page');
            var nextPageNumber = pageNumber + 1;

            feedbackPage.hide();
            var nextPage = $('.feedback-page[data-feedback-page="' + nextPageNumber + '"]');
            nextPage.show();

            if(nextPage.find('#textReview').length > 0) {
                nextPage.find('#textReview').text($('textarea#textTypeText').val());
            }
        });
        dialogContainer.find('.feedback-dialog-backward').on('click', function(event) {
            event.preventDefault();
            event.stopPropagation();

            var feedbackPage = $(this).closest('.feedback-page');
            var pageNumber = feedbackPage.data('feedback-page');
            var nextPage = pageNumber - 1;

            feedbackPage.hide();
            $('.feedback-page[data-feedback-page="' + nextPage + '"]').show();
        });

        this.on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!active) {
                $.get(currentOptions.backendUrl, null, function (data) {
                    initMechanisms(data);
                });
            } else {
                dialog.dialog("close");
            }
            active = !active;
        });
        return this;
    };

    $.fn.feedback.defaults = {
        'color': '#fff',
        'backgroundColor': '#a4e271',
        'backendUrl': 'http://ec2-54-175-37-30.compute-1.amazonaws.com/FeedbackConfiguration/text_rating.json',
        'postUrl': 'http://ec2-54-175-37-30.compute-1.amazonaws.com/feedback_repository/example/feedback'
    };

})(jQuery, window, document);