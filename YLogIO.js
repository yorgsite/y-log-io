
var fs=require('fs');

const DataIO= require('./YDataIO.js');

var YL={};

var YLogIO=function(){};

YL.id=1;

YL.loggers={};
YL.deep=3;

YL.datas_file=__dirname+'/YLogIO.settings.json';


YL.loggers={};

// ------- LogData

YL.LogData=function(){
	this.id		= -1;
	this.time	= -1;
	this.type	= '';
	this.args	= [];
	this.stack	= [];
};



YL.LogData.prototype.fromLog= function(args,stack,type){
	this.id		= YL.id++;
	this.time	= Date.now();
	this.type	= type||'log';
	this.args	= args.map(a=>YL.toStr(a,YL.deep) );
	this.stack	= stack;
	return this;
};
YL.LogData.prototype.fromData= function(data){
	this.stack	= new YL.Stack().fromData(data.stack);
	return YL.dcopy(data,this,['id','time','type','args']);
};
YL.LogData.prototype.toData= function(){
	return YL.dcopy(this,{
		stack	: this.stack.toData()
	},['id','time','type','args']);
};
// YL.LogData.prototype.toStr= function(){
// 	return
// };

// --------------- STACK -------------

// ------- tools

YL.prefix_sl='    at ';
Object.defineProperty(YLogIO,'stack',{
	get:()=>new YL.Stack().fromLevel(1),
	enumerable:true
});
YLogIO.getStack=function(level){
	level=level||0;
	return new YL.Stack().fromLevel(level+1);
};
YLogIO.logStack=function(level){
	level=level||0;
	console.log(style('allBack',new YL.Stack().fromLevel(level+1).toStr()));
};

// ------- Stack

YL.Stack=function(){
	this.file	= '';
	this.row	= -1;
	this.col	= -1;
	this.list	= [];

};
YL.Stack.prototype.fromLevel= function(level){
	var scope=this;
	level=level||0;
	level++;
	let stk=new Error('').stack.split('\n');

	this.list	= stk
	.filter(s=>s.indexOf(YL.prefix_sl)===0)
	.filter((s,i)=>i>=level)
	.map(s=>new YL.StackItem().fromLine(s));
	// ['file','method','row','col'].forEach(k=>{
	// 	scope[k]=scope.list[0][k];
	// });

	YL.dcopy(this.list[0],this,['file','row','col','method']);
	return this;
};
YL.Stack.prototype.fromData= function(data){
	this.list		= data.list.map(s=>new YL.StackItem().fromData(s));
	return YL.dcopy(data,this,['file','row','col','method']);
};
YL.Stack.prototype.toData= function(){
	return YL.dcopy(this,{
		list	: this.list.map(l=>l.toData())
	},['file','row','col','method']);
};

YL.Stack.prototype.toLines= function(){
	return this.toLogLines().concat(this.toStackLines());
};
YL.Stack.prototype.toLogLines= function(){
	return [
		'   at  : '+this.file,
		'method : '+this.method,
		' line  : '+this.row,
		'  col  : '+this.col
	];
};
YL.Stack.prototype.toStackLines= function(){
	return this.list.map((s,i)=>' - stack['+i+'] : '+s.str);
};
YL.Stack.prototype.toStr		= function(){	return this.toLines().join('\n');	};
YL.Stack.prototype.toLogStr	= function(){	return this.toLogLines().join('\n');	};
YL.Stack.prototype.toStackStr	= function(){	return this.toStackLines().join('\n');	};



// ------- StackItem

