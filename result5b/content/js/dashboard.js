/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 91.08498815611786, "KoPercent": 8.915011843882137};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9056142215138031, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9949847094801223, 500, 1500, "Delete character"], "isController": false}, {"data": [0.9929763477008045, 500, 1500, "Get hero by id"], "isController": false}, {"data": [0.9962250365319045, 500, 1500, "Update character"], "isController": false}, {"data": [0.6649983590416804, 500, 1500, "Get all heroes"], "isController": false}, {"data": [0.9939518567799686, 500, 1500, "Create character"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 45171, 4027, 8.915011843882137, 2221.5253149144364, 0, 51410, 102.5, 146.0, 31708.65000000002, 46451.990000000005, 862.0913411073153, 511.291777648291, 142.05375173554785], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete character", 8175, 41, 0.5015290519877675, 110.20171253822626, 0, 370, 112.0, 156.0, 174.0, 258.0, 156.5821984715279, 39.90717446944013, 32.40697096046659], "isController": false}, {"data": ["Get hero by id", 8329, 58, 0.6963621082963141, 112.11850162084284, 1, 521, 113.0, 159.0, 181.0, 271.0, 159.2634376732891, 39.18587511592443, 19.614850786134962], "isController": false}, {"data": ["Update character", 8212, 31, 0.377496346809547, 109.78287871407701, 3, 370, 112.0, 156.0, 173.0, 235.8699999999999, 157.17949699498527, 37.46728218428205, 35.47654964016384], "isController": false}, {"data": ["Get all heroes", 12188, 3847, 31.56383327863472, 7934.668034131933, 3, 51410, 134.0, 28647.100000000006, 38284.94999999998, 48036.19000000002, 232.6087371414394, 356.580771710451, 19.587647849590628], "isController": false}, {"data": ["Create character", 8267, 50, 0.604814322003145, 109.41272529333487, 2, 371, 112.0, 155.0, 173.0, 232.3199999999997, 158.12627914538743, 38.56199327312982, 35.30183497589947], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1, 0.024832381425378695, 0.0022138097451904985], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3828, 95.05835609634964, 8.474463704589228], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 197, 4.891979140799602, 0.4361205198025282], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.impl.execchain.RequestAbortedException/Non HTTP response message: Request aborted", 1, 0.024832381425378695, 0.0022138097451904985], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 45171, 4027, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3828, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 197, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1, "Non HTTP response code: org.apache.http.impl.execchain.RequestAbortedException/Non HTTP response message: Request aborted", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Delete character", 8175, 41, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 40, "Non HTTP response code: org.apache.http.impl.execchain.RequestAbortedException/Non HTTP response message: Request aborted", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get hero by id", 8329, 58, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 58, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update character", 8212, 31, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 30, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get all heroes", 12188, 3847, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3650, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 197, "", "", "", "", "", ""], "isController": false}, {"data": ["Create character", 8267, 50, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 50, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
