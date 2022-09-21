const defaultComponentSetting = {
    title: "hello",
    id: "",
    css: { color: "#FFF" },
    hover: {
        "background-color": "#0000004c"
    },
    element: function () {
        var comp = new Component().create('span').css(Design.Data.button)
        comp.component.dataset['compId'] = comp.id;
        return comp
    },
    joinPoint: {
        top: true,
        left: true,
        right: true,
        bottom: true,
        size: 5,
        circle: true
    },
    draggable: true,
    selectable: true,
    callback: function (data) {
    }
}
window.compId = 0;
window.prevents = {
    component: {
        isRename: false
    }
}
window.components = []

/**
 * @param {HTMLElement,Object} element
 */
class FlowChart {
    constructor(element,
        setting = {
            grid: {
                opt: true,
                spacing: 15
            },
            css: {}
        }) {
        this.element = element;
        this.svgelement = this.svg.create().attrs({ width: "100%", height: "100%" });
        this.setting = Object.assign({}, setting);
        this.components = []
        this.addSvg();
        this.defaultJoinSetting = {
            current: {
                comp: null,
                direction: 'top' | 'left' | 'bottom' | 'right'
            },
            target: {
                comp: null,
                direction: 'top' | 'left' | 'bottom' | 'right'
            },
            connector: {
                type: 'line'
            },
            css: {
                size: 2,
                color: "blue"
            }
        }

    }
    init(element, setting) {
        this.element = element ? element : this.element
        this.setting = setting ? Object.assign({}, setting) : this.setting
        this.element.css({
            position: "relative",
            height: "600px",
            display: "inline-block"
        });
        this.element.appendChild(this.svgelement.svg);
        this.buildGrid()
        return this
    }
    addSvg() {
        this.svgelement.svg.setAttribute("style", "position: absolute;z-index: -1;top: 0;left: 0;")
    }
    buildGrid() {
        if ('grid' in this.setting) {
            if (this.setting.grid.opt) {
                this.createGrid();
            }
        }
    }
    createGrid() {
        const w = this.size.width;
        const h = this.size.height;

        const width = this.setting.grid.width
            ? this.setting.grid.width : w;

        const height = this.setting.grid.height ?
            this.setting.grid.height : h;

        const spacing = this.setting.grid.spacing != null ? this.setting.grid.spacing : 15;

        for (let x = 0; x <= width; x += spacing) {
            const line = this.svg.create('line');
            line.attrNs({ "x1": x, "y1": 0, "x2": x, "y2": height, "stroke": "#333333", "stroke-width": 0.5 });
            this.svgelement.svg.appendChild(line.svg);
        }
        for (let y = 0; y <= height; y += spacing) {
            var line = this.svg.create('line');
            line.attrNs({ "x1": 0, "y1": y, "x2": width, "y2": y, "stroke": "#333333", "stroke-width": 0.5 });
            this.svgelement.svg.appendChild(line.svg);
        }
    }
    getComponent(componentRef = String | Number) {
        if (typeof componentRef == 'number') return document.querySelectorAll('._flowchart_component')[componentRef]
        if (typeof componentRef == 'string') return this.getComponentById(componentRef);
    }
    getComponentById(id) {
        var comp = null;
        document.querySelectorAll('._flowchart_component').forEach(c => {
            if (!c.comp.getAttribute('id')) return
            if (c.comp.getAttribute('id') === id) {
                comp = c
                return false
            }
        })
        return comp
    }
    adjustComponentDefaultSetting(setting) {
        var set = Object.assign({}, defaultComponentSetting)
        return new FObject(set).filterObject(setting)
    }

