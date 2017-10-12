// ==UserScript==
// @name        PoloniexMarketPower
// @namespace   BryanPakulski@outlook.com
// @description Shows a rough % of the buying power of the bullish/bearish side with total BTC spent and the shift in market favour
// @include     https://poloniex.com/exchange*
// @version     1
// @grant       none
// @require     https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.bundle.js
// ==/UserScript==

var ticker = 2500; // Time in seconds before updating the chart, defaults to 2.5
var currentdate = new Date();

// So many variables...
var bullO = 0;
var bullP = 0;
var bullM = 0;
var bearO = 0;
var bearP = 0;
var bearM = 0;
var lastbuy = 0;
unsafeWindow.pmp_order_size = 100;

// Returns time
function getTime()
{
	currentdate = new Date();

	var time = currentdate.getHours() + ":" +
        currentdate.getMinutes() + ":" +
        currentdate.getSeconds();

    return time;
}

// Adds data to chart
function addData(chart, label, data1, data2, data3, data4) {

  chart.data.datasets[0].data.push(data1);
  chart.data.datasets[1].data.push(data2);
  chart.data.datasets[2].data.push(data3);
  chart.data.datasets[3].data.push(data4);

  // Manage array size to be under order_size data points
  if (chart.data.datasets[0].data.length > unsafeWindow.pmp_order_size)
  {
    for (i = 0; i < chart.data.datasets[0].data.length - unsafeWindow.pmp_order_size; i++)
      {
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
        chart.data.datasets[2].data.shift();
        chart.data.datasets[3].data.shift();
        chart.data.labels.shift();
      }
  }

  chart.data.labels.push(label);

  chart.update();
}

// Create the watcher
var watcher = document.createElement("div");
watcher.className = "Market_Watcher mainBox";

// CSS of watcher
var css = "float: left;"+
    "width: 100%;"+
    "margin-bottom: 10px;";

watcher.style.cssText = css;

// Children elements //
// Title
var head = document.createElement("div");
head.className = "head";
var title = document.createElement("div");
title.className = "name";
title.innerHTML = "Market Weight (Last <foofa id='order_size'>" + unsafeWindow.pmp_order_size + "</foofa> Orders)" + "<button onclick=\"pmp_order_size += 10; document.getElementById('order_size').innerHTML=pmp_order_size;\"'>+</button>/<button onclick=\"pmp_order_size -= 10; document.getElementById('order_size').innerHTML=pmp_order_size;\">-</button>";

// Main body
var body = document.createElement("div");
body.innerHTML = "<table id='market_weighting_table' class='dataTable no-footer' role='grid' style='width: 100%;'>" +
  "<tr>"+
  "<th>Bull Orders</th>"+
  "<th>Bull %</th>"+
  "<th>Bull Market Share</th>"+
  "<th>Bear Orders</th>"+
  "<th>Bear %</th>"+
  "<th>Bear Market Share</th>"+
  "</tr>"+
  "<tr style='text-align: center;'>"+
  "<td id='a1'>-</td>"+
  "<td id='a2' class='buyClass'>-</td>"+
  "<td id='a3'>-</td>"+
  "<td id='b1'>-</td>"+
  "<td id='b2' class='sellClass'>-</td>"+
  "<td id='b3'>-</td>"+
  "</tr>"+
  "</table>";

// Chart
var chart = document.createElement("canvas");
chart.id = "market_weight_chart";
chart.height = "200";
chart.width = "1231";

// Append children
head.appendChild(title);
watcher.appendChild(head);
watcher.appendChild(body);
watcher.appendChild(chart);

// Location to insert watcher
var location = document.getElementsByClassName("marketDepth")[0];
location.parentNode.insertBefore(watcher, location.nextSibling);

// Chart for graphing data
var ctx = document.getElementById("market_weight_chart").getContext('2d');
var mixedChart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [{
          label: 'Buying Power',
          data: [],
          borderColor: "#27892f",
          backgroundColor: "rgba(39, 137, 47, 0.3)",
          pointBorderWidth: 1,
          pointRadius: 1,
          yAxisId: '1'
        }, {
          label: 'Selling Power',
          data: [],
          borderColor: "#b72219",
          backgroundColor: "rgba(183, 34, 25, 0.3)",
          pointBorderWidth: 1,
          pointRadius: 1,
          yAxisId: '1'
        }, {
          label: 'Market Share',
          data: [],
          borderColor: "#aaaa2f",
          backgroundColor: "rgba(170, 170, 47, 0.3)",
          pointBorderWidth: 1,
          pointRadius: 1,
          lineTension: 1,
          yAxisId: '1'
        }, {
          label: 'Price',
          data: [],
          borderColor: "#004f89",
          backgroundColor: "rgba(0, 79, 137, 0.3)",
          pointBorderWidth: 1,
          pointRadius: 1,
          lineTension: 1,
          yAxisId: '2'
        }],
    labels: []
  },
  options: [{
  	scales: {
            xAxes: [{
                afterTickToLabelConversion: function(data){


                    var xLabels = data.ticks;

                    xLabels.forEach(function (labels, i) {
                        if (i % 2 == 1){
                            xLabels[i] = '';
                        }
                    });
                }
            }],
            yAxes: [{
		        id: '1',
		        type: 'linear',
		        position: 'left',
		      }, {
		        id: '2',
		        type: 'linear',
		        position: 'right',
		      }]

        }
  }]
});

// Fields to update
a1 = document.getElementById('a1');
a2 = document.getElementById('a2');
a3 = document.getElementById('a3');
b1 = document.getElementById('b1');
b2 = document.getElementById('b2');
b3 = document.getElementById('b3');

// Update function
window.setInterval(function(){

  // Update graph with buying power, total owned market share and the price per coin
  if (bullO != 0){
  	addData(mixedChart, getTime(), bullP, -bearP, bullM, lastbuy);
  }

  bullO = 0;
  bullP = 0;
  bullM = 0;
  bearO = 0;
  bearP = 0;
  bearM = 0;

  // Update tables
  $("#tradeHistoryTable tbody tr").each(function(){
    if (this.cells[1].innerHTML.indexOf("Buy") == -1){
      bearO += 1;
      bearM += parseFloat(this.cells[4].innerHTML);
    }
    else
    {
      bullO += 1;
      bullM += parseFloat(this.cells[4].innerHTML);
    }
    // Keep track of current price
    if (bearO <= 1)
    {
    	lastbuy = parseFloat(this.cells[2].innerHTML);
    }
  });

  var total = bullM + bearM;

  bullP = (bullM / total) * 100;
  bearP = (bearM / total) * 100;

  // Push data into the table fields
  a1.innerHTML = bullO;
  a2.innerHTML = bullP.toFixed(8) + "%";
  a3.innerHTML = bullM.toFixed(8) + " BTC";
  b1.innerHTML = bearO;
  b2.innerHTML = bearP.toFixed(8) + "%";
  b3.innerHTML = bearM.toFixed(8) + " BTC";

}, ticker);
