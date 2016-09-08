/**
 * RiojaWall v1
 *
 * Copyright 2016, Gerard Rodes https://github.com/GerardRodes
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */
(function($){

  const defaultOptions = {
    itemSelector: '.item',
    cols: 4,
    animation: false,
    transition: '1.75s ease-in-out'
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

    $wall.container = $(container);
    $wall.items = $wall.container.find(options.itemSelector);
    $wall.cols = [];
    $wall.allImages = $wall.container.find('img');
    $wall.loadedImages = 0;

    $wall.init = function(){
      $wall.container.css('position','relative');
      $wall.loadCols();
    }

    $wall.loadCols = function(){
      for(var colIndex = 0; colIndex < options.cols; colIndex++){
        var itemsOnCol = $wall.items.filter(function(itemIndex,currentValue,arr){
          return (itemIndex - colIndex) % options.cols == 0
        })
        $wall.cols.push(new Column(colIndex,itemsOnCol,$wall.container.width() / options.cols))
      }
    }

    $wall.allImages.on('load',function(){
      $wall.loadedImages++;
      if($wall.loadedImages == $wall.allImages.length){
        var changed = true;
          while(changed){
            changed = false;

            var fromHigherCol = $wall.cols.sort(function(a, b){ return a.height < b.height })
            
            $.each(fromHigherCol,function(i,col){
              var lastItem = col.items.last()[0],
                  colHeightWithoutLastItem = col.height - lastItem.element.height(),
                  stillShorterColumns = $wall.cols.filter(function(el){ return colHeightWithoutLastItem > el.height })
                                                  .sort(function(a, b){ return a.height > b.height })

              if(stillShorterColumns.length > 0){
                stillShorterColumns[0].items.push(col.popItem());
                col.arrangeItems();
                stillShorterColumns[0].arrangeItems();
                changed = true;
              }
            })

        }
      }
    })

    if(options.animation){
      $wall.items.css('transition',options.transition)
    }
  }

  var Column = function(colIndex,itemsOnCol,width){
    var $col = this;

    $col.index = colIndex;
    $col.items = itemsOnCol.map(function(i,el){ return new Item(el,i) });
    $col.width = width;
    $col.height = 0;

    $col.init = function(){
      $col.arrangeItems()
    }

    $col.popItem = function(){
      var poppedItem = $col.items.slice(-1)[0];
      $col.items = $col.items.slice(0,$col.items.length - 1);
      return poppedItem;
    }

    $col.arrangeItems = function(){
      $.each($col.items,function(itemIndex,el){
        var itemsAbove = $col.items.slice(0, itemIndex),
            topPx = 0;

        itemsAbove.each(function(i,item){ topPx+=item.element.height() })

        el.element.css({
          position: 'absolute',
          width: $col.width,
          left: $col.width * $col.index,
          top: topPx
        })
      })
      $col.height = 0;
      $col.items.map(function(i,item){ $col.height += item.element.height() })
    }

    $col.items.each(function(i,el){
      el.element.find('img').on('load',$col.arrangeItems)
    })

    $col.init()
  }

  var Item = function(el,depth){
    var $item = this;

    $item.element = $(el);
    $item.depth = depth;
  }

})(jQuery)
