// The shop floor is a trapezoid in the elevated cutaway artwork. All world
// objects and pointer coordinates use this same invertible floor projection.
export const FLOOR={backY:.565,frontY:.820,backLeft:.335,backRight:.655,frontLeft:.240,frontRight:.755};
const ratio=(FLOOR.frontRight-FLOOR.frontLeft)/(FLOOR.backRight-FLOOR.backLeft);
export function projectFloor(x,y,width){const v=(y-3)/10,t=v/(ratio-(ratio-1)*v),left=FLOOR.backLeft+(FLOOR.frontLeft-FLOOR.backLeft)*t,span=FLOOR.backRight-FLOOR.backLeft+((FLOOR.frontRight-FLOOR.frontLeft)-(FLOOR.backRight-FLOOR.backLeft))*t;return{x:left+(x-2)/(width-4)*span,y:FLOOR.backY+(FLOOR.frontY-FLOOR.backY)*t,size:Math.max(.62,Math.min(1.14,span/(FLOOR.frontRight-FLOOR.frontLeft)))}}
export function unprojectFloor(x,y,width){const t=(y-FLOOR.backY)/(FLOOR.frontY-FLOOR.backY),v=t*ratio/(1+t*(ratio-1)),left=FLOOR.backLeft+(FLOOR.frontLeft-FLOOR.backLeft)*t,span=FLOOR.backRight-FLOOR.backLeft+((FLOOR.frontRight-FLOOR.frontLeft)-(FLOOR.backRight-FLOOR.backLeft))*t;return{x:2+(x-left)/span*(width-4),y:3+v*10}}
