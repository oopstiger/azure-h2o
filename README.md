# H2O

A collection of web apps.

app path | description
---- | ----
/badge | A badge SVG image generator.
/badge/health | HTTP health badge generator

All these apps can be tested on http://h2o.azurewebsites.net.
> **NOTE**<br/>
> _h2o.azurewebsites.net_ is hosted on a Azure free pricing plan container. **Do not use it in production.**

## badge - A badge SVG image generator
### API

    GET /badge?head=head&body=body

Or by POST method:

    POST /badge

```json
{
  "head": "head",
  "body": "body"
}
```
e.g. The following link generates ![Demo Badge](http://h2o.azurewebsites.net/badge?head=hello&body=world)

    http://h2o.azurewebsites.net/badge?head=hello&body=world

### Parameters<a name="badge-parameters"/>
Name | Type | Required | Description
---- | ---- | ---- | ----
head | string | YES | head text
body | string | YES | body text
head-color | string | NO | head color, default #555555(dark gray)*
body-color | string | NO | body color, default #7cbb00(green)
head-width | number | NO | head width, default 0(auto)*
body-width | number | NO | body width, default 0(auto)
style | string | NO | badge style, may be 'travis' or 'flat'
foreground | string | NO | text color, default #ffffff(white)

> NOTE<br/>
> - For convenience, color values such as `head-color` can be passed without '#' prefix.
> - Calculated text width is **inaccurate**, hope someone can help fix this.

## badge/health - HTTP health badge generator
### API

    GET /badge/health?url=example.com

e.g. The following link generates a badge image indicating the serving status of example.com ![Demo Badge](http://h2o.azurewebsites.net/badge/health?url=example.com)

    http://h2o.azurewebsites.net/badge/health?url=example.com

### Parameters
Name | Type | Required | Description
---- | ---- | ---- | ----
url | string | YES | URL to be tested
check-status | number | NO | checks status code returned by the URL, default 200.
check-response-time | number | NO | checks `X-Response-Time` header for load, default null(not checked).<br/>If the returned `X-Response-Time` header value is greater than this value, a WARN badge will be generated.

[Parameters of API /badge](#badge-parameters) can be used to control the visual style of generated badge.

> **NOTE**<br/>
> - If `check-response-time` is set but no `X-Response-Time` header is returned by the server, a FAIL badge will be generated.
> - For security reasons, the calling frequency of `/badge/health` is restricted to 1 time per 30 seconds per host.

## More...
