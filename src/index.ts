import path from 'path'
import type MFS from 'memory-fs'

interface MemoryModule extends NodeModule {
  exports: any
  require: NodeRequire
  id: string
  filename: string
  loaded: boolean
  parent: MemoryModule | null
  children: MemoryModule[]
  path: string
  paths: string[]
}

function makeModule(id: string, require: NodeRequire) {
  return {
    id,
    path: path.dirname(id),
    filename: path.basename(id),
    paths: [],
    exports: {},
    require,
    loaded: false,
    parent: null,
    children: []
  }
}

class MemoryModule implements NodeModule {
  exports: any
  require: NodeRequire;
  id: string;
  filename: string;
  loaded: boolean;
  parent: MemoryModule | null;
  children: MemoryModule[];
  path: string
  paths: string[];
  constructor() {
    this.id = id;
    this.paths = []
    this.path = path.dirname(id);
    this.parent = null
    this.exports = {};
    this.require = require
    this.filename = null as any as string;
    this.loaded = false;
    this.children = [];
  }
}

export default function makeMemoryRequireFunction(mfs: MFS): NodeRequire {
  let cache: NodeJS.Dict<MemoryModule> = {}
  let extensions: NodeJS.RequireExtensions = {
    '.js': () => {},
    '.json':  () => {},
    '.node': () => {}
  }

  const memoryRequire = (id: string): any => {

  }

  const memoryResolve = makeMemoryResolveFunction(mfs)

  let main: MemoryModule | undefined = undefined

  return Object.assign(
    memoryRequire,
    {
      resolve: memoryResolve,
      cache,
      extensions,
      main
    }
  )
}

export function makeMemoryResolveFunction(mfs: MFS): RequireResolve {
  const memoryResolve = (id: string, options?: { paths?: string[]; }): string => {

  }

  const paths = (request: string): string[] | null => {

  }

  return Object.assign(
    memoryResolve,
    {
      paths
    }
  )
}