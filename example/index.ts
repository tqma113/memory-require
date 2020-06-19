import MFS from 'memory-fs'
import makeMemoryRequireFunction from '../src/index'


const mfs = new MFS()
const memoryRequire = makeMemoryRequireFunction(mfs)
mfs.mkdirpSync('/aaa/bbb/')
mfs.writeFileSync('/aaa/bbb/cc.js', 'module.exports = { test: "aaa" }')
const module = memoryRequire('/aaa/bbb/cc.js')