YL.StackItem=function(){
	this.str	= '';
	this.file	= '';
	this.row	= -1;
	this.col	= -1;
};
YL.StackItem.prototype.fromLine= function(line){
	let lst=line.substr(YL.prefix_sl.length);
	this.str	= lst;
	if(this.str.lastIndexOf(')')===this.str.length-1){
		lst=this.str.split(' ');
		this.method=lst.shift();
		if(this.method==='new'){
			this.method+=' '+lst.shift();
		}
		lst=lst.join(' ');
		lst=lst.substr(1,lst.length-2);
	}else {
		this.method='<anonymous>';
	}
	lst=lst.split(':');
	this.col	= lst.pop();
	this.row	= lst.pop();
	this.file	= lst.join(':');
	return this;
};
YL.StackItem.prototype.fromData= function(data){
	return YL.dcopy(data,this,['str','file','row','col','method']);
};
YL.StackItem.prototype.toData= function(data){
	return YL.dcopy(this,{},['str','file','row','col','method']);
};

// -------------------------------

YL.dcopy=function(src,tgt,keys){
	keys.forEach(k=>tgt[k]=src[k]);
	return tgt;
};


YL.IOFile=function(fileName){
	var getDefault=()=>({
		cnt:0,
		list:[]
	});
	DataIO.apply(this,[fileName,getDefault]);
};

YL.toStr=function(src,maxLevel,level){
	let tabu='  ';
	let strmax=200;
	let to=typeof(src);
	level=level||0;
	if(to==='object'){
		if(level<maxLevel){
			let lvt=Array(level).fill(tabu).join('');
			if(src instanceof Array){
				return '[\n'+src.map(s=>lvt+tabu+YL.toStr(s,maxLevel,level+1)).join(',\n')+'\n'+lvt+']';
			}else {
				try {
					let keys = Object.keys(src);
					return '{\n'+keys.map(k=>lvt+tabu+k+':'+YL.toStr(src[k],maxLevel,level+1)).join(',\n')+'\n'+lvt+'}';
				} catch (e) {
					return src+'';
				}
			}

		}else {
			return '[object]';
		}
	}else if(to==='function'){
		return '[function]';
	}else if(to==='string'){
		if(level===0){
			return src;
		}
		let str=JSON.stringify(src);
		if(str.length>strmax){
			str=str.substr(0,strmax)+'…';
		}
		return str;
	}else {
		return src+'';
	}
};

YL.Date=function(time){
	var scope=this;
	let date = new Date(time);
	[	{n:'Date',d:2,ofs:0},
		{n:'Month',d:2,ofs:1},
		{n:'FullYear',d:2,ofs:0},
		{n:'Hours',d:2,ofs:0},
		{n:'Minutes',d:2,ofs:0},
		{n:'Seconds',d:2,ofs:0},
		{n:'Milliseconds',d:3,ofs:0}
	].forEach(v=>{
		let num=''+(date['get'+v.n]()+v.ofs);
		if(num.length<v.d){
			num=Array(v.d-num.length).fill('0').join('')+num;
		}
		scope[v.n.toLowerCase()]=num;
	});
	this.toString=function(){
		let dtime=scope.date+'/'+scope.month+'/'+scope.fullyear;
		let htime=scope.hours+':'+scope.minutes+':'+scope.seconds+':'+scope.milliseconds;
		return dtime+'-'+htime;
	}
};


YL.io_files=[];


YL.Datas=function(){
	var scope=this;
	var getDefault=()=>({
		list:[]
	});
	var load=()=>{
		this.read();
		this.data.list.forEach(l=>{
			YL.loggers[l.n]=YLogIO.getLogger(l.f);
		});
	};
	DataIO.apply(this,[YL.datas_file,getDefault]);
	this.register=function(name,fileName){
		if(!(name in YL.loggers)){
			YL.loggers[name]=YLogIO.getLogger(fileName);
			this.data.list.push({n:name,f:fileName});
			this.write();
		}
		return YL.loggers[name];
	};
	this.whipe=function(name){
		if(name in YL.io_files){
			YL.io_files[name].whipe();
			delete YL.io_files[name];
		}
		if(name in YL.loggers){
			delete YL.loggers[name];
		}
	};
	load();
};
// YL.datas.whipe(name);
YL.p16={
	getCode:(rgb)=>rgb.map(d=>Math.floor(Math.max(0,Math.min(255,d)))).join(';'),
	getFront:(code)=>'\x1b[38;2;' + code,
	getBack:(code)=>'\x1b[48;2;' + code
};
YL.s16=new function(){
	this.getFront=function(rgb){
		return [YL.p16.getFront(YL.p16.getCode(rgb))+'m','\x1B[39m'];
	};
	this.getBack=function(rgb){
		return [YL.p16.getBack(YL.p16.getCode(rgb))+'m','\x1B[49m'];
	};
}();

