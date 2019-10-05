# y-log-io
Console loging to an other terminal. Useful to not disturb the main terminal output.

This console outputs to an other terminal to avoid disturbing the layout or primary informations of the main terminal output.

<u>Install :</u>ll<br/>ooo

```
npm install y-log-io
```

exemple 1 :


Script 1 : Get your logger (where you execute you code)
```javascript
const Log= require('y-log-io');
var logger=Log.getLogger(jsonPath);
logger.log('some',{data:{txt:'abcd',list:[0,1,2]}},['a','b','c']);
```
Script 2 : show output logs (where you execute you code)
```javascript
var output = YLog.getOutput(theSame_jsonPath);
output.start();
```
<br/>
