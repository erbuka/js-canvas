//define("extend");

Class = {
	extend : function(proto, constructorName) {
		if(!proto.init || typeof proto.init !== "function")
			console.error("Class.extend(): prototype doesn't contain the initializer");

		var ctor = proto.init;
		
		if(this.prototype === undefined)
			ctor.prototype = {};
		else
			ctor.prototype = Object.create(this.prototype);

		ctor.prototype.constructor = ctor;
		
		if(constructorName) 
			ctor.prototype.__constructorName__ = constructorName;

		ctor.extend = Class.extend;

		for(var i in proto) {
			if(i != "init")
				ctor.prototype[i] = proto[i];
		}

		return ctor;
	},
	abstract : function() {
		console.error("Method implementation required")
	}
};

Class.serialize = function(obj) {
	var refMap = {};
	Class._createReferenceMap(obj, refMap);
	Class._flatternReferenceMap(refMap);
	return refMap;
}

Class.deserialize = function(refMap) {

	var mainObj = refMap[1];

	Class._resolveReferenceMap(mainObj, refMap);

	for(var i in refMap) {
		var obj = refMap[i];
		delete obj["$id"];
		delete obj["$visited"];
	}

	return mainObj;
}

Class._resolveReferenceMap = function(objRoot, refMap) {

	if(objRoot["$visited"])
		return;

	objRoot["$visited"] = true;

    if (objRoot.__constructorName__) {
        var split = objRoot.__constructorName__.split(".");
        var proto = window[split[0]];

        if (proto === undefined) {
            console.error("Class.deserialize(): undefined prototype: " + objRoot.__constructorName__);
            return;
        }

        for (var k = 1; k < split.length; k++) {
            proto = proto[split[k]];
            if (proto === undefined) {
                console.error("Class.deserialize(): undefined prototype: " + objRoot.__constructorName__);
                return;
            }
        }

        objRoot.__proto__ = proto.prototype;

        delete objRoot.__constructorName__;
    } else {
        console.warn("Class.deserialize(): __constructorName__ not found for object: " + JSON.stringify(objRoot));
    }

	for(var i in objRoot) {

		var value = objRoot[i];
		
		if(value !== null && typeof value === "object" && value["$ref"]) {
			objRoot[i] = refMap[value["$ref"]];
			Class._resolveReferenceMap(objRoot[i], refMap);
		}
	}

    if(objRoot.__proto__.__unpack__)
    	objRoot.__unpack__();
}

/*
Class.deserialize = function(refMap) {
	
	var mainObj = refMap[1];

	for(var i in refMap) {

		var obj = refMap[i];

        if (obj.__constructorName__) {
            var split = obj.__constructorName__.split(".");
            var proto = window[split[0]];

            if (proto === undefined) {
                console.error("Class.deserialize(): undefined prototype: " + obj.__constructorName__);
                return;
            }

            for (var k = 1; k < split.length; k++) {
                proto = proto[split[k]];
                if (proto === undefined) {
                    console.error("Class.deserialize(): undefined prototype: " + obj.__constructorName__);
                    return;
                }
            }

            obj.__proto__ = proto.prototype;

            delete obj.__constructorName__;
        } else {
            console.warn("Class.deserialize(): __constructorName__ not found for object: " + JSON.stringify(obj));
        }

		for(var j in obj) {

			var value = obj[j];
			
			if(value !== null && typeof value === "object" && value["$ref"])
				obj[j] = refMap[value["$ref"]];
		}
	}

	for(var i in refMap) {
		var obj = refMap[i];

        if (obj.__proto__.__unpack__)
            obj.__unpack__();

		delete obj['$id'];
	}
	return mainObj;
}*/

Class._createReferenceMap = function(obj, refMap, refCount) {
	
	if(!refCount) {
		refCount = {
			count : 1
		};
	}
	
	if(obj !== undefined && obj !== null && typeof obj === "object") {
		
		if(obj['$id'])
			return;

        if (obj.__proto__.__constructorName__)
            obj.__constructorName__ = obj.__proto__.__constructorName__;

        if (obj.__pack__)
            obj.__pack__();

		obj['$id'] = refCount.count;
		refMap[refCount.count] = obj;
		refCount.count++;

		for(var i in obj) {
			Class._createReferenceMap(obj[i], refMap, refCount);
		}

	}
}

Class._flatternReferenceMap = function(refMap) {
	for(var i in refMap) {
		for(var j in refMap[i]) {
			var obj = refMap[i][j];
			if(obj !== null && obj['$id'])
				refMap[i][j] = { "$ref" : obj['$id'] };
		}
	}
}
