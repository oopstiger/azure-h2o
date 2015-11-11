# A collection of web apps

app path | description
---- | ----
/badge | badge svg image generator.

## badge - badge svg image generator
Generates a SVG image like:
![Badge Image](http://h2o.azurewebsites.net/badge?h=build&b=passing&bc=4c1)


API Path: /badge 

e.g. The following link generates ![Demo Badge](http://h2o.azurewebsites.net/badge?h=hello&b=word) 

    http://h2o.azurewebsites.net/badge?h=head&b=body

Parameters that can be used to customize the badge:

param | required | description
---- | ---- | ---- 
h | YES | head text
b | YES | body text
hc | NO | head color, default 555
bc | NO | body color, default 007ec6
hw | NO | head width, default auto
bw | NO | body width, default auto
style | NO | badge style, may be 'travis' or 'flat'
foreground | NO | foreground color, default fff

> NOTE<br/>
> `hc`, `bc`, `foreground` color values are passed without '#' prefix.

## More...
