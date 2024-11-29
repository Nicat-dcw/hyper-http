export class Context {
  public params: Record<string, string> = {};
  private _body: any = null;
  private _bodyParsed: boolean = false;

  constructor(public request: Request, private response: Response) {}

  get url() {
    return new URL(this.request.url);
  }

  get query() {
    return Object.fromEntries(this.url.searchParams);
  }

  async parseBody() {
    if (this._bodyParsed) return this._body;

    try {
      const contentType = this.request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        this._body = await this.request.json();
      } else if (contentType?.includes('text/plain')) {
        this._body = await this.request.text();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const text = await this.request.text();
        this._body = Object.fromEntries(new URLSearchParams(text));
      } else {

        this._body = await this.request.text();
      }
    } catch (error) {
      console.error('Error parsing body:', error);
      this._body = null;
    }

    this._bodyParsed = true;
    return this._body;
  }


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


  get body() {
    if (!this._bodyParsed) {
      throw new Error('Body not parsed. Call parseBody() first or use async body access.');
    }
    return this._body;
  }

  


  async data() {
    return await this.parseBody();
  }
}