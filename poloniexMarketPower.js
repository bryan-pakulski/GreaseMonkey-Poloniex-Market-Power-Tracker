// ==UserScript==
// @name        PoloniexMarketPower
// @namespace   BryanPakulski@outlook.com
// @description Shows a rough % of the buying power of the bullish/bearish side with total BTC spent and the shift in market favour
// @include     https://poloniex.com/exchange*
// @version     1
// @grant       none
// ==/UserScript==

var ticker = 2500; // Time in seconds before updating the chart, defaults to 2.5

// Create the watcher
var watcher = document.createElement("div");
watcher.className = "Market_Watcher mainBox"

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
title.innerHTML = "Market Weight (Last 200 Orders)";

// Main body
var body = document.createElement("div")
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
  "</table>"  

// Append children
head.appendChild(title);
watcher.appendChild(head);
watcher.appendChild(body);

// Location to insert watcher
var location = document.getElementsByClassName("marketDepth")[0];
location.parentNode.insertBefore(watcher, location.nextSibling);


// Fields to update
a1 = document.getElementById('a1');
a2 = document.getElementById('a2');
a3 = document.getElementById('a3');
b1 = document.getElementById('b1');
b2 = document.getElementById('b2');
b3 = document.getElementById('b3');

// Update function
window.setInterval(function(){

  // So many variables...
  var bullO = 0;
  var bullP = 0;
  var bullM = 0;
  var bearO = 0;
  var bearP = 0;
  var bearM = 0;

  
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