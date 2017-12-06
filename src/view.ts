import {Chart, DeafElement, Viewbox} from './chart';
import { Blackboard } from './watch';
const SMOOTHNESS = .2;
export class View {

  width : number = 800;
  height : number = 600;
  sizeLabel : number = 100;
  sizeDot : number = 6.68;
  defSizeLabel: number;
  defSizeDot: number;

  unitX: number;
  unitY: number;
  offsetX: number;
  offsetY: number;

  scaleX (x : number): number { return (x * this.unitX + this.offsetX);}
  scaleY (y : number): number  { return  (y * this.unitY + this.offsetY);}
  scaleXY (x: number, y: number) : [number, number] { return  [this.scaleX(x), this.scaleY(y)];}

  rscaleX (x : number) { return Math.round((x - this.offsetX) / this.unitX);}
  rscaleY (y : number) { return Math.round((y - this.offsetY) / this.unitY);}
  rscaleXY (x: number, y: number) { return [this.rscaleX(x), this.rscaleY(y)];}


  elRoot: DeafElement;

  private c : Chart;

  get scale(): {name: Function, from: number, to: number}{
    return this.c.scale;
  }
  get viewbox(): Viewbox{
    return this.c.viewbox;
  }
  get watch(): Blackboard{
    return this.c.watch;
  }
  set chart (c: Chart) {
    this.c = c;
  }

  constructor () {

  }

  getView (el: DeafElement) {
    let ret = new Viewbox(el.bBox);
    ret.width *= this.unitX;
    ret.height *= this.unitY;
    ret.x += this.offsetX;
    ret.y += this.offsetY;
    switch (el.type) {
      case "curve":
        const smoothness = this.unitX * SMOOTHNESS;
        let points : Array<string|number> = [];
        let lastpoint = [this.scaleX(el.points[0]), this.scaleY(el.points[1])]
        if (el.points.length <= 0) {
          ret.points = [];
          break;
        } else if (el.points.length <= 2) {
          // single point?
          points = ['M', ...lastpoint, 'V', this.scaleY(0)];
          ret.points = points;
          break;
        } else {
          // double points or more?
          points.push('M', ...lastpoint);
          points.push('C', (lastpoint[0] + smoothness).toFixed(2), lastpoint[1].toFixed(2));

          for (let i = 2; i < el.points.length - 2; i += 2) {
            // many points;
            let nextpoint = [this.scaleX(el.points[i + 2]), this.scaleY(el.points[i + 3])];
            let currentpoint = [this.scaleX(el.points[i]), this.scaleY(el.points[i + 1])];
            let dx = nextpoint[0] - lastpoint[0]
            , dy = nextpoint[1] - lastpoint[1];
            let rate = smoothness / Math.hypot(dx, dy);
            dx *= rate;
            dy *= rate;

            points.push((currentpoint[0] - dx).toFixed(2), (currentpoint[1] - dy).toFixed(2)
              , currentpoint[0].toFixed(2), currentpoint[1].toFixed(2)
              , 'C'
              , (currentpoint[0] + dx).toFixed(2), (currentpoint[1] + dy).toFixed(2));
            lastpoint = currentpoint;
          }

          let currentpoint = [this.scaleX(el.points[el.points.length - 2]), this.scaleY(el.points[el.points.length - 1])];
          let dx = currentpoint[0] - lastpoint[0]
          , dy = currentpoint[1] - lastpoint[1];
          let rate = smoothness / Math.hypot(dx, dy);
          dx *= rate;
          dy *= rate;

          points.push((currentpoint[0] - dx).toFixed(2), (currentpoint[1] - dy).toFixed(2)
            , (currentpoint[0]).toFixed(2), currentpoint[1].toFixed(2))

          points.push('L', ...this.scaleXY(currentpoint[0], 0));
          points.push('L', ...this.scaleXY(el.points[0],(0)));
          ret.points = points;
          break;
        }
      case 'line': {
        let points : Array<string|number> = ['M', ...this.scaleXY(el.points[0], el.points[1])];
        for(let i = 2; i < el.points.length; i += 2) {
          points.push('L')
          points.push(this.scaleX(el.points[i]).toFixed(2))
          points.push(this.scaleY(el.points[i + 1]).toFixed(2))
        }
        ret.points = points;
      }
      default:
        break;
    }
    return ret;
  }

  draw() : any {
    this.elRoot = this.c.drawDeaf();
    let _cLength = Math.ceil(Math.log10(this.viewbox.bottom) + .01);
    this.sizeLabel = (Math.floor((_cLength - 1) / 3) * .5 + _cLength + 1) * this.sizeDot;

    this.unitX = (this.width - this.sizeLabel - this.sizeDot) / this.viewbox.width;
    if (!isFinite(this.unitX)) {
      this.unitX = this.width * 2;
    }
    this.unitY = - (this.height - this.sizeLabel - this.sizeDot) / this.viewbox.height;
    if (!isFinite(this.unitY)) {
      this.unitY = this.height* 2;
    }
    this.defSizeLabel = this.sizeLabel / this.unitX;
    this.defSizeDot = this.sizeDot / this.unitX;

    this.offsetX = - this.viewbox.left * this.unitX + this.sizeLabel;
    this.offsetY = (this.height - this.sizeLabel);

    return this.render()
  }

  render() : any {
  }

  renderRecurr(el: DeafElement) : any {
    return el.childNodes.forEach(e => this.renderRecurr(e));
  }
}