    createComponent(setting = defaultComponentSetting) {
        setting = (this.adjustComponentDefaultSetting(setting))
        var comp = setting.element()
        comp.css(setting.css)
        comp.addText(setting.title)
        comp.hover(setting.hover)
        comp.rename()
        window.components.push(this);
        setting.id ? comp.component.id = setting.id : null
        if (setting.draggable)
            comp.drag();
        comp.context([
            {
                name: "Copy", key: "Ctrl + C", callback: function (data) {
                    console.log(data)
                }
            },
            {
                name: "Cut", key: "Ctrl + X", callback: function (data) {
                    console.log(data)
                }
            },
            {
                name: "Paste", key: "Ctrl + V", callback: function (data) {
                    console.log(data)
                }
            }
        ]);
        if (setting.joinPoint) {
            comp.addJoinPoint(setting.joinPoint,this.svgelement);
        }
        this.element.appendChild(comp.getComponent)
        this.components.push(comp)
        if (setting.selectable) comp.getComponent.addEventListener('click', function (e) { comp.select() })
        setting.callback({ target: this, setting: setting, initiatedComponent: comp })
        return { target: this, setting: setting, initiatedComponent: comp }
    }

    joinTo(setting = this.defaultJoinSetting) {
        setting = new FObject(this.defaultJoinSetting).filterObject(setting)
        var point = new JOIN().getJoinablePoint(setting);
        let x = `M ${point.startPoint.x}, ${point.startPoint.y} L ${point.endPoint.x} ${point.endPoint.y}`;
        let path = this.svgelement.drawPath(x, setting.css);
        path.attrs({ "data-connector": setting.connector.type })
        path.svg.id = "p_" + setting.current.comp.id + "-" + setting.target.comp.id;

    }

    get size() {
        var rect = this.element.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height
        }
    }
    get svg() {
        return new SVG();
    }
    get component() {
        return new Component();
    }
}

