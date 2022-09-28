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
        show: function (cmd = "block") {
            command(function (ele) {
                ele.style.display = cmd;
            });
        },
        hide: function () {
            command(function (ele) {
                ele.style.display = "none";
            });
        },
        toggleShow: function (cmd) {
            const current = this;
            command(function (ele) {
                if (window.getComputedStyle(ele).display == "none") current.show(cmd);
                else current.hide();
            });
        },
        addClass: function (cls) {
            if (selected instanceof HTMLElement) {
                selected.classList.add(cls);
            } else {
                command(function (ele) {
                    ele.classList.add(cls);
                });
            }
        },
        removeClass: function (cls) {
            if (selected instanceof HTMLElement) {
                selected.classList.remove(cls);
            } else {
                command(function (ele) {
                    ele.classList.remove(cls);
                });
            }
        },
        toggleClass: function (cls) {
            if (selected instanceof HTMLElement) {
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
            if (selected instanceof HTMLElement) {
                has = selected.classList.contains(cls);
            } else {
                command(function (ele) {
                    has = ele.classList.contains(cls);
                });
            }
            return has;
        },
        css: function (css) {
            if (selected instanceof HTMLElement) {
                selected.css(css);
            } else {
                command(function (ele) {
                    ele.css(css);
                });
            }
        },
        color: function (color) {
            return generateLightOrDarkColor(color);
        },
        loop: function (callback) {
            [].forEach.call(selected, callback);
        },
        data: function (data) {
            var x;
            if (selected instanceof Element) {
                x = selected.getAttribute(`data-${data}`);
            } else {
                x = [];
                command(function (ele) {
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
        size: function(){
            if(selected instanceof Element){
                return 1
            }else{
                return selected.length
            }
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
            transform: "translateX(-50%)",
            display: "block",
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
    static generateNewPointAtCenter(start,end,count){
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
                        console.log(i+1)
                        coor.splice(i + 1, 0, cor);
                        is = true;
                        break;
                    }
                    if (cor[find] > x && cor[find] <= nextx || cor[find] < x && cor[find] >= nextx) {
                        index = i + 1
                        console.log(i+1)
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
    if (col != end) throw new Error("Invalid style properties!");
    var obj = {};
    var splitVals = this.split(";").filter((data) => data.length > 0);
    for (let val of splitVals) {
        if (!val.includes(":")) throw new Error("Invalid style property: " + val);
        let props = val.split(":");
        obj[`${props[0].trim()}`] = props[1].trim();
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
var itechEvent = new IEvent();
window.positionChangeEvt = { handler: [], trigger: false };