YL.styles={
	startLine:['\x1B[47m\x1B[30m', '\x1B[39m\x1B[49m'],
	topLine:['\x1B[4m', '\x1B[24m'],
	time:['\x1B[1m\x1B[36m', '\x1B[39m\x1B[22m'],
	method:['\x1B[1m\x1B[34m', '\x1B[39m\x1B[22m'],
	file:['\x1B[1m', '\x1B[22m'],
	line:['\x1B[1m\x1B[35m', '\x1B[39m\x1B[22m'],
	allBack:['','']
};
YL.styles16={
	startLine:['\x1B[47m\x1B[30m', '\x1B[39m\x1B[49m'],
	topLine:['\x1B[4m', '\x1B[24m'],
	time:['\x1B[1m\x1B[36m', '\x1B[39m\x1B[22m'],
	method:YL.s16.getFront([100,100,255]),
	file:['\x1B[1m', '\x1B[22m'],
	line:['\x1B[1m\x1B[35m', '\x1B[39m\x1B[22m'],
	allBack:YL.s16.getBack([30,30,30])
};

/**
for output terminal
@param {string} fileName : path to logs json file OR name of a registered file path.
@constructor
*/
YL.Output=function(fileName){
	var scope=this;

	// maximal rw period (rw at least 1/period) => fix fs.watch leaks
	this.timeout=2000;
	// time between log separators
	this.splitTimeout=2000;
	this.hasRGB=false;

	let llTime=0;
	let started=0;
	let t_id=0;
	let sgb=YL.s16.getBack([255,30,30]);
	if(!(fileName in YL.io_files)){
		YL.io_files[fileName]=new YL.IOFile(fileName);
	}
	let file=YL.io_files[fileName];
	let bold=['\x1B[1m', '\x1B[22m'];
	var logdat=function(txt){

	};
	var style=function(type,txt){
		let st=scope.hasRGB?YL.styles16:YL.styles;
		return st[type].join(txt);
	};
	this.show={
		startLine	: true,
		topLine		: true,
		info		: true,
		time		: true,
		method		: true,
		file		: true,
		line		: true,
		stack		: true
	};
	this.startMsg=' Console starts - Press ctrl+c to stop ';
	this.stackMax=5;

	var update=function(){
		file.read();
		let list=file.data.list;
		file.data.list=[];
		file.write();
		update.logList(list);
		if(t_id)clearTimeout(t_id);
		t_id=setTimeout(()=>{
			t_id=0;update();
		},scope.timeout);
	};
	update.logList=function(list){
		list=list.map(d=>new new YL.LogData().fromData(d));
		list.forEach(d=>{
			if(scope.show.topLine){
				update.logTopLine(d);
			}
			if(scope.show.info){
				update.logInfo(d);
			}
			if(scope.show.stack){
				update.logStack(d);
			}
			console.log(...d.args);
		});
	};
	update.logTopLine=function(d){
		let tdif=d.time-llTime;
		llTime=d.time;
		let fc=tdif>scope.splitTimeout?'─':' ';
		// let tl=Array(process.stdout.columns-1).fill(fc).join('');
		let tl=fc.repeat(process.stdout.columns-1);
		// console.log(scope.styles.topLine.join(tl));
		console.log(style('allBack',style('topLine',tl)));
	};
	update.logInfo=function(d){
		console.log(style('allBack','●'+update.getInfo(d.stack,new YL.Date(d.time))));
	};
	//… ←↑→↓─│┌┐└┘├┤┬┴┼═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╦╧╨╩╪╫╬▀▄█▌▐░▒▓■□▪▫▬▲►▼◄◊○◌●◘◙◦☺☻☼♠♣♥♦♪♫♫
	update.logStack=function(d){
		let list=d.stack.list;
		let lines=list
		.filter((li,i)=>i>0)
		.map((li,i)=>{
			if(i===scope.stackMax){
				return bold.join('└─ …');
			}else if (i<scope.stackMax) {
				let pref=(i<list.length-2)?'├─':'└─';
				let info=update.getInfo(li);
				return bold.join(pref)+' '+info;
			}
		}).filter(l=>l);
		console.log(style('allBack',lines.join('\n')));
	};
	update.getInfo=function(ldat,date){
		let dd={};
		if(date)dd.time=date;
		dd.method	= ldat.method;
		dd.file		= ldat.file;
		dd.line		= ldat.row;
		let lstr='';
		Object.keys(dd)
		.filter(k=>scope.show[k])
		.forEach((k,i)=>{
			lstr+=(i>0?' ':'')+style(k,dd[k]);
			// lstr+=(i>0?' ':'')+scope.styles[k].join(dd[k]);
		})
		return lstr;
	};

	this.start=function(){
		if(!started){
			started=1;
			fs.watchFile(fileName,update);
			if(scope.show.startLine){
				// console.log(scope.styles.startLine.join(scope.startMsg));
				console.log(style('startLine',scope.startMsg));
			}
			update();
		}
	};
	Object.defineProperty(this,'fileName',{get:()=>fileName});
};

