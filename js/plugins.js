function getTranslateY(obj){
  if (!window.getComputedStyle)
    return;

  var style = window.getComputedStyle(obj.get(0)),
      matrix = style.getPropertyValue('-webkit-transform') ||
               style.getPropertyValue('-o-transform') ||
               style.getPropertyValue('-moz-transform') ||
               style.getPropertyValue('-ms-transform') ||
               style.getPropertyValue('transform');

      if(matrix == 'none')
       matrix = ('0,0,0,0');

   var values = matrix.match(/([-+]?[\d\.]+)/g);

   return values[14] || values[5] || 0;
};
