

var snake = {
         
	    //objects in control....	
		 $win: null,
		 $grid: null,
		 $snake: null,
		 $food: null,
		 
	   //miscelleneous....
		 onScoreFn: null,
		 report : {
			   marks: 0
		 },
		 gridBoundLayer: {   //tds ($tds) that lie on left,top,right and bottom layers/borders of grid...
			 topLayer: new Array(),
			 rightLayer: new Array(),
			 bottomLayer: new Array(),
			 leftLayer: new Array()
		 },
	    
	   //for movement functionality...
		 dir:"l",
		 speeds: {  // time in milliseconds...
			 slow: 500,
			 medium: 200,
			 fast: 100,
			 supersonic: 20
		 },
         defaultSpeed: 200,         
         $snakePieceHolders: new Array(), // array of $tds holding pieces of snake currently..
         timerId: 0,
		 paused: false,
		 
	   //styling objects....	 
         gridPathDimension: {x:15,y:15},
         snakeInitialPieces: 3,      
         gridCellStyle: {width:"15px",height:"15px",padding:"0px"},
         gridStyle: {width:"100%",height:"100%",borderWidth:"1px",borderCollapse:"collapse"},
         snakeStyle: {
        	 background : "#0F0",
        	 width: "100%",
        	 height: "100%",
             position: "absolute",
             borderWidth: "0px",
             zIndex: 1001
         },
         foodStyle: {
        	 background : "#F00",
        	 width: "100%",
        	 height: "100%",
             position: "absolute",
             borderWidth: "0px",
             zIndex: 1000
         },
         
       //functions for all functionality...
         init: function($window,onscoreFn){
		   this.$win = $window;
		   this.onScoreFn = onscoreFn; 
		   this.makeSnakeGrid();		   
		   this.registerJoySticks();
		   this.popoutFood();
		   this.startSnake();
		 },
		
		 makeSnakeGrid: function(){
			 this.$grid = $('<table id="snakeGrid" border="0px">');
			 this.$grid.css(this.gridStyle);
			 var vPath = Math.ceil( this.$win.innerWidth() / this.gridPathDimension.x ); // number of vertical columns
			 var hPath = Math.ceil( this.$win.innerHeight() / this.gridPathDimension.y ); // number of horizontal rows
			 var $tr = null;
			 var $td = null;
			 
			 for( var i = 0; i < hPath; i++ ){
				 $tr = $('<tr class="row-'+i+'">');
				 
				 for( var j = 0; j < vPath; j++ ){
					 $td = $('<td class="row-'+i+' col-'+j+'" ><div class="wrapper" style="width:100%;height:100%;border-width:0px"></div></td>');
					 $td.css(this.gridCellStyle);
					 $tr.append($td);
				 }
				 
				 this.$grid.append($tr);
			 }
			 
			 this.$win.append( this.$grid);
			 this.feedSnakeGridBounds();
		 },
		 feedSnakeGridBounds: function(){
			 var that = this;
			 this.$grid.find("tr:first").find("td").each(function(i){  //top layer tds ($tds)...
				 that.gridBoundLayer.topLayer.push($(this)); 
				 $(this).addClass("topLayer");
			 });
			 this.$grid.find("tr").each(function(i){  //right layer..
				 that.gridBoundLayer.rightLayer.push($(this).find("td:last"));
				 $(this).find("td:last").addClass("rightLayer");
			 });
			 this.$grid.find("tr:last").find("td").each(function(i){  //bottom layer...
				 that.gridBoundLayer.bottomLayer.push($(this));
				 $(this).addClass("bottomLayer");
			 });
			 this.$grid.find("tr").each(function(i){  //right layer..
				 that.gridBoundLayer.leftLayer.push($(this).find("td:first"));
				 $(this).find("td:first").addClass("leftLayer");
			 });
		 },
		 registerJoySticks: function(){
		    var that = this;
		    $("body").keydown(function(e){
			     var key = e.which;			   
				 if( key == 37 || key == 0 || key == 0 ){
					    if( that.dir == "r") return;
					    that.dir = "l";
	    		        that.moveSnake();
				 }else if( key == 38 || key == 0 || key == 0 ){
					 if( that.dir == "d") return;
					    that.dir = "u";
		    		    that.moveSnake();
				  }else if( key == 39 || key == 0 || key == 0 ){
					  if( that.dir == "l") return;
					    that.dir = "r";
	    		        that.moveSnake();
				   }else if( key == 40 || key == 0 || key == 0 ){
					   if( that.dir == "u") return;
					     that.dir = "d";
	    			     that.moveSnake();
					}
			});
		    $("span.JoyStick").click(function(){
		    	if( $(this).is("#TopJoyStick") ){
		    		if( that.dir == "d") return;
		    		    that.dir = "u";
		    		    that.moveSnake();
		    	 }else if( $(this).is("#LeftJoyStick") ){
		    		 if( that.dir == "r") return;
		    		      that.dir = "l";
		    		      that.moveSnake();
		    	   }else if( $(this).is("#RightJoyStick") ){
		    		   if( that.dir == "l") return;
		    		       that.dir = "r";
		    		       that.moveSnake();
		    		 }else if( $(this).is("#BottomJoyStick") ){
		    			 if( that.dir == "u") return;
		    			     that.dir = "d";
		    			     that.moveSnake();
		    			 }
		    });
		 },
		 setDefaultSpeed: function(speed){
			 this.defaultSpeed = speed;
		 },
		 emptySnakePiecesHolders: function(){	
		     for( x in this.$snakePieceHolders )
			     this.$snakePieceHolders[x].find("div.wrapper").html("");
				 
			 this.$snakePieceHolders = null;
             this.$snakePieceHolders = new Array();			 
		 },
		
		 popoutFood: function(){
			 $("#snakeFood").remove();
			 if( this.$win == null) return;
			 
			 this.$food = $('<div id="snakeFood">');			
			 this.$food.css(this.foodStyle);
			 var tdIndex = Math.round( Math.random() * (this.$grid.find("td").length - 1) );
			 this.$grid.find("td").eq( tdIndex ).addClass("target").find("div.wrapper").append( this.$food );
		 },
		 startSnake: function(){
		   $(".snake").remove();
		   if( this.$win == null) return;		   
		   
		   this.$snake = $('<div class="snake">');
		   this.$snake.css(this.snakeStyle);	
		   this.feedStartPoint();
		   this.startTimer();
		 },
		 startTimer: function(){
			 var that = this;
			 clearInterval(this.timerId);
			 if( this.paused ) return;
			 this.timerId = setTimeout(function(){
			      that.moveSnake();
	    	  },this.defaultSpeed);		   
		   
		 },
		 pause: function(){
			  this.paused = true;
		  },
		 play: function(){
			  this.paused = false;
			  this.startTimer();
	      },
		 feedStartPoint: function(){			 		
		     var $tempSnakePieceHolders = new Array();
			 var tdIndex = 0; // index for the start td( snake piece holder ) in a layer...
			 var layer = Math.round(Math.random()*4); // 4 means gridBounds...the four sides outer grid layers of $tds..
			 switch( layer ){  		    
			    case 1:  // top bound layer starts...
			      tdIndex = Math.round(Math.random()*this.gridBoundLayer.topLayer.length); // find column to start with
			      $tds = this.$grid.find("td.col-"+ tdIndex); // get all $tds in that column
			      for(var i = 0; i < this.snakeInitialPieces; i++)
			    	    $tempSnakePieceHolders.push( $tds.eq(i) ); // store $tds currently to hold the snake pieces.
			      
			      this.dir = "d";
				  break;
			    case 2:  // right bound layer starts...
			      tdIndex = Math.round(Math.random()*this.gridBoundLayer.rightLayer.length);
			      $tds = this.$grid.find("td.row-"+ tdIndex);
			      for(var i = 0; i < this.snakeInitialPieces; i++)
			    	    $tempSnakePieceHolders.push( $tds.eq( $tds.length - 1 - i ) );
			      
			      this.dir = "l";	      
			      break;
			    case 3:   // bottom bound layer starts...
			      tdIndex = Math.round(Math.random()*this.gridBoundLayer.bottomLayer.length);
			      $tds = this.$grid.find("td.col-"+ tdIndex);
			      for(var i = 0; i < this.snakeInitialPieces; i++)
			    	   $tempSnakePieceHolders.push( $tds.eq( $tds.length - 1 - i ) );

			      this.dir = "u";
			      break;
			    case 4:   // left bound layer starts...
			      tdIndex = Math.round(Math.random()*this.gridBoundLayer.leftLayer.length);
			      $tds = this.$grid.find("td.row-"+ tdIndex);
			      for(var i = 0; i < this.snakeInitialPieces; i++)
			    	    $tempSnakePieceHolders.push( $tds.eq( i ) );
			      
			      this.dir = "r";
			      break;	
			    default:			
			 	      tdIndex = Math.round(Math.random()*this.gridBoundLayer.topLayer.length);
				      $tds = this.$grid.find("td.col-"+ tdIndex);
				      for(var i = 0; i < this.snakeInitialPieces; i++)
				    	    $tempSnakePieceHolders.push( $tds.eq(i) );
				      
				      this.dir = "d";				  
			 }   	
			 this.shapeSnake( $tempSnakePieceHolders,false );   
			 this.$win.css("height",this.$win.height() + ( this.$grid.outerHeight() - this.$win.innerHeight()) +"px");  
		 },
		 shapeSnake: function($snakePieceHolders,reshape){//in each snake movement new snake pieces a made on new snake bodies( $tds ),simulating a snake piece movement.....
			 if( typeof( reshape ) == "undefined" )
			      reshape = false;
			 else if( reshape ){
			   this.emptySnakePiecesHolders();
			 }
			   
			   var $newSnakePart = null;
			   var foodEaten = false;
		       for(x in $snakePieceHolders){
				      $newSnakePart = this.snakeOnMotion($snakePieceHolders,x); //making of snake piece on snake body( $td ) is considered snake is in motion...       				  
					  if( $newSnakePart != null ){
						  foodEaten = true;
						  $snakePieceHolders.push( $newSnakePart );
						  this.onSnakeGrowing();  
					   }
			    	  $snakePieceHolders[x].find("div.wrapper").append( this.$snake.clone() );	//make snake piece on snake body..
					  this.$snakePieceHolders[x] = 	$snakePieceHolders[x]; // store the pieces holders in the master storage.	  
			      }
				   if( foodEaten ){//attach snake piece to the new snake part also <it is not done so in the loop above >
				       var y = $snakePieceHolders.length - 1;
				       $snakePieceHolders[y].find("div.wrapper").append( this.$snake.clone() );	
					   this.$snakePieceHolders[y] = $snakePieceHolders[y]; 
				   }
				      
		       if(  $("#snakeFood").length == 0 )// if snake food has been eaten, popout another snake food...
			       this.popoutFood(); //food is only poped out here when all snake pieces have moved on step further(in the for loop above ).
				   
			      if( this.dir == "r" || this.dir == "d")
			          $(".snake:last").attr("id","snakeHead").css('background',"#00F");
			      else
			    	  $(".snake:first").attr("id","snakeHead").css('background',"#00F");	 
		 },
		 moveSnake: function(){
		    if( this.$win == null || this.$snake == null ) return; 
		    var $tempSnakePieceHolders = new Array();
			var vIndex = this.getVPathIndex( $("#snakeHead").parents("td") );
			var hIndex = this.getHPathIndex( $("#snakeHead").parents("td") );
			var stepIndex = 0; // either new(snake head index) next one step vIndex / hIndex. The rest a singler substraction from here.
			var $td = null;
			
		    if( this.dir == "d" ){  
			      stepIndex = hIndex + 1;
			      for(var i = 0; i < this.$snakePieceHolders.length; i++){
					  if( stepIndex - i >= this.gridBoundLayer.leftLayer.length )//if in > last $td in column go to first $td
					      stepIndex = 0;
					  $td = this.$grid.find(".col-"+ vIndex +".row-"+ (stepIndex - i ));
					  $tempSnakePieceHolders.push( $td );					  
				  }
		     }else if( this.dir == "r" ){
			      stepIndex = vIndex + 1;
			      for(var i = 0; i < this.$snakePieceHolders.length; i++){
					  if( stepIndex - i >= this.gridBoundLayer.topLayer.length )//if in > last $td in row go to first $td
					      stepIndex = 0;
					  $td = this.$grid.find(".col-"+ (stepIndex - i ) +".row-"+ hIndex);
					  $tempSnakePieceHolders.push( $td );
				  }
		       }else if( this.dir == "l" ){
			    	  stepIndex = vIndex - 1;
					  for(var i = 0; i < this.$snakePieceHolders.length; i++){
						  if( stepIndex + i < 0  )//if in < first $td in row go to last $td
							  stepIndex = this.gridBoundLayer.topLayer.length - 1;
						  $td = this.$grid.find(".col-"+ (stepIndex + i ) +".row-"+ hIndex);
						  $tempSnakePieceHolders.push( $td );
					  }
		          }else if( this.dir == "u" ){
			          stepIndex = hIndex - 1;
					  for(var i = 0; i < this.$snakePieceHolders.length; i++){
						  if( stepIndex + i < 0  )//if in > first $td in column go to last $td
							  stepIndex = this.gridBoundLayer.leftLayer.length - 1;
						  $td = this.$grid.find(".col-"+ vIndex +".row-"+ (stepIndex + i ));
						  $tempSnakePieceHolders.push( $td );
					   }
		            }	      
		    
		    this.shapeSnake( $tempSnakePieceHolders,true ); 
		    this.startTimer();
		 },
		 getVPathIndex: function($td){// vertical/column index where current $td falls..
			 var index = 0;		
			 var className = this.getClass($td.attr('class'),1);
			 var classNameParts = className.split("-");
			 if( classNameParts.length > 0 )
			    index = parseInt(classNameParts[1]);
			 
			 return index;
		 },
		 getHPathIndex: function($td){// horizontal/row index where current $td falls..
             var index = 0;  
             var className = this.getClass($td.attr('class'),0);
			 var classNameParts = className.split("-");
			 if( classNameParts.length > 0 )
			    index = parseInt(classNameParts[1]);

			 return index;
		 },
		 getClass: function(strClass,classIndex){
			 if(typeof(strClass) == "undefined" || strClass == null) return "";
			 
			 var classNames = strClass.split(" ");
			 if( classNames.length > classIndex)
			    return classNames[classIndex];
			 else
				return "";
		 },		
	    snakeOnMotion: function($snakePieceHolders,x){ //if the current $td contains food,return next extra snake body $td to the calling function for the snake to be grown/extended..	
		   $currentTd = $snakePieceHolders[x];//$currentTd is (snake body ) where the current snake piece is moved on	     	
		   if( $currentTd.find("#snakeFood").length == 0 ) return null;		  
		  
		   var vIndex = this.getVPathIndex( $snakePieceHolders[$snakePieceHolders.length - 1] );
		   var hIndex = this.getHPathIndex( $snakePieceHolders[$snakePieceHolders.length - 1] );		   
		   $("#snakeFood").remove();
		   var $newSnakePart = null; 
		   var stepIndex = 0;
			
		   if( this.dir == "d" ){
			    stepIndex = hIndex + 1;  
				  if( stepIndex >= this.gridBoundLayer.leftLayer.length )//if in > last $td in column go to first $td
					  stepIndex = 0;
			    $newSnakePart = this.$grid.find(".col-"+ vIndex +".row-"+ stepIndex);
			 }else if( this.dir == "r" ){
				 stepIndex = vIndex + 1;
				  if( stepIndex >= this.gridBoundLayer.topLayer.length )//if in > last $td in row go to first $td
					  stepIndex = 0;
				  $newSnakePart = this.$grid.find(".col-"+ stepIndex +".row-"+ hIndex);
			  }else if( this.dir == "l" ){
				   stepIndex = vIndex + 1;
					  if( stepIndex >= this.gridBoundLayer.topLayer.length  )//if in < first $td in row go to last $td
						  stepIndex = 0;
				   $newSnakePart = this.$grid.find(".col-"+ stepIndex +".row-"+ hIndex);
				}else if(this.dir == "u"){
					 stepIndex = hIndex + 1;  
					  if( stepIndex >= this.gridBoundLayer.leftLayer.length )//if in > last $td in column go to first $td
						  stepIndex = 0;
			         $newSnakePart = this.$grid.find(".col-"+ vIndex +".row-"+ stepIndex);
				  }
				  
		   return $newSnakePart;
	    },
	    onSnakeGrowing: function(){	  	  	
	    	 if(this.onScoreFn != null){
	    		 this.report.marks += 5; 
	    		 if(typeof(this.onScoreFn) == "function"){ 
	    			 this.onScoreFn(this.report);
				 }else if( typeof(this.onScoreFn) == "string"){ 
	    		     window[this.onScoreFn](this.report);
				 }
	    	 }else
	    		 this.onScore();
	    },
	    onScore: function(){
	    	this.report.marks += 5;
	    	alert("score: "+ this.report.marks);
	    }
}