'use strict'

const debug = require('debug')
const log = debug('http-api:block')
log.error = debug('http-api:block:error')
const multiaddr = require('multiaddr')

exports = module.exports

// common pre request handler that parses the args and returns `addr` which is assigned to `request.pre.args`
exports.parseAddrs = (request, reply) => {
  if (!request.query.arg) {
    return reply("Argument 'addr' is required").code(400).takeover()
  }

  try {
    multiaddr(request.query.arg)
  } catch (err) {
    return reply("Argument 'addr' is invalid").code(500).takeover()
  }

  return reply({
    addr: request.query.arg
  })
}

exports.peers = {
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    ipfs.swarm.peers((err, peers) => {
      if (err) {
        log.error(err)
        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      return reply({
        Strings: peers.map((addr) => addr.toString())
      })
    })
  }
}

exports.addrs = {
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    ipfs.swarm.addrs((err, peers) => {
      if (err) {
        log.error(err)
        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      const addrs = {}
      peers.forEach((peer) => {
        addrs[peer.id.toB58String()] = peer.multiaddrs.map((addr) => addr.toString())
      })

      return reply({
        Addrs: addrs
      })
    })
  }
}

exports.localAddrs = {
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    ipfs.swarm.localAddrs((err, addrs) => {
      if (err) {
        log.error(err)
        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      return reply({
        Strings: addrs.map((addr) => addr.toString())
      })
    })
  }
}

exports.connect = {
  // uses common parseAddr method that returns a `addr`
  parseArgs: exports.parseAddrs,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const addr = request.pre.args.addr
    const ipfs = request.server.app.ipfs

    ipfs.swarm.connect(addr, (err) => {
      if (err) {
        log.error(err)
        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      return reply({
        Strings: [`connect ${addr} success`]
      })
    })
  }
}

exports.disconnect = {
  // uses common parseAddr method that returns a `addr`
  parseArgs: exports.parseAddrs,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const addr = request.pre.args.addr
    const ipfs = request.server.app.ipfs

    ipfs.swarm.disconnect(addr, (err) => {
      if (err) {
        log.error(err)
        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      return reply({
        Strings: [`disconnect ${addr} success`]
      })
    })
  }
}
