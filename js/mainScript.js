var MainBody=React.createClass({
	//添加全局变量A=鼠标选中的值，默认为"null"
	mouseGet: "null",
	
	allChecked: "",
	amountOfAllRegular:0,
	uncheckedPrice:0,
	isInitialised:false,
	checkedId:"",
	allItem:0,
	initialiseTimes:0,
	getInitialState: function() {
		return {
			//添加全局变量A=鼠标选中的值，默认为"null"
			mouseGet: "null";
			
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
	handleModeChange:function(mode){//点击编辑
		this.setState({
			mode:mode
		});
	},
	allDone:function(){//点击完成
		this.setState({
			amountOfAllCheckedItem:0,
			allPrice:0,
			mode: "settle",
			initialiseTimes:this.state.initialiseTimes+1
		});
	},
	deleteItem:function(){//删除商品
		var itemIds=this.checkedId;//获取选中的商品id
		var itemData=[];//存储删除后的商品列表
		var shopIndex=-1;//控制push的位置
		this.state.data.forEach(function(shop){//和for循环类似
			var shopnameIsOK=false;//控制逐个商店地判断是否push
			shop.items.forEach(function(item){
				if (itemIds.indexOf(item.id)==-1) {//若不是选中之一的
					if (!shopnameIsOK) {
						itemData.push({
							shopname:shop.shopname,
							items:[],
							id:shop.id
						});
						shopnameIsOK=true;
						shopIndex++;//进一
					};
					itemData[shopIndex].items.push(item);//push进来的就会删除后还显示出来
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
	handleAllSelect:function(allIsChecked){//全选

		if(allIsChecked){
			var thisRef=this;
			this.state.data.forEach(function(shop){
				shop.items.forEach(function(item){
					if ((item.itemstatus=="regular"||thisRef.state.mode=="edit")
						&&item.id!==""
						&&thisRef.checkedId.indexOf(item.id)==-1) {
						thisRef.checkedId+=item.id+"[']";//还没选中的加入选中id
					}
				});
			});
			if (this.state.mode=="edit") {
				this.setState({
					allPrice:  this.state.allPrice+this.uncheckedPrice,//价格是全部加起来
					amountOfAllCheckedItem:this.allItem//数量也是总数
				});
			}else{
				this.setState({
					allPrice:  this.state.allPrice+this.uncheckedPrice,
					amountOfAllCheckedItem:this.amountOfAllRegular
				});
			}
			
			this.uncheckedPrice=0;//未选中的价格清零
		}else{//取消全选
			this.checkedId="";
			this.uncheckedPrice=this.uncheckedPrice+this.state.allPrice;
			this.setState({
				allPrice:  0,
				amountOfAllCheckedItem:0
			});
		}
	},
	handleItemChange:function(itemIsChecked,priceChange,id){//处理商品选中或取消选中
		var CheckedItem=itemIsChecked?
		this.state.amountOfAllCheckedItem+1:this.state.amountOfAllCheckedItem-1;
		if (itemIsChecked) {//选中的情况
			this.checkedId+=id+"[']";//添加到选中id中
			this.uncheckedPrice=this.uncheckedPrice-priceChange;//未选中价格减少
			this.setState({
				allPrice: this.state.allPrice+priceChange,//结算价格增加
				amountOfAllCheckedItem: CheckedItem
			});
		}else{//取消选中的情况，处理就和前面相反
			this.checkedId=this.checkedId.replace(id+"[']","");
			this.uncheckedPrice=this.uncheckedPrice+priceChange;
			this.setState({
				allPrice: this.state.allPrice-priceChange,
				amountOfAllCheckedItem: CheckedItem
			});
			
		}
	},
	handleShopChange:function(shopIsChecked,amountOfChangedItem,priceChange,id){//处理商店选中或取消选中
		var idArray=id.split("[']");
		var thisRef=this;
		if(shopIsChecked){//选中的情况
			idArray.forEach(function(id,index){//for循环该商店下的每个商品
				if (id!==""&&thisRef.checkedId.indexOf(id)==-1) {//如果某商品id不在选中id中
					thisRef.checkedId+=(id+"[']");//就加进去
				}
			});
			this.uncheckedPrice=this.uncheckedPrice-priceChange;//价格的处理同上个函数
			this.setState({
				allPrice: this.state.allPrice+priceChange,
				amountOfAllCheckedItem:this.state.amountOfAllCheckedItem+amountOfChangedItem
			});
		}else{//取消选中的情况
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

var TitleBox=React.createClass({
	mode:"settle",
	modeWord:"编辑",
	changeMode:function(){//点击编辑
		this.mode=this.mode=="edit"?"settle":"edit";
		this.props.handleModeChange(this.mode);
		return false;
	},
	allDone:function(){//点击完成
		this.mode=this.mode=="edit"?"settle":"edit";
		this.props.allDone(this.mode);
		return false;
	},
	
    	
	render:function(){
	//在这里弄banner和二层菜单
	//每个a对应getData函数，赋值A
	
	//二层菜单的控制函数

	
		var clickEvent=this.mode=="edit"?this.allDone:this.changeMode;
		this.modeWord=this.mode=="edit"?"完成":"编辑";
		return(
			<img src="../image/banner.jpg"/>//banner
			<div id="nav2">//二层菜单
				<ul>
				<li>
				<label className="year"><a href="javascript:;" style="font-size:23px;">|学院资料|</a></label>
				<ul className="two">
					<li><label><a onclick="applySelectedTo(this);return false;" className="selected" href="#">
						|课程内容</a></label></li>
					<li><label><a onclick="applySelectedTo(this);return false;" href="#">|参考资料</a></label></li>
				</ul>
				<label className="year"><a href="javascript:;" style="font-size:23px;">|二次元相关|</a></label>
				<ul className="two">
					<li><label><a onclick="applySelectedTo(this);return false;" href="#">
						|TVP Animation<br />
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;in UIChina</a></label></li>
					<li><label><a onclick="applySelectedTo(this);return false;" href="#">
						|VOCALOID</a></label></li>
					<li><label><a onclick="applySelectedTo(this);return false;" href="#">
						|MediBang Paint</a></label></li>
				</ul>
				</li>
				</ul>
			</div>
			
			);
			
			<script type="text/javascript" >
	
	//获取mouseGet（不知道这样弄对不对）
	//导航保持高亮（在这里调用getData写在一起，因为考虑到clickon=会冲突）
    function applySelectedTo(obj) {
		//调用getData
		getData(obj);
			
		var ul = document.getElementById("nav2")[0]; // get the first ul tag on the page
		var allLinks = document.getElementById("nav2").getElementsByTagName("a"); // get all the links within that ul
		for (var i = 0; i < allLinks.length; i++) { // iterate through all those links
			allLinks[i].className = ""; // and assign their class names to nothing
		}
		link.className = "selected"; // finally, assign class="selected" to our chosen link
		var allDivs = document.getElementById("nav2");
		for (var k = 0; k < allDivs.length; k++) {
			allDivs[k].className = "";
		}
		var lyricId = link.getAttribute("href").split("#")[1];
		lyricId = document.getElementById(lyricId);
		lyricId.className = "on";
    }
	function getData:(obj) {
            //获取点击项的名字
            var content = obj.innerText;
			this.mouseGet = content;//mouseGet的赋值方式不确定

            //更改图片和大名字标题
            //var file0 = "Artists/" + content + "/0.jpg";
            //document.getElementById('icon').src = file0;
    }
	
    function addEvent(el, name, fn) {//绑定事件
        if (el.addEventListener) return el.addEventListener(name, fn, false);
        return el.attachEvent('on' + name, fn);
    }
    function nextnode(node) {//寻找下一个兄弟并剔除空的文本节点
        if (!node) return;
        if (node.nodeType == 1)
            return node;
        if (node.nextSibling)
            return nextnode(node.nextSibling);
    }
    function prevnode(node) {//寻找上一个兄弟并剔除空的文本节点
        if (!node) return;
        if (node.nodeType == 1)
            return node;
        if (node.previousSibling)
            return prevnode(node.previousSibling);
    }
    function parcheck(self, checked) {//递归寻找父亲元素，并找到input元素进行操作
        var par = prevnode(self.parentNode.parentNode.parentNode.previousSibling), parspar;
        if (par && par.getElementsByTagName('input')[0]) {
            par.getElementsByTagName('input')[0].checked = checked;
            parcheck(par.getElementsByTagName('input')[0], sibcheck(par.getElementsByTagName('input')[0]));
        }
    }
    function sibcheck(self) {//判断兄弟节点是否已经全部选中
        var sbi = self.parentNode.parentNode.parentNode.childNodes, n = 0;
        for (var i = 0; i < sbi.length; i++) {
            if (sbi[i].nodeType != 1)//由于孩子结点中包括空的文本节点，所以这里累计长度的时候也要算上去
                n++;
            else if (sbi[i].getElementsByTagName('input')[0].checked)
                n++;
        }
        return n == sbi.length ? true : false;
    }
    addEvent(document.getElementById('nav2'), 'click', function (e) {//绑定input点击事件，使用menu_zzjs_net根元素代理
        e = e || window.event;
        var target = e.target || e.srcElement;
        var tp = nextnode(target.parentNode.nextSibling);
        switch (target.nodeName) {
            case 'A': //点击A标签展开和收缩树形目录，并改变其样式会选中checkbox
                if (tp && tp.nodeName == 'UL') {
                    if (tp.style.display != 'block') {
                        tp.style.display = 'block';
                        prevnode(target.parentNode.previousSibling).className = 'ren'
                    } else {
                        tp.style.display = 'none';
                        prevnode(target.parentNode.previousSibling).className = 'add'
                    }
                }
                break;
            case 'SPAN': //点击图标只展开或者收缩
                var ap = nextnode(nextnode(target.nextSibling).nextSibling);
                if (ap.style.display != 'block') {
                    ap.style.display = 'block';
                    target.className = 'ren'
                } else {
                    ap.style.display = 'none';
                    target.className = 'add'
                }
                break;
            case 'INPUT': //点击checkbox，父亲元素选中，则孩子节点中的checkbox也同时选中，孩子结点取消父元素随之取消
                if (target.checked) {
                    if (tp) {
                        var checkbox = tp.getElementsByTagName('input');
                        for (var i = 0; i < checkbox.length; i++)
                            checkbox[i].checked = true;
                    }
                } else {
                    if (tp) {
                        var checkbox = tp.getElementsByTagName('input');
                        for (var i = 0; i < checkbox.length; i++)
                            checkbox[i].checked = false;
                    }
                }
                parcheck(target, sibcheck(target)); //当孩子结点取消选中的时候调用该方法递归其父节点的checkbox逐一取消选中
                break;
        }
    });
    window.onload = function () {//页面加载时给有孩子结点的元素动态添加图标
        var labels = document.getElementById('nav2').getElementsByTagName('label');
        for (var i = 0; i < labels.length; i++) {
            var span = document.createElement('span');
            span.style.cssText = 'display:inline-block;height:40px;vertical-align:middle;width:180px;cursor:pointer;';
            span.innerHTML = ' '
            span.className = 'add';
            if (nextnode(labels[i].nextSibling) && nextnode(labels[i].nextSibling).nodeName == 'UL')
                labels[i].parentNode.insertBefore(span, labels[i]);
            else
                labels[i].className = 'rem'
        }
    }
	</script>
	}
});

var SubTitleBox=React.createClass({
	mode:"settle",
	modeWord:"编辑",
	changeMode:function(){//点击编辑
		this.mode=this.mode=="edit"?"settle":"edit";
		this.props.handleModeChange(this.mode);
		return false;
	},
	allDone:function(){//点击完成
		this.mode=this.mode=="edit"?"settle":"edit";
		this.props.allDone(this.mode);
		return false;
	},
	getDataSub:function(obj) {
            //获取点击项的名字
            var contentSub = obj.innerText;
			this.mouseGet = content;//mouseGet的赋值方式不确定

            //更改图片和大名字标题
            //var file0 = "Artists/" + content + "/0.jpg";
            //document.getElementById('icon').src = file0;
    },
	render:function(){
	//在这里实现子菜单，据点击A不同return不同内容（选中一项后悔消失，不过也不妨碍）
	//这里的每个a同样的响应getData函数，赋值A（getData函数是不同的？）
		var clickEvent=this.mode=="edit"?this.allDone:this.changeMode;
		this.modeWord=this.mode=="edit"?"完成":"编辑";
		
		if(this.mouseGet == "TVP Animation"){
			return(
				<div id="menu" style="position: absolute;">
					<ul>
						<li><a href="#" onclick="getDataSub(this)" style="text-decoration:none;">TVP视频教学</a></li>
						<li><a href="#" onclick="getDataSub(this)" style="text-decoration:none;">TVP软件下载</a></li>
					</ul>
				</div>
				/*<div className="titlebox">
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
				</div>*/
			);
		}
		else{
			return(
				<div id="menu" style="position: absolute;">
					<ul>
						<li><a href="#" onclick="getDataSub(this)" style="text-decoration:none;">VOCALOID视频教学</a></li>
						<li><a href="#" onclick="getDataSub(this)" style="text-decoration:none;">VOCALOID软件下载</a></li>
					</ul>
				</div>
			);
		}
	}
});

var ShopList=React.createClass({
	render:function(){
		var shops=[];
		var thisRef=this;
		this.props.trolleyinformation.forEach(function(shop){
		//在这里添加if约束，符合字符串（添加判断变量A（应为全局）的内容才push到shops中（应该可行）
			//if(shop.shopname == this.mouseGet){
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
			//}
			
		});
		//if(this.mouseGet !== "null"){
			return(
				//A为空时return别的东西
				<div className="shoplist">
					{shops}
				</div>
			);
		//}
		//else{
		//	return(
		//		<div>Nothing</div>
		//	);
		//}
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

		//处理子组件
		//json变了之后这里要更改
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
	numberChange:function(){//改变商品数量
		if (this.firstInput) this.number="";
		var isSelected=this.refs.checkbox.getDOMNode().checked;
		var temp=this.refs.number.getDOMNode().value.replace(/^0*/,"");
		if(temp.match(/^(?:1|[1-9][0-9]?|99)$/)){//数量可以是1/1-99/99
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
			var newAllPrice=this.number*this.props.price;//新的价格=数量*单价
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
		//json变了之后这里显示的内容也会更改
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

//这个也许没用，也可以加别的js效果
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