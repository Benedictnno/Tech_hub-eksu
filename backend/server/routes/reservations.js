import express from 'express'
import Joi from 'joi'
import Application from '../models/Application.js'
import { protect, admin } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { generateReferenceId } from '../utils/reference.js'
import { sendEmail } from '../utils/email.js'

const router = express.Router()

const trackSchema = Joi.object({
  referenceId: Joi.string().required()
})

const submitSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  organizationName: Joi.string().required(),
  eventTitle: Joi.string().required(),
  eventDate: Joi.date().iso().required(),
  description: Joi.string().required(),
  link: Joi.string().uri().optional()
})

router.get('/applications/track', validate(trackSchema, 'query'), async (req, res) => {
  const { referenceId } = req.query
  const appDoc = await Application.findOne({ referenceId }).select('eventTitle organizationName status paymentStatus eventDate referenceId')
  if (!appDoc) return res.status(404).json({ message: 'Application not found' })
  res.json(appDoc)
})

const cancelSchema = Joi.object({
  referenceId: Joi.string().required(),
  email: Joi.string().email().required()
})

const resubmitSchema = Joi.object({
  referenceId: Joi.string().required(),
  email: Joi.string().email().required(),
  fullName: Joi.string().optional(),
  phone: Joi.string().optional(),
  organizationName: Joi.string().optional(),
  eventTitle: Joi.string().optional(),
  eventDate: Joi.date().iso().optional(),
  description: Joi.string().optional(),
  link: Joi.string().uri().optional()
})

router.post('/applications/cancel', validate(cancelSchema), async (req, res) => {
  const { referenceId, email } = req.body
  const appDoc = await Application.findOne({ referenceId, email })
  if (!appDoc) return res.status(404).json({ message: 'Application not found' })
  if (!['Pending', 'Approved - Awaiting Payment'].includes(appDoc.status)) {
    return res.status(400).json({ message: 'Only pending or awaiting payment applications can be cancelled' })
  }
  if (appDoc.paymentStatus === 'Paid') {
    return res.status(400).json({ message: 'Paid applications cannot be cancelled via this endpoint' })
  }
  appDoc.status = 'Cancelled'
  await appDoc.save()
  await sendEmail({ to: appDoc.email, subject: 'Reservation Cancelled', html: `<p>Your application ${appDoc.referenceId} has been cancelled.</p>` })
  res.json(appDoc)
})

router.post('/applications/resubmit', validate(resubmitSchema), async (req, res) => {
  const { referenceId, email, ...updates } = req.body
  const appDoc = await Application.findOne({ referenceId, email })
  if (!appDoc) return res.status(404).json({ message: 'Application not found' })
  if (!['Rejected', 'Cancelled'].includes(appDoc.status)) {
    return res.status(400).json({ message: 'Only rejected or cancelled applications can be resubmitted' })
  }
  Object.assign(appDoc, updates)
  appDoc.status = 'Pending'
  appDoc.paymentStatus = 'Pending'
  appDoc.paymentDeadline = undefined
  appDoc.paystack = { authorizationUrl: null, reference: null, accessCode: null }
  await appDoc.save()
  await sendEmail({ to: appDoc.email, subject: 'Reservation Resubmitted', html: `<p>Your application ${appDoc.referenceId} has been resubmitted for review.</p>` })
  res.json(appDoc)
})

router.post('/applications', validate(submitSchema), async (req, res) => {
  const referenceId = await generateReferenceId(Application)
  const appDoc = await Application.create({ ...req.body, referenceId, status: 'Pending', paymentStatus: 'Pending' })
  res.status(201).json(appDoc)
})

router.get('/admin/applications/pending', protect, admin, async (req, res) => {
  const apps = await Application.find({ status: 'Pending' }).sort({ createdAt: -1 })
  res.json(apps)
})

router.get('/admin/applications/:id', protect, admin, async (req, res) => {
  const appDoc = await Application.findById(req.params.id)
  if (!appDoc) return res.status(404).json({ message: 'Not found' })
  res.json(appDoc)
})

router.get('/admin/applications', protect, admin, async (req, res) => {
  const { status, startDate, endDate, page = '1', limit = '20' } = req.query
  const p = Math.max(parseInt(page, 10) || 1, 1)
  const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)

  const query = {}
  if (status) query.status = status
  if (startDate && endDate) {
    const start = new Date(startDate)
    start.setHours(0,0,0,0)
    const end = new Date(endDate)
    end.setHours(23,59,59,999)
    query.eventDate = { $gte: start, $lte: end }
  }

  const total = await Application.countDocuments(query)
  const items = await Application.find(query)
    .sort({ createdAt: -1 })
    .skip((p - 1) * l)
    .limit(l)

  res.json({ total, page: p, pages: Math.ceil(total / l), limit: l, items })
})

router.post('/admin/applications/:id/reject', protect, admin, async (req, res) => {
  const appDoc = await Application.findById(req.params.id)
  if (!appDoc) return res.status(404).json({ message: 'Not found' })
  appDoc.status = 'Rejected'
  await appDoc.save()
  await sendEmail({ to: appDoc.email, subject: 'Reservation Rejected', html: `<p>Your application ${appDoc.referenceId} was rejected.</p>` })
  res.json(appDoc)
})

router.post('/admin/applications/:id/request-modifications', protect, admin, async (req, res) => {
  const appDoc = await Application.findById(req.params.id)
  if (!appDoc) return res.status(404).json({ message: 'Not found' })
  await sendEmail({ to: appDoc.email, subject: 'Reservation Needs Changes', html: `<p>Please modify your application ${appDoc.referenceId}.</p>` })
  res.json(appDoc)
})

