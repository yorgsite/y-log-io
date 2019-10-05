
// const YLog= require('y-log-io');
const YLog= require('../YLogIO.js');

let jsonPath = __dirname+'/tmp_log_data.json';



var test_logger=function(){
	let konsol=YLog.getLogger(jsonPath);

	let args=['some',{data:{txt:'abcd',list:[0,1,2]}},['a','b','c']];
	console.log('--- LOG :');
	console.log(...args);

	konsol.log(...args);
};
var test_output=function(){
	var output = YLog.getOutput(jsonPath);

	// comment this line if your terminal doesnt display rgb colors.
	output.hasRGB=true;

	// uncomment this line if you want to remove the stack trace
	// output.show.stack=false;

	output.start();
};
var test_log=function(){
	test_logger();
	test_output();
};

if(process.argv[2]==='log'){
	test_logger();
}else if(process.argv[2]==='out'){
	test_output();
}else {
	test_log();
}
