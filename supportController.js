import Support from "../models/Support.js";

// helper to map _id -> id
const toDTO = (doc) => ({
  id: doc._id.toString(),
  userId: doc.userId,
  username: doc.username,
  useremail: doc.useremail,
  subject: doc.subject,
  message: doc.message,
  imageUrl: doc.imageUrl,
  status: doc.status,
  adminSeen: doc.adminSeen,
  createdAt: doc.createdAt,
  replies: doc.replies?.map((r) => ({
    id: r._id.toString(),
    message: r.message,
    isAdmin: r.isAdmin,
    createdAt: r.createdAt,
    imageUrl: r.imageUrl,
  })) || [],
});

export const createTicket = async (req, res) => {
  try {
    const { userId, username, useremail, subject, message } = req.body;
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url || "";
    }
    const ticket = await Support.create({ userId, username, useremail, subject, message, imageUrl });
    res.status(201).json(toDTO(ticket));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const tickets = await Support.find(query).sort({ createdAt: -1 });
    res.json(tickets.map(toDTO));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    console.log(`[getTicketById] Fetching ticket for id: ${req.params.id} at ${new Date().toISOString()}`);
    const t = await Support.findById(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });
    res.json(toDTO(t));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const addReply = async (req, res) => {
  try {
    const { message, isAdmin } = req.body;

    let imageUrl = "";

    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url || "";
    }

    const t = await Support.findById(req.params.id);

    if (!t) return res.status(404).json({ message: "Not found" });

    const isAdminBool = String(isAdmin).toLowerCase() === "true";
    console.log("admin bool :", isAdminBool, req.params.id)

    if (isAdminBool) {
      await Support.findByIdAndUpdate(req.params.id, { adminSeen: false });
    } else {
      await Support.findByIdAndUpdate(req.params.id, { adminSeen: true });
    }

    t.replies.push({ message, isAdmin: isAdminBool, imageUrl });

    await t.save();

    res.status(201).json(toDTO(t));

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const t = await Support.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!t) return res.status(404).json({ message: "Not found" });
    res.json(toDTO(t));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const t = await Support.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
