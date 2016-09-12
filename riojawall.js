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
    justImages: true,
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
    $wall.resizeTimeout;

    $wall.init = function(){
      $wall.container.css('position','relative');
      $wall.updateWidth();
      $wall.loadCols();
      $wall.updateHeight();
      if($wall.items.length > ($wall.cols.length * 2) ){
        $wall.equalizeItems();
      }
      $wall.bindImages();
    }

    $wall.destroy = function(){
      $.each($wall.cols,function(i,col){
        col.items.each(function(i,item){
          item.element.css({
            position: 'static',
            width: '',
            left: '',
            top: ''
          })
        })
      })
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
        var lastItem = col.getLastItem();
        while((col.height - lastItem.element.height()) > ($wall.getShortestCol().height) ){
          $wall.getShortestCol().appendItem(col.popItem())
        }
      })
    }

    $wall.bindImages = function(){
	    $.each($wall.cols,function(i,col){
		    col.items.each(function(i,item){
          var img = item.element.find('img');
		      $(img).load(function(){
			      $wall.updateHeight();
            col.arrangeItems()
		      }).each(function() {
            if(this.complete) $(this).load();
          });

          $("<img/>")
          .attr("src", $(img).attr("src"))
          .load(function() {
            item.imgWidth = this.width;
            item.imgHeight = this.height;

            $wall.loadedImages++;
            col.arrangeItems()
            if($wall.loadedImages == $wall.allImages.length){
              $wall.updateHeight();
              if($wall.items.length > ($wall.cols.length * 2)  && options.shareItems){
                $wall.equalizeItems();
              }
            }
            col.arrangeItems()
          });

		    })
	    })
    }

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
      $col.height = parseInt($wall.container.css('paddingTop')) + ($col.marginY * $col.items.length);
      if(options.justImages){
        $col.items.map(function(i,item){ $col.height += item.imgHeight });
      }else {
        $col.items.map(function(i,item){ $col.height += item.element.height() });
      }
      $wall.updateHeight();
    }

    $col.arrangeItems = function(){
      $.each($col.items,function(itemIndex,el){
        var itemsAbove = $col.items.slice(0, itemIndex),
            topPx = itemIndex * $col.marginY + parseInt($wall.container.css('paddingTop'));

        itemsAbove.each(function(i,item){
          if(options.justImages){
            topPx+= ( $col.width * item.imgHeight ) / item.imgWidth
          } else {
            topPx+=item.element.height()
          }
        })

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
    $item.imgHeight = $(el).height();
    $item.imgWidth = $(el).width();
  }

})(jQuery)
