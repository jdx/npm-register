const npm = require('./npm')
const config = require('./config')
const warn = require('./warn')

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

module.exports = {
  get: get,
  save
}
