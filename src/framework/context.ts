export class Context {
  public params: Record<string, string> = {};
  private _body: any;

  constructor(public request: Request, private response: Response) {}

  get url() {
    return new URL(this.request.url);
  }

  get query() {
    return Object.fromEntries(this.url.searchParams);
  }

  async parseBody() {
    if (!this._body) {
      const contentType = this.request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        this._body = await this.request.json();
      } else if (contentType?.includes('text')) {
        this._body = await this.request.text();
      } else {
        this._body = await this.request.text();
      }
    }
    return this._body;
  }

  // Response helpers
  json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  text(data: string, status = 200) {
    return new Response(data, {
      status,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  html(data: string, status = 200) {
    return new Response(data, {
      status,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  redirect(url: string, status = 302) {
    return new Response(null, {
      status,
      headers: { Location: url },
    });
  }

  // Request body getters
  get body() {
    return this._body;
  }

  get data(): any {
    return this._body;
  }
}