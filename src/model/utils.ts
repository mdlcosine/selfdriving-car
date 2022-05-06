import {Coordinate} from "./Coordinate";

export function lerp(start: number, end:number, percentage:number){
    return start + (end - start)*percentage
}

export function getIntersection(firstLineStart: Coordinate,
                                firstLineEnd: Coordinate,
                                secondLineStart: Coordinate,
                                secondLineEnd:Coordinate){
    const tTop=(secondLineEnd.x-secondLineStart.x)*(firstLineStart.y-secondLineStart.y)-(secondLineEnd.y-secondLineStart.y)*(firstLineStart.x-secondLineStart.x);
    const uTop=(secondLineStart.y-firstLineStart.y)*(firstLineStart.x-firstLineEnd.x)-(secondLineStart.x-firstLineStart.x)*(firstLineStart.y-firstLineEnd.y);
    const bottom=(secondLineEnd.y-secondLineStart.y)*(firstLineEnd.x-firstLineStart.x)-(secondLineEnd.x-secondLineStart.x)*(firstLineEnd.y-firstLineStart.y);

    if(bottom!==0){
        const t=tTop/bottom;
        const u=uTop/bottom;
        if(t>=0 && t<=1 && u>=0 && u<=1){
            return {
                x:lerp(firstLineStart.x,firstLineEnd.x,t),
                y:lerp(firstLineStart.y,firstLineEnd.y,t),
                offset:t
            }
        }
    }

    return null;
}

export function polysIntersect(poly1:Coordinate[], poly2:Coordinate[]){
    for(let i = 0; i <poly1.length; i++){
        for(let j = 0; j < poly2.length; j++){
            const touch = getIntersection(
                poly1[i],
                poly1[(i+1)%poly1.length], // Modulo connects last to first point in polygon
                poly2[j],
                poly2[(j+1)%poly2.length], // Modulo connects last to first point in polygon
            )
            if(touch)
                return true
        }
    }

    return false
}
