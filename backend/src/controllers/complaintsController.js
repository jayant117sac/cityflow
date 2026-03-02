const prisma = require('../lib/prisma');

exports.getComplaints = async (req, res) => {
  const { role, id } = req.user;
  const where = role === 'citizen' ? { userId: id } : {};
  const complaints = await prisma.complaint.findMany({
    where,
    include: { user: { select: { name: true, email: true } }, department: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(complaints);
};

exports.createComplaint = async (req, res) => {
  const { title, category, description, lat, lng } = req.body;
  const complaint = await prisma.complaint.create({
    data: {
      title, category, description,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      userId: req.user.id,
    },
  });
  res.status(201).json(complaint);
};

exports.getComplaintById = async (req, res) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { statusUpdates: true, feedback: true, department: true },
  });
  if (!complaint) return res.status(404).json({ message: 'Not found' });
  res.json(complaint);
};

const { sendStatusUpdate } = require('../services/emailService');

exports.updateStatus = async (req, res) => {
  const { status, note } = req.body;
  const complaintId = parseInt(req.params.id);

  // Get complaint with user details for email
  const existing = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: { user: true },
  });

  if (!existing) return res.status(404).json({ message: 'Complaint not found' });

  const complaint = await prisma.complaint.update({
    where: { id: complaintId },
    data: { status },
  });

  await prisma.statusUpdate.create({
    data: { complaintId, status, note, updatedByUserId: req.user.id },
  });

  // Send email notification (don't await — don't block the response)
  sendStatusUpdate({
    to: existing.user.email,
    name: existing.user.name,
    complaintTitle: existing.title,
    newStatus: status,
  }).catch((err) => console.error('Email error:', err));

  res.json(complaint);
};

exports.assignComplaint = async (req, res) => {
  const { departmentId } = req.body;
  const complaint = await prisma.complaint.update({
    where: { id: parseInt(req.params.id) },
    data: { assignedDept: departmentId },
  });
  res.json(complaint);
};