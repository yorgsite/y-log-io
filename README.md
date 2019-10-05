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
var logger=Log.getlogger(jsonPath);
logger.log('some',{data:{txt:'abcd',list:[0,1,2]}},['a','b','c']);
```
Script 2 : show output logs.
```javascript
const Log= require('y-log-io');
var output = Log.getOutput(theSame_jsonPath);
output.start();
```

See **[exemple_01](exemples/exemple_01.js)**.

<hr/>

<br/>

## <a name="tg_menu"></a> Menu

+ [Get logger](#tg_logger)
	+ [Input](#tg_logger_input)
+ [Get Output](#tg_output)
	+ [Output](#tg_output_out)
+ [Aliases](#tg_regisetr)

<hr/>

<br/>

### <a name="tg_logger"></a> Get logger

Get the logger. This command returns an instance of **Input**.
```javascript
/**
get the logger.
@param {string} fileName : path to logs json file OR a registered file alias.
@return {Input} the fake console
*/
YLogIO.getlogger(fileName)
```

#### <a name="tg_logger_input"></a> Input

##### - Properties

+ timeout : **int** *default=500*.
	- Minimal read/write period. The logger wont access the json file more than once evry **timeout** ms.
	- Decrease if you want more responsiveness.
	- Increase if you want to limit rw charge.
+ maxlog : **int** *default=100*.
	- maximum logs buffer size. Limits json file size when output is not listening.
	- Low value reduce file size and r/w time, but you may loose outputs.
+ fileName : **string** *read only*
	- path to the json file name.

<hr/>

<br/>

### <a name="tg_output"></a> Get Output

Get the logger output. This command returns an instance of **Output**.
```javascript
/**
get logger output.
@param {string} fileName : path to logs json file OR a registered file alias.
@return {YL.Output} the console output logger. call logger.start(); to activate.
*/
YLogIO.getOutput(fileName)
```

#### <a name="tg_output_out"></a> Output

##### - Methods

+ .start : Starts the console output.

```javascript
/**
activate the console.
*/
Output.start();
```

##### - Properties

+ timeout : **int** *default=2000*.
	- maximal r/w period (fs.watch leaks fix) forced access to json file if no changes have been detected after **timeout** ms.
+ splitTimeout : **int**  *default=2000*.
	- display a different log separator when time between log is greater than **splitTimeout** ms.

+ startMsg : **string**
	- The message displayed when the output starts.
+ stackMax : **int** *default=5*.
	- displayed stack pile maximum size.
+ show : **object**
	+ .startLine : **boolean** *default=true*
		- Shows **startMsg**.
	+ .topLine : **boolean** *default=true*
		- Shows log separator.
	+ .info : **boolean** *default=true*
		- Shows log infos (time method file line).
	+ .time : **boolean** *default=true*
		- Shows log time.
	+ .method : **boolean** *default=true*
		- Shows log local method.
	+ .file : **boolean** *default=true*
		- Shows log current file name.
	+ .line : **boolean** *default=true*
		- Shows log current file line number.
	+ .stack : **boolean** *default=true*
		- Shows stack pile.


<hr/>

<br/>

### <a name="tg_regisetr"></a> Aliases

Share the same output among files without caring about different pathes by registering an alias.

```javascript
/**
register an alias name for the logs json file. useful for access in different file pathes.
@param {string} name : alias of the registered file path.
@param {string} fileName : path to logs json file.
*/
YLogIO.register(name,fileName)
```

The registration could be done only (but at least) once. Event in a one-shot separated script.

```javascript
const Log= require('y-log-io');
Log.register('my-alias',pathToAJsonFile);

```

You can now call logger and output by their alias.

ex logger:
```javascript
const logger= require('y-log-io').getlogger('my-alias');
```

ex output :
```javascript
require('y-log-io').getOutput('my-alias').start();
```

<hr/>

<br/>

### <a name="tg_regisetr"></a> Exemples

- **[exemple_01](exemples/exemple_01.js)**.

<hr/>
