"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chart_1 = require("./chart");
const drawsvg_1 = require("./drawsvg");
class SVGChart extends drawsvg_1.SVGChart {
    constructor() {
        super(...arguments);
        this.SPEED = 14085;
        this.Zdistance = 100;
        this.XRotation = -25;
        this.YRotation = 10;
    }
    get is3DActived() {
        return (this.monkey.style.display != 'none');
    }
    set is3DActived(is) {
        this.monkey.style.display = is ? 'block' : 'none';
    }
    render() {
        let cv = super.render();
        let mk = this.createLayer();
        this.mark = mk;
        this.renderMaker(mk);
        let monkey = this.createLayer();
        this.monkey = monkey;
        this.is3DActived = false;
        this.renderMonkey(monkey);
        this.renderTab(cv);
        return cv;
    }
    renderMaker(svgNode) {
        let mark = new chart_1.DeafElement('g');
        mark.attributes.svgNode = svgNode;
        let marker = mark.appendChild(new chart_1.DeafLine);
        marker.setAttribute('class', 'vscale');
        marker.lineTo(0, 0);
        marker.lineTo(100, 0);
        this.renderSVG(marker);
        return mark;
    }
    renderMonkey(svgNode) {
        let mark = new chart_1.DeafElement('g');
        svgNode.setAttributeNS(null, 'class', 'monkey');
        mark.attributes.svgNode = svgNode;
        let marker = mark.appendChild(new chart_1.DeafLine);
        marker.setAttribute('class', 'monkey');
        marker.setAttribute('style', 'transform:rotateY(' + (90) + 'deg);');
        marker.lineTo(0, 0);
        marker.lineTo(100, 0);
        this.renderSVG(marker);
        let vpath = mark.appendChild(new chart_1.DeafLine);
        vpath.setAttribute('class', 'monkey');
        vpath.lineTo(0, 0);
        this.renderSVG(vpath);
        Object.keys(this.watch.members).forEach(v => {
            vpath.attributes.svgNode.appendChild(document.createElementNS(drawsvg_1.NS_SVG, 'circle'));
        });
        let zCursor = mark.appendChild(new chart_1.DeafLine);
        zCursor.setAttribute('class', 'cursor');
        zCursor.lineTo(0, 0);
        this.renderSVG(zCursor);
        let yCursor = mark.appendChild(new chart_1.DeafLine);
        yCursor.setAttribute('class', 'cursor');
        yCursor.lineTo(0, 0);
        yCursor.lineTo(0, this.viewbox.bottom);
        this.renderSVG(yCursor);
        return mark;
    }
    renderMask(elRoot) {
        let defs = document.createElementNS(drawsvg_1.NS_SVG, 'defs');
        elRoot.appendChild(defs);
        let mask = document.createElementNS(drawsvg_1.NS_SVG, 'clipPath');
        let id = Math.random().toFixed(2);
        mask.setAttributeNS(null, 'id', id);
        defs.appendChild(mask);
        let maskrect = document.createElementNS(drawsvg_1.NS_SVG, 'rect');
        mask.appendChild(maskrect);
        maskrect.setAttributeNS(null, 'class', 'mask');
        maskrect.setAttributeNS(null, 'x', '0');
        maskrect.setAttributeNS(null, 'y', '0');
        maskrect.setAttributeNS(null, 'width', '1000');
        maskrect.setAttributeNS(null, 'height', (this.sizeDot * 4).toFixed(0));
        return id;
    }
    renderLabel(elRoot) {
        const LINEHEIGHT = 3;
        let elLabel = document.createElementNS(drawsvg_1.NS_SVG, 'g');
        elRoot.appendChild(elLabel);
        elLabel.setAttribute('id', 'label');
        let elLableBack = document.createElementNS(drawsvg_1.NS_SVG, 'rect');
        elLabel.appendChild(elLableBack);
        elLableBack.setAttributeNS(null, 'width', '0');
        elLableBack.setAttributeNS(null, 'height', (LINEHEIGHT * this.sizeDot * (Object.keys(this.watch.members).length + 2)).toFixed(2));
        elLableBack.setAttributeNS(null, 'rx', (this.sizeDot).toFixed(2));
        let elLableTitleBack = elLableBack.cloneNode();
        elLabel.appendChild(elLableTitleBack);
        elLableTitleBack.setAttributeNS(null, 'clip-path', 'url(#' + this.renderMask(elRoot) + ')');
        elLableTitleBack.setAttributeNS(null, 'class', 'mask');
        let posOfLabelComa = (this.sizeLabel - this.sizeDot) / 2;
        let create = (v, i) => {
            let elt = document.createElementNS(drawsvg_1.NS_SVG, 'text');
            elt.setAttributeNS(null, 'y', (((i + 1) * LINEHEIGHT + 1) * this.sizeDot).toFixed());
            elt.setAttributeNS(null, 'x', this.sizeDot.toFixed());
            let elv = document.createElementNS(drawsvg_1.NS_SVG, 'text');
            elv.setAttributeNS(null, 'y', (((i + 1) * LINEHEIGHT + 1) * this.sizeDot).toFixed());
            elv.setAttributeNS(null, 'x', posOfLabelComa.toFixed());
            elv.setAttributeNS(null, 'class', 'line' + i.toFixed());
            elv.setAttributeNS(null, 'text-anchor', 'end');
            elLabel.appendChild(elt);
            elLabel.appendChild(elv);
            return [elt, elv];
        };
        let lbls = Object.keys(this.watch.members).map((v, i) => create(v, i + 1));
        lbls.push(create('v', -.3));
        return {
            setValue: (i, k, v) => {
                let elK = lbls[i][0];
                let elV = lbls[i][1];
                elK.textContent = k;
                elV.textContent = v;
                let r = elLabel.getBBox();
                let w;
                let rText = elK.getBBox(), rValue = elV.getBBox();
                w = Math.max(rText.width + rValue.width + 4 * this.sizeDot, r.width);
            },
            adjust: (left) => {
                let r = elLabel.getBBox();
                let w = 0;
                lbls.forEach(([rText, rValue], i) => {
                    w = Math.max(rText.getBBox().width + rValue.getBBox().width + 4 * this.sizeDot, w);
                });
                lbls.forEach(([rText, rValue], i) => {
                    rValue.setAttributeNS(null, 'x', (w - this.sizeDot).toFixed());
                });
                left -= w + this.sizeDot;
                if (left < this.sizeLabel) {
                    left += w + 2 * this.sizeDot;
                }
                elLableBack.setAttributeNS(null, 'width', w.toFixed());
                elLableTitleBack.setAttributeNS(null, 'width', w.toFixed());
                elLabel.setAttributeNS(null, 'transform', 'translate(' + left + ',0)');
            }
        };
    }
    renderTab(elRoot) {
        let elText = document.createElementNS(drawsvg_1.NS_SVG, 'text');
        let elSVG = (document.createElementNS(drawsvg_1.NS_SVG, 'textPath'));
        elSVG.setAttribute('id', 'tag');
        elSVG.setAttributeNS(null, 'fill', 'none');
        elText.appendChild(elSVG);
        elText.setAttributeNS(null, 'text-anchor', 'end');
        elRoot.appendChild(elText);
        let elDot = new chart_1.DeafElement('point');
        elDot.data = "";
        elDot.setAttribute('click', 'pointerEvent');
        let offset = 1, isRunning = false, x, y, speed, tgt, lasttarget;
        let watchList = this.watch;
        let elLb = this.renderLabel(elRoot);
        let yCursor = this.cover.childNodes[0].childNodes[1].childNodes[2].childNodes[0];
        yCursor.setAttributeNS(null, 'class', 'cursor');
        let xCursor = yCursor.cloneNode();
        yCursor.parentNode.appendChild(xCursor);
        let zCursor = this.monkey.childNodes[2].childNodes[0];
        let toREL = zCursor.getAttributeNS(null, 'd').match(/[\.\d]+/g);
        yCursor.setAttributeNS(null, 'd', ['M', toREL[0], toREL[1], 'V', toREL[1], 'H', this.width, 'V', toREL[1]].join(' '));
        let targetIt = (evt) => {
            x = evt.offsetX, y = evt.offsetY;
            let [rx, ry] = this.rscaleXY(x, y);
            if (rx < 0)
                return;
            if (ry < 0)
                return;
            zCursor.setAttributeNS(null, 'd', ['M', toREL[0], toREL[1], 'V', y, 'H', this.width, 'V', toREL[1]].join(' '));
            yCursor.setAttributeNS(null, 'd', ['M', toREL[0], y, 'H', this.width].join(' '));
            xCursor.setAttributeNS(null, 'd', ['M', x, toREL[1], 'V', -this.height].join(' '));
            rx = Math.round(rx);
            let minD, keyClose;
            Object.keys(watchList.members).forEach((k, i) => {
                let datum = watchList.members[k].data[rx];
                datum = datum || watchList.members[k].data[0];
                let _dy = Math.abs(ry - datum);
                if (minD == undefined) {
                    keyClose = k;
                    minD = _dy;
                }
                else if (minD > _dy) {
                    minD = _dy;
                    keyClose = k;
                }
                elLb.setValue(i, k + ':', datum);
            });
            elLb.setValue(Object.keys(watchList.members).length, '', this.scale.name(rx));
            elLb.adjust(x);
            tgt = document.getElementById(keyClose) || tgt;
            if (tgt.nodeName === 'path') {
                let elsParent = tgt.parentNode.parentNode;
                // find the closed point to show
                if (watchList.members[tgt.id] && Math.abs(Math.round(rx) - rx) < 0.3) {
                    ry = watchList.members[tgt.id].data[rx];
                    ry = ry || watchList.members[tgt.id].data[0];
                    elDot.data = ry;
                    elDot.left = rx;
                    elDot.top = ry;
                    elDot.id = tgt.id;
                    this.activeDot = elDot;
                    this.elSVGDot && this.elSVGDot.parentNode.removeChild(this.elSVGDot);
                    this.elSVGDot = this.createPoint(elDot);
                    this.elSVGDot.setAttribute('class', tgt.getAttribute('class') + ' pointer');
                    zCursor.setAttribute('class', tgt.getAttribute('class') + ' cursor');
                    elsParent.appendChild(this.elSVGDot);
                    this.monkey.style.transform =
                        this.monkey.style.transform.replace(/translateZ\([\-\d\w]+\)/, '') + this.monkeyBusiness();
                }
                speed = this.SPEED * this.unitX / tgt.getTotalLength();
                if (tgt !== lasttarget) {
                    lasttarget = tgt;
                    lasttarget.parentNode.appendChild(elText);
                    // walk the line.
                    // watchList.members[tgt.id].data
                    // elsParent = elsParent.parentNode;
                    // elsParent.parentNode.removeChild(elsParent);
                    // elsParent.parentNode.appendChild(elsParent);
                    elSVG.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + lasttarget.id);
                    elSVG.textContent = lasttarget.id;
                    offset = x;
                    let style = getComputedStyle(lasttarget);
                    elSVG.style.stroke = style.stroke;
                    elSVG.style.fill = style.stroke;
                    elSVG.style.fontSize = (Number(style.strokeWidth) * 5).toFixed(2);
                }
                // throttleIt();
            }
        };
        let throttleIt = () => {
            if (isRunning)
                return;
            isRunning = true;
            window.requestAnimationFrame(() => {
                elSVG.setAttributeNS(null, 'startOffset', offset.toFixed(0));
                let pos = lasttarget.getPointAtLength(offset);
                if (offset < tgt.getTotalLength()) {
                    isRunning = false;
                    if (pos.x < x - speed) {
                        offset += speed;
                        throttleIt();
                    }
                    else if (pos.x > x + speed) {
                        offset -= speed;
                        throttleIt();
                    }
                    else if (speed > 1) {
                        speed *= .5;
                        throttleIt();
                    }
                    else {
                    }
                }
                elSVG.textContent = tgt.id; // + ':' + (this.rscaleY(pos.y)).toFixed(0);
            });
        };
        elRoot.addEventListener('mousemove', targetIt);
        elRoot.addEventListener('click', () => {
            // this.sort();
            // this.trigger(elSVGDot);
        });
        return targetIt;
    }
    createLayer() {
        let left = this.scaleX(this.scale.from) + 'px';
        let top = this.scaleY(0) + 'px';
        let cv = super.createLayer();
        cv.style.transformOrigin = [left, top].join(' ');
        return cv;
    }
    animatedSort3D(dir = true, cb) {
        // this.monkey.style.display = dir ? 'block': 'none';
        this.is3DActived = dir;
        return new Promise((resolve, reject) => {
            let _cb = function (evt) {
                this.removeEventListener('transitionend', _cb);
                if (cb) {
                    cb.call(this, evt);
                }
            };
            let rotate = (p, i) => {
                p.addEventListener('transitionend', _cb);
                let transform = dir ?
                    [
                        'rotateX(' + this.XRotation + 'deg)',
                        'rotateY(' + this.YRotation + 'deg)',
                        ' translateZ(' + i * (-this.Zdistance) + 'px)'
                    ].join(' ') : '';
                p.style.transform = transform;
            };
            for (let i = this.pages.length - 1, p; p = this.pages[i]; i--) {
                rotate(p, i);
            }
            rotate(this.cover, 0);
            let _arrTranformStyle = dir ? [
                'rotateX(' + this.XRotation + 'deg)',
                'rotateY(' + (this.YRotation + 90) + 'deg)'
            ]
                :
                    ['rotateY(' + (90) + 'deg)'];
            this.mark.style.transform = _arrTranformStyle.join(' ');
            this.monkey.style.transform = _arrTranformStyle.concat([this.monkeyBusiness()]).join(' ');
            let marker = this.mark.childNodes[0].childNodes[0];
            let length = dir ? 200 : 1;
            // marker.pathSegList.replaceItem(marker.createSVGPathSegLinetoRel(length, 0) ,marker.pathSegList.numberOfItems - 1);
            let segs = marker.getAttribute('d').match(/\w[\s\d]+/g);
            segs.splice(-1, 1, 'l ' + length.toFixed() + ' 0');
            marker.setAttributeNS(null, 'd', segs.join(''));
            let style = getComputedStyle(this.mark);
            setTimeout(() => {
                resolve(); //no matter what. fuck this.
            }, style.transitionDuration.replace(/s/g, '000').replace('m000', '')) * 1.1; // translate '\ds' to ms number
        });
    }
    monkeyBusiness(pos) {
        let x = Number(this.elSVGDot.childNodes[0].getAttribute('x')), y = Number(this.elSVGDot.childNodes[0].getAttribute('y')), rx = this.rscaleX(x);
        if (rx < 0)
            return 'translateZ(0px)';
        pos = (pos || x) - this.sizeLabel;
        let elMonkey = this.monkey.childNodes[1].childNodes[0];
        let points = ['M ', this.sizeLabel, this.height - this.sizeLabel]
            .concat(this.pages.map((svg, i) => {
            // let pt = new DeafElement('point');
            let svgPath = svg.childNodes[0].childNodes[0], key = svgPath.id, datapoin = this.watch.members[key].data[rx];
            let svgPoint = elMonkey.parentNode.childNodes[i + 1];
            let x = (this.Zdistance * i + this.sizeLabel).toFixed(), y = this.scaleY(datapoin).toFixed();
            // side effect;
            svgPoint.setAttributeNS(null, 'cx', x);
            svgPoint.setAttributeNS(null, 'cy', y);
            svgPoint.setAttributeNS(null, 'class', svgPath.getAttributeNS(null, 'class'));
            // side effect end;
            return [
                'L',
                (x),
                y
            ].join(' ');
        }));
        points.push('V ' + (this.height - this.sizeLabel));
        elMonkey.setAttributeNS(null, 'd', points.join(' ')); // side effect;
        return 'translateZ(' + pos + 'px)';
    }
    sort() {
        let activeSvg = this.elSVGDot.parentNode;
        this.animatedSort3D()
            .then(() => {
            for (var i = this.pages.length - 1; i > 0; i--) {
                if (this.pages[i] === activeSvg) {
                    // activeSvg.parentNode.appendChild(activeSvg);
                    this.pages.splice(i, 1);
                    this.pages.splice(0, 0, activeSvg);
                    this.pages[0].parentNode.insertBefore(activeSvg, this.cover);
                    return this.animatedSort3D(this.is3DActived);
                }
            }
            return this.animatedSort3D(false);
        })
            .then(() => {
        });
    }
}
exports.SVGChart = SVGChart;
//# sourceMappingURL=eventsvg.js.map