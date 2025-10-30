export const GetNotification = async (req, res) => {
    const id = req.user.id;
    try {
        const notifications = await Notification.find({ user_id: id,isRead:false }).sort({ createdAt: -1 });
        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    const id = req.user.id;
    try {
        await Notification.updateMany({ user_id:id , isRead:false },{ $set: { isRead:true }});
        res.status(200).json({ message: "Notifications are cleared" });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};