router.post('/admin/applications/:id/approve', protect, admin, async (req, res) => {
  const appDoc = await Application.findById(req.params.id)
  if (!appDoc) return res.status(404).json({ message: 'Not found' })

  if (appDoc.status !== 'Pending') {
    return res.status(400).json({ message: 'Only pending applications can be approved' })
  }

  const now = new Date()
  const dayStart = new Date(appDoc.eventDate)
  dayStart.setHours(0,0,0,0)
  const conflict = await Application.findOne({
    eventDate: { $gte: dayStart, $lte: new Date(dayStart.getTime() + 24*60*60*1000 - 1) },
    status: { $in: ['Approved - Awaiting Payment', 'Approved - Payment Confirmed'] },
    ...( { $or: [ { paymentDeadline: { $exists: false } }, { paymentDeadline: { $gte: now } } ] } ),
    _id: { $ne: appDoc._id }
  })
  if (conflict) return res.status(409).json({ message: 'Date already reserved' })

  const deadlineHours = parseInt(process.env.RESERVATION_PAYMENT_DEADLINE_HOURS || '48', 10)
  const paymentDeadline = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000)

  let authorizationUrl = null
  let reference = null
  let accessCode = null

  if (process.env.PAYSTACK_SECRET_KEY) {
    const amountKobo = parseInt(process.env.RESERVATION_AMOUNT || '100000', 10)
    const paystackReference = `RES-${appDoc.referenceId}-${Date.now()}`
    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: appDoc.email, amount: amountKobo, reference: paystackReference, callback_url: process.env.PAYSTACK_CALLBACK_URL || '' })
    })

    const rawText = await initRes.text()
    console.log('Paystack init response:', initRes.status, rawText)

    if (!initRes.ok) {
      return res.status(502).json({
        message: 'Failed to initialize payment with Paystack',
        providerStatus: initRes.status
      })
    }

    const initJson = JSON.parse(rawText)
    if (initJson.status) {
      authorizationUrl = initJson.data.authorization_url
      reference = initJson.data.reference || paystackReference
      accessCode = initJson.data.access_code
    } else {
      return res.status(502).json({ message: 'Payment provider returned an error during initialization' })
    }
  }

  appDoc.status = 'Approved - Awaiting Payment'
  appDoc.paymentDeadline = paymentDeadline
  appDoc.paystack = { authorizationUrl, reference, accessCode }
  await appDoc.save()

  const payLink = authorizationUrl || (process.env.PAYSTACK_PUBLIC_PAY_URL ? `${process.env.PAYSTACK_PUBLIC_PAY_URL}?ref=${appDoc.referenceId}` : '')
  await sendEmail({ to: appDoc.email, subject: 'Reservation Approved', html: `<p>Reference: ${appDoc.referenceId}</p><p>Pay here: <a href="${payLink}">${payLink}</a></p><p>Deadline: ${paymentDeadline.toISOString()}</p>` })
  res.json(appDoc)
})

router.post('/paystack/webhook', async (req, res) => {
  const signature = req.headers['x-paystack-signature']
  if (!process.env.PAYSTACK_SECRET_KEY) return res.status(400).json({ message: 'Webhook not configured' })
  const crypto = await import('node:crypto')
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex')
  if (hash !== signature) return res.status(401).json({ message: 'Invalid signature' })
  const event = req.body
  if (event?.event === 'charge.success') {
    const ref = event.data?.reference
    const appDoc = await Application.findOne({ 'paystack.reference': ref })
    if (appDoc) {
      appDoc.paymentStatus = 'Paid'
      appDoc.status = 'Approved - Payment Confirmed'
      await appDoc.save()
      await sendEmail({ to: appDoc.email, subject: 'Reservation Confirmed', html: `<p>Payment confirmed for ${appDoc.referenceId}.</p>` })
    }
  }
  res.json({ received: true })
})

router.get('/admin/dashboard', protect, admin, async (req, res) => {
  const total = await Application.countDocuments()
  const statuses = ['Pending','Approved - Awaiting Payment','Approved - Payment Confirmed','Rejected','Cancelled']
  const byStatusAgg = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ])
  const byStatus = Object.fromEntries(statuses.map(s => [s, 0]))
  for (const row of byStatusAgg) byStatus[row._id] = row.count

  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const todayStart = new Date()
  todayStart.setHours(0,0,0,0)
  const todayEnd = new Date(todayStart.getTime())
  todayEnd.setHours(23,59,59,999)

  const approvedConfirmedUpcoming = await Application.countDocuments({ status: 'Approved - Payment Confirmed', eventDate: { $gte: now, $lte: in30 } })
  const awaitingPaymentUpcoming = await Application.countDocuments({ status: 'Approved - Awaiting Payment', eventDate: { $gte: now, $lte: in30 }, $or: [ { paymentDeadline: { $exists: false } }, { paymentDeadline: { $gte: now } } ] })
  const overdueAwaitingPayment = await Application.countDocuments({ status: 'Approved - Awaiting Payment', paymentDeadline: { $lt: now } })
  const eventsToday = await Application.countDocuments({ eventDate: { $gte: todayStart, $lte: todayEnd } })
  const latestPending = await Application.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(10)

  res.json({
    totalApplications: total,
    byStatus,
    eventsToday,
    upcoming: {
      approvedConfirmedUpcoming,
      awaitingPaymentUpcoming
    },
    overdueAwaitingPayment,
    latestPending
  })
})

export default router
