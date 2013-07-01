package sketchwire;

import processing.core.PApplet;
import processing.opengl.*;
import javax.media.opengl.*;
import javax.media.opengl.glu.*;
import peasy.*;
import java.nio.*;
import java.util.*;
import elements.*;

public class SketchWire extends PApplet {
	
	GL gl;
	GLU glu;
	
	public PeasyCam cam;
	public int pointCount = 250;
	
	int first, last;
	float testDist;
	float[] mousePos, mousePlanePos;
	public boolean drawing;
	public Point focusPoint, selectPoint, centerPoint;
	double dist;

	public ArrayList<Point> currentLine;
	public ArrayList<Point> points = new ArrayList<Point>();

	public ArrayList<ArrayList<Point>> lines = new ArrayList<ArrayList<Point>>();
	
	
	public void setup() {
		size(800,600,OPENGL);

		gl=((PGraphicsOpenGL)g).gl;
		glu=((PGraphicsOpenGL)g).glu;
		
		cam = new PeasyCam(this,1000);
		cam.setMinimumDistance(10);
		cam.setMaximumDistance(10000);
		cam.setMouseControlled(false);
		centerPoint = new Point();
		centerPoint.a.x = 0;
		centerPoint.a.y = 0;
		centerPoint.a.z = 0;
		sphereDetail(5);

		first = 0;
		last = pointCount -1;
		drawing = false;
		noFill();
		dist = cam.getDistance();
	}

	public void draw() {
		
		 background(75);
		 //get raw mouse3d position
		  mousePos = getMouse3D();
		 
		  if(drawing == false){
			  focusPoint = getPoint(mouseX,mouseY);
			   
		  }
		  		  
		  if(focusPoint !=null ){
			selectPoint = focusPoint;  
			getPlanePoints2(points); 
		  }
		  if(selectPoint !=null){
			  mousePlanePos = getMousePerp();
			  if(!drawing){
				   
			  }
			  
		  }
		  //havent drawn anything yet
		  else{
			selectPoint = centerPoint;
			mousePlanePos=getMousePerp();
		  }
		  

		  drawShape();
		  if(keyPressed){
			  keyHit();
		  }
	}
	
	
	public void drawShape(){
		
		if(currentLine != null){
			stroke(255,0,0);
			
			beginShape();
			for(int i=0;i<currentLine.size();i++){
										
					curveVertex(currentLine.get(i).a.x,currentLine.get(i).a.y,currentLine.get(i).a.z);
				
			}
			endShape();
		}

		for(int i=0;i<lines.size();i++){
			beginShape();
			for(int j=0;j<lines.get(i).size();j++){
				stroke(100+155 -(int)((j*100/lines.get(i).size())*1.55f));
				curveVertex(lines.get(i).get(j).a.x,lines.get(i).get(j).a.y,lines.get(i).get(j).a.z);
			}
			endShape();
		}
		
	}
	
	public void keyHit(){
		if (key == 'w'){
			cam.rotateX(.05);
			
		}
		if (key == 's'){
			cam.rotateX(-.05);
			
		}
		if (key == 'a'){
			cam.rotateY(-.05);
			
		}
		if (key == 'd'){
			cam.rotateY(.05);
			
		}
		
		if (key == 'r'){
			//choppy
			cam.setDistance(dist+10);
			
		}
		
		if (key == 'f'){
			//choppy
			cam.setDistance(dist-10);
		}
	}
	
	public void mousePressed(){
		if (keyPressed && key == ' '){
			cam.setMouseControlled(true);
		}else{
			drawing = true;
			currentLine = new ArrayList<Point>();	
		}
	}
	
	public void mouseDragged(){

		if(drawing){
			    	last++;
					if(last == pointCount) last =0;
					first++;
					if(first == pointCount) first =0;
										
					Point drawPoint = new Point();
							
					drawPoint.a.x = mousePlanePos[0];
					drawPoint.a.y = mousePlanePos[1];
					drawPoint.a.z = mousePlanePos[2];
					currentLine.add(drawPoint);
					points.add(drawPoint);
		}
	}
	
	public void mouseReleased(){
		if(drawing){
			first = 0;
			last = pointCount -1;
			lines.add(currentLine);
			drawing = false;

		}
		cam.setMouseControlled(false);
	}
	
