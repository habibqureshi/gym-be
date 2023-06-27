const validateEmail = (mail) =>
  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail) ? true : false;
const getOffset = ({ limit, page }) => {
  return (page - 1) * limit;
};

class NotificationMessage {
  constructor(title, type, action, message, actionPayload = null) {
    this.title = title;
    this.type = type;
    this.action = action;
    this.message = message;
    this.actionPayload = actionPayload;
  }
}

const NOTIFICATION_STATUS = {
  PENDING: "PENDING",
  POSITIVE: "POSITIVE",
  NEGATIVE: "NEGATIVE",
};

const NOTIFY_ON = {
  SYSTEM: "SYSTEM",
  IN_APP: "IN_APP",
  BOTH: "SYSTEM_IN_APP",
};

const NOTIFICATION_TYPE = {
  INVITE: "INVITE",
  PROPERTY_SHARING: "SHARING",
  NONE: "NONE",
  INVITE_REVOKED: "INVITE_REVOKED",
  DOWNLOAD_HISTORY: "Download_History",
  MY_PRIVATES: "My_Privates",
  MY_CALENDER: "My Calendar",
  COACH: "Coach",
};

module.exports = {
  validateEmail,
  getOffset,
  NotificationMessage,
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPE,
  NOTIFY_ON,
};
