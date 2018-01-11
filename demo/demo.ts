import {SVGChart} from '../src/eventsvg'
import {Chart} from '../src/chart'
import {Blackboard, Line} from '../src/watch'
import { Gen } from '../src/background';

let blackboard = new Blackboard
let chart = new Chart(blackboard);
let plot = new SVGChart();
(global => {
  global.blackboard = blackboard;
  global.chart = chart;
  global.Gen = Gen;
  global.plot = plot;
})(window as any)

