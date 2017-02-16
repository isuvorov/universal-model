import getGroupMeetingTemplate from './group_meeting'
import getMeetingConfirmitedTemplate from './meeting_confirmited'
import getMeetingRejectedTemplate from './meeting_rejected'
import getRecoveryPasswordTemplate from './recovery_password'
import getRequestMeetingHelpMeTemplate from './request_meeting_help_me'
import getRequestMeetingHelpYouTemplate from './request_meeting_help_you'
import getSignInTemplate from './sign_in'

export default () => {
  const service = {}
  service.templates = {
    group_meeting: getGroupMeetingTemplate,
    meeting_confirmited: getMeetingConfirmitedTemplate,
    meeting_rejected: getMeetingRejectedTemplate,
    recovery_password: getRecoveryPasswordTemplate,
    request_meeting_help_me: getRequestMeetingHelpMeTemplate,
    request_meeting_help_you: getRequestMeetingHelpYouTemplate,
    sign_in: getSignInTemplate,
  }

  service.getHtml = function (ctx, type, emailParams) {
    // console.log({ emailParams, type })
    if (this.templates[type]) {
      return this.templates[type](ctx, emailParams)
    }
    return null
  }
  return service
}
