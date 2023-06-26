const { sendNotification } = require("../../services/notification.service");
const {
  NOTIFY_ON,
  NOTIFICATION_STATUS,
  INVITATION_TYPE,
  NOTIFICATION_TYPE,
  NotificationMessage,
} = require("../../utils/helpers/helper");

const { UserModel } = require("../../models");

const notifyUser = async (clientId, currentUser, msg) => {
  const user = await UserModel.findOne({ where: { id: clientId }, raw: true });
  console.log("msg: ", msg);
  const message = new NotificationMessage(
    "Private Booking",
    NOTIFICATION_TYPE.NONE,
    { positive: "", negative: "", neutral: "OK" },
    msg
  );
  console.log(`sending notification by userId:${clientId}`);

  return await sendNotification(
    {
      id: currentUser.id,
      name: currentUser.name,
      userName: currentUser.userName,
    },
    user,
    message,
    NOTIFY_ON.IN_APP,
    null
  );
};

module.exports = { notifyUser };
