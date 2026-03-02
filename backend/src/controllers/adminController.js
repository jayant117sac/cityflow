const prisma = require('../lib/prisma');

exports.getAnalytics = async (req, res) => {
  const total = await prisma.complaint.count();
  const pending = await prisma.complaint.count({ where: { status: 'Pending' } });
  const inProgress = await prisma.complaint.count({ where: { status: 'InProgress' } });
  const resolved = await prisma.complaint.count({ where: { status: 'Resolved' } });

  res.json({ total, pending, inProgress, resolved });
};