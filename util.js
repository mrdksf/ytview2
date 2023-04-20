export const DIRECTION = {
    right:"right",
    left:"left",
    up: "up",
    down:"down",
}

export const swipeState = {
    startX: 0,
    startY: 0,
    left:0,
    swiping: false,
    close:false,
}

export const getDirection = (xDiff,yDiff) => {

    if( Math.abs( xDiff ) > Math.abs( yDiff ) ){

        if( xDiff > 0 ){
            return DIRECTION.left;
        }

        return DIRECTION.right;
    }

    if( yDiff > 0 ){
        return DIRECTION.up
    }

    return DIRECTION.down;

}

export const isHorizontalAction = (swipeState) => {

    if(swipeState.direction === DIRECTION.right || swipeState.direction === DIRECTION.left){
        return true;
    }

    return false;
}