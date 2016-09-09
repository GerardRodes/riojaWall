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
    transition: '1s ease-in-out',
    marginX: 0,
    marginY: 0,
    shareItems: true,
    responsive: true,
    breakpoints: [
    	{maxWidth: 480, 	cols: 1},
    	{maxWidth: 860, 	cols: 2},
    	{maxWidth: 1200, 	cols: 3}
  	]
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
    $wall.initCols = options.cols;

    $wall.init = function(){
      $wall.container.css('position','relative');

      $wall.updateWidth();
      $wall.loadCols();
      $wall.updateHeight();
      $wall.equalizeItems();
      $wall.binImages();
    }

    $wall.loadCols = function(){
    	$wall.cols = [];
      for(var colIndex = 0; colIndex < options.cols; colIndex++){
        var itemsOnCol = $wall.items.filter(function(itemIndex,currentValue,arr){
          return (itemIndex - colIndex) % options.cols == 0
        })
        $wall.cols.push(new Column($wall,colIndex, itemsOnCol, $wall.container.width() / options.cols, options))
      }
    }

    $wall.updateWidth = function(){
      if(options.responsive){
      	var breakpoint = options.breakpoints.filter(function(breakpoint,index,arr){ return breakpoint.maxWidth >= window.innerWidth })[0]
      	console.log(breakpoint)
      	if(breakpoint != undefined){
      		options.cols = breakpoint.cols;
      	} else {
      		options.cols = $wall.initCols;
      	}
      }
    }

    $wall.updateHeight = function(){
    	var highestCol = $wall.getHighestCol();
    	if(highestCol != undefined){
    		$wall.container.css('minHeight',highestCol.height)
    	}
    }

    $wall.getHighestCol = function(){
    	return $wall.cols.concat().sort(function(a, b){ return a.height < b.height })[0];
    }

    $wall.getShortestCol = function(){
    	return $wall.cols.concat().sort(function(a, b){ return a.height > b.height })[0];
    }

    $wall.equalizeItems = function(){
      var highestToShortest = $wall.cols.concat().sort(function(a, b){ return a.height < b.height })
      $.each(highestToShortest,function(i,col){
      	while((col.height - col.getLastItem().element.height()) > ($wall.getShortestCol().height) ){
      		$wall.getShortestCol().appendItem(col.popItem())
      	}
      })
    }

    $wall.binImages = function(){
	    $.each($wall.cols,function(i,col){
		    col.items.each(function(i,item){
		      item.element.find('img').on('load',function(){
		      	col.arrangeItems()
			      $wall.loadedImages++;
			      if($wall.loadedImages == $wall.allImages.length && options.shareItems){
			      	$wall.updateHeight();
			      	$wall.equalizeItems();
			    	}
		      })
		    })
	    })
    }

    $(window).on('resize',$wall.init)

    if(options.animation){
      $wall.items.css('transition',options.transition)
    }
  }

  var Column = function($wall,colIndex,itemsOnCol,width,options){
    var $col = this;

    $col.index = colIndex;
    $col.items = itemsOnCol.map(function(i,el){ return new Item(el,i) });
    $col.width = width - options.marginX / 2;
    $col.marginX = options.marginX;
    $col.marginY = options.marginY;
    $col.height = 0;

    $col.init = function(){
      $col.arrangeItems()
    }

    $col.popItem = function(){
      var poppedItem = $col.items.slice(-1)[0];
      $col.items = $col.items.slice(0,$col.items.length - 1);
      $col.arrangeItems()
      return poppedItem;
    }

    $col.appendItem = function(item){
    	$col.items.push(item);
      $col.arrangeItems()
    }

    $col.getLastItem = function(){
    	return $col.items.slice(-1)[0];
    }

    $col.updateHeight = function(){
      $col.height = 0;
      $col.items.map(function(i,item){ $col.height += item.element.height() });
      $wall.updateHeight();
    }

    $col.arrangeItems = function(){
      $.each($col.items,function(itemIndex,el){
        var itemsAbove = $col.items.slice(0, itemIndex),
            topPx = itemIndex * $col.marginY;

        itemsAbove.each(function(i,item){ topPx+=item.element.height() })
        el.element.css({
          position: 'absolute',
          width: $col.width,
          left: $col.width * $col.index + ($col.marginX * $col.index),
          top: topPx
        })
      })
      $col.updateHeight();
    }

    $col.init()
  }

  var Item = function(el,depth){
    var $item = this;

    $item.element = $(el);
    $item.depth = depth;
  }

})(jQuery)
