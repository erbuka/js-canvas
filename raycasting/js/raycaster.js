Ray = Class.extend({
	init : function(o, v) {

		if(!o) {
			o = v3d();
		}

		if(!v) {
			v = v3d();
		}

		this.origin = v3d(o);
		this.direction = v3d(v);
		this.inverseDirection = v3d(1 / v.x, 1 / v.y, 1 / v.z);
		this.sign = [
			this.inverseDirection.x < 0 ? 1 : 0,
			this.inverseDirection.y < 0 ? 1 : 0,
			this.inverseDirection.z < 0 ? 1 : 0,
		];
	},
	set : function(o, v) {
		this.origin.set(o);
		this.direction.set(v);
		/*
		this.inverseDirection.set(1 / v.x, 1 / v.y, 1 / v.z);
		this.sign[0] = this.inverseDirection.x < 0 ? 1 : 0;
		this.sign[1] = this.inverseDirection.y < 0 ? 1 : 0;
		this.sign[2] = this.inverseDirection.z < 0 ? 1 : 0;
		*/
	},
	toString : function() {
		return "ray  { dir: " + this.direction.toString() + ", orig: " + this.origin.toString() + "}";
	}
});

Raycaster = {
	__temp__ : v3d(),
	geometricRaycast : function(ray, shape, p) {

		if(!p) {
			p = this.__temp__;
		}

		if(shape instanceof Sphere) {
			return this.geometricRaycastSphere(ray, shape, p);
		}

		if(shape instanceof Box) {
			return this.geometricRaycastBox2(ray, shape, p);
		}
	},
	geometricRaycastBox2 : function(ray, box, p) {

		var vmin = box.bounds[0];
		var vmax = box.bounds[1];
		var rdir = ray.direction;
		var rpos = ray.origin;

		var t1 = (vmin.x - rpos.x) / rdir.x;
		var t2 = (vmax.x - rpos.x) / rdir.x;
		var t3 = (vmin.y - rpos.y) / rdir.y;
		var t4 = (vmax.y - rpos.y) / rdir.y;
		var t5 = (vmin.z - rpos.z) / rdir.z;
		var t6 = (vmax.z - rpos.z) / rdir.z;
		var t7 = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
		var t8 = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
		var t9 = (t8 < 0 || t7 > t8) ? null : t7;
		if(t9 != null) {
			p.set(rdir).setScale(t9).setAdd(rpos);
			return true;
		}
		return false;
	},
	geometricRaycastBox : function(ray, box, p) {

		var tmin, tmax, tymin, tymax, tzmin, tzmax; 
		var bounds = box.bounds;
		var sign = ray.sign;
		var orig = ray.origin;
		var invdir = ray.inverseDirection;
	 
	    tmin = (bounds[sign[0]].x - orig.x) * invdir.x; 
	    tmax = (bounds[1 - sign[0]].x - orig.x) * invdir.x; 
	    tymin = (bounds[sign[1]].y - orig.y) * invdir.y; 
	    tymax = (bounds[1 - sign[1]].y - orig.y) * invdir.y; 
	 
	    if ((tmin > tymax) || (tymin > tmax)) 
	        return false; 
	    if (tymin > tmin) 
	        tmin = tymin; 
	    if (tymax < tmax) 
	        tmax = tymax; 
	 
	    tzmin = (bounds[sign[2]].z - orig.z) * invdir.z; 
	    tzmax = (bounds[1 - sign[2]].z - orig.z) * invdir.z; 
	 
	    if ((tmin > tzmax) || (tzmin > tmax)) 
	        return false; 
	    if (tzmin > tmin) 
	        tmin = tzmin; 
	    if (tzmax < tmax) 
	        tmax = tzmax; 
	 	
	 	if(tmin < 0)
	 		return false;
		
		p.set(ray.direction).setScale(tmin).setAdd(orig);

	    return true; 
	},
	geometricRaycastSphere : (function() {
		var l = v3d();
		return function(ray, sphere, p) {
			l.set(sphere.center).setSub(ray.origin);
			var tca = l.dot(ray.direction);
			var d2 = l.dot(l) - tca * tca;
			if(d2 > sphere.radius2) return false;
			var thc = Math.sqrt(sphere.radius2 - d2);
			var t0 = tca - thc
			var t1 = tca + thc;


			if(t0 < 0 && t1 < 0) { // no intersection (ray going opposite direction)
				return false;
			} else { // 1 intersection
				var t = t0 < 0 ? t1 : t0;
				p.set(ray.direction).setScale(t).setAdd(ray.origin);
				return true;
			}			
		}
	})(),
	createScreenRay : (function() {
		var right = v3d();
		var up = v3d();
		var vUp = v3d();
		var vRight = v3d();
		var temp = v3d();
		return function(sw, sh, sx, sy, origin, forward, worldUp, fovY, refRay) {
			var h2 = Math.tan(fovY); // half height
			var w2 = h2 * sw / sh; // half width

			right.setCross(worldUp, forward).setNormalize();
			up.setCross(forward, right);

			var fUp = -(sy / sh) * 2 + 1;
			var fRight = (sx / sw) * 2 - 1;
				
			vUp.set(up).setScale(h2 * fUp);
			vRight.set(right).setScale(w2 * fRight);

			if(refRay !== undefined) {
				refRay.set(origin, temp.set(forward).setAdd(vUp).setAdd(vRight).setNormalize());
			} else {
				return new Ray(origin, temp.set(forward).setAdd(vUp).setAdd(vRight).setNormalize());
			}
		}
	})()
};