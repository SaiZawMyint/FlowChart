var element = null;
ready(function () {
    element = document.getElementById("flowChart");
    itech(element).flowchart().init();
    itech('#add-comp-btn').on('click',function(){
        itech('.modal-field').show()
    })
    itech('.btn.close-modal').on('click',function(){
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
        var ref = itech('#'+this.dataset['color']).get(0)
        this.parentElement.style.color = this.value
        ref.value = this.value
    })
});
function createComponent(){
    var compname = itech('#comp-name').get(0)
    var comptop = itech('#comp-top').get(0)
    var compleft = itech('#comp-left').get(0)
    var compbgcolor = itech('#comp-bg-color').get(0)
    var compcolor = itech('#comp-color').get(0)
    var complinecolor = itech('#line-color').get(0)

    console.log(comptop.value, compleft.value)
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
