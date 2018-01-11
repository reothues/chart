"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventsvg_1 = require("../src/eventsvg");
const chart_1 = require("../src/chart");
const watch_1 = require("../src/watch");
const background_1 = require("../src/background");
let blackboard = new watch_1.Blackboard;
let chart = new chart_1.Chart(blackboard);
let plot = new eventsvg_1.SVGChart();
(global => {
    global.blackboard = blackboard;
    global.chart = chart;
    global.Gen = background_1.Gen;
    global.plot = plot;
})(window);
//# sourceMappingURL=demo.js.map