class Component {
    constructor() {
        this.component;
        this.hoverProps = {
            org: {},
            prop: {}
        };
        this.id = window.compId++;
        this.joinBtns = {
            top: null,
            left: null,
            right: null,
            bottom: null
        }
    }
    create(tag = "div", join = false) {
        this.component = document.createElement(tag);
        join ? this.component.classList.add('_join_component') : null
        return this;
    }
    css(css) {
        this.component.css(css);
        return this;
    }
    addText(text) {
        this.component.innerHTML = `<span style="user-select:none;">${text}</span>`;
        var target = this.component
        this.component.firstElementChild.addEventListener('focus', function (e) {
            e.stopPropagation();
            this.contentEditable = true
            window.prevents.component.isRename = true
            console.log(prevents.component.isRename)
        })
        this.component.firstElementChild.addEventListener('input', function () {
            JOIN.searchJoins(target);
        })
        this.component.firstElementChild.addEventListener('mousedown', function (e) {
            if (window.prevents.component.isRename) e.stopPropagation();
        })
        this.component.firstElementChild.addEventListener('blur', function (e) {
            e.stopPropagation();
            window.prevents.component.isRename = false
            this.contentEditable = false
            this.css({ cursor: "inherit" })
        })
        return this
    }
    rename(opt = true, name = this.getComponent.innerText) {
        if (opt) {
            this.getComponent.addEventListener('dblclick', function (e) {
                if (!window.prevents.component.isRename) placeCaretAtEnd(this.firstElementChild)
                this.firstElementChild.contentEditable = true;
                this.firstElementChild.css({ cursor: "text" })
                this.firstElementChild.focus()
            })
        }
        function placeCaretAtEnd(el) {
            el.focus();
            if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
                var range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (typeof document.body.createTextRange != "undefined") {
                var textRange = document.body.createTextRange();
                textRange.moveToElementText(el);
                textRange.collapse(false);
                textRange.select();
            }
        }

    }
    hover(css) {
        this.hoverProps.org = this.component.getAttribute('style').parseObject();
        this.hoverProps.prop = css;
        var compTarget = this
        this.component.addEventListener('mouseover', function () {
            this.css(compTarget.hoverProps.prop);
        });
        this.component.addEventListener('mouseout', function () {
            this.css(compTarget.hoverProps.org);
        })
    }
    context(menus = [{ name: 'name', key: "", callback: callback }]) {
        this.component.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            var x = e.clientX;
            var y = e.clientY;
            var target = this;
            var comp = new Component().create('div');
            comp.css({
                "position": "absolute",
                "top": y + "px",
                "left": x + "px",
                "width": "200px",
                "height": "fit-content",
                "background-color": "#FFF",
                "box-shadow": "0 0 1rem rgb(0 0 0 /0.5)",
                "overflow": "hidden",
                "border-radius": "5px",
                "font-size": "0.7em",
                "z-index": "999"
            });
            comp.component.tabIndex = -1;
            document.body.appendChild(comp.component);
            comp.component.focus();
            comp.component.addEventListener('blur', function () {
                this.remove();
            })
            for (let menu of menus) {
                var m = document.createElement('div');
                m.css({
                    "padding": "5px",
                    "border-bottom": "2px solid rgb(0 0 0 /0.15)",
                    "cursor": "pointer",
                    "display": "flex",
                    "justify-content": "space-between",
                    "align-items": "center"
                });
                m.innerHTML = `<label>${menu.name}</label><small>${menu.key}</small>`
                m.addEventListener('click', function (e) {
                    menu.callback({ e: e, target: target, menu: menu })
                    comp.component.blur()
                });
                comp.component.appendChild(m);
            }
        })
    }
    drag() {
        var elmnt = this.getComponent;
        elmnt.onmousedown = dragMouseDown;
        var component = this;
        function dragMouseDown(e) {
            if (window.prevents.component.isRename || e.stopPropagation()) return false;
            e = e || window.event;
            e.preventDefault();
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            if (prevents.component.isRename) return false;
            e = e || window.event;
            e.preventDefault();
            //calculate position
            JOIN.searchJoins(elmnt)
            elmnt.style.top = ((e.clientY - elmnt.offsetTop) + (elmnt.offsetTop - (elmnt.offsetHeight / 2))) + "px";
            elmnt.style.left = ((e.clientX - elmnt.offsetLeft) + (elmnt.offsetLeft)) + "px";
            restoreHoverProps(elmnt.style.top, elmnt.style.left)
        }

        function closeDragElement() {
            /* stop moving when mouse button is released:*/
            JOIN.searchJoins(elmnt)
            document.onmouseup = null;
            document.onmousemove = null;
        }
        function restoreHoverProps(top, left) {
            if ('top' in component.hoverProps.org) {
                component.hoverProps.org.top = top
            }
            if ('left' in component.hoverProps.org) {
                component.hoverProps.org.left = left
            }
        }
    }
    /**
     * 
     * @param {Component} element 
     * @param {{x:String}: Object} points 
     */
    addJoinPoint(points = { top: true, left: true, right: true, bottom: true, size: 10, circle: true, rect: false },svg = new SVG()) {
        var top = points.top ? new Component().create('span', true).css(Design.Data.joinBtn('top', { width: points.size, height: points.size })).component : null;
        var left = points.left ? new Component().create('span', true).css(Design.Data.joinBtn('left', { width: points.size, height: points.size })).component : null;
        var right = points.right ? new Component().create('span', true).css(Design.Data.joinBtn('right', { width: points.size, height: points.size })).component : null;
        var bottom = points.bottom ? new Component().create('span', true).css(Design.Data.joinBtn('bottom', { width: points.size, height: points.size })).component : null;

        top != null ? top.dataset['join_top'] = "true" : null
        left != null ? left.dataset['join_left'] = "true" : null
        right != null ? right.dataset['join_right'] = "true" : null
        bottom != null ? bottom.dataset['join_bottom'] = "true" : null
        top != null ? this.getComponent.appendChild(top) : null
        left != null ? this.getComponent.appendChild(left) : null
        right != null ? this.getComponent.appendChild(right) : null
        bottom != null ? this.getComponent.appendChild(bottom) : null

        this.joinBtns.top = top
        this.joinBtns.left = left
        this.joinBtns.right = right
        this.joinBtns.bottom = bottom

        SVG.addPathAction(svg, top, left,right, bottom)
        
    }
    select() {
        if (this.component.classList.contains('_box_selected')) {
            this.component.classList.remove('_box_selected')
        } else {
            this.component.classList.add('_box_selected')
        }
    }
    get getComponent() {
        return this.component
    }
}

