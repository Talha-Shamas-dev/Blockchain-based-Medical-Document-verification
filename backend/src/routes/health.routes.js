/**
 * health.routes.js
 *
 * GET /api/health        — quick liveness probe (no auth, for load balancers)
 * GET /api/health/full   — deep status of Fabric, Redis, IPFS, Queue (auth required)
 * GET /api/health/fabric — just Fabric connectivity (useful for debugging)
 */

import express from 'express'
import os from 'os'
import { authenticate }    from '../middleware/auth.js'
import fabricService       from '../services/fabric.service.js'
import cacheService        from '../services/cache.service.js'
import ipfsService         from '../services/ipfs.service.js'
import notificationService from '../services/notification.service.js'
import { queueHealth }     from '../services/queue.service.js'
import { config }          from '../config/index.js'

const router  = express.Router()
const started = Date.now()

const uptime = () => {
  const s = Math.floor((Date.now() - started) / 1000)
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return `${h}h ${m}m ${sec}s`
}

// ── GET /api/health — liveness (no auth) ──────────────────────────────────────
router.get('/', (_req, res) =>
  res.json({
    status:    'ok',
    service:   'medchain-backend',
    version:   '2.0.0',
    uptime:    uptime(),
    channel:   config.fabric.channel,
    chaincode: config.fabric.chaincode,
    ts:        new Date().toISOString(),
  })
)

// ── GET /api/health/fabric — Fabric-only check (useful for debugging) ─────────
router.get('/fabric', authenticate, async (_req, res) => {
  const result = await fabricService.healthCheck()
  res.status(result.status === 'ok' ? 200 : 503).json(result)
})

// ── GET /api/health/full — deep check (auth required) ─────────────────────────
router.get('/full', authenticate, async (_req, res) => {
  const [fabric, cache, ipfs, queue, cacheStats] = await Promise.allSettled([
    fabricService.healthCheck(),
    cacheService.healthCheck(),
    ipfsService.healthCheck(),
    queueHealth(),
    cacheService.stats(),
  ])

  const get = r => r.status === 'fulfilled' ? r.value : { status: 'error', error: r.reason?.message }
  const checks = {
    fabric:     get(fabric),
    cache:      get(cache),
    ipfs:       get(ipfs),
    queue:      get(queue),
    cacheStats: get(cacheStats),
  }

  const allOk = ['fabric','cache'].every(k => ['ok','simulated'].includes(checks[k]?.status))

  res.status(allOk ? 200 : 503).json({
    status:    allOk ? 'healthy' : 'degraded',
    uptime:    uptime(),
    wsClients: notificationService.connectedCount,
    fabric: {
      channel:   config.fabric.channel,
      chaincode: config.fabric.chaincode,
      peer:      config.fabric.peerAddr,
      user:      `${config.fabric.user}@${config.fabric.orgDomain}`,
    },
    system: {
      node:   process.version,
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB used',
      cpu:    os.loadavg().map(v => v.toFixed(2)).join(' / ') + ' (1m/5m/15m)',
      cpus:   os.cpus().length,
    },
    checks,
    ts: new Date().toISOString(),
  })
})

export default router
