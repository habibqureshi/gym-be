const admin = require("firebase-admin");
const serviceAccount = require("../../firebase-credential.json");
const { UserModel, NotificationModel } = require("../models");
const {
  NOTIFY_ON,
  NOTIFICATION_STATUS,
  INVITATION_TYPE,
  NOTIFICATION_TYPE,
} = require("../utils/helpers/helper");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (
  senderUser,
  receiverUser,
  message,
  sendOnAppAndSystem,
  status
) => {
  try {
    console.log(
      `Notification sender service... ${senderUser}, message:${JSON.stringify(
        message
      )}`
    );
    // let notificationData;
    console.log(`creating message object..`);
    const messageToSend = {
      data: {
        data: JSON.stringify({
          sender: {
            id: `${senderUser.id}`,
            name: `${senderUser.name}`,
            userName: `${senderUser.userName}`,
          },
          message: message,
          actionPayload: message.actionPayload,
          status: status,
        }),
      },
    };
    const notification_options = {
      content_available: true,
      priority: "high",
    };
    console.log(
      `Sending Notification Message: ${JSON.stringify(messageToSend)}`
    );
    let firebaseMessageId = null;
    if (receiverUser.deviceToken) {
      const res = await admin
        .messaging()
        .sendToDevice(
          receiverUser.deviceToken,
          messageToSend,
          notification_options
        );
      firebaseMessageId =
        (res.results && res.results.length > 0 && res.results[0].messageId) ||
        null;
      console.log(
        `notification sent successfully Message Response: ${JSON.stringify(
          res
        )}`
      );
    } else {
      console.log(`receiver device token doesn't exist`);
      return await saveNotificationInDataBase(
        senderUser,
        receiverUser,
        message,
        firebaseMessageId,
        receiverUser.deviceToken,
        NOTIFY_ON.IN_APP,
        status
      );
    }
    console.log(`saving notification to database`);
    return await saveNotificationInDataBase(
      senderUser,
      receiverUser,
      message,
      firebaseMessageId,
      receiverUser.deviceToken,
      sendOnAppAndSystem,
      status
    );
  } catch (error) {
    console.log(`error while sending notification ${error}`);
    throw error;
  }
};

const saveDeviceToken = async ({ deviceToken }, currentUser) => {
  try {
    console.log(
      `saving Firebase token against currentUser: ${currentUser.name} and Token :${deviceToken}`
    );
    await UserModel.update(
      {
        deviceToken: deviceToken,
      },
      {
        where: {
          id: currentUser.id,
        },
      }
    );
    return {
      status: 200,
      message: `Token Updated Successfully`,
    };
  } catch (error) {
    console.log(`error while saving device token ${error}`);
    throw error;
  }
};

const saveNotificationInDataBase = async (
  currentUser,
  receiverUser,
  message,
  firebaseMessageId = null,
  deviceToken = null,
  sendOnAppAndSystem,
  status
) => {
  try {
    console.log(
      `Saving Notification to Database Message:${JSON.stringify(message)}`
    );
    console.log(`creating Object for NotificationModel`);
    const notificationObject = {
      sender: currentUser.id,
      receiver: receiverUser.id,
      firebaseMessageId: (firebaseMessageId && firebaseMessageId) || null,
      type: message.type,
      title: message.title,
      action: JSON.stringify(message.action),
      actionPayload: message.actionPayload
        ? JSON.stringify(message.actionPayload)
        : null,
      message: message.message,
      deviceToken: (deviceToken && deviceToken) || null,
      status: status,
    };
    console.log(
      `Notification Object to Create In DB:${JSON.stringify(
        notificationObject
      )}`
    );
    let notificationData;
    switch (sendOnAppAndSystem) {
      case NOTIFY_ON.BOTH:
        console.log(
          `creating SYSTEM and IN-APP notification ${JSON.stringify(
            notificationObject
          )}`
        );
        notificationData = await saveNotification([
          {
            ...notificationObject,
            targetSystem: NOTIFY_ON.IN_APP,
          },
          {
            ...notificationObject,
            targetSystem: NOTIFY_ON.SYSTEM,
          },
        ]);
        break;
      case NOTIFY_ON.IN_APP:
        console.log(
          `creating IN-APP notification ${JSON.stringify(notificationObject)}`
        );
        notificationData = await saveNotification([
          {
            ...notificationObject,
            targetSystem: NOTIFY_ON.IN_APP,
          },
        ]);
        break;
      case NOTIFY_ON.SYSTEM:
        console.log(
          `creating SYSTEM notification ${JSON.stringify(notificationObject)}`
        );
        notificationData = await saveNotification([
          {
            ...notificationObject,
            targetSystem: NOTIFY_ON.SYSTEM,
          },
        ]);
        break;
    }
    return notificationData;
  } catch (error) {
    console.log(`Error while saving notification in dataase ${error}`);
    throw error;
  }
};

