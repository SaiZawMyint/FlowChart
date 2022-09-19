ready(function () {
    var element = document.getElementById("flowChart");

    var component1 = itech(element).flowchart().add({
        title: "My Component 1",
        id: "mycomponent1",
        css: {
            "color": "#FFF",
            "top": "100px"
        }
    })
    var component2 = itech(element).flowchart().add({
        title: "My Component 2",
        id: "mycomponent2",
        css: {
            "color": "#FFF",
            "top": "200px"
        }
    })
    var component3 = itech(element).flowchart().add({
        title: "My Component 3",
        id: "mycomponent3",
        css: {
            "color": "#FFF",
            "top": "200px",
            "left": "30%"
        }
    })
    itech(element).flowchart().joins(component1,component2,{current: 'right',target: 'top'})
    itech(element).flowchart().joins(component1,component3,{current: 'left',target: 'top'})
    
});