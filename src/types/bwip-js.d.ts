declare module 'bwip-js' {
  export interface ToBufferOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    width?: number;
    includetext?: boolean;
    textxalign?: string;
    [key: string]: any;
  }

  export function toBuffer(opts: ToBufferOptions): Promise<Buffer>;

  interface BwipJsStatic {
    toBuffer(opts: ToBufferOptions): Promise<Buffer>;
    [key: string]: any;
  }

  const bwipjs: BwipJsStatic;
  export default bwipjs;
}
