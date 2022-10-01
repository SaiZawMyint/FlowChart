const defaultComponentSetting = {
    title: "hello",
    id: '',
    css: { color: "#FFF", top: "50px", left: Calculator.screenCenter().x + "px", "background-color": "#0181a7" },
    hover: {
        "opacity": "0.6"
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
    connector: {
        type: 'line',
        color: '#333',
        size: '3'
    },
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
var specialCase = {
    copy: null,
    jpoints: [{ current: null, target: null, opt: false }],
    moveableData: [{ parent: null, mover: [] }],
    removeItem: {
        element: null,
    },
    colorCase:{
        choose: false,
        data: '',
        target: null
    }
}
function createId(id = '') {
    return "_itech_" + id + (Math.floor(Date.now() / 1000))
}
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
        this.svgelement = this.svg.create().attrs({ width: "100%", height: "100%" }).style(
            ".-svg-itech-path{cursor:pointer;}._itech-circle-move-path{cursor:move;} g:hover > ._itech-circle-move-path{display:block}");
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
        this.element.css({ 'user-select': 'none'})
        this.setting = setting ? Object.assign({}, setting) : this.setting
        this.element.css({
            position: "relative",
            height: "100vh",
            display: "inline-block"
        });
        this.element.appendChild(this.svgelement.svg);
        this.buildGrid()
        const flowchart = this
        new Component(this.element).context([
            {
                name: "Paste", key: "Ctrl + V", callback: function (data) {
                    var copy = specialCase.copy
                    var setting = Component.copySettingFromDom(copy);
                    setting.css.top = data.e.pageY + "px"
                    setting.css.left = data.e.pageX + "px"
                    flowchart.createComponent(setting)
                }
            }
            ,
            {
                name: "Undo", key: "Ctrl + C", callback: function (data) {
                    console.log(data)
                }
            },
            {
                name: "Redo", key: "Ctrl + X", callback: function (data) {
                    console.log(data)
                }
            }
            ,
            {
                name: "Rounded Corner", key: "Ctrl + X", callback: function (data) {
                    itech('polyline').loop(function (ele) {
                        var d = ele.getAttribute('points')
                        var f = d.replaceAll(',', ' ')
                        var pd = Calculator.generateCorner(f)
                        ele.removeAttribute('points')
                        ele.setAttributeNS(null, 'd', pd)
                        var copy = new SVG().create('path');
                        var attrs = {}
                        for (let i = 0; i < ele.attributes.length; i++) {
                            attrs[ele.attributes[i].name] = ele.attributes[i].value
                        }
                        copy.attrNs(attrs)
                        ele.parentElement.replaceChild(copy.svg, ele)
                    })
                }
            }
        ]);
        this.initEvents()
        return this
    }
    initEvents() {
        document.addEventListener('mousedown', function (e) {
            itech('._box_selected').loop(function (ele) {
                itech(ele).removeClass('_box_selected')
                if(specialCase.colorCase.choose){

                }
            })
            
        })
        // var opt = false;
        // document.addEventListener('keypress',function(e){
        //     if(e.shiftKey) opt = true
        // })
        // document.addEventListener('keyup',function(e){
        //     if(e.shiftKey) opt = false
        // })
        document.addEventListener('keydown', function (e) {
            switch (e.which) {
                case 37: moveSelectedComponent('left',e.shiftKey)
                    break;

                case 38: moveSelectedComponent('up',e.shiftKey)
                    break;

                case 39: moveSelectedComponent('right',e.shiftKey)
                    break;

                case 40: moveSelectedComponent('down',e.shiftKey)
                    break;

                default: return; // exit this handler for other keys
            }
            e.preventDefault();
        })

        function moveSelectedComponent(direction, opt) {
            itech('._box_selected').loop(function (ele) {
                const get = ele instanceof HTMLElement ? 'e' : ele instanceof SVGElement && ele.tagName == 'circle' ? 'sc' : 'e'
                var top = get == 'e' ? parseFloat(itech(ele).css('top')) : get == 'sc' ? parseFloat(itech(ele).attr('cy')) : 0
                var left = get == 'e' ? parseFloat(itech(ele).css('left')) : get == 'sc' ? parseFloat(itech(ele).attr('cx')) : 0
                switch (direction) {
                    case 'up': top -= opt ? 5 : 1
                        break

                    case 'left': left -= opt ? 5 : 1
                        break

                    case 'right': left += opt ? 5 : 1
                        break

                    case 'down': top += opt ? 5 : 1
                        break
                }
                if (get == 'e') itech(ele).css({ top: top + "px", left: left + "px" })
                if (get == 'sc') {
                    var index = parseFloat(itech(ele).data('move-index'))
                    JOIN.updateJoinsByC(left,top,ele.parentElement.firstElementChild,index)

                    ele.setAttributeNS(null, 'cx', left)
                    ele.setAttributeNS(null, 'cy', top)
                }
                JOIN.searchJoins(ele)
            })

        }
    }
    addSvg() {
        this.svgelement.svg.setAttribute("style", "position: absolute;top: 0;left: 0;")
    }
    buildGrid() {
        if ('grid' in this.setting) {
            if (this.setting.grid.opt) {
                this.createGrid();
            }
        }
    }
    removeGrid() {
        itech('._itech-grid-line').loop(function (ele) {
            ele.remove()
        })
        itechFlowchart.setting.grid.opt = false
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
            const line = this.svg.create('line').attrs({ class: '_itech-grid-line' });
            line.attrNs({ "x1": x, "y1": 0, "x2": x, "y2": height, "stroke": "#333333", "stroke-width": 0.5 });
            this.svgelement.svg.appendChild(line.svg);
        }
        for (let y = 0; y <= height; y += spacing) {
            var line = this.svg.create('line').attrs({ class: '_itech-grid-line' });
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
       // comp.hover(setting.hover)
        comp.rename()
        window.components.push(this);
        setting.id = createId()
        itech(comp.component).addClass('_itech-comp-btn')
        setting.id ? comp.component.id = setting.id : createId()
        if (setting.draggable)
            comp.drag();
        comp.context([
            {
                name: "Copy", key: "Ctrl + C", callback: function (data) {
                    specialCase.copy = data.target
                }
            },
            {
                name: "Cut", key: "Ctrl + X", callback: function (data) {
                    console.log(data)
                }
            },
            {
                name: "Paste", key: "Ctrl + V", callback: function (data) {
                }
            }
            ,
            {
                name: "Delete", key: "Delete", callback: function (data) {
                    var storeRef = []
                    for (let x of data.target.children) {
                        for (let data of specialCase.jpoints) {
                            if (x == data.current) {
                                let svg = i_id(data.target)
                                svg.parentElement.remove()
                                storeRef.push(data.target)
                            }
                        }
                    }
                    JOIN.removeRelated(storeRef)
                    data.target.remove()
                }
            }
        ]);
        if (setting.joinPoint) {
            comp.addJoinPoint(setting.joinPoint, setting.connector, this.svgelement);
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
    constructor(ele) {
        this.component = ele;
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
        this.component.innerHTML = `<span style="user-select:none;color:inherit;font-family:inherit;font-size: inherit;" class="_itech_fc_text">${text}</span>`;
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
        this.component.firstElementChild.addEventListener('change', function () {
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
    context(menus = [{ name: 'name', key: "", callback: callback }]) {
        this.component.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            e.stopPropagation()
            var x = e.pageX;
            var y = e.pageY;
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
                m.classList.add('context-menu-list')
                m.innerHTML = `<label>${menu.name}</label><small>${menu.key}</small>`

                m.addEventListener('click', function (e) {
                    menu.callback({ e: e, target: target, menu: menu, component: comp, x: x, y: y })
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
            elmnt.style.top = ((e.pageY - elmnt.offsetTop) + (elmnt.offsetTop - (elmnt.offsetHeight / 2))) + "px";
            elmnt.style.left = ((e.pageX - elmnt.offsetLeft) + (elmnt.offsetLeft - (elmnt.offsetWidth / 2))) + "px";
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
    addJoinPoint(points = { top: true, left: true, right: true, bottom: true, size: 10, circle: true, rect: false }, connector, svg = new SVG()) {
        var top = points.top ? new Component().create('span', true).css(Design.Data.joinBtn('top', { width: points.size, height: points.size, "color": connector.color })).component : null;
        var left = points.left ? new Component().create('span', true).css(Design.Data.joinBtn('left', { width: points.size, height: points.size, "color": connector.color })).component : null;
        var right = points.right ? new Component().create('span', true).css(Design.Data.joinBtn('right', { width: points.size, height: points.size, "color": connector.color })).component : null;
        var bottom = points.bottom ? new Component().create('span', true).css(Design.Data.joinBtn('bottom', { width: points.size, height: points.size, "color": connector.color })).component : null;

        top != null ? top.dataset['join_top'] = "true" : null
        left != null ? left.dataset['join_left'] = "true" : null
        right != null ? right.dataset['join_right'] = "true" : null
        bottom != null ? bottom.dataset['join_bottom'] = "true" : null

        top != null ? top.dataset['join_connector_setting'] = JSON.stringify(connector) : null
        left != null ? left.dataset['join_connector_setting'] = JSON.stringify(connector) : null
        right != null ? right.dataset['join_connector_setting'] = JSON.stringify(connector) : null
        bottom != null ? bottom.dataset['join_connector_setting'] = JSON.stringify(connector) : null

        top != null ? this.getComponent.appendChild(top) : null
        left != null ? this.getComponent.appendChild(left) : null
        right != null ? this.getComponent.appendChild(right) : null
        bottom != null ? this.getComponent.appendChild(bottom) : null

        this.joinBtns.top = top
        this.joinBtns.left = left
        this.joinBtns.right = right
        this.joinBtns.bottom = bottom

        SVG.addPathAction(svg, top, left, right, bottom)

    }
    select() {
        if (this.component.classList.contains('_box_selected')) {
            this.component.classList.remove('_box_selected')
        } else {
            this.component.classList.add('_box_selected')
        }
    }
    static copySettingFromDom(ele = new HTMLElement()) {
        var setting = Object.assign({}, defaultComponentSetting)
        setting.css = ele.getAttribute('style').parseObject();
        setting.title = ele.innerText
        setting.connector = JSON.parse(ele.lastElementChild.getAttribute('data-join_connector_setting'))
        console.log(setting)
        return setting
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
    getDirectionSelector(current = new HTMLElement(), currentdir) {
        return (document.querySelectorAll("#" + current.id + " [data-join_" + currentdir + "]")[0])
    }
    static addRelationRef(id, joinc, opt) {
        var val = id;
        var t = opt ? "data-jp-current" : "data-jp-target"
        var existing = joinc.getAttribute(t);
        if (existing != null) {
            val = existing + " " + id
        }
        joinc.setAttribute(t, val);
        specialCase.jpoints.push({ current: joinc, target: id, opt: opt })
    }
    static searchJoins(ele) {
        for (let i = 0; i < ele.children.length; i++) {
            let child = ele.children[i]
            if (child.classList.contains("_join_component")) {
                if (child.hasAttribute('data-jp-current')) {
                    JOIN.changePoly(child.getAttribute('data-jp-current'), child, true)
                }
                if (child.hasAttribute('data-jp-target')) {
                    JOIN.changePoly(child.getAttribute('data-jp-target'), child, false)
                }
            }
        }
    }
    static getOffset(rect, direction) {
        if (direction == 'left') return rect.left + rect.width
        if (direction == 'top') return rect.top + rect.height
    }
    static removeRelated(id) {
        for (let data of specialCase.jpoints) {
            if (id instanceof Array) {
                if (id.includes(data.target)) {
                    specialCase.jpoints = specialCase.jpoints.filter(d => d != data)
                }
            } else if (typeof id == 'string') {
                if (id == data.target) {
                    specialCase.jpoints = specialCase.jpoints.filter(d => d != data)
                }
            }
        }
    }
    static updateJoinsByC(x, y, target, index) {
        var parses = SVG.parsePoint('line', target.getAttribute('points'))
        parses[index].x = x
        parses[index].y = y
        let data = (JOIN.generatePoints(parses))
        target.setAttribute('points', data)
    }
    static changePoly(idLists, target, opt) {
        var ids = [];
        if (idLists.includes(" ")) {
            var split = idLists.split(" ");
            ids = split.filter(s => s.length > 0);
        } else {
            ids = [idLists]
        }
        const rect = target.getBoundingClientRect()
        ids.forEach(id => {
            var t = i_id(id)
            if (t == null) return
            var points = t.hasAttribute("points") ? t.getAttribute("points") : "";
            var connectorType = t.hasAttribute('data-connector') ?
                t.getAttribute('data-connector') : "line"
            let newPdata = analysePath(rect, points, connectorType, opt)
            t.setAttribute("points", newPdata)
        })
        function analysePath(rect, points, type, opt) {
            const top = JOIN.getOffset(rect, 'top')
            const left = JOIN.getOffset(rect, 'left')
            let x = left - (rect.width / 2)
            let y = top - (rect.height / 2)
            return updatePos(x, y, type, points, opt)
        }
        function updatePos(x, y, type, points, opt) {
            var parsePoints = SVG.parsePoint(type, points)
            var start = parsePoints[0]
            var end = parsePoints[parsePoints.length - 1]
            if (opt) {
                start.x = x
                start.y = y
            } else {
                end.x = x
                end.y = y
            }
            return JOIN.generatePoints(parsePoints);
        }
    }
    static change(idLists, target, opt) {
        var ids = [];
        if (idLists.includes(" ")) {
            var split = idLists.split(" ");
            ids = split.filter(s => s.length > 0);
        } else {
            ids = [idLists]
        }
        const rect = target.getBoundingClientRect()
        ids.forEach(id => {
            var t = document.getElementById(id)
            if (t == null) return
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
    static addBreakPoint(target, locx, locy) {
        var circle = new SVG().create('circle').attrNs({ cx: locx, cy: locy, r: '3' }).attrs({ stroke: '#333', "stroke-width": 2, fill: '#d4d4d4', class: "_itech-circle-move-path" })
        target.parentElement.appendChild(circle.svg)
        var id = target.parentElement.id
        var parsePoints = SVG.parsePoint('line', target.getAttribute('points'))
        var x = locx
        var y = locy
        var newP = {
            x: x,
            y: y
        }
        var opr = Calculator.generateNewPoint(parsePoints, newP)
        var finalPointData = opr.data
        itech(`#${id} ._itech-circle-move-path`).loop(function (ele) {
            let index = parseInt(itech(ele).data('move-index'))
            if (index >= opr.index) {
                ele.setAttribute("data-move-index", index + 1)
            }
        })
        circle.attrs({ "data-move-index": opr.index })
        let data = (JOIN.generatePoints(finalPointData))
        target.setAttribute('points', data)
        var movePath = true
        circle.svg.onmousedown = mouseDown
        circle.svg.addEventListener('click', function (e) {
            e.stopPropagation()
            itech(this).toggleClass('_box_selected')
        })
        new Component(circle.svg).context([
            {
                name: "Remove", key: "Ctrl + P + Delete", callback: function (d) {
                    var parses = SVG.parsePoint('line', target.getAttribute('points'))
                    var mindex = parseInt(itech(circle.svg).data('move-index'))
                    parses.splice(mindex, 1)
                    let data = (JOIN.generatePoints(parses))
                    target.setAttribute('points', data)
                    itech(`#${id} ._itech-circle-move-path`).loop(function (ele) {
                        let index = parseInt(itech(ele).data('move-index'))
                        if (index >= mindex && index != 1) {
                            ele.setAttribute("data-move-index", index - 1)
                        }
                    })
                    d.target.remove()
                }
            }
        ])

        var movex, movey
        function mouseDown(e) {
            e.stopPropagation()
            movePath = true
            document.addEventListener('move', startMove)
            document.addEventListener('up', endMove)
            console.log('down')
        }
        function startMove(e) {
            if (!movePath) return false
            e.stopPropagation()
            movex = e.pageX
            movey = e.pageY
            var index = parseInt(itech(circle.svg).data('move-index'))
            JOIN.updateJoinsByC(movex, movey, target, index)
            circle.attrNs({ cx: movex, cy: movey })
        }
        function endMove() {
            if (!movePath) return false
            movePath = false
        }
    }
    static generatePoints(point = [{ x: 0, y: 0 }]) {
        let pointData = ``
        for (let p of point) {
            pointData += `${p.x} ${p.y}, `
        }
        return pointData.trim().substring(0, pointData.length - 2)
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
    style(style) {
        if (this.svg == null) return
        var defs = i_create('defs');
        var sty = i_create('style')
        sty.type = "text/css"
        sty.innerText += style;
        defs.appendChild(sty)
        this.svg.appendChild(defs)
        return this
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
            if (this.svg.getAttribute(key)) {
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

    polyline(points, css) {
        var poly = new SVG().create('polyline').attrNs({ "stroke": css.color, fill: "none", "stroke-width": css.size, "points": points })
        this.svg.appendChild(poly.svg)
        return poly
    }

    static addGeneralAction(svgelement) {
        svgelement.addEventListener('dblclick', function (e) {
            JOIN.addBreakPoint(this, e.pageX, e.pageY)
        })
    }

    static addPathAction(svg, ...targets) {
        var polyline = null, pointData = { x1: 0, y1: 0, x2: 0, y2: 0 };
        targets.forEach(target => {
            target.addEventListener('mousedown', function (e) {
                e.stopPropagation();
                start(e, this)
            })
        })
        var drawLivePath = false, dragTarget = null
        function start(e, target) {
            var rect = target.getBoundingClientRect();
            dragTarget = target

            var connector = JSON.parse(target.dataset['join_connector_setting'])
            var g = new SVG().create('g')
            g.svg.id = 'g_' + createId('gp')
            pointData.x1 = rect.left + (rect.width / 2)
            pointData.y1 = rect.top + (rect.height / 2)
            pointData.x2 = e.pageX
            pointData.y2 = e.pageY
            polyline = g.polyline(pointDatas(), connector).attrs({ "data-svg-g": g.svg.id, class: "-svg-itech-path itech-connector-obj" })
            g.svg.appendChild(polyline.svg)
            SVG.addGeneralAction(polyline.svg)
            svg.svg.appendChild(g.svg)
            new Component(polyline.svg).context([
                {
                    name: "Add Point", key: "Ctrl + Alt + P", callback: function (d) {
                        JOIN.addBreakPoint(d.target, d.x, d.y)
                    }
                },
                {
                    name: "Style", key: "Ctrl + Alt + S", callback: function (data) {
                        console.log(data)
                    }
                },
                {
                    name: "Delete", key: "", callback: function (data) {
                        SVG.removePath(data.target)
                    }
                }
            ])
            document.body.css({ cursor: "crosshair" })
            drawLivePath = true
            document.onmousemove = drag
            document.onmouseup = stop
        }
        function drag(e) {
            if (!drawLivePath) return false
            pointData.x2 = e.pageX
            pointData.y2 = e.pageY
            polyline.attrs({ points: pointDatas() })
        }
        function stop(e) {
            if (!drawLivePath) return false
            drawLivePath = false
            document.body.css({ cursor: "default" })
            updateJoin(dragTarget, e.target, polyline)
        }

        function pointDatas() {
            return `${pointData.x1} ${pointData.y1}, ${pointData.x2} ${pointData.y2}`;
        }
        function updateJoin(current, target, path) {
            if (!current.classList.contains('_join_component') ||
                !target.classList.contains('_join_component') ||
                current.parentElement == target.parentElement) {
                polyline.svg.parentElement.remove()
                return false
            }
            var id = "p_" + current.parentElement.id + "-" + target.parentElement.id;
            path.svg.id = id
            JOIN.addRelationRef(id, current, true)
            JOIN.addRelationRef(id, target, false)
        }
    }

    static removePath(path) {
        var id = path.id;
        JOIN.removeRelated(id);
        path.parentElement.remove();
    }

    static parsePoint(type = 'line', point) {
        var data = []
        if (type == 'line') {
            let points = point.trim().split(',')
            for (let p of points) {
                p = p.trim()
                let obj = {
                    x: 0, y: 0
                }
                let xy = p.trim().split(/\s/g)
                obj.x = parseInt(xy[0].trim())
                obj.y = parseInt(xy[1].trim())
                data.push(obj)
            }
        }
        return data
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