/**
for input terminal (the fake console).
@param {string} fileName : path to logs json file OR name of a registered file path.
@constructor
*/
YL.Input=function(fileName){
	var scope=this;
	// minimal rw period (can't rw more than 1/period) =>limit rw charge
	this.timeout=500;
	// max logs pile length
	this.maxlog=100;

	if(!(fileName in YL.io_files)){
		YL.io_files[fileName]=new YL.IOFile(fileName);
	}
	let file=YL.io_files[fileName];
	let logz=[];
	let t_id=0;
	var update=function(){

		if(!t_id){
			file.read();
			file.data.list=file.data.list.concat(logz.map(l=>l.toData()));
			while(file.data.list.length>scope.maxlog)file.data.list.shift();
			file.write();
			logz=[];

			t_id=setTimeout(()=>{
				t_id=0;
				if(logz.length)update();
			},scope.timeout);
		}
	};
	this.log=function(...args){
		let stk=new YL.Stack().fromLevel(1);
		logz.push(new YL.LogData().fromLog(args,stk,'log'));
		update();
	};
	Object.defineProperty(this,'fileName',{get:()=>fileName});
};

// ------------- PUBLIC --------------------

/**
get input terminal, avoid duplicate instances.
@param {string} fileName : path to logs json file OR name of a registered file path.
@return {YL.Input} the fake console
*/
YLogIO.getLogger=function(fileName){
	if(!(fileName in YL.loggers)){
		YL.loggers[fileName]=new YL.Input(fileName);
	}
	return YL.loggers[fileName];
};

/**
get output logger.
@param {string} fileName : path to logs json file OR name of a registered file path.
@return {YL.Output} the console output logger. call logger.start(); to activate.
*/
YLogIO.getOutput=function(fileName){
	return new YL.Output(fileName);
};

/**
register an alias name for the logs json file. useful for access in different file pathes.
@param {string} name : alias of the registered file path.
@param {string} fileName : path to logs json file.
*/
YLogIO.register=function(name,fileName){
	YL.datas.register(name,fileName);
	return this;
};
YLogIO.whipe=function(name){
	YL.datas.whipe(name);
	return this;
};

YL.datas=new YL.Datas();






module.exports = YLogIO;
