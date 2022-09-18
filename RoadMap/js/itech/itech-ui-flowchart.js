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
        
    }
    init(element,setting) {
        this.element = element ? element : this.element
        this.setting = setting ? Object.assign({},setting): this.setting
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
                name: "Copy",key: "Ctrl + C", callback: function (data) {
                    console.log(data)
                }
            },
            {
                name: "Cut",key: "Ctrl + X", callback: function (data) {
                    console.log(data)
                }
            },
            {
                name: "Paste",key: "Ctrl + V", callback: function (data) {
                    console.log(data)
                }
            }
        ]);
        if (setting.joinPoint) {
            this.component.addJoinPoint(comp, setting.joinPoint);
        }
        this.element.appendChild(comp.getComponent)
        this.components.push(comp)
        setting.callback({ target: this, setting: setting , initiatedComponent: comp})
        return { target: this, setting: setting , initiatedComponent: comp}
    }

    joinTo(setting = {
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
        }
    }) {
        var point = new JOIN().getJoinablePoint(setting);
        console.log(point, this.svgelement)
        let x = `M ${point.startPoint.x}, ${point.startPoint.y} L ${point.endPoint.x} ${point.endPoint.y}`;
        let path = this.svgelement.drawPath(x);
        console.log(path)
        path.svg.id = "p_"+setting.current.comp.id+"-"+setting.target.comp.id;
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
        this.component.firstElementChild.addEventListener('focus', function (e) {
            e.stopPropagation();
            this.contentEditable = true
            window.prevents.component.isRename = true
            console.log(prevents.component.isRename)
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
                this.firstElementChild.contentEditable = true;
                this.firstElementChild.css({ cursor: "text" })
                this.firstElementChild.focus()
                placeCaretAtEnd(this.firstElementChild)
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
    context(menus = [{ name: 'name',key: "", callback: callback }]) {
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
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            if (prevents.component.isRename) return false;
            e = e || window.event;
            e.preventDefault();
            //calculate position
            elmnt.style.top = ((e.clientY - elmnt.offsetTop) + (elmnt.offsetTop - (elmnt.offsetHeight / 2))) + "px";
            elmnt.style.left = ((e.clientX - elmnt.offsetLeft) + (elmnt.offsetLeft)) + "px";
            restoreHoverProps(elmnt.style.top, elmnt.style.left)
        }

        function closeDragElement() {
            /* stop moving when mouse button is released:*/
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
    addJoinPoint(element, points = { top: true, left: true, right: true, bottom: true, size: 10, circle: true, rect: false }) {
        var top = points.top ? this.create('span', true).css(Design.Data.joinBtn('top', { width: points.size, height: points.size })).component : null;
        var left = points.left ? this.create('span', true).css(Design.Data.joinBtn('left', { width: points.size, height: points.size })).component : null;
        var right = points.right ? this.create('span', true).css(Design.Data.joinBtn('right', { width: points.size, height: points.size })).component : null;
        var bottom = points.bottom ? this.create('span', true).css(Design.Data.joinBtn('bottom', { width: points.size, height: points.size })).component : null;

        top != null ? top.dataset['join_top'] = "true" : null
        left != null ? left.dataset['join_left'] = "true" : null
        right != null ? right.dataset['join_right'] = "true" : null
        bottom != null ? bottom.dataset['join_bottom'] = "true" : null

        bottom.addEventListener('mousedown', function (e) {
            e.stopPropagation()
        })
        top != null ? element.component.appendChild(top) : null
        left != null ? element.component.appendChild(left) : null
        right != null ? element.component.appendChild(right) : null
        bottom != null ? element.component.appendChild(bottom) : null
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

        var rectc = joinc.getBoundingClientRect();
        var rectt = joint.getBoundingClientRect();

        var sx = this.getOffset(rectc, 'left')
        var sy = this.getOffset(rectc, 'top')
        var ex = this.getOffset(rectt, 'left')
        var ey = this.getOffset(rectt, 'top')

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
    getOffset(rect,direction) {
        
        if(direction == 'left') return rect.left + rect.width
        if(direction == 'top') return rect.top + rect.height
    }
    getDirectionSelector(current = new HTMLElement(), currentdir) {
        return (document.querySelectorAll("#" + current.id + " [data-join_" + currentdir + "]")[0])
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
            this.svg.setAttributeNS(null, key, attrs[key]);
        }
        return this;
    }
    attrs(attrs) {
        for (let key in attrs) {
            this.svg.setAttribute(key, attrs[key]);
        }
        return this;
    }
    drawPath(pathData) {
        var svg = new SVG();
        var path = svg.create('path');
        path.attrNs({ "stroke": "red","stroke-width":"3", "d": pathData});
        this.svg.appendChild(path.svg);
        return path;
    }
    
}


const itechFlowchart = new FlowChart();
