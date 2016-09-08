(function($){

  const defaultOptions = {
    itemSelector: '.item',
    cols: 4
  }

  $.fn.extend({
    riojaWall: function(customOptions) {

      var options = $.extend({},defaultOptions,customOptions);
      if(this.length > 1){
        var wallList = [];
        this.each(function(){ wallList.push(initWall(this,options)) })
        return wallList;
      } else {
        return initWall(this,options);
      }
    }
  });

  var initWall = function(container, options){
    var wall = new RiojaWall(container,options);
    wall.init()
    return wall;
  }

  var RiojaWall = function(container, options){
    var $wall = this;

    $wall.container = container;
    $wall.items = $($wall.container).find(options.itemSelector);
    $wall.colWidth = $(container).width() / options.cols;
    $wall.matrix = [];

    $wall.init = function(){
      $wall.loadMatrix()
      $wall.setStyles()
      $(options.itemSelector+' img').on('load',$wall.setStyles)
      console.log($wall)
    }

    $.each($wall.items,function(i,el){

    })

    $wall.loadMatrix = function(){
      var tempItems = $wall.items,
          totalItems = $wall.items.length;

      $wall.matrix = [];

      while(tempItems.length > 0){
        $wall.matrix.push(tempItems.splice(0,options.cols))
      }
      console.log($wall.matrix)
    }

    $wall.setStyles = function(){
      $($wall.container).css({position:'relative'})
      $($wall.matrix).each(function(depth,group){
        $(group).each(function(col,el){
          var top = $wall.matrix.slice(0,depth).reduce(function(total,group){ console.log('parents: ',$(group[col])); return $(group[col]).height() + total },0)

          console.log('top: ',top)

          $(el).css({
            position:'absolute',
            width: $wall.colWidth,
            left: $wall.colWidth * col,
            top: top
          })
        })
      })
    }

  }

})(jQuery)