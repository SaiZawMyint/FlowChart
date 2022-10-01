var element = null;

const ref = '#ref-'
var compname = itech(`${ref}comp-name`).get(0)
var tops = itech(`${ref}comp-top`).get(0)
console.log(compname,tops)
var left = itech(`${ref}comp-left`).get(0)
var width = itech(`${ref}comp-width`).get(0)
var height = itech(`${ref}comp-height`).get(0)
var color = itech(`${ref}comp-color`).get(0)
var bgcolor = itech(`${ref}comp-bg-color`).get(0)
var fontfamily = itech(`${ref}font-family`).get(0)
var fontsize = itech(`${ref}font-size`).get(0)
var bordertop = itech(`${ref}border-top`).get(0)
var borderleft = itech(`${ref}border-left`).get(0)
var borderright = itech(`${ref}border-right`).get(0)
var borderbottom = itech(`${ref}border-bottom`).get(0)
var bordercolor = itech(`${ref}border-color-inp`).get(0)
var bordertype = itech(`${ref}border-type`).get(0)
var bordersize = itech(`${ref}border-size`).get(0)

var autowidth = itech('#auto-width').get(0)
var autoheight = itech('#auto-height').get(0)
var refforecolor = itech('#ref-fore-color').get(0)
var refbackcolor = itech('#ref-back-color').get(0)
var refborderc = itech(`${ref}border-color`).get(0)
const refcomponents = [compname,tops,left,width,height,autowidth,autoheight,color,bgcolor,refforecolor,refbackcolor,fontfamily,fontsize,bordertop,borderleft,borderright,borderbottom,bordercolor,bordertype,bordersize]
var refSetting = {
    name: '',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    color: '',
    background: '',
    font:{
        family: '',
        size: 0
    },
    border:{
        top: false,
        left: false,
        right: false,
        bottom: false,
        all: false,
        color: '',
        type: '',
        size: 0
    }
}
ready(function () {
    element = document.getElementById("flowChart");
    itech(element).flowchart().init();
    itech('.float-btn').on('click',function(){
        itech(element).flowchart().grid()
    })
    itech('#add-comp-btn').on('click',function(){
        if(itech(this).hasClass('active'))
            itech('.modal-field').hide()
        else
        itech('.modal-field').show('block',function(d){
            itech(d.firstElementChild).animate('drop-down')
        })
    })
    itech('.btn.close-modal').on('click',function(){
        itech('#add-comp-btn').removeClass('active')
        itech('.modal-field').wait(20,function(){
            itech('.modal-box').addClass('up')
        },function(ele){
            console.log(ele)
            itech(ele.firstElementChild).removeClass('up')
            itech(ele).hide()
        })
    })
    itech('.btn.create-comp').on('click',function(){
        createComponent()
    })
    itech('#bg-ref-color').on('click',function(){
        var back = itech('#back-color').get(0)
        back.click()
    })
    itech('#ref-color').on('click',function(){
        var back = itech('#fore-color').get(0)
        back.click()
    })
    itech('#ref-line-color').on('click',function(){
        var back = itech('#connector-color').get(0)
        back.click()
    })
    itech('.color-inp').on('input',function(){
        var ref = itech(this.dataset['color']).get(0)
        this.parentElement.style.color = this.value
        ref.value = this.value
        itech(this.dataset['cref']).css({"background-color":this.value})
    })
    itech('.inp.blame').on('input',function(){
        if(this.value.trim().length > 0) itech(this).removeClass('error')
        if(this.value.trim().length == 0) itech(this).addClass('error')
    })
    itech('.main-list').on('click',function(){
        itech(this).toggleClass('active')
        itech('.main-list').loop((ele)=>{
            if(ele != this && itech(ele).hasClass('active')){
                itech(ele).removeClass('active')
                itech(ele.dataset['hide']).hide()
            } 
        })
        if(itech(this).isDataSet('hide'))
            itech(this.dataset['hide']).toggleShow('flex')
        this.focus()
    })
    itech('.main-list').on('blur',function(){
        itech(this).removeClass('active')
        if(itech(this).isDataSet('hide'))
            itech(this.dataset['hide']).hide()

    })
    itech('.ref-line').on('click',function(e){
        e.stopPropagation();
        if(itech(this).isDataSet('click')){
           itech(itech(this).data('click')).get(0).click()
        }
    })
    itech('.choose-c-color').on('click',function(e){
        e.stopPropagation()
        if(!itech(this).hasClass('ref')){
            this.parentElement.parentElement.blur()
            specialCase.colorCase.choose = true
            specialCase.colorCase.data = itech(this).data('color')
            tintcolor(specialCase.colorCase.data)
        }
    })
    itech(".pop-c").on("input",function(){
        this.dataset['color'] = this.value
    })
    itech("#choose-tink-color").on('change',function(){
        this.parentElement.parentElement.parentElement.blur()
        specialCase.colorCase.choose = true
        specialCase.colorCase.data = itech(this).data('color')
        tintcolor(specialCase.colorCase.data)
    })
    itech(compname).on('input change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        if(itech(target).hasClass('_itech-comp-btn')){
            target.firstElementChild.innerText = this.value
            JOIN.searchJoins(target);
        }
    })
    itech('.btn.lock').on('click',function(){
        itech(this).toggleClass('active')
    })
    itech(tops).on('input change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        if(itech(target).hasClass('_itech-comp-btn')){
            var diff = Math.abs(parseInt(itech(target).css('top')) - parseInt(itech(target).css('left')))
            itech(target).css({top: this.value+"px"})
            var diff1 =Math.abs(parseInt(itech(target).css('top')) - parseInt(itech(target).css('left')))
            if(itech('#position-lock').hasClass('active')){
                left.value = parseInt(left.value) + (parseInt(diff) - parseInt(diff1))
                itech(target).css({left: left.value+"px"})
            }
            JOIN.searchJoins(target);
        }
    })
    itech(left).on('input change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        if(itech(target).hasClass('_itech-comp-btn')){
            var diff = Math.abs(parseInt(itech(target).css('left')) - parseInt(itech(target).css('top')))
            itech(target).css({left: this.value+"px"})
            var diff1 =Math.abs(parseInt(itech(target).css('left')) - parseInt(itech(target).css('top')))
            if(itech('#position-lock').hasClass('active')){
                tops.value = parseInt(tops.value) + (parseInt(diff1) - parseInt(diff))
                itech(target).css({top: tops.value+"px"})
            }
            JOIN.searchJoins(target);
        }
    })
    itech(width).on('input change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        if(itech(target).hasClass('_itech-comp-btn')){
            var diff = Math.abs(parseInt(itech(target).css('width')) - parseInt(itech(target).css('height')))
            itech(target).css({width: this.value+"px"})
            var diff1 =Math.abs(parseInt(itech(target).css('width')) - parseInt(itech(target).css('height')))
            if(itech('#size-lock').hasClass('active')){
                height.value = parseInt(height.value) + (parseInt(diff1) - parseInt(diff))
                itech(target).css({height: height.value+"px"})
            }
            JOIN.searchJoins(target);
        }
    })
    itech(height).on('input change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        if(itech(target).hasClass('_itech-comp-btn')){
            var diff = Math.abs(parseInt(itech(target).css('height')) - parseInt(itech(target).css('width')))
            itech(target).css({height: this.value+"px"})
            var diff1 =Math.abs(parseInt(itech(target).css('height')) - parseInt(itech(target).css('width')))
            if(itech('#size-lock').hasClass('active')){
                width.value = parseInt(width.value) + (parseInt(diff) - parseInt(diff1))
                itech(target).css({width: width.value+"px"})
            }
            JOIN.searchJoins(target);
        }
    })
    itech(autowidth).on('click',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        itech(target).css({width: 'fit-content'})
        width.value = parseInt(itech(target).css('width'))
        JOIN.searchJoins(target);
    })
    itech(autoheight).on('click',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        itech(target).css({height: 'fit-content'})
        height.value = parseInt(itech(target).css('height'))
        JOIN.searchJoins(target);
    })
    itech('.color-dig').on('click',function(){
        this.firstElementChild.click()
    })
    itech(color).on('input change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        itech(target).css({color: this.value})
        JOIN.searchJoins(target);
    })
    itech(refforecolor).on('input change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        itech(target).css({color: this.value})
        JOIN.searchJoins(target);
    })
    itech(bgcolor).on('input change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        itech(target).css({"background-color": this.value})
        JOIN.searchJoins(target);
    })
    itech(refbackcolor).on('input change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        itech(target).css({"background-color": this.value})
        JOIN.searchJoins(target);
    })
    itech(fontfamily).on('change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        itech(target).css({"font-family": `${this.value}`})
        itech(this).css({"font-family":`${this.value}`})
        JOIN.searchJoins(target);
    })
    itech('.b').on('click',function(){
        itech(this).toggleClass('active')
        var id = itech(this).data('target')
        var target = i_id(id)
        borderActions(this,target)
        
    })
    itech(refborderc).on('click',function(){
        var cid = itech(this).data('direction')
        var ctarget = i_id(cid)
        ctarget.click()
        
    })
    itech('#ref-border-color-inp').on('input',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        itech('.b').loop(function(ele){
            borderActions(ele,target)
        })
    })
    itech(bordertype).on('change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        itech('.b').loop(function(ele){
            borderActions(ele,target)
        })
    })
    itech(bordersize).on('input change',function(){
        var id = itech(this).data('target')
        var target = i_id(id)
        itech('.b').loop(function(ele){
            borderActions(ele,target)
        })
    })
});
function borderActions(current,target){
    var size = bordersize.value == 0 ? 1 : bordersize.value
    var type = bordertype.value
    var color = bordercolor.value
    let direction = itech(current).data('direction')
    if(itech(current).hasClass('active')){
        if(direction == 'top') itech(target).css({
            'border-top-width': size+"px",
            'border-top-style': type,
            'border-top-color': color
        })
        if(direction == 'left') itech(target).css({
            'border-left-width': size+"px",
            'border-left-style': type,
            'border-left-color': color
        })
        if(direction == 'right') itech(target).css({
            'border-right-width': size+"px",
            'border-right-style': type,
            'border-right-color': color
        })
        if(direction == 'bottom') itech(target).css({
            'border-bottom-width': size+"px",
            'border-bottom-style': type,
            'border-bottom-color': color
        })
    }else{
        if(direction == 'top') itech(target).css({
            'border-top-width': "unset",
            'border-top-style': "unset",
            'border-top-color': "unset"
        })
        if(direction == 'left') itech(target).css({
            'border-left-width': "unset",
            'border-left-style': "unset",
            'border-left-color': "unset"
        })
        if(direction == 'right') itech(target).css({
            'border-right-width': "unset",
            'border-right-style': "unset",
            'border-right-color': "unset"
        })
        if(direction == 'bottom') itech(target).css({
            'border-bottom-width': "unset",
            'border-bottom-style': "unset",
            'border-bottom-color': "unset"
        })
    }
    JOIN.searchJoins(target);
}
function tintcolor(color){
    itech('body').css({cursor: `url(${Design.customCursor('\uf1fb',color)}), auto`})
    
    itech('body').addClass('tint-color')
    var orgcolor = itech('._itech-comp-btn').css('color')
    var orgcursor = itech('._itech-comp-btn').css('cursor')
    
    document.addEventListener('mousedown',devt) 

    itech('._itech-comp-btn').on('mouseover', mover)
    itech('._itech-comp-btn').on('mousedown', mdown)
    itech('._itech-comp-btn').on('mouseout',mout)
    
    function devt(e){
        if(!specialCase.colorCase.choose) return false
        if(!itech(e.target).hasClass('_itech-comp-btn')){
            restoretc()
        }
    }

    function mover(e){
        if(!specialCase.colorCase.choose) return false
        e.stopPropagation()
        this.css({color: specialCase.colorCase.data, cursor: `url(${Design.customCursor('\uf1fb',color)}), auto !important`})
    }
    function mdown(e){
        if(!specialCase.colorCase.choose) return false
        e.stopPropagation()
        
        this.css({color: specialCase.colorCase.data,cursor: orgcursor})
        restoretc()
    }
    function mout(e){
        if(!specialCase.colorCase.choose) return false
        this.css({color: orgcolor,cursor: orgcursor})
    }
}
function restoretc(){
    itech('body').css({cursor: 'default'})
        itech('body').removeClass('tint-color')
    specialCase.colorCase.choose = false
    specialCase.colorCase.data = ''
    specialCase.colorCase.data = null
}
function createComponent(){
    var compname = itech('#comp-name').get(0)
    var comptop = itech('#comp-top').get(0)
    var compleft = itech('#comp-left').get(0)
    var compbgcolor = itech('#comp-bg-color').get(0)
    var compcolor = itech('#comp-color').get(0)
    var complinecolor = itech('#line-color').get(0)
    if(compname.value.trim().length == 0){
        itech(compname).addClass('error')
        return false;
    }
    itech('#add-comp-btn').removeClass('active')
    var setting = defaultComponentSetting
    setting.title = compname.value
    if(comptop.value.length > 0) setting.css.top = comptop.value +'px'
    setting.css["background-color"]=compbgcolor.value
    if(compleft.value.length > 0) setting.css.left = compleft.value +'px'
    if(complinecolor.value.length > 0) setting.connector.color = complinecolor.value
    setting.css.color = compcolor.value
    setting.callback = function(data){
        console.log(data)
        itech(data.initiatedComponent.component).on('click',selectedElement)
    }
    itech(element).flowchart().add(setting)
    itech('.modal-field').hide()

    compname.value = ''
    comptop.value = ''
    compleft.value = ''
    // compbgcolor.value = ''
    // compcolor.value = ''
    // complinecolor.value=''
}
function selectedElement(e){
    
    if(!itech(this).hasClass('_box_selected')){
        itech('.stylish-box').removeClass('active')
    }else{
        targetSelected(this)
        itech('.stylish-box').toggleClass('active')
    }
    
}
function targetSelected(component = new Element()){
    var targetId = component.id
    if(itech(component).hasClass('_itech-comp-btn')){
        var rect = component.getBoundingClientRect()
        refSetting.name = component.firstElementChild.innerText
        refSetting.top = itech(component).css('top')
        refSetting.left = itech(component).css('left')
        refSetting.width = rect.width
        refSetting.height = rect.height
        refSetting.color = itech(component).css('color')
        refSetting.background = itech(component).css('background-color')
        refSetting.font.family = itech(component.firstElementChild).css('font-family')
        refSetting.font.size = itech(component.firstElementChild).css('font-size')
        refSetting.border.top = itech(component).css('border-top-width') != '0px'
        refSetting.border.left = itech(component).css('border-left-width') != '0px'
        refSetting.border.right = itech(component).css('border-right-width') != '0px'
        refSetting.border.bottom = itech(component).css('border-bottom-width') != '0px'
        refSetting.border.color = itech(component).css('border-color')
        refSetting.border.size = itech(component).css('border-width')
        refSetting.border.type = itech(component).css('border-style')
        console.log(itech(component).css('border-top-width'))
        updateRef(targetId)

    }
}
function updateRef(id){
    refcomponents.forEach(ele=>{
        itech(ele).data('target',id)
    })
    compname.value = refSetting.name
    tops.value = parseInt(refSetting.top)
    left.value = parseInt(refSetting.left)
    width.value = parseInt(refSetting.width)
    height.value = parseInt(refSetting.height)
    color.value = itech().color(refSetting.color).convertHEX()
    bgcolor.value = itech().color(refSetting.background).convertHEX()
    fontfamily.value = (refSetting.font.family)
    fontsize.value = parseInt(refSetting.font.size)
    if(refSetting.border.top) itech(bordertop).addClass('active')
    if(refSetting.border.left) itech(borderleft).addClass('active')
    if(refSetting.border.right) itech(borderright).addClass('active')
    if(refSetting.border.bottom) itech(borderbottom).addClass('active')
    if(refSetting.border.all) itech(borderall).addClass('active')
    // bordercolor.value = refSetting.border.color
    itech(bordercolor).css({color: refSetting.border.color})
    bordertype.value = refSetting.border.type == 'none' ? 'solid': Calculator.getFirst(refSetting.border.type,' ',['solid','dotted','dashed','double','groove','ridge','inset','outset'])
    bordersize.value = Calculator.largetInt(refSetting.border.size)
}
