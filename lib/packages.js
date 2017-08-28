const npm = require('./npm')
const config = require('./config')
const warn = require('./warn')
const _ = require('lodash')

function save (pkg) {
  let key = `packages/${pkg.name}`
  console.log(`Saving ${key}`)
  return config.storage.put(key, pkg)
}

async function refreshPkg (npmPkg) {
  try {
    let storagePkg = await config.storage.getJSON(`packages/${npmPkg.name}`)
    if (!storagePkg) {
      await save(npmPkg)
      return
    }
    if (npmPkg._rev !== storagePkg._rev) {
      await save(npmPkg)
    }
  } catch (err) {
    warn(err, {pkg: npmPkg.name})
  }
}

async function get (name, etag) {
  let pkg = await npm.get(name, etag)
  if (pkg === 304) return 304
  if (pkg === 404) {
    pkg = await config.storage.getJSON(`packages/${name}`)
    if (!pkg) return 404
    return pkg
  }
  refreshPkg(pkg)
  return pkg
}

// traverses finding all dependents of a package
async function fetchAllDependents (name) {
  let pkg = await npm.getLatest(name)
  let deps = Object.keys(pkg.dependencies || {})
  if (!deps.length) return []
  let promises = []
  for (let dep of deps) {
    promises.push(fetchAllDependents(dep))
  }
  for (let subdeps of await Promise.all(promises)) {
    deps = deps.concat(subdeps)
  }
  return _.uniq(deps.sort())
}

module.exports = {
  get: get,
  save,
  fetchAllDependents
}