	public Point getPoint(float mX, float mY){
		
		float screenXpos;
		float screenYpos;
		
		float x;
		float y;
		float z;
		float greedy = 10;
		int sphereSize = 10;
		for(int i=0;i<points.size();i++){
			
				if (points.get(i) != null){
				x = points.get(i).a.x;
				y = points.get(i).a.y;
				z = points.get(i).a.z;
				
				 screenXpos=screenX(x,y,z);
				 screenYpos=screenY(x,y,z);
				
				if(mX > screenXpos-greedy && mX < screenXpos+greedy && mY > screenYpos-greedy && mY < screenYpos+greedy){
					pushMatrix();
					translate(points.get(i).a.x, points.get(i).a.y, points.get(i).a.z);
					
					pushStyle();
					noStroke();
					fill(255,0,0);
					sphere(sphereSize);
					popStyle();
					popMatrix();
					
					return points.get(i);
				}
				}	
			}
		return null;
	}
	
	public double getDepth(Point point){
		int screenXpos;
		int screenYpos;
		float x,y,z;
		x = point.a.x;
		y = point.a.y;
		z = point.a.z;
		
		 screenXpos=(int)screenX(x,y,z);
		 screenYpos=(int)screenY(x,y,z);
		
		
		((PGraphicsOpenGL)g).beginGL();
		//have to get processing to dump all it's matricies into GL, so the functions work.

		  int viewport[] = new int[4];
		//For the viewport matrix... not sure what all the values are, I think the first two are width and height, and all Matricies in GL seem to be 4 or 16...
		
		 FloatBuffer fb=ByteBuffer.allocateDirect(4).order(ByteOrder.nativeOrder()).asFloatBuffer();
		//set up a floatbuffer to get the depth buffer value of the mouse position

		  gl.glReadPixels(screenXpos, height-screenYpos, 1, 1, GL.GL_DEPTH_COMPONENT, GL.GL_FLOAT, fb);
		//Get the depth buffer value at the mouse position. have to do height-mouseY, as GL puts 0,0 in the bottom left, not top left.
		  fb.rewind(); //finish setting up this.
		  double depth=(double)fb.get(0);
		  ((PGraphicsOpenGL)g).endGL();
		  return depth;
	}
	
	
	public float getDepth2(Point point){
		float[] camPos = cam.getPosition();
		float[] lookAt = cam.getLookAt();
		float[] curVert = new float[3];
		curVert[0] = point.a.x;
		curVert[1] = point.a.y;
		curVert[2] = point.a.z;
		//VECTOR FROM CAMERA POSITION TO CAMEREA TARGET
		Vector3D lookAtVec = new Vector3D(camPos[0]-lookAt[0],camPos[1]-lookAt[1],camPos[2]-lookAt[2]);
		//VECTOR FROM CAMERA POSITION TO CURRENT VERTEX
		Vector3D vertVec = new Vector3D(camPos[0]-curVert[0],camPos[1]-curVert[1],camPos[2]-curVert[2]);
		//THE DISTANCE BETWEEN MOUSEPOS AND VERT
		float vertDist = dist(camPos[0],camPos[1],camPos[2],curVert[0], curVert[1], curVert[2]);
		  
		float aVL =cos((float) Vector3D.angle(vertVec, lookAtVec));
		float normDist = aVL * vertDist;
		return normDist;
	}
	
	public void getPlanePoints2(ArrayList<Point> points){
		float selectDepth = getDepth2(selectPoint);
		
		for(int i=0;i<points.size();i++){
			if (!currentLine.contains(points.get(i))){
				
			
			double testDepth = getDepth2(points.get(i));
			if(testDepth > selectDepth -1 && testDepth < selectDepth +1){
				//println("hit");
				 pushMatrix();
					translate(points.get(i).a.x, points.get(i).a.y, points.get(i).a.z);
					
					pushStyle();
					noStroke();
					fill(0,255,0);
					sphere(5);
					popStyle();
					popMatrix();
			}
		}
		}
	}
	
	public void getPlanePoints(ArrayList<Point> points){
		double selPtDepth = getDepth(selectPoint); 
		
		for(int i=0;i<points.size();i++){
			double testDepth = getDepth(points.get(i));
		
			if(testDepth == selPtDepth){
			    pushMatrix();
				translate(points.get(i).a.x, points.get(i).a.y, points.get(i).a.z);
				
				pushStyle();
				noStroke();
				fill(0,255,0);
				sphere(5);
				popStyle();
				popMatrix();
		  }
		}  		
	}

