import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: userId }, { seen: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getNotifications:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Powiadomienia zostały usunięte" });
  } catch (error) {
    console.log("Error in deleteNotifications:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

// export const deleteOneNotification = async (req, res) => {
//   try {
//     const notificationId = req.params.id;
//     const userId = req.user._id;
//     await Notification.findById(notificationId);
//     if (!notification) {
//       return res.status(404).json({ error: "Powiadomienie nie istnieje" });
//     }
//     if (notification.to.toString() !== userId.toString()) {
//       return res
//         .status(403)
//         .json({ error: "Nie masz uprawnien do usuniecia tego powiadomienia" });
//     }

//     await Notification.findByIdAndDelete(notificationId);

//     res.status(200).json({ message: "Powiadomienie zostało usunięte" });
//   } catch (error) {
//     console.log("Error in deleteOneNotification:", error.message);
//     res.status(500).json({ error: "Błąd serwera" });
//   }
// };
