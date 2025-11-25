export const generateReferenceId = async (Model) => {
  const now = new Date()
  const year = now.getFullYear()
  const count = await Model.countDocuments({ createdAt: { $gte: new Date(`${year}-01-01T00:00:00Z`), $lt: new Date(`${year + 1}-01-01T00:00:00Z`) } })
  const seq = String(count + 1).padStart(3, '0')
  return `TECHHUB-${year}-${seq}`
}

