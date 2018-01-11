"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SMOOTHNESS = .5;
exports.pad = (n) => {
    let ret = [];
    while (n >= 1000) {
        n = n / 1000;
        ret.splice(0, 0, n.toFixed(3).substr(-3));
    }
    ;
    ret.splice(0, 0, n);
    return ret.join(',');
};
class Viewbox {
    constructor(args) {
        this.points = [];
        [this.left, this.top, this.right, this.bottom] = args;
    }
    get width() {
        return this.right - this.left;
    }
    set width(val) {
        let delta = (val - this.width) / 2;
        this.left -= delta;
        this.right += delta;
    }
    get height() {
        return this.bottom - this.top;
    }
    set height(val) {
        let delta = (val - this.height) / 2;
        this.top -= delta;
        this.bottom += delta;
    }
    get x() {
        return this.left / 2 + this.width / 2;
    }
    set x(val) {
        let delta = (val - this.x);
        this.left += delta;
        this.right += delta;
    }
    get y() {
        return this.left / 2 + this.width / 2;
    }
    set y(val) {
        let delta = (val - this.y);
        this.top += delta;
        this.bottom += delta;
    }
    get bBox() {
        return [this.left, this.top, this.right, this.bottom];
    }
    set bBox(args) {
        [this.left, this.top, this.right, this.bottom] = args;
    }
    toString() {
        return JSON.stringify([this.left, this.top, this.right, this.bottom]);
    }
}
exports.Viewbox = Viewbox;
class DeafElement extends Viewbox {
    constructor(type) {
        super([0, 0, 0, 0]);
        this.type = type;
        this.attributes = {};
        this.childNodes = [];
    }
    getView(unitX, unitY, offsetX, offsetY) {
        let ret = new Viewbox(this.bBox);
        ret.width *= unitX;
        ret.height *= unitY;
        ret.x += offsetX;
        ret.y += offsetY;
        return ret;
    }
    appendChild(el) {
        this.childNodes.push(el);
        el.parentNode = this;
        return el;
    }
    static line() {
        return new DeafLine;
    }
    static curve() {
        return new DeafCurve;
    }
    setAttribute(name, value) {
        this.attributes[name] = value;
    }
}
exports.DeafElement = DeafElement;
class DeafLine extends DeafElement {
    constructor() {
        super(...arguments);
        this.type = 'line';
        this.points = [];
    }
    lineTo(x, y) {
        if (Array.isArray(x)) {
            x = x[0];
            y = x[1];
        }
        this.points.push(x);
        this.points.push(y);
        return this;
    }
    getView(unitX, unitY, offsetX, offsetY) {
        let ret = super.getView(unitX, unitY, offsetX, offsetY);
        let scaleX = (x) => (x * unitX + offsetX);
        let scaleY = (y) => (y * unitY + offsetY);
        let scaleXY = (x, y) => [scaleX(x), scaleY(y)];
        let points = ['M', ...scaleXY(this.points[0], this.points[1])];
        for (let i = 2; i < this.points.length; i += 2) {
            points.push(scaleX(this.points[i]).toFixed(2));
            points.push(scaleY(this.points[i + 1]).toFixed(2));
        }
        ret.points = points;
        return ret;
    }
}
exports.DeafLine = DeafLine;
class DeafCurve extends DeafLine {
    constructor() {
        super(...arguments);
        this.type = 'curve';
    }
}
exports.DeafCurve = DeafCurve;
class DLabel extends DeafElement {
}
exports.DLabel = DLabel;
class Chart {
    constructor(watch) {
        this.watch = watch;
        this.hScaleLabelCount = 15;
    }
    setupScale(arr) {
        this.scale.name = (i) => arr[i];
    }
    drawDeaf(from, to) {
        if (!this.scale) {
            this.viewbox = new Viewbox([0, 0, 0, 0]);
            return new DeafElement('none');
        }
        from = from || this.scale.from || 0;
        to = to || this.scale.to || 0;
        // find out v scales via max.
        let max = 0;
        // find out h scales unit.
        let unit = 1;
        let elRoot = new DeafElement('svg');
        let elScales = elRoot.appendChild(new DeafElement('g'));
        let doms = [];
        let enumDom = {};
        let hmax = 0;
        for (var key in this.watch.members) {
            if (!this.watch.members[key])
                continue;
            enumDom[key] = doms.push(elRoot.appendChild(DeafElement.curve())) - 1;
            doms[enumDom[key]].setAttribute('class', key + ' plot line' + doms.length);
            doms[enumDom[key]].setAttribute('type', Chart.type.plot);
            doms[enumDom[key]].id = key;
            hmax = Math.max(hmax, this.watch.members[key].data.length);
        }
        let elScaleH = elScales.appendChild(DeafElement.line());
        let elScaleV = elScales.appendChild(DeafElement.line());
        enumDom['$hscale'] = doms.push(elScaleH) - 1;
        enumDom['$vscale'] = doms.push(elScaleV) - 1;
        elScaleH.setAttribute('class', 'hscale');
        elScaleV.setAttribute('class', 'vscale');
        elScaleH.id = 'time';
        elScaleV.id = 'value';
        let args = [from, to, max, doms, enumDom, elScaleH];
        if (hmax - from > 1) {
            this.createCurveChart(args);
        }
        else {
            this.creeateHistogram(args);
        }
        [from, to, max, doms, enumDom, elScaleH] = args;
        if (max == 0) {
            max = 100;
        }
        let vscale = Math.pow(10, Math.floor(Math.log10(max)));
        max = Math.ceil(max / vscale) * vscale;
        let step = 0;
        //create vertical scales
        do {
            elScaleV.lineTo(from, step);
            let point = elScaleV.appendChild(new DeafElement('point'));
            point.left = from;
            point.top = step;
            if (step == 0) {
                point.data = ' ';
            }
            else {
                point.data = exports.pad(step);
            }
            let el = elScaleV.appendChild(DeafElement.line());
            el.lineTo(from, step).lineTo(to, step);
            el.id = 'value:' + exports.pad(step);
            step += vscale;
        } while (step <= max);
        this.viewbox = new Viewbox([from, 0, to, max]);
        return elRoot;
    }
    createCurveChart(args) {
        let [from, to, max, doms, enumDom, elScaleH] = args;
        let piss = 1;
        if ((to - from) > this.hScaleLabelCount) {
            piss = Math.round((to - from) / this.hScaleLabelCount);
        }
        for (var i = from; i <= to; i++) {
            // create lines
            for (var key in this.watch.members) {
                if (typeof (this.watch.members[key]) === 'undefined') {
                    continue;
                }
                let arr = this.watch.members[key].data;
                if (isNaN(arr[i]))
                    continue;
                max = Math.max(max, arr[i]);
                doms[enumDom[key]].lineTo(i, arr[i]);
            }
            //create horizental scales
            //create points on horizental scale
            if (((i % piss === 0) && (i + piss) < (to + .3 * piss))
                || i == from
                || i == to) {
                elScaleH.lineTo(i, 0);
                let point = elScaleH.appendChild(new DeafElement('point'));
                point.left = i;
                point.top = 0;
                point.data = this.scale.name(i);
            }
        }
        args[2] = max;
    }
    creeateHistogram(args) {
        let [from, to, max, doms, enumDom, elScaleH] = args;
        // create lines
        to = from + doms.length - 1;
        Object.keys(this.watch.members).forEach((key, i) => {
            i += 1;
            if (typeof (this.watch.members[key]) === 'undefined') {
                return;
            }
            let arr = this.watch.members[key].data;
            if (isNaN(arr[from]))
                return;
            max = Math.max(max, arr[from]);
            doms[enumDom[key]].type = 'line';
            doms[enumDom[key]]
                .lineTo(from + i - .4, 0)
                .lineTo(from + i - .4, arr[from])
                .lineTo(from + i + .4, arr[from])
                .lineTo(from + i + .4, 0);
            elScaleH.lineTo(i + from, 0);
            let point = elScaleH.appendChild(new DeafElement('point'));
            point.left = i + from + .5;
            point.top = 0;
            point.data = key;
        });
        args[2] = max;
        args[1] = to;
        this.setupScale([this.scale.name[0], ...Object.keys(this.watch.members)]);
    }
}
Chart.type = {
    plot: 'plot',
    hscale: 'hscale',
    vscale: 'vscale',
};
exports.Chart = Chart;
//# sourceMappingURL=chart.js.map