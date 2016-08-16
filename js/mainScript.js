var MainBody=React.createClass({
	allChecked: "",
	amountOfAllRegular:0,
	uncheckedPrice:0,
	isInitialised:false,
	checkedId:"",
	allItem:0,
	initialiseTimes:0,
	getInitialState: function() {
		return {
			amountOfAllCheckedItem: 0,
			allPrice: 0,
			mode: "settle",
			data: [],
			initialiseTimes:0
		};
	},
	componentDidMount: function() {

		this.loadItemFromServer();
	},
	loadItemFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			success: function(data) {
				this.setState({data: data});
				var regular=0;
				var allPrice=0;
				var thisRef=this;
				this.state.data.forEach(function(shop){
					shop.items.forEach(function(item){
						thisRef.allItem++;
						if (item.itemstatus=="regular") {
							allPrice+=item.price;
							regular++;
						}
					});
				});
				this.amountOfAllRegular=regular;
				this.uncheckedPrice=allPrice;
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleModeChange:function(mode){
		this.setState({
			mode:mode
		});
	},
	allDone:function(){
		this.setState({
			amountOfAllCheckedItem:0,
			allPrice:0,
			mode: "settle",
			initialiseTimes:this.state.initialiseTimes+1
		});
	},
	deleteItem:function(){
		var itemIds=this.checkedId;
		var itemData=[];
		var shopIndex=-1;
		this.state.data.forEach(function(shop){
			var shopnameIsOK=false;
			shop.items.forEach(function(item){
				if (itemIds.indexOf(item.id)==-1) {
					if (!shopnameIsOK) {
						itemData.push({
							shopname:shop.shopname,
							items:[],
							id:shop.id
						});
						shopnameIsOK=true;
						shopIndex++;
					};
					itemData[shopIndex].items.push(item);
				}
			});
		});
		this.setState({
			data:itemData,
			initialiseTimes:this.state.initialiseTimes+1
		});
	},
	initialise: function(doInitialised){
		if (doInitialised) {
			var regular=0;
			var allPrice=0;
			var thisRef=this;
			this.allItem=0;
			this.state.data.forEach(function(shop){
				thisRef.allItem++;
				shop.items.forEach(function(item){
					if (item.itemstatus=="regular") {
						allPrice+=item.price;
						regular++;
					}
				});
			});
			this.checkedId="";
			this.amountOfAllRegular=regular;
			this.uncheckedPrice=allPrice;
			this.initialiseTimes++;
		}
	},
	handleNumberChange: function(addPrice,isSelected){
		if (isSelected) {
			this.setState({
				allPrice: this.state.allPrice+addPrice
			});
		}else{
			this.uncheckedPrice+=addPrice;
			this.setState();
		}
	},
	handleAllSelect:function(allIsChecked){

		if(allIsChecked){
			var thisRef=this;
			this.state.data.forEach(function(shop){
				shop.items.forEach(function(item){
					if ((item.itemstatus=="regular"||thisRef.state.mode=="edit")
						&&item.id!==""
						&&thisRef.checkedId.indexOf(item.id)==-1) {
						thisRef.checkedId+=item.id+"[']";
					}
				});
			});
			if (this.state.mode=="edit") {
				this.setState({
					allPrice:  this.state.allPrice+this.uncheckedPrice,
					amountOfAllCheckedItem:this.allItem
				});
			}else{
				this.setState({
					allPrice:  this.state.allPrice+this.uncheckedPrice,
					amountOfAllCheckedItem:this.amountOfAllRegular
				});
			}
			
			this.uncheckedPrice=0;
		}else{
			this.checkedId="";
			this.uncheckedPrice=this.uncheckedPrice+this.state.allPrice;
			this.setState({
				allPrice:  0,
				amountOfAllCheckedItem:0
			});
		}
	},
	handleItemChange:function(itemIsChecked,priceChange,id){
		var CheckedItem=itemIsChecked?
		this.state.amountOfAllCheckedItem+1:this.state.amountOfAllCheckedItem-1;
		if (itemIsChecked) {
			this.checkedId+=id+"[']";
			this.uncheckedPrice=this.uncheckedPrice-priceChange;
			this.setState({
				allPrice: this.state.allPrice+priceChange,
				amountOfAllCheckedItem: CheckedItem
			});
		}else{
			this.checkedId=this.checkedId.replace(id+"[']","");
			this.uncheckedPrice=this.uncheckedPrice+priceChange;
			this.setState({
				allPrice: this.state.allPrice-priceChange,
				amountOfAllCheckedItem: CheckedItem
			});
			
		}
	},
	handleShopChange:function(shopIsChecked,amountOfChangedItem,priceChange,id){
		var idArray=id.split("[']");
		var thisRef=this;
		if(shopIsChecked){
			idArray.forEach(function(id,index){
				if (id!==""&&thisRef.checkedId.indexOf(id)==-1) {
					thisRef.checkedId+=(id+"[']");
				}
			});
			this.uncheckedPrice=this.uncheckedPrice-priceChange;
			this.setState({
				allPrice: this.state.allPrice+priceChange,
				amountOfAllCheckedItem:this.state.amountOfAllCheckedItem+amountOfChangedItem
			});
		}else{
			idArray.forEach(function(id,index){
				if (id!=="") {
					thisRef.checkedId=thisRef.checkedId.replace(id+"[']","");
				}
			});
			this.uncheckedPrice=this.uncheckedPrice+priceChange;
			this.setState({
				allPrice: this.state.allPrice-priceChange,
				amountOfAllCheckedItem:this.state.amountOfAllCheckedItem-amountOfChangedItem
			});
		}
	},
	render:function(){
		
		this.initialise(this.initialiseTimes!==this.state.initialiseTimes)

		// 处理全选的情况
		var thisRef=this;
		if (this.amountOfAllRegular==this.state.amountOfAllCheckedItem
			&&this.amountOfAllRegular!==0
			&&this.state.mode!=="edit") {
			this.allChecked="checked";
		}else if(this.allItem==this.state.amountOfAllCheckedItem
			&&this.state.mode=="edit"){
			this.allChecked="checked";
		}else{
			this.allChecked="";
		}


		return(
			
			<div className="mainbody">

				<TitleBox
				handleModeChange={this.handleModeChange}
				allDone={this.allDone}></TitleBox>
				<ShopList 
				allItem={this.allItem} 
				trolleyinformation={this.state.data} 
				itemTellAllDone={this.handleItemChange}
				shopTellAllDone={this.handleShopChange}
				initialiseTimes={this.state.initialiseTimes} 
				itemTellDonePrice={this.handleNumberChange}
				amountOfAllCheckedItem={this.state.amountOfAllCheckedItem}
				amountOfAllRegular={this.amountOfAllRegular}
				mode={this.state.mode}></ShopList>
				<Done 
				allChecked={this.allChecked}
				amountOfAllCheckedItem={this.state.amountOfAllCheckedItem}
				tellMainBody={this.handleAllSelect}
				allPrice={this.state.allPrice}
				mode={this.state.mode}
				deleteItem={this.deleteItem}></Done>
			</div>
			);
	}
});

/*<div>{"amountOfAllCheckedItem______"+this.state.amountOfAllCheckedItem}</div>*/
/*<div>{"this.amountOfAllRegular______"+this.amountOfAllRegular}</div>*/
/*<div>{"this.allItem______"+this.allItem}</div>*/
/*<div>{"缓冲池"+this.uncheckedPrice}</div>*/
/*<div>{"反应池"+this.state.allPrice}</div>*/

var TitleBox=React.createClass({
	mode:"settle",
	modeWord:"编辑",
	changeMode:function(){
		this.mode=this.mode=="edit"?"settle":"edit";
		this.props.handleModeChange(this.mode);
		return false;
	},
	allDone:function(){
		this.mode=this.mode=="edit"?"settle":"edit";
		this.props.allDone(this.mode);
		return false;
	},
	render:function(){
		var clickEvent=this.mode=="edit"?this.allDone:this.changeMode;
		this.modeWord=this.mode=="edit"?"完成":"编辑";
		return(
			<div className="titlebox">
				<div className="layout-3">
					<a href="http://jayustree.gitcafe.io/" className="arrow">←</a>
				</div>
				<div className="layout-3">
					<span className="title">购物车</span>
				</div>
				<div className="layout-3">
					<a onClick={clickEvent}
					href="#" className="pattern">{this.modeWord}</a>
				</div>
			</div>
			);
	}
});

var ShopList=React.createClass({
	render:function(){
		var shops=[];
		var thisRef=this;
		this.props.trolleyinformation.forEach(function(shop){
			shops.push(<ShopBox 
				shopname={shop.shopname} 
				items={shop.items} 
				allItem={thisRef.props.allItem}
				itemTellAllDone={thisRef.props.itemTellAllDone}
				shopTellAllDone={thisRef.props.shopTellAllDone}
				initialiseTimes={thisRef.props.initialiseTimes} 
				itemTellDonePrice={thisRef.props.itemTellDonePrice} 
				amountOfAllCheckedItem={thisRef.props.amountOfAllCheckedItem}
				amountOfAllRegular={thisRef.props.amountOfAllRegular}
				mode={thisRef.props.mode}/>);
		});
		return(
			<div className="shoplist">
				{shops}
			</div>
			);
	}
});

var ShopBox=React.createClass({
	classString:"shopbox",
	isDisabled:true,
	allItemDisabled:"disabled",
	amountOfRegular:0,
	checked: "",
	amountOfCheckedItem:0,
	selectedPrice:0,
	unselectedPrice:0,
	isInitialised:false,
	checkedId:"",
	allShopItem:0,
	initialiseTimes:0,
	initialise:function(isInitialised,doInitialised){
		if (!isInitialised||doInitialised) {
			var thisRef=this;
			var regular=0;
			this.selectedPrice=0;
			this.unselectedPrice=0;
			this.allShopItem=0;
			this.amountOfCheckedItem=0;
			this.props.items.forEach(function(item,index){
				thisRef.allShopItem++;
				if (item.itemstatus=="regular") {
					regular++;
					thisRef.isDisabled=false;
					thisRef.allItemDisabled="";
					thisRef.unselectedPrice+=item.price;
				}
			});
			this.classString=this.isDisabled?"shopbox disabledshop":"shopbox";
			this.amountOfRegular=regular;
			this.isInitialised=true;
		}
		if(doInitialised){
			this.checked="";
			this.initialiseTimes++;
		}
	},
	handleItemNumberChange:function(addPrice,isSelected){
		if (isSelected) {
			this.selectedPrice+=addPrice;
		}else{
			this.unselectedPrice+=addPrice;
		}
	},
	handleItemChange:function(itemIsChecked,priceChange,id){
		this.amountOfCheckedItem=itemIsChecked?
		this.amountOfCheckedItem+1:this.amountOfCheckedItem-1;
		if (itemIsChecked) {
			this.checkedId+=id+"[']";
			this.unselectedPrice=this.unselectedPrice-priceChange;
			this.selectedPrice=this.selectedPrice+priceChange;
		}else{
			this.checkedId=this.checkedId.replace(id+"[']","");
			this.selectedPrice=this.selectedPrice-priceChange;
			this.unselectedPrice=this.unselectedPrice+priceChange;
		}
		if(this.props.mode=="edit"){
			this.checked=this.allShopItem==this.amountOfCheckedItem?"checked":"";
		}else{
			this.checked=this.amountOfRegular==this.amountOfCheckedItem?"checked":"";
		}
	},
	shopCheckedChange:function(){
		var allId="";
		if (this.props.mode=="edit") {
			this.props.items.forEach(function(item){
				allId+=item.id+"[']";
			});
		}else{
			this.props.items.forEach(function(item){
				if (item.itemstatus=="regular") {
					allId+=item.id+"[']";
				}
			});	
		}
		if (this.refs.shopSelect.getDOMNode().checked) {
			var thisRef=this;
			this.checkedId=allId;
			this.selectedPrice=this.selectedPrice+this.unselectedPrice;
			if(this.props.mode=="edit"){
				this.props.shopTellAllDone(
					this.refs.shopSelect.getDOMNode().checked,
					this.allShopItem-this.amountOfCheckedItem,
					this.unselectedPrice,
					allId
				);
			}else{
				this.props.shopTellAllDone(
					this.refs.shopSelect.getDOMNode().checked,
					this.amountOfRegular-this.amountOfCheckedItem,
					this.unselectedPrice,
					allId
				);
			}
			this.unselectedPrice=0;
		}else{
			this.checkedId="";
			this.unselectedPrice=this.unselectedPrice+this.selectedPrice;
			this.props.shopTellAllDone(
				this.refs.shopSelect.getDOMNode().checked,
				this.amountOfCheckedItem,
				this.selectedPrice,
				allId
			);
			this.selectedPrice=0;
		}
		this.checked=this.refs.shopSelect.getDOMNode().checked?"checked":"";
		if(this.props.mode=="edit"){
			this.amountOfCheckedItem=this.refs.shopSelect.getDOMNode().checked?
			this.allShopItem:0;
		}else{
			this.amountOfCheckedItem=this.refs.shopSelect.getDOMNode().checked?
			this.amountOfRegular:0;
		}
		
	},
	render:function(){

		// 初始化
		this.initialise(
			this.isInitialised,
			this.initialiseTimes!==this.props.initialiseTimes
			);

		if (this.props.mode=="edit") {
			this.isDisabled=false;
			this.allItemDisabled="";
		}

		// 处理全选的情况
		if(this.props.amountOfAllCheckedItem==this.props.amountOfAllRegular
			&&this.props.amountOfAllRegular!==0
			&&this.amountOfRegular!==0
			&&this.props.mode!=="edit"){
			if (this.checked!=="checked") {
				this.selectedPrice=this.selectedPrice+this.unselectedPrice;
				this.unselectedPrice=this.selectedPrice-this.unselectedPrice;
				this.selectedPrice=this.selectedPrice-this.unselectedPrice;
			}
			this.checkedId="";
			var thisRef=this;
			this.props.items.forEach(function(item){
				if (item.itemstatus=="regular") {
					thisRef.checkedId+=item.id+"[']";
				}
			});
			this.amountOfCheckedItem=this.amountOfRegular;
			this.checked="checked";
		}else if(this.props.amountOfAllCheckedItem==this.props.allItem
			&&this.props.allItem!==0&&this.props.mode=="edit"){
			this.checkedId="";
			var thisRef=this;
			this.props.items.forEach(function(item){
				thisRef.checkedId+=item.id+"[']";
			});
			this.amountOfCheckedItem=this.allShopItem;
			this.checked="checked";
		}else if(this.props.amountOfAllCheckedItem==0){
			if (this.checked=="checked") {
				this.selectedPrice=this.selectedPrice+this.unselectedPrice;
				this.unselectedPrice=this.selectedPrice-this.unselectedPrice;
				this.selectedPrice=this.selectedPrice-this.unselectedPrice;
			}
			this.checkedId="";
			this.amountOfCheckedItem=0;
			this.checked="";
		}

		// 处理子组件
		var thisRef=this;
		var items=[];
		this.props.items.forEach(function(item,index){
			items.push(<ShopItem 
				itemname={item.itemname} 
				itemId={item.id} 
				itemauthor={item.author}
				itemresUrl={item.resUrl}
				itemremarks={item.remarks}
				
				//原来的不删除会不会影响结果输出
				/*price={item.price} 
				itemstatus={item.itemstatus}
				itempicurl={item.picUrl} */
				
				allShopItem={thisRef.allShopItem} 
				itemTellShop={thisRef.handleItemChange}
				mode={thisRef.props.mode} 
				itemTellAllDone={thisRef.props.itemTellAllDone}
				itemTellDonePrice={thisRef.props.itemTellDonePrice} 
				itemTellShopPrice={thisRef.handleItemNumberChange}
				shopAmountOfCheckedItem={thisRef.amountOfCheckedItem} 
				shopAmountOfRegular={thisRef.amountOfRegular}
				initialiseTimes={thisRef.props.initialiseTimes} 
				mode={thisRef.props.mode}/>);
			if (index!==(thisRef.props.items.length-1)) {
				items.push(<hr/>);
			}
		});


		return(
			<div className={this.classString}>


				<div className="shopname">
					<input disabled={this.allItemDisabled} 
					checked={this.checked} 
					type="checkbox" 
					ref="shopSelect" 
					onChange={this.shopCheckedChange}></input>
					<span>{this.props.shopname}</span>
				</div>
				<hr></hr>
				<div className="itembox">
					{items}
				</div>
			</div>
			);
	}
});

/* <div>{"this.allItemDisabled______"+this.allItemDisabled}</div> */
/* <div>{"this.amountOfRegular______"+this.amountOfRegular}</div> */
/* <div>{"this.allShopItem______"+this.allShopItem}</div> */
/* <div>{"this.checked______"+this.checked}</div> */
/* <div>{"this.amountOfCheckedItem______"+this.amountOfCheckedItem}</div> */
/* <div>{"反应池______"+this.selectedPrice}</div> */
/* <div>{"缓冲池______"+this.unselectedPrice}</div> */
/* <div>{"this.checkedId______"+this.checkedId}</div> */

var ShopItem=React.createClass({
	classString: "shopitem disableditem",
	itemstatusword: "",
	disabled: "disabled",
	checked: "",
	number:0,
	selectedPrice:0,
	unselectedPrice:0,
	isInitialised:false,
	firstInput:true,
	initialiseTimes:0,
	initialise:function(isInitialised,doInitialised){
		if (!isInitialised||doInitialised) {
			if (this.props.itemstatus=="takenOff"){
				this.itemstatusword="已下架";
				this.unselectedPrice=0;
				this.selectedPrice=0;
				this.number=0;
			}else if(this.props.itemstatus=="soldOut"){
				this.itemstatusword="卖完了";
				this.unselectedPrice=0;
				this.selectedPrice=0;
				this.number=0;
			}else{
				this.classString="shopitem";
				this.disabled="";
				this.unselectedPrice=this.props.price;
				this.selectedPrice=0;
				this.number=1;
			}
			this.isInitialised=true;
		}
		if(doInitialised){
			this.checked="";
			this.initialiseTimes++;
		}
	},
	numberChange:function(){
		if (this.firstInput) this.number="";
		var isSelected=this.refs.checkbox.getDOMNode().checked;
		var temp=this.refs.number.getDOMNode().value.replace(/^0*/,"");
		if(temp.match(/^(?:1|[1-9][0-9]?|99)$/)){
			if (this.number==""&&this.firstInput) {
				this.number="";
				this.firstInput=false;
			}else{
				this.number=(this.number>99)?99:temp;
			}
		}else{
			if (temp.match(/^-?\d+$/)) {
				if (temp>99) {
					this.number=99;
				}
			}else{
				this.number=0;
			}
		}
		if (isSelected) {
			var newAllPrice=this.number*this.props.price;
			var oldAllPrice=this.selectedPrice;
			this.selectedPrice=newAllPrice;
			this.unselectedPrice=0;
			this.props.itemTellShopPrice(newAllPrice-oldAllPrice,isSelected);
			this.props.itemTellDonePrice(newAllPrice-oldAllPrice,isSelected);
		}else{
			var newAllPrice=this.number*this.props.price;
			var oldAllPrice=this.unselectedPrice;
			this.unselectedPrice=newAllPrice;
			this.selectedPrice=0;
			this.props.itemTellShopPrice(newAllPrice-oldAllPrice,isSelected);
			this.props.itemTellDonePrice(newAllPrice-oldAllPrice,isSelected);
		}

	},
	itemCheckedChange:function(){
		this.checked=this.refs.checkbox.getDOMNode().checked?"checked":"";
		if (this.checked=="checked") {
			this.selectedPrice=this.unselectedPrice;
			this.unselectedPrice=0;
			this.props.itemTellShop(
				this.refs.checkbox.getDOMNode().checked,
				this.selectedPrice,
				this.props.itemId
				);
			this.props.itemTellAllDone(
				this.refs.checkbox.getDOMNode().checked,
				this.selectedPrice,
				this.props.itemId
				);
		}else{
			this.unselectedPrice=this.selectedPrice;
			this.selectedPrice=0;
			this.props.itemTellShop(
				this.refs.checkbox.getDOMNode().checked,
				this.unselectedPrice,
				this.props.itemId
				);
			this.props.itemTellAllDone(
				this.refs.checkbox.getDOMNode().checked,
				this.unselectedPrice,
				this.props.itemId
				);
		}
		
	},
	render:function(){

		// 初始化
		this.initialise(
			this.isInitialised,
			this.initialiseTimes!==this.props.initialiseTimes
			);
		if (this.props.itemstatus=="takenOff"){
			this.classString="shopitem disableditem";
			if (this.props.mode=="edit") {
				this.disabled="";
			}else{
				this.disabled="disabled";
			}
			this.itemstatusword="已下架";
		}else if(this.props.itemstatus=="soldOut"){
			this.classString="shopitem disableditem";
			if (this.props.mode=="edit") {
				this.disabled="";
			}else{
				this.disabled="disabled";
			}
			this.itemstatusword="卖完了";
		}else{
			this.classString="shopitem";
			this.disabled="";
		}

		// 处理全选
		if(this.props.shopAmountOfCheckedItem==this.props.allShopItem
			&&this.props.allShopItem!==0
			&&this.props.mode=="edit"){
			this.checked="checked";
		}else if(this.props.shopAmountOfCheckedItem==this.props.shopAmountOfRegular
			&&this.props.shopAmountOfRegular!==0
			&&this.props.mode!=="edit"){
			
			if (this.checked!=="checked") {
				this.selectedPrice=this.selectedPrice+this.unselectedPrice;
				this.unselectedPrice=this.selectedPrice-this.unselectedPrice;
				this.selectedPrice=this.selectedPrice-this.unselectedPrice;
				if (this.disabled!=="disabled") {
					this.checked="checked";
				}
			}
		}else if(this.props.shopAmountOfCheckedItem==0){
			if (this.checked=="checked") {
				this.selectedPrice=this.selectedPrice+this.unselectedPrice;
				this.unselectedPrice=this.selectedPrice-this.unselectedPrice;
				this.selectedPrice=this.selectedPrice-this.unselectedPrice;
				this.checked="";
			}
		}


		return(
			<div className={this.classString}>
				// <input ref="checkbox"
				// type="checkbox" 
				// disabled={this.disabled} 
				// checked={this.checked}
				// onChange={this.itemCheckedChange}></input>
				<div>{this.props.itemId}</div>
				<div className="itemname">
					{this.props.itemname}
				</div>
				<div className="itemshow">
					<div>{this.props.itemauthor}</div>
					<div><a href=this.props.itemresUrl地址</a></div>
					<div>{this.props.itemremarks}</div>
					//<div className="itempic" 
					//style={{backgroundImage: 'url('+this.props.itempicurl+')'}}></div>
					//<div className="itemstatus">{this.itemstatusword}</div>
				</div>
				// <div className="iteminputbox">
					// <div className="price">￥{this.props.price}</div>
					// <input ref="number"
					// type="text"
					// disabled={this.disabled} 
					// value={this.number}
					// onChange={this.numberChange}
					// onFocus={this.numberChange}></input>
				// </div>
			</div>
			);
	}
});

var Done=React.createClass({
	allChecked:"",
	style:{display:"inline"},
	handleAllSelect:function(){
		this.props.tellMainBody(this.refs.checkbox.getDOMNode().checked);
	},
	deleteItem:function(){
		this.props.deleteItem();
	},
	render:function(){
		this.allChecked=this.props.allChecked;
		this.style=(this.props.mode=="edit")?{display:"none"}:{display:"inline"};
		var buttonWord=(this.props.mode=="edit")?
		"删除":"结算("+this.props.amountOfAllCheckedItem+")";
		var clickEvent=this.props.mode=="edit"?this.deleteItem:"";
		return(
			<div className="done">
				<input 
				type="checkbox" 
				checked={this.allChecked} 
				onChange={this.handleAllSelect}
				ref="checkbox"></input><span>全选</span>
				<button 
				onClick={clickEvent} 
				type="button">{buttonWord}</button>
				<div className="totalfreight">
					<span className="total" style={this.style}>合计：￥{parseFloat(this.props.allPrice).toFixed(2)}</span>
					<span className="freight" style={this.style}>不含运费</span>
				</div>
			</div>
			);
	}
});

React.render(
	<MainBody url="Data.json"/>,
	document.getElementById('myBody')
	);