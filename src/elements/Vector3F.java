package elements;


public class Vector3F {
	public float x;
	public float y;
	public float z;
	/**
	 * creates a vector (0,0,0);
	 *
	 */
	public Vector3F(){
		this.x=0;
		this.y=0;
		this.z=0;
	}
	/**
	 * creates a new 3 dimensional vector with double as the arguments
	 * @param x
	 * @param y
	 * @param z
	 */
	public Vector3F(float x, float y, float z){
		this.x = x;
		this.y = y;
		this.z = z;
	}
	/**
	 * creates a copy of v
	 * @param v
	 */
	public Vector3F(Vector3F v){
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
	}
	/**
	 * adds v to this vector
	 * @param v
	 */
	public void add(Vector3F v){
		this.x+=v.x;
		this.y+=v.y;
		this.z+=v.z;
	}
	/**
	 * subtracts v from this vector
	 * @param v
	 */
	public void subtract(Vector3F v){
		this.x-=v.x;
		this.y-=v.y;
		this.z-=v.z;
	}
	/**
	 * scales this vector by a
	 * @param a
	 */
	public void scale(float a){
		this.x*=a;
		this.y*=a;
		this.z*=a;
	}
	/**
	 * dots this vector with v
	 * @param v
	 * @return the dot product of this and v
	 */
	public float dot(Vector3F v){
		return v.x*x + v.y*y + v.z*z;
	}
	/**
	 * crosses this with vector v
	 * @param v
	 * @return the this cross v
	 */
	public Vector3F cross(Vector3F v){
		return new Vector3F(y*v.z - z*v.y, -(x*v.z - v.x*z), x*v.y - v.x*y);
	}
	/**
	 * returns the distance from this to v
	 * @param v
	 * @return the distance from this to v
	 */
	public float distanceTo(Vector3F v){
		return (float)Math.sqrt((x-v.x)*(x-v.x) + (y-v.y)*(y-v.y) + (z-v.z)*(z-v.z));
	}
	/**
	 * returns the angle between this and v
	 * @param v
	 * @return the angle between this and v
	 */
	public float angleBetween(Vector3F v){
		Vector3F vc = v.clone();
		Vector3F thisc = this.clone();
		vc.normalize();
		thisc.normalize();
		return (float)Math.acos(vc.dot(thisc));
	}
	/**
	 * normalizes this vector
	 *
	 */
	public void normalize(){
		double mag = Math.sqrt(x*x + y*y + z*z);
		if (mag !=0){
			x/=mag;
			y/=mag;
			z/=mag;
		}
	}
	/**
	 * gets the magnitude of this vector
	 * @return the magnitude of this vector
	 */
	public float mag(){
		return (float)Math.sqrt(x*x + y*y + z*z);
	}
	/**
	 * clones this vector
	 * @return a clone of this
	 */
	public Vector3F clone(){
		return new Vector3F(this);
	}
	public void set(Vector3F v){
		x = v.x;
		y= v.y;
		z = v.z;
	}
	public boolean equals(Object o){
		if (o instanceof Vector3F){
			Vector3F v = (Vector3F)o;
			return v.x==x && v.y==y && v.z==z;
		}
		return false;
	}
	public int hashCode(){
		return (int)(x + y + z);
	}
	public String toString(){
		return "( " + x + ", " + y + ", " + z + ")";
	}
	// these are the static methods

	public static Vector3F add(Vector3F v1, Vector3F v2){
		Vector3F v = new Vector3F(v1);
		v.add(v2);
		return v;
	}
	public static Vector3F subtract(Vector3F v1, Vector3F v2){
		Vector3F v = new Vector3F(v1);
		v.subtract(v2);
		return v;
	}
	public static float dot(Vector3F v1, Vector3F v2){
		return v1.dot(v2);
	}
	public static Vector3F cross(Vector3F v1, Vector3F v2){
		Vector3F v = new Vector3F(v1);
		v = v.cross(v2);
		return v;
	}

}
