export const apiEndpointOrchestrator = 'http://ec2-54-175-37-30.compute-1.amazonaws.com/';
export const applicationPath = 'orchestrator/feedback/{lang}/applications/';
export const applicationId = 4;
export const applicationName = 'energiesparkonto.de';

export const apiEndpointRepository = 'http://ec2-54-175-37-30.compute-1.amazonaws.com/';
export const feedbackPath = "feedback_repository/{lang}/feedbacks";

export const feedbackObjectTitle = 'Feedback';

export const defaultSuccessMessage = 'Your feedback was successfully sent';

export const dialogOptions = {
    autoOpen: false,
    height: 'auto',
    width: 'auto',
    minWidth: 500,
    modal: true,
    title: 'Feedback',
    buttons: {},
    resizable: false
};

export const mechanismTypes = {
    textType: 'TEXT_TYPE',
    ratingType: 'RATING_TYPE',
    screenshotType: 'SCREENSHOT_TYPE',
    audioType: 'AUDIO_TYPE',
    categoryType: 'CATEGORY_TYPE',
    attachmentType: 'ATTACHMENT_TYPE'
};

export const configurationTypes = {
    push: 'PUSH',
    pull: 'PULL'
};

export const cookieNames = {
  lastTriggered: 'lastTriggered'
};