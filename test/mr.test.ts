import MFS from 'memory-fs'
import makeMemoryRequireFunction from '../src/index'

describe("memory require", () => {
  describe('require', () => {
    it("absolutive", () => {
      const mfs = new MFS()
      const memoryRequire = makeMemoryRequireFunction(mfs)

      mfs.mkdirpSync('/aaa/bbb/')
      mfs.writeFileSync('/aaa/bbb/cc.js', 'module.exports = { test: "aaa" }')
      const module = memoryRequire('/aaa/bbb/cc.js')

      expect(module.exports.test).toEqual('aaa')
    })

    it.todo("relative")
  })

  describe('require.cache', () => {
    it('work', () => {
      const mfs = new MFS()
      const memoryRequire = makeMemoryRequireFunction(mfs)

      mfs.mkdirpSync('/aaa/bbb/')
      mfs.writeFileSync('/aaa/bbb/cc.js', 'module.exports = { test: "aaa" }')
      const module = memoryRequire('/aaa/bbb/cc.js')

      expect(module.exports.test).toEqual('aaa')
      expect(memoryRequire.cache['/aaa/bbb/cc.js']?.exports.test).toEqual('aaa')
    })
  })

  describe('require.extensions', () => {
    it.todo('Deprecated')
  })

  describe('require.main', () => {
    it('work', () => {
      const mfs = new MFS()
      const memoryRequire = makeMemoryRequireFunction(mfs, require)

      expect(memoryRequire.main).toStrictEqual(require.main)
    })
  })

  describe('require.resolve', () => {
    it('exsit', () => {
      const mfs = new MFS()
      const memoryRequire = makeMemoryRequireFunction(mfs, require)

      mfs.mkdirpSync('/aaa/bbb/')
      mfs.writeFileSync('/aaa/bbb/cc.js', 'module.exports = { test: "aaa" }')

      expect(memoryRequire.resolve('/aaa/bbb/cc.js')).toStrictEqual('/aaa/bbb/cc.js')
    })

    it('not exsit', () => {
      const mfs = new MFS()
      const memoryRequire = makeMemoryRequireFunction(mfs, require)

      expect(memoryRequire.resolve('../src/index.ts')).toStrictEqual(require.resolve('../src/index.ts'))
    })
  })

  describe('require.resolve.paths', () => {
    it('work', () => {
      const mfs = new MFS()
      const memoryRequire = makeMemoryRequireFunction(mfs, require)

      expect(memoryRequire.resolve.paths('../')).toStrictEqual(require.resolve.paths('../'))
      expect(memoryRequire.resolve.paths('/')).toStrictEqual(require.resolve.paths('/'))
    })
  })
})