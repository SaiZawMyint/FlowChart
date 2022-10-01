function ready(fn) {
    if (document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
var flowchartSetting = {
    initiate: { status: false, time: new Date() },
};
document.addEventListener('mousemove', function (e) {
    document.dispatchEvent(new MouseEvent(`move`, e));
}, true);
document.addEventListener('mouseup', function (e) {
    document.dispatchEvent(new MouseEvent(`up`, e));
}, true);

window.itech = function (selector) {
    var selected = _(selector);
    function command(cmd) {
        if (selected == null) return false;
        [].forEach.call(selected, cmd);
    }
    return {
        flowchart: function (setting) {
            if (!flowchartSetting.initiate.status) init();
            function init() {
                flowchartSetting.initiate.status = true;
                itechFlowchart.init(selected, setting);
            }
            return {
                init: function () {
                    init();
                    return this;
                },
                add: function (setting) {
                    if (!flowchartSetting.initiate.status) init();
                    return itechFlowchart.createComponent(setting).initiatedComponent;
                },
                joins: function (
                    comp1,
                    comp2,
                    edge = { current: "bottom", target: "top" },
                    css,
                    connectorType
                ) {
                    var cdir = "current" in edge ? edge.current : "bottom";
                    var tdir = "target" in edge ? edge.target : "top";
                    var joinsetting = {
                        current: {
                            comp: comp1.getComponent,
                            direction: cdir,
                        },
                        target: {
                            comp: comp2.getComponent,
                            direction: tdir,
                        },
                        connector: {
                            type: "line",
                        },
                        css: {
                            size: 2,
                            color: "blue",
                        },
                    };
                    css ? (joinsetting.css = css) : null;
                    connectorType ? (joinsetting.connector.type = connectorType) : null;
                    itechFlowchart.joinTo(joinsetting);
                },
                grid: function () {
                    if (!flowchartSetting.initiate.status) init();
                    if (itechFlowchart.setting.grid.opt) {
                        itechFlowchart.setting.grid.opt = false;
                        return itechFlowchart.removeGrid();
                    } else {
                        itechFlowchart.setting.grid.opt = true;
                        return itechFlowchart.buildGrid();
                    }
                },
            };
        },
        on: function (event, handler) {
            if (selected instanceof HTMLElement) {
                itechEvent.on(selected, event, handler, false);
            } else {
                command(function (ele) {
                    itechEvent.on(ele, event, handler, false);
                });
            }
        },
        object: function (obj) {
            return new FObject(selected).filterObject(obj);
        },
        show: function (cmd = "block",callback) {
            command(function (ele) {
                ele.style.display = cmd;
                callback(ele)
            });
            
        },
        hide: function (callback) {
            if(selected instanceof Element){
                selected.style.display = "none"
                if(callback != null || callback != undefined)
                callback(selected)
            }else{
                command(function (ele) {
                    ele.style.display = "none";
                    if(callback != null || callback != undefined)
                    callback(ele)
                });
            }
            
        },
        toggleShow: function (cmd) {
            const current = this;
            command(function (ele) {
                if (window.getComputedStyle(ele).display == "none") current.show(cmd);
                else current.hide();
            });
        },
        addClass: function (cls) {
            if (selected instanceof Element) {
                selected.classList.add(cls);
            } else {
                command(function (ele) {
                    ele.classList.add(cls);
                });
            }
        },
        removeClass: function (cls) {
            if (selected instanceof Element) {
                selected.classList.remove(cls);
            } else {
                command(function (ele) {
                    ele.classList.remove(cls);
                });
            }
        },
        toggleClass: function (cls) {
            if (selected instanceof Element) {
                if (selected.classList.contains(cls)) selected.classList.remove(cls);
                else selected.classList.add(cls);
            } else {
                command(function (ele) {
                    if (ele.classList.contains(cls)) ele.classList.remove(cls);
                    else ele.classList.add(cls);
                });
            }
        },
        hasClass: function (cls) {
            var has = false;
            if (selected instanceof Element) {
                has = selected.classList.contains(cls);
            } else {
                command(function (ele) {
                    has = ele.classList.contains(cls);
                });
            }
            return has;
        },
        css: function (css) {
            var res = null
            if (selected instanceof Element) {
                if (typeof css === 'string') {
                    res = getComputedStyle(selected).getPropertyValue(css)
                } else {
                    selected.css(css);
                }

            } else {
                command(function (ele) {

                    if (typeof css === 'string') {
                        res = ele.style.getPropertyValue(css)
                    } else {
                        ele.css(css)
                    }
                });
            }
            return res
        },
        color: function (color) {
            return{
                convertHEX: function(){
                    return Color.convertHex(color)
                }
            }
        },
        loop: function (callback) {
            [].forEach.call(selected, callback);
        },
        data: function (data,val = null) {
            var x;
            if (selected instanceof Element) {
                if(val != null || val != undefined) selected.setAttribute(`data-${data}`,val)
                x = selected.getAttribute(`data-${data}`);
            } else {
                x = [];
                command(function (ele) {
                    if(val != null || val != undefined) ele.setAttribute(`data-${data}`,val)
                    x.push(ele.getAttribute(`data-${data}`));
                });
            }
            return x;
        },
        isDataSet: function (data) {
            var has = false;
            if (selected instanceof HTMLElement) {
                has = selected.getAttribute(`data-${data}`) != null;
            } else {
                command(function (ele) {
                    has = ele.getAttribute(`data-${data}`) != null;
                });
            }
            return has;
        },
        size: function () {
            if (selected instanceof Element) {
                return 1
            } else {
                return selected.length
            }
        },
        attr: function(attr,val){
            if(selected instanceof Element){
                if(val == null || val == undefined) return selected.getAttribute(attr)
            }
        },
        animate: function(action){
            if(selected instanceof Element){

            }
        },
        wait: function(time,action,callback){
            let id = null
            let p = 0
            clearInterval(id)
            action()
            id = setInterval(function(){
                if(p==time){
                    clearInterval(id)
                    command(function(ele){
                        callback(ele)
                    })
                }
                
                p++
            },time)
           
            
        },
        get: function (index) {
            if (index != null) return selected[index];
            return selected;
        },
    };
};
function generateLightOrDarkColor(color) { }
//short function
function _(selector) {
    if (selector instanceof Element) return selector;
    if (typeof selector === "string") return document.querySelectorAll(selector);
    return selector;
}
function i_id(id) {
    return document.getElementById(id);
}
function i_class(cls) {
    return document.getElementsByClassName(cls);
}
function i_create(tag) {
    return document.createElement(tag);
}
function i_append(parent, ...children) {
    children.forEach((child) => {
        parent.appendChild(child);
    });
}
function i_addClass(parent, ...classes) {
    classes.forEach((cls) => {
        parent.classList.add(cls);
    });
}

class Design {
    static Data = {
        button: {
            padding: "10px 13px",
            "background-color": "#0181a7",
            "border-radius": "5px",
            "text-align": "center",
            width: "fit-content",
            cursor: "pointer",
            top: "10px",
            left: "50%",
            display: "flex",
            "align-items":"center",
            "justify-content": "center",
            position: "absolute",
            opacity: "1",
        },
        joinBtn: function (direction, css) {
            let w = css.width ? css.width : 3;
            let h = css.height ? css.height : 3;
            let style = {
                position: "absolute",
                "border-radius": "50%",
                "z-index": "30",
                cursor: "crosshair",
            };

            style["width"] = w + "px";
            style["height"] = h + "px";
            style["background-color"] = css.color ? css.color : "#333";

            if (direction == "top") {
                style["top"] = -1 * (h / 2) + "px";
                style["left"] = "50%";
                style["transform"] = "translateX(-50%)";
            }
            if (direction == "left") {
                style["top"] = "50%";
                style["left"] = -1 * (w / 2) + "px";
                style["transform"] = "translateY(-50%)";
            }
            if (direction == "right") {
                style["top"] = "50%";
                style["right"] = -1 * (w / 2) + "px";
                style["transform"] = "translateY(-50%)";
            }
            if (direction == "bottom") {
                style["bottom"] = -1 * (h / 2) + "px";
                style["left"] = "50%";
                style["transform"] = "translateX(-50%)";
            }
            for (let key in css) {
                if (!(key in style)) {
                    style[key] = css[key];
                }
            }
            return style;
        },
    };
    static customCursor(code,color){
        var canvas = document.createElement("canvas");
        canvas.width = 15;
        canvas.height = 15;
        //document.body.appendChild(canvas);
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000000";
        ctx.font = "15px FontAwesome";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = color
        ctx.fillText(code, 7, 7);
        var dataURL = canvas.toDataURL('image/png')
        return dataURL
    }
}

class Color{
    static componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex.toUpperCase() : hex.toUpperCase();
    }
    static rgbToHex(r, g, b) {
        return "#" + Color.componentToHex(r) + Color.componentToHex(g) + Color.componentToHex(b);
    }
    static convertHex(color){
        var c = ""
        if(color.includes('rgb')){
            var crange = color.substring(color.indexOf('(')+1, color.lastIndexOf(')'));
            var rgb = crange.split(',')
            c = Color.rgbToHex(parseInt(rgb[0].trim()),parseInt(rgb[1].trim()),parseInt(rgb[2].trim()))
        }
        return c
    }
}

class IEvent {
    static ALL_EVT =
        "resize click musedown mouseup focous blur keydown change dbclick mouseover mouseout mousewheel keydown keyup keypress textinput touchstart touchmove touchend touchcancel resize scroll zoom select change submit reset";
    constructor() { }
    on(element, events, handler, usedCapture = false, args) {
        var evt = this.analyseEvts(events);
        evt.forEach((e) => {
            element.addEventListener(e, handler, usedCapture);
        });
    }
    analyseEvts(events) {
        if (typeof events == "string") {
            if (events.includes(" ")) {
                let evt = events.split(" ");
                return evt.filter((e) => e != null && e.length != 0);
            } else {
                return [events];
            }
        } else if (events instanceof Array) {
            return events;
        } else {
            throw new Error("Undefined event declared type!");
        }
    }
    attachAllEvt(target, callback) {
        this.on(target, IEvent.ALL_EVT, callback, false);
    }
    attachDocument() {
        var evt = this;
        this.attachAllEvt(document, function (e) {
            if (window.positionChangeEvt.trigger) {
                if (window.positionChangeEvt.handler.length > 0) {
                    window.positionChangeEvt.handler.forEach((setting) => {
                        var orgRect = setting.rect;
                    });
                }
            }
        });
    }
}

class Drag {
    constructor() { }
}

class Calculator {
    static screenCenter() {
        return {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };
    }
    static convertStringToArray(str, regex) {
        let ary = str.split(regex);
        ary = ary.filter((a) => a.trim().length > 0);
        return ary;
    }
    static convertArrayToString(ary, regex) {
        let str = "";
        ary.forEach((a) => {
            str += a + regex;
        });
        return str;
    }
    static generateNewPointAtCenter(start, end, count) {
        var coor = [start, end]
        addNewPoint(count)
        return coor
        function addNewPoint(index) {
            var divider = index + 1;
            var ary = [];
            var initialX = end.x - start.x;
            var initialY = end.y - start.y;
            var gx = initialX / divider;
            var gy = initialY / divider;
            for (let i = 1; i <= index; i++) {
                ary.push({
                    x: i * gx + start.x,
                    y: i * gy + start.y,
                });
            }
            coor.splice(1, 0, ...ary);
        }
    }
    static generateNewPoint(coor, newPoint = { x: 0, y: 0 }) {
        var index = 0;
        addCoor(newPoint)
        return {
            data: coor,
            index: index
        }
        function addCoor(cor = { x: 0, y: 0 }) {

            if (!loop(true)) {
                loop(false)
            }
            function loop(opt = true) {
                let is = false;
                for (let i = 0; i < coor.length;) {
                    var find = opt ? "x" : "y";
                    var x = coor[i][find];
                    var nextx = coor[i + 1][find];
                    if (cor[find] == x) {
                        index = i + 1
                        console.log(i + 1)
                        coor.splice(i + 1, 0, cor);
                        is = true;
                        break;
                    }
                    if (cor[find] > x && cor[find] <= nextx || cor[find] < x && cor[find] >= nextx) {
                        index = i + 1
                        console.log(i + 1)
                        coor.splice(i + 1, 0, cor);
                        is = true;
                        break;
                    }
                    if (i != coor.length - 2) i++;
                    else break;
                }
                return is;
            }

        }
    }
    static generateCorner(data) {
        var x = data.replaceAll(/  +/g,' ')
        console.log(x)
        var process = {}
        process.argv = x.split(' ')
        var radius = 12;

        var lineToVector = function (p1, p2) {
            var vector = {
                x: p2.x - p1.x,
                y: p2.y - p1.y
            };
            return vector;
        }

        var vectorToUnitVector = function (v) {
            var magnitude = v.x * v.x + v.y * v.y;
            var magnitude = Math.sqrt(magnitude);
            var unitVector = {
                x: v.x / magnitude,
                y: v.y / magnitude
            };
            return unitVector;
        }

        var roundOneCorner = function (p1, corner, p2) {
            var corner_to_p1 = lineToVector(corner, p1);
            var corner_to_p2 = lineToVector(corner, p2);
            var corner_to_p1_unit = vectorToUnitVector(corner_to_p1);
            var corner_to_p2_unit = vectorToUnitVector(corner_to_p2);

            var curve_p1 = {
                x: corner.x + corner_to_p1_unit.x * radius,
                y: corner.y + corner_to_p1_unit.y * radius
            };
            var curve_p2 = {
                x: corner.x + corner_to_p2_unit.x * radius,
                y: corner.y + corner_to_p2_unit.y * radius
            };
            var path = {
                line_end: curve_p1,
                curve_control: corner,
                curve_end: curve_p2
            };
            return path;
        }

        var printPath = function (path) {
            return (" L " + path.line_end.x.toFixed(1) + "," + path.line_end.y.toFixed(1))+" "+("Q " + path.curve_control.x.toFixed(1) + "," + path.curve_control.y.toFixed(1)
                + " " + path.curve_end.x.toFixed(1) + "," + path.curve_end.y.toFixed(1));
        }
        
        //check input
        if (process.argv.length <= 2) {
            throw new Error("enter at least one point");
        }
        if (process.argv.length % 2 !== 0) {
            throw new Error("you entered " + (process.argv.length - 2) + " numbers, but each point should have two numbers");
        }
        if (process.argv.length < 6) {
            throw new Error("need at least 3 points");
            
        }

        //main
        var pointdata = ("M " + process.argv[2] + "," + process.argv[3]);
        for (var i = 2; i + 5 < process.argv.length; i += 2) {

            var p1 = {
                x: parseInt(process.argv[i]),
                y: parseInt(process.argv[i + 1])
            }
            var p2 = {
                x: parseInt(process.argv[i + 2]),
                y: parseInt(process.argv[i + 3])
            }
            var p3 = {
                x: parseInt(process.argv[i + 4]),
                y: parseInt(process.argv[i + 5])
            }
            var path = roundOneCorner(p1, p2, p3);
            pointdata +=printPath(path);
        }

        var lastArg = process.argv.length - 1;
        pointdata +=(" L " + process.argv[lastArg - 1] + "," + process.argv[lastArg]+" Z");
        return pointdata
    }
    static getFirst(value='',regex, data =[]){
        var splits = value.split(regex)
        var match = ''
        for(let sp of splits){
            if(data.includes(sp)){
                match = sp
                break;
            }
        }
        return match
    }
    static largetInt(value='',regex=' '){
        if(!value.includes(regex)) return parseInt(value)
        var splits = value.split(regex)
        var match = 0
        for(let sp of splits){
            let x = parseInt(sp.trim())
            if(match < x){
                match = x
            }
        }
        return match
    }
}

var x = 0;
Element.prototype.css = function (css = {}) {
    var style =
        this.getAttribute("style") != null ? this.getAttribute("style") : "";
    var parsed = style.parseObject();
    //not exist ?
    for (let key in css) {
        if (!(key in parsed)) parsed[key] = css[key];
    }
    //override
    if (style.length > 0 && css != null) {
        css = Object.assign({}, new FObject(parsed).filterObject(css));
    }
    //check existance
    var finalstyle = "";
    for (let key in css) {
        if (key == "filterObject") continue;
        finalstyle += `${key}: ${css[key]};`;
    }
    this.setAttribute("style", finalstyle);
};
String.prototype.parseObject = function () {
    let col = (this.match(/:/g) || []).length;
    let end = (this.match(/;/g) || []).length;
    if (col != end) console.log("Invalid style properties!");
    var obj = {};
    var splitVals = this.split(";").filter((data) => data.length > 0);
    for (let val of splitVals) {
        if (!val.includes(":")) continue
        let props = val.split(":");
        let key = val.substring(0, val.indexOf(":")).trim()
        let value = val.substring(val.indexOf(":")+1, val.length).trim()
        obj[key] = value;
    }
    return obj;
};
Array.prototype.remove = function (index) {
    if (typeof index == "number") {
        this.slice(index, 1);
        return this;
    } else {
        const ind = this.indexOf(index);
        if (ind > -1) {
            this.splice(ind, 1);
            return this;
        }
    }
};
class FObject {
    constructor(obj) {
        this.obj = obj;
    }
    filterObject(compare) {
        if (this.obj.length == 0 || compare.length == 0) return null;
        var newObj = Object.assign({}, this.obj);
        for (let key in compare) {
            if (key in newObj) {
                newObj[key] = compare[key];
            }
        }
        let ary = Object.entries(newObj);
        let x = ary.filter(([key, value]) => key != "filterObject");
        return Object.fromEntries(x);
    }
}
class IAnimation{
    static animate(element=new Element(),action){
        switch(action){
            case 'drop-down': dropdown()
                break;
        }
        function dropdown(){
            
        }
    }
}
var itechEvent = new IEvent();
window.positionChangeEvt = { handler: [], trigger: false };
