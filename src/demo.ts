import {SVGChart} from './drawsvg'
import {Chart} from './chart'
import {Blackboard, Line} from './watch'
import { Gen } from './background';
let blackboard = new Blackboard
let chart = new Chart(blackboard);
let plot = new SVGChart();
(global => {
  global.blackboard = blackboard;
  global.chart = chart;
  global.Gen = Gen;
  global.plot = plot;
})(window as any)

