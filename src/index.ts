import path from 'path'
import type MFS from 'memory-fs'


const CHAR_COLON = 58 /* : */
const CHAR_FORWARD_SLASH = 47 /* / */
const CHAR_BACKWARD_SLASH = 92 /* \ */

const nmChars = [ 115, 101, 108, 117, 100, 111, 109, 95, 101, 100, 111, 110 ];
const nmLen = nmChars.length;

const isWindows = process.platform === 'win32'

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

function makeModule(id: string, require: NodeRequire) {
  const _path = path.dirname(id)
  const paths = resolvePaths(_path)

  return {
    id,
    path: _path,
    filename: path.basename(id),
    paths,
    exports: {},
    require,
    loaded: false,
    parent: null,
    children: []
  }
}

function resolvePaths(from: string) {
  if (isWindows) {
    // Guarantee that 'from' is absolute.
    from = path.resolve(from);

    // note: this approach *only* works when the path is guaranteed
    // to be absolute.  Doing a fully-edge-case-correct path.split
    // that works on both Windows and Posix is non-trivial.

    // return root node_modules when path is 'D:\\'.
    // path.resolve will make sure from.length >=3 in Windows.
    if (from.charCodeAt(from.length - 1) === CHAR_BACKWARD_SLASH &&
        from.charCodeAt(from.length - 2) === CHAR_COLON)
      return [from + 'node_modules'];

    const paths = [];
    for (let i = from.length - 1, p = 0, last = from.length; i >= 0; --i) {
      const code = from.charCodeAt(i);
      // The path segment separator check ('\' and '/') was used to get
      // node_modules path for every path segment.
      // Use colon as an extra condition since we can get node_modules
      // path for drive root like 'C:\node_modules' and don't need to
      // parse drive name.
      if (code === CHAR_BACKWARD_SLASH ||
          code === CHAR_FORWARD_SLASH ||
          code === CHAR_COLON) {
        if (p !== nmLen)
          paths.push(from.slice(0, last) + '\\node_modules');
        last = i;
        p = 0;
      } else if (p !== -1) {
        if (nmChars[p] === code) {
          ++p;
        } else {
          p = -1;
        }
      }
    }

    return paths;
  } else { // posix
    // Guarantee that 'from' is absolute.
    from = path.resolve(from);
    // Return early not only to avoid unnecessary work, but to *avoid* returning
    // an array of two items for a root: [ '//node_modules', '/node_modules' ]
    if (from === '/')
      return ['/node_modules'];

    // note: this approach *only* works when the path is guaranteed
    // to be absolute.  Doing a fully-edge-case-correct path.split
    // that works on both Windows and Posix is non-trivial.
    const paths = [];
    for (let i = from.length - 1, p = 0, last = from.length; i >= 0; --i) {
      const code = from.charCodeAt(i);
      if (code === CHAR_FORWARD_SLASH) {
        if (p !== nmLen)
          paths.push(from.slice(0, last) + '/node_modules');
        last = i;
        p = 0;
      } else if (p !== -1) {
        if (nmChars[p] === code) {
          ++p;
        } else {
          p = -1;
        }
      }
    }

    // Append /node_modules to handle root paths.
    paths.push('/node_modules');

    return paths;
  };
}