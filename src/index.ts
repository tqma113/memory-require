import vm from 'vm'
import path from 'path'
import type MFS from 'memory-fs'

interface MemoryModule extends NodeModule {
  paths: string[]
}

type AllowExtension = '.js' | '.json' | '.node'

const FilenameExtensionRegex = /(?:\.([^.]+))?$/

const isWindows = process.platform === 'win32'

export default function makeMemoryRequireFunction(mfs: MFS): NodeRequire {
  let cache: NodeJS.Dict<MemoryModule> = {}
  const extensions: NodeJS.RequireExtensions = {
    '.js': (module: MemoryModule, filename: string) => {
      const dirname = path.dirname(filename)
      const content = mfs.readFileSync(filename, 'utf8')
      const wrapper = warp(content)
      const compiledWrapper = vm.runInThisContext(wrapper, {
        filename,
        lineOffset: 0,
        displayErrors: true
      })
      compiledWrapper(
        module.exports,
        require,
        module,
        filename,
        dirname
      )
    },
    '.json':  (module: MemoryModule, filename: string) => {
      const content = mfs.readFileSync(filename, 'utf8')
      try {
        module.exports = JSON.stringify(stripBOM(content));
      } catch (err) {
        err.message = filename + ': ' + err.message;
        throw err;
      }
    },
    '.node': (module: MemoryModule, filename: string) => {
      // @ts-ignore
      return process.dlopen(
        module,
        path.toNamespacedPath(filename)
      )
    }
  }

  let memoryRequire: NodeRequire
  const _memoryRequire = (id: string): any => {
    if (id === '') {
      throw new Error(`id: ${id} must be a non-empty string`);
    }

    try {
      return load(id, memoryRequire);
    } catch {
      return require(id)
    }
  }

  const memoryResolve = makeMemoryResolveFunction(mfs)

  let main: MemoryModule | undefined = require.main

  // @ts-ignore
  memoryRequire = Object.assign(
    _memoryRequire,
    {
      resolve: memoryResolve,
      cache,
      extensions,
      main
    }
  )

  return memoryRequire
}

export function makeMemoryResolveFunction(mfs: MFS): RequireResolve {
  const memoryResolve = (id: string, options?: { paths?: string[]; }): string => {
    return path.basename(id)
  }

  const paths = (request: string): string[] | null => {
    return resolvePaths(request)
  }

  return Object.assign(
    memoryResolve,
    {
      paths
    }
  )
}

export function makeMemoryModule(id: string, require: NodeRequire) {
  return {
    id,
    filename: path.basename(id),
    paths: resolvePaths(path.dirname(id)),
    exports: {},
    require,
    loaded: false,
    parent: null,
    children: []
  }
}

function warp(script: string) {
  return `(function (exports, require, module, __filename, __dirname) { ${script} \n});`
}

function stripBOM(content: string) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

function load(id: string, memoryRequire: NodeRequire): MemoryModule {
  const filename = path.basename(id)
  const regexArr = FilenameExtensionRegex.exec(filename)
  if (regexArr) {
    const extension = regexArr[0]
    if (extension in memoryRequire.extensions) {
      const module = makeMemoryModule(id, memoryRequire)
      memoryRequire.extensions[extension as AllowExtension](module, id)
      return module
    } else {
      throw new Error(`the extension ${extension} of ${id} is not supported`)
    }
  } else {
    throw new Error(`the file ${id} need extension`)
  }
}

function resolvePaths(from: string) {
  if (isWindows) {
    from = path.resolve(from)
    return from.split('\\\\').filter(Boolean)
  } else { // posix
    from = path.resolve(from)
    return from.split('/').filter(Boolean)
  };
}