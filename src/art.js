export const ATLAS_RECTS={
 mobile:[24,60,414,292],computing:[443,53,417,300],gaming:[865,35,418,318],
 audio:[22,449,417,289],accessories:[472,354,359,399],checkout:[865,430,422,314],
 staff:[160,766,153,440],shopper:[541,746,199,461],staffHead:[170,766,138,118],shopperHead:[581,746,137,128],plant:[910,782,342,412]
};
export class ArtManager{
 constructor(){this.image=new Image();this.ready=false;this.failed=false;this.image.onload=()=>this.ready=true;this.image.onerror=()=>this.failed=true;this.image.src=new URL('../assets/shop-atlas.png',import.meta.url).href}
 draw(ctx,key,x,y,width,height,flip=false){if(!this.ready)return false;const source=ATLAS_RECTS[key];if(!source)return false;ctx.save();if(flip){ctx.translate(x+width,y);ctx.scale(-1,1);x=0;y=0}ctx.drawImage(this.image,...source,x,y,width,height);ctx.restore();return true}
}
