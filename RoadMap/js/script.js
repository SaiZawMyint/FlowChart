ready(function () {
    var element = document.getElementById("flowChart");

    var component1 = itech(element).flowchart().add({
        title: "My Component 1",
        id: "mycomponent1",
        css: {
            "color": "#FFF",
            "top": "100px",
            "left": "50%"
        },
        callback: function(data){
         //   data.initiatedComponent.select();
        }
    })
    var component2 = itech(element).flowchart().add({
        title: "My Component 2",
        id: "mycomponent2",
        css: {
            "color": "#FFF",
            "top": "200px",
            "left":"50%"
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
    var component4 = itech(element).flowchart().add({
        title: "My Component 4",
        id: "mycomponent4",
        css: {
            "color": "#FFF",
            "top": "200px",
            "left": "30px"
        }
    })
    var component5 = itech(element).flowchart().add({
        title: "My Component 5",
        id: "mycomponent5",
        css: {
            "color": "#FFF",
            "top": "100px",
            "left": "70%"
        }
    })
    itech(element).flowchart().joins(component1,component2,{current: 'bottom',target: 'top'},{size: 2, color: "red"}, 'line')
    itech(element).flowchart().joins(component1,component3,{current: 'left',target: 'top'})
    itech(element).flowchart().joins(component2,component3,{current: 'left', target: "right"})
});