class JOIN {
    constructor() {
        this.setting = {
            current: {
                comp: null,
                direction: 'top' | 'left' | 'bottom' | 'right'
            },
            target: {
                comp: null,
                direction: 'top' | 'left' | 'bottom' | 'right'
            }
        }
    }
    getJoinablePoint(setting = Object.assign({}, this.setting)) {
        var component = setting.current.comp
        var target = setting.target.comp
        var cdir = setting.current.direction
        var tdir = setting.target.direction

        var joinc = this.getDirectionSelector(component, cdir);
        var joint = this.getDirectionSelector(target, tdir);
        var id = "p_" + setting.current.comp.id + "-" + setting.target.comp.id;

        JOIN.addRelationRef(id, joinc, true)
        JOIN.addRelationRef(id, joint, false)

        var rectc = joinc.getBoundingClientRect();
        var rectt = joint.getBoundingClientRect();

        var sx = JOIN.getOffset(rectc, 'left')
        var sy = JOIN.getOffset(rectc, 'top')
        var ex = JOIN.getOffset(rectt, 'left')
        var ey = JOIN.getOffset(rectt, 'top')

        return {
            startPoint: {
                x: sx - (rectc.width / 2),
                y: sy - (rectc.height / 2)
            },
            endPoint: {
                x: ex - (rectt.width / 2),
                y: ey - (rectt.height / 2)
            }
        }
    }
    static addRelationRef(id, joinc, opt){
        var val = id;
        var t = opt ? "data-jp-current" : "data-jp-target"
        var existing = joinc.getAttribute(t);
        if (existing != null) {
            val = existing + " " + id
        }
        joinc.setAttribute(t, val);
    }
    static searchJoins(ele) {
        for (let i = 0; i < ele.children.length; i++) {
            let child = ele.children[i]
            if (child.classList.contains("_join_component")) {
                if (child.hasAttribute('data-jp-current')) {
                    JOIN.change(child.getAttribute('data-jp-current'), child, true)
                }
                if (child.hasAttribute('data-jp-target')) {
                    JOIN.change(child.getAttribute('data-jp-target'), child, false)
                }
            }
        }
    }
    static getOffset(rect, direction) {
        if (direction == 'left') return rect.left + rect.width
        if (direction == 'top') return rect.top + rect.height
    }
    getDirectionSelector(current = new HTMLElement(), currentdir) {
        return (document.querySelectorAll("#" + current.id + " [data-join_" + currentdir + "]")[0])
    }
    static change(idLists, target, opt) {
        var ids = [];
        console.log(idLists,idLists.includes(" "))
        if (idLists.includes(" ")) {
            var split = idLists.split(" ");
            ids = split.filter(s => s.length > 0);
        } else {
            ids = [idLists]
        }
        const rect = target.getBoundingClientRect()
        ids.forEach(id => {
            var t = document.getElementById(id)
            var path = t.hasAttribute("d") ? t.getAttribute("d") : "";
            var connectorType = t.hasAttribute('data-connector') ?
                t.getAttribute('data-connector') : "line"
            let newPdata = analysePath(rect, path, connectorType, opt)
            t.setAttribute("d", newPdata)
        })
        function analysePath(rect, path, type, opt) {
            const top = JOIN.getOffset(rect, 'top')
            const left = JOIN.getOffset(rect, 'left')
            let rx = left - (rect.width / 2)
            let ry = top - (rect.height / 2)
            return updatePos(rx, ry, type, path, opt);
        }
        function updatePos(x, y, type, path, opt) {
            var parsePath = SVG.parsePath(type, path);
            var p = parsePath.lineStart
            var sp = parsePath.lineEnd
            if (opt) {
                p[1] = x + ",";
                p[2] = y
            } else {
                sp[1] = x + ", "
                sp[2] = y
            }

            return p[0] + " " + p[1] + " " + p[2] + " " + sp[0] + " " + sp[1] + " " + sp[2];
        }
    }
}

