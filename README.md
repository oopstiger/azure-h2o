# H2O

A collection of web apps.

app path | description
---- | ----
/badge | A badge SVG image generator.

> **NOTE**<br/>
> http://h2o.azurewebsites.net/ is a test site hosted on a Azure **free** pricing plan container. Thus the service is unstable.

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

### Parameters
Name | Type | Required | Description
---- | ---- | ---- | ----
head | string | YES | head text
body | string | YES | body text
head-color | string | NO | head color, default #555*
body-color | string | NO | body color, default #007ec6
head-width | number | NO | head width, default 0(auto)*
body-width | number | NO | body width, default 0(auto)
style | string | NO | badge style, may be 'travis' or 'flat'
foreground | string | NO | text color, default white(#fff)

> NOTE<br/>
> - For convenience, color values such as `head-color` can be passed without '#' prefix.
> - Calculated text width is **inaccurate**, hope someone can help fix this.

## More...
