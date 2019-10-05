# y-log-io
Console loging to an other terminal. Useful to not disturb the main terminal output.

This console outputs to an other terminal to avoid disturbing the layout or primary informations of the main terminal output.

Install :

```
npm install y-log-io
```

<hr/>

**Exemple 1 : base use.**


Script 1 : Get your logger (where you execute you code)
```javascript
const Log= require('y-log-io');
var logger=Log.getLogger(jsonPath);
logger.log('some',{data:{txt:'abcd',list:[0,1,2]}},['a','b','c']);
```
Script 2 : show output logs.
```javascript
const Log= require('y-log-io');
var output = Log.getOutput(theSame_jsonPath);
output.start();
```
See exemple_01.js

<br/>

<hr/>

## <a name="tg_menu"></a> Menu

+ [Logger](#tg_logger)
	+ [YL.Input](#tg_logger_input)
+ [Output](#tg_logger)

<hr/>

### <a name="tg_logger"></a> Logger

Get the logger. This command returns an instance of **YL.Input**.
```javascript
/**
get the logger.
@param {string} fileName : path to logs json file OR name of a registered file path.
@return {YL.Input} the fake console
*/
YLogIO.getLogger(fileName)
```

#### <a name="tg_logger_input"></a> YL.Input

Properties

+ timeout : **int**
	- Minimal read/write period. The Logger wont access the json file than once evry **timeout** ms. *default=500*.
	- Decrease if you want more responsiveness.
	- Increase if you want to limit rw charge.
+ maxlog : **int**
	- maximum logs buffer size. Limits json file size when output is not listening. *default=100*.
	- Low value reduce file size and r/w time, but you may loose outputs.
+ fileName : **string** *read only*
	- path to the json file name.

	
TODO...