class SVG {
    static svgns = "http://www.w3.org/2000/svg";
    static xsvg = "http://www.w3.org/1999/xlink";
    static xlink = "xlink:href";
    constructor() {
        this.svg = null;
    }
    create(tag = 'svg') {
        this.svg = document.createElementNS(SVG.svgns, tag);
        return this;
    }
    createG(tag = 'g1') {
        this.svg = document.createElementNS(SVG.xsvg, SVG.xlink, "#" + tag);
        return this;
    }
    /**
     * @param {{ [x: string]: string; }} attrs
     */
    attrNs(attrs) {
        for (let key in attrs) {
            this.svg.setAttributeNS(null, key, attrs[key])
        }
        return this;
    }
    attrs(attrs) {
        for (let key in attrs) {
            if(this.svg.getAttribute(key)){
                this.svg.removeAttribute(key)
            }
            this.svg.setAttribute(key, attrs[key])
        }
        return this
    }
    drawPath(pathData, css) {
        var svg = new SVG()
        var path = svg.create('path')
        path.attrNs({ "stroke": css.color, "stroke-width": css.size, "d": pathData })
        this.svg.appendChild(path.svg)
        return path
    }

    static addPathAction(svg,...targets){
        var path = null, pathData = {sx:0,sy:0,ex:0,ey:0};
        targets.forEach(target=>{
            target.addEventListener('mousedown',function(e){
                e.stopPropagation();
                start(e,this)
            })
        })
        var drawLivePath = false, dragTarget = null
        function start(e,target){
            var rect = target.getBoundingClientRect();
            dragTarget = target
            pathData.sx = rect.left + (rect.width / 2)
            pathData.sy = rect.top + (rect.height / 2)
            pathData.ex = e.clientX
            pathData.ey = e.clientY
            path = new SVG().create('path').attrs({"stroke-width":"3","stroke":"#333", d: pathPoints()});
            svg.svg.appendChild(path.svg);
            document.body.css({cursor: "crosshair"})
            drawLivePath = true
            document.onmousemove = drag
            document.onmouseup = stop
        }
        function drag(e){
            if(!drawLivePath) return false
            pathData.ex = e.clientX
            pathData.ey = e.clientY
            path.attrs({d: pathPoints()})
        }
        function stop(e){
            if(!drawLivePath) return false
            drawLivePath = false
            document.body.css({cursor: "default"})
            console.log(e.target)
            updateJoin(dragTarget, e.target, path)
        }
        function pathPoints(){
            return `M ${pathData.sx}, ${pathData.sy} L ${pathData.ex}, ${pathData.ey}`;
        }
        function updateJoin(current,target,path){
            if(!current.classList.contains('_join_component') ||
            !target.classList.contains('_join_component')){
                path.svg.remove()
                return false
            } 
            var id = "p_" + current.parentElement.id + "-" + target.parentElement.id;
            path.svg.id = id
            JOIN.addRelationRef(id,current,true)
            JOIN.addRelationRef(id,target,false)
        }
    }

    static parsePath(type, path) {
        if (type == 'line') {
            const symbols = ['M', 'L']
            path = path.trim()
            symbols.forEach(sym => {
                if (!path.includes(sym)) throw new Error("Invalid path");
            })
            var pdata = path.split(/\s/g);
            var startData = [], endData = []
            var savingStart = false, savingEnd = false
            pdata.forEach(pd => {
                if (pd.trim() == symbols[0]) {
                    savingStart = true
                    savingEnd = false
                } else if (pd.trim() == symbols[1]) {
                    savingEnd = true
                    savingStart = false
                }
                if (savingStart) startData.push(pd);
                if (savingEnd) endData.push(pd)
            })
            startData = startData.filter(sd => sd.trim().length > 0)
            endData = endData.filter(ed => ed.trim().length > 0)
            return {
                lineStart: startData,
                lineEnd: endData
            }
        }
    }
}


const itechFlowchart = new FlowChart();
