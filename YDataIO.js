
var fs=require('fs');

var DataIO=function(fileName,getDefault){
	var data,last_json;
	getDefault=getDefault||(()=>({}));
	if(fileName.substr(fileName.length-5).toLowerCase()!=='.json'){
		fileName+='.json';
	}
	let get_default=()=>({cnt:0,val:getDefault()});
	this.get=function(){
		return data?data.val:this.read();
	};
	this.set=function(v){
		if(!data)data=get_default();
		data.val=v;
	};
	Object.defineProperty(this,'data',{
		get:this.get,
		set:this.set
	});
	this.write=function(force){
		let txt=JSON.stringify(data);
		if(force||txt!==last_json){
			data.cnt++;
			txt=JSON.stringify(data);
			fs.writeFileSync(fileName,txt,'utf-8');
			last_json=txt;
		}
	};
	this.read=function(force){
		let txt;data=txt;// undefine data
		if(fs.existsSync(fileName)){
			txt=fs.readFileSync(fileName,'utf-8');
			// if(force||txt!==last_json){

				try {
					data=JSON.parse(txt);
					last_json=txt;
				} catch (e) {
					this.clean();
				}
			// }
		}else{
			this.clean();
		}
		return data.val;
	};
	this.clean=function(){
		data=get_default();
		last_json=JSON.stringify(data);
	};
	this.whipe=function(){
		if(fs.existsSync(fileName)){
			let undef;data=undef;
			fs.unlinkSync(fileName);
		}
	};
};

module.exports = DataIO;
