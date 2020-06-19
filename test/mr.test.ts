import MFS from 'memory-fs'
import makeMemoryRequireFunction from '../src/index'

describe("memory require", () => {
  describe('require', () => {
    it("work", () => {
      const mfs = new MFS()
      const memoryRequire = makeMemoryRequireFunction(mfs)

      mfs.mkdirpSync('/aaa/bbb/')
      mfs.writeFileSync('/aaa/bbb/cc.js', 'module.exports = { test: "aaa" }')
      const module = memoryRequire('/aaa/bbb/cc.js')
      
      expect(module.exports.test).toEqual('aaa')
    })
  })

  describe('require.cache', () => {

  })

  describe('require.extensions', () => {

  })

  describe('require.main', () => {

  })

  describe('require.resolve', () => {

  })

  describe('require.resolve.paths', () => {

  })
})