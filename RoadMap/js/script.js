var element = null;
ready(function () {
    element = document.getElementById("flowChart");
    itech(element).flowchart({grid:{opt:false}}).init();
    itech('.float-btn').on('click',function(){
        itech(element).flowchart().grid()
    })
    itech('#add-comp-btn').on('click',function(){
        if(itech(this).hasClass('active'))
            itech('.modal-field').hide()
        else
        itech('.modal-field').show()
    })
    itech('.btn.close-modal').on('click',function(){
        itech('#add-comp-btn').removeClass('active')
        itech('.modal-field').hide()
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
});

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
    itech(element).flowchart().add(setting)
    itech('.modal-field').hide()

    compname.value = ''
    comptop.value = ''
    compleft.value = ''
    // compbgcolor.value = ''
    // compcolor.value = ''
    // complinecolor.value=''
}
