define(function (require) {
  return function drawRing(ctx,centerX,centerY,outerRadius,width,startAngle,endAngle,isCounterClockwise,precentage,bgcolor,bgalpha,color,alpha){
    var precentAngle
    if(isCounterClockwise){
      if(endAngle<startAngle)
        precentAngle = -((-endAngle+startAngle)*precentage - startAngle)
      else
        precentAngle = -((360-endAngle+startAngle)*precentage - startAngle)
    }else{
      if(endAngle<startAngle)
        precentAngle = (360+endAngle-startAngle)*precentage + startAngle
      else
        precentAngle = (endAngle-startAngle)*precentage + startAngle
    }
    precentAngle *= 2*Math.PI/360
    endAngle *= 2*Math.PI/360
    startAngle *= 2*Math.PI/360
    
    ctx.beginPath()
    ctx.arc(centerX,centerY,outerRadius,startAngle,endAngle,isCounterClockwise)
    ctx.arc(centerX,centerY,outerRadius-width,endAngle,startAngle,!isCounterClockwise)
    
    ctx.fillStyle = 'hsla('+bgcolor+',100%,100%,'+bgalpha+')'
    ctx.fill()   
    ctx.beginPath()
    ctx.arc(centerX,centerY,outerRadius,startAngle,precentAngle,isCounterClockwise)
    ctx.arc(centerX,centerY,outerRadius-width,precentAngle,startAngle,!isCounterClockwise)
    
    ctx.fillStyle = 'hsla('+color+',100%,70%,'+alpha+')'
    ctx.fill()   
  }
})