	//INTERACTION
	public float[] getMousePerp(){
			 
		  float[] camPos = cam.getPosition();
		  float[] lookAt = cam.getLookAt();
		  float[] curVert = new float[3];
		  curVert[0] = selectPoint.a.x;
		  curVert[1] = selectPoint.a.y;
		  curVert[2] = selectPoint.a.z;
		  
		  float[] mouse = getMouse3D(); //return values from getMouse3D();
		  
		  //VECTOR FROM MOUSE POSITION TO CAMERA POSITION
		   Vector3D dirVec = new Vector3D(camPos[0]-mouse[0],camPos[1]-mouse[1],camPos[2]-mouse[2]);
		   
		  //VECTOR FROM CAMERA POSITION TO CAMEREA TARGET
		  Vector3D lookAtVec = new Vector3D(camPos[0]-lookAt[0],camPos[1]-lookAt[1],camPos[2]-lookAt[2]);
		 	
		  //VECTOR FROM CAMERA POSITION TO CURRENT VERTEX
		  Vector3D vertVec = new Vector3D(camPos[0]-curVert[0],camPos[1]-curVert[1],camPos[2]-curVert[2]);

		  //THE DISTANCE BETWEEN MOUSEPOS AND VERT
		  float vertDist = dist(camPos[0],camPos[1],camPos[2],curVert[0], curVert[1], curVert[2]);
		  
		  Vector3D dirVecUnit = dirVec.normalize();
		  Vector3D lookVecUnit = lookAtVec.normalize();

		  float aVL =cos((float) Vector3D.angle(vertVec, lookAtVec));

		  float normDist = aVL * vertDist;
		  testDist = normDist;
		  Vector3D normVec = lookVecUnit.scalarMultiply(normDist);
	  
		  float aVD = cos((float)Vector3D.angle(normVec, dirVecUnit));

		  float finDist = abs(normDist/aVD);
		 
		  float naX = (float) (camPos[0]-dirVecUnit.getX()*finDist);
		  float naY = (float) (camPos[1]-dirVecUnit.getY()*finDist);
		  float naZ = (float) (camPos[2]-dirVecUnit.getZ()*finDist);
			 
		  return new float[]{naX,naY,naZ};
}
		
	public float[] getMouse3D(){
	  ((PGraphicsOpenGL)g).beginGL();
	//have to get processing to dump all it's matricies into GL, so the functions work.

	  int viewport[] = new int[4];
	//For the viewport matrix... not sure what all the values are, I think the first two are width and height, and all Matricies in GL seem to be 4 or 16...

	  double[] proj=new double[16];
	//For the Projection Matrix, 4x4

	  double[] model=new double[16];
	//For the Modelview Matrix, 4x4

	  gl.glGetIntegerv(GL.GL_VIEWPORT, viewport, 0);
	//fill the viewport matrix

	  gl.glGetDoublev(GL.GL_PROJECTION_MATRIX,proj,0);
	//projection matrix

	  gl.glGetDoublev(GL.GL_MODELVIEW_MATRIX,model,0);
	//modelview matrix

	  FloatBuffer fb=ByteBuffer.allocateDirect(4).order(ByteOrder.nativeOrder()).asFloatBuffer();
	//set up a floatbuffer to get the depth buffer value of the mouse position

	  gl.glReadPixels(mouseX, height-mouseY, 1, 1, GL.GL_DEPTH_COMPONENT, GL.GL_FLOAT, fb);
	//Get the depth buffer value at the mouse position. have to do height-mouseY, as GL puts 0,0 in the bottom left, not top left.

	  fb.rewind(); //finish setting up this.

	  double[] mousePosArr=new double[4];
	//the result x,y,z will be put in this.. 4th value will be 1, but I think it's "scale" in GL terms, but I think it'll always be 1.

	 glu.gluUnProject((double)mouseX,height-(double)mouseY,(double)fb.get(0),model,0,proj,0,viewport,0,mousePosArr,0);
	
	 //glu.gluUnProject((double)mouseX,height-(double)mouseY,(double)0.5, model,0,proj,0,viewport,0,mousePosArr,0); 
	 //the magic function. You put all the values in, and magically the x,y,z values come out :)

	  ((PGraphicsOpenGL)g).endGL();
	  
	  return new float[]{(float)mousePosArr[0],(float)mousePosArr[1],(float)mousePosArr[2]};
	//The values are all doubles, so throw them into floats to make life easier.
} 

public static void main(String _args[]) {
	PApplet.main(new String[] { sketchwire.SketchWire.class.getName() });
}
}

