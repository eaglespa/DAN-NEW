declare module 'next/server' {
  export class NextRequest extends Request {
    json(): Promise<any>;
    nextUrl: URL;
  }
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
  }
}
