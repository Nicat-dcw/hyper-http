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
    if (this._body !== undefined) return this._body;

    try {
      const contentType = this.request.headers.get('content-type');
      const bodyText = await this.request.text();

      // Check if body is empty
      if (!bodyText) {
        this._body = null;
        return null;
      }

      // Try parsing JSON if content type is JSON
      if (contentType?.includes('application/json')) {
        try {
          this._body = JSON.parse(bodyText);
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          this._body = bodyText;
        }
      } else {
        this._body = bodyText;
      }
    } catch (error) {
      console.error('Error parsing body:', error);
      this._body = null;
    }

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
    return this._body;
  }

  get data() {
    return this._body;
  }
}