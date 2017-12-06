import { Chart, DeafElement, DeafLine } from "./chart";
import { View } from './view';

export class svgDeafElement{
  deafElement: DeafElement;
  constructor(public svgElement:  SVGElement) {
  };
  repaintInto(charter: SVGChart) {
    let replacement = charter.renderSVG(this.deafElement);
    this.svgElement.parentNode.insertBefore(replacement, this.svgElement);
    this.svgElement.parentNode.removeChild(this.svgElement);
  }
  static getPoint(svgElement:  SVGGElement): DeafElement {
    return (new svgDeafPoint(svgElement)).deafElement as DeafElement;
  }
}

export class svgDeafPoint{
  deafElement: DeafElement;
  constructor(public svgElement:  SVGGElement) {
    this.deafElement = new DeafElement('point');
    let elTxt = <SVGTextElement> this.svgElement.childNodes[0].childNodes[1];
    this.deafElement.left = Number(elTxt.getAttributeNS(null, 'x'));
    this.deafElement.top = Number(elTxt.getAttributeNS(null, 'y'));
    this.deafElement.data = elTxt.textContent;
  }
}
export const NS_SVG = "http://www.w3.org/2000/svg";
const SMOOTHNESS = .5;

export class SVGChart extends View {
  elSVGDot : SVGElement;
  pages: Array<SVGSVGElement> = [];
  cover: SVGSVGElement;

  render() {
    let cv = this.createLayer();
    this.cover = cv;
    this.elRoot.attributes.svgNode = this.cover;
    super.render();
    this.elRoot.childNodes.forEach(e => this.renderRecurr(e));
    return cv;
  }

  createLayer() : SVGSVGElement {
    let cv = document.createElementNS(NS_SVG, 'svg');
    cv.setAttribute('viewBox', [0, 0, this.width, this.height].join(' '));
    cv.setAttribute('width', this.width.toFixed(0));
    cv.setAttribute('height', this.height.toFixed(0));
    return cv;
  }

  newPage(): SVGSVGElement{
    let cv = this.createLayer()
    this.pages.push(cv);
    return cv;
  }

  renderRecurr (el: DeafElement): void {
    let elSVG = this.renderSVG(el);
    super.renderRecurr(el);
  }
  renderSVG (el: DeafElement) : SVGElement {
    
    let elSVG = document.createElementNS(NS_SVG, 'g')
      , elParentSVG = <SVGElement>el.parentNode.attributes.svgNode;
    elSVG.setAttributeNS(null, 'class', el.attributes.class);

    switch (el.type) {

      case "curve": 
      case "line": 
        if (el.attributes.type == Chart.type.plot) {
          let elPage = this.newPage();
          elPage.setAttributeNS(null, 'class', 'plot');
          elParentSVG = elPage;
        }
        let view = this.getView(el);
        let elLine = document.createElementNS(NS_SVG, 'path');
        elLine.setAttributeNS(null, 'd', view.points.join(' '));
        elLine.setAttributeNS(null, 'fill-opacity', '.25');
        elLine.setAttributeNS(null, 'class', el.attributes.class);
        elLine.setAttributeNS(null, 'id', el.id);

        elSVG.appendChild(elLine);
        break;
      case "point":
        let elPoint = this.createPoint(el);
        elPoint.setAttribute('class', 'scales');
        elSVG.appendChild(elPoint);
        break;
      
      default:

        break;
    }
    elParentSVG.appendChild(elSVG);
    el.attributes.svgNode = elSVG;
    return elSVG;
  }
  createPoint(el: DeafElement) : SVGElement {

    let [x, y] = this.scaleXY(el.left, el.top)
    let elSVG = document.createElementNS(NS_SVG, 'g');
    let elText = document.createElementNS(NS_SVG, 'text');
    elSVG.setAttributeNS(null, 'class', 'point');
    elSVG.setAttributeNS(null, 'transform', 'translate(' + x.toFixed(0) + ',' + y.toFixed(0) + ')');
    
    elText.appendChild(document.createTextNode(el.data));
    elText.setAttributeNS(null, 'text-anchor', 'end');
    elText.setAttributeNS(null, 'x', '0');
    elText.setAttributeNS(null, 'y', '0');
    // elText.setAttributeNS(null, 'transform', 'rotate(-45 ' + x.toFixed(0) + ',' + y.toFixed(0) + ')')
    elText.setAttributeNS(null, 'dx',(-this.sizeDot).toFixed(2));
    elText.setAttributeNS(null, 'dy',(this.sizeDot).toFixed(2));
    elSVG.appendChild(elText);

    let elCircle = document.createElementNS(NS_SVG, 'circle');
    elCircle.setAttributeNS(null, 'cx', '0');
    elCircle.setAttributeNS(null, 'cy', '0');
    elCircle.setAttributeNS(null, 'r', (this.sizeDot).toFixed(2));
    elSVG.appendChild(elCircle);
    
    return elSVG;
  }
}