const saveNotification = async (notificationData) => {
  console.log(`save notification as SYSTEM notification`);
  return await NotificationModel.bulkCreate(notificationData);
};

const updateNotification = async (
  currentUser,
  receiverId,
  type,
  status,
  message,
  id
) => {
  try {
    console.log(
      `disabling notification from both in-app and system sender:${currentUser.name}, receiver:${receiverId}, status:${status}`
    );
    const whereClause = {
      receiver: receiverId,
      sender: currentUser.id,
      type: type,
    };
    if (id) whereClause.id = id;
    const disableNotification = await NotificationModel.update(
      {
        status: status,
        message: message,
      },
      {
        where: whereClause,
      }
    );

    console.log(`disable notification ${disableNotification}`);
    return {
      status: 200,
      message: "diabled notification",
    };
  } catch (error) {
    console.log(`error while updating status of notification ${error}`);
    throw error;
  }
};

const deleteNotification = async (currentUser, receiverId, type, status) => {
  try {
    console.log(
      `deleting notification from both in-app and system sender:${currentUser.name}, receiver:${receiverId}, status:${status}`
    );

    const disableNotification = await NotificationModel.update(
      {
        status: status,
        deleted: true,
      },
      {
        where: {
          receiver: receiverId,
          sender: currentUser.id,
          type: type,
        },
      }
    );

    console.log(`deleting notification`);
    return {
      status: 200,
      message: "deleting notification",
    };
  } catch (error) {
    console.log(`error while deleting notification ${error}`);
    throw error;
  }
};

const notificationListing = async ({ pageNum = 1, limit = 5 }, currentUser) => {
  try {
    console.log(
      `listing Notifications ${(currentUser.userName, currentUser.id)}`
    );
    let offset = 0 + (pageNum - 1) * limit;
    const whereClause = {};
    whereClause["receiver"] = currentUser.id;
    whereClause["deleted"] = false;
    whereClause["targetSystem"] = NOTIFY_ON.IN_APP;

    console.log(
      `fetching all IN - APP notifications against user ${currentUser.userName}`
    );
    let notifications = await NotificationModel.findAndCountAll({
      where: whereClause,
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
      // raw: true,
      include: [
        {
          model: UserModel,
          as: "notification_sender",
          attributes: ["userName", "name"],
        },
      ],
    });
    console.log(`fetching sender details...`);
    console.log("notifications:", JSON.stringify(notifications));
    const notificationObj = [];
    console.log(`building reqiured object`);
    notifications.rows &&
      notifications.rows.map((item) => {
        console.log(item);
        notificationObj.push({
          id: item.id,
          sender: {
            id: item.sender,
            name: item.notification_sender
              ? item.notification_sender.name
              : null,
            userName: item.notification_sender
              ? item.notification_sender.userName
              : null,
          },
          message: {
            type: item.type,
            title: item.title,
            action: JSON.parse(item.action),
            text: item.message,
            actionPayload: JSON.parse(item.actionPayload),
          },
          status: item.status,
          targetSystem: item.targetSystem,
          firebaseMessageId: item.firebaseMessageId,
        });
      });

    console.log(`Notification object : ${JSON.stringify(notificationObj)}`);
    return {
      status: 200,
      messageCode: "notifications.found",
      items:
        (notificationObj.length > 0 && notificationObj) || notifications.rows,
      pagination: {
        totalItems: notifications.count,
        pageNum,
        entriesPerPage: limit,
      },
    };
  } catch (error) {
    console.log(`error while fetching notifications ${error} `);
    throw error;
  }
};

module.exports = {
  sendNotification,
  saveDeviceToken,
  updateNotification,
  notificationListing,
  deleteNotification,
};
