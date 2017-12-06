
const STEP = 1000;
export class Gen{
  colorBase = [255,255,255,255]//[73, 44, 78, 255]
  colorTaint = [[210, 230, 255, 255], [255,255,255,255], [255, 210, 230, 255], [255,255,255,255], [255, 230, 210, 255]];
  posTaint: Array<Array<number>> = [];
  speedTaint: Array<Array<number>> = [];
  dta: ImageData;
  ctx: CanvasRenderingContext2D;
  el = window.document.createElement('style');
  get dataPNG() {
    return this.ctx.canvas.toDataURL();
  }
  constructor(width: number, height: number, private name: string = 'rand') {
    let cv = document.createElement('canvas');
    cv.width = width; cv.height = height;
    this.ctx = cv.getContext('2d');
    this.ctx.fillStyle = 'rgba(' + this.colorBase.join(',') + ')';

    for(let j = 0, t: Array<number>; t = this.colorTaint[j]; j++) {
      this.posTaint[j] = [width * Math.random(), height * Math.random(), width * Math.random()];
      this.speedTaint[j] = [width * Math.random(), height * Math.random(), width * Math.random()];
    }
    this.ctx.putImageData(this.createTaint(this.colorTaint, this.posTaint), 0, 0);
    window.document.head.appendChild(this.el);
    this.createStyle();
  }
  move(){
    let diff: Array<Array<number>> = new Array(this.colorTaint.length),
      pos = new Array(diff.length);

    for(let j = 0, t: Array<number>; t = this.colorTaint[j]; j++) {
      pos[j] = this.posTaint[j];

      this.posTaint[j] = [this.dta.width * Math.random(), this.dta.height * Math.random(), this.dta.width * (.5 - .5 * Math.random())];

      diff[j] = this.posTaint[j].map((v, i) => {
        return (pos[j][i] - v) / STEP;
      });
    }

    let i = STEP
    let animate = () => {
      if (i < 0) {
        return;
      }
      for(let j = 0, t: Array<number>; t = this.colorTaint[j]; j++) {
        for (let p = 0; p < 3; p ++){
          pos[j][p] = this.posTaint[j][p] + diff[j][p] * i;
        }
      }
      this.ctx.putImageData(this.createTaint(this.colorTaint, pos), 0, 0);
      this.createStyle();
      window.requestAnimationFrame(animate)
      i-=100;
    }
    animate();
  }
  createStyle() {
    let sheet = <CSSStyleSheet> this.el.sheet;
    while(sheet.rules.length){
      sheet.deleteRule(0);
    }
    sheet.insertRule('.' + this.name + ' {background-image:url("' + this.dataPNG + '")}')
  }
  createTaint(colorTaint: Array<Array<number>>, posTaint: Array<Array<number>>) : ImageData{

    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.dta = this.ctx.getImageData(0, 0 ,this.ctx.canvas.width,this.ctx.canvas.height);
    for(let j = 0, t: Array<number>; t = colorTaint[j]; j++) {
      let taint = posTaint[j];
      let colordiff = this.colorBase.map((v, i) => {
        return t[i] - v;
      });
      for(let i = 0; i < this.dta.data.length; i += 4) {
        let {x, y, c} = this.visit(i);
        let dr = 1 - Math.min(1, (Math.pow(taint[0] - x, 2) + Math.pow(taint[1] - y, 2)) / Math.pow(taint[2], 2));
        for (let c = 0; c < 4; c ++) {
          this.dta.data[c + i] += dr * colordiff[c];
        }
      }
    }
    return this.dta;
  }
  visit (idx: number) {
    let i = Math.floor(idx / 4),
    x = i % this.dta.width,
    y = (i - x) / this.dta.width,
    c = idx % 4;
    return {x, y, c};
  }
}
