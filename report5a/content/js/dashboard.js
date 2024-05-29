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

    var data = {"OkPercent": 97.16283829884011, "KoPercent": 2.8371617011598818};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9650614055037525, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.992779251399941, 500, 1500, "Delete character"], "isController": false}, {"data": [0.9905633194064256, 500, 1500, "Get hero by id"], "isController": false}, {"data": [0.9926868509580226, 500, 1500, "Update character"], "isController": false}, {"data": [0.8673258368876826, 500, 1500, "Get all heroes"], "isController": false}, {"data": [0.9944727272727273, 500, 1500, "Create character"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 35176, 998, 2.8371617011598818, 864.7501705708455, 0, 31625, 187.0, 232.0, 366.0, 30554.0, 1093.6790722258495, 450.52405180253714, 192.20931879216803], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete character", 6786, 49, 0.7220748600058945, 151.9740642499266, 2, 413, 158.0, 208.0, 220.0, 296.2600000000002, 211.9896285651807, 55.1657901775952, 43.77709639850364], "isController": false}, {"data": ["Get hero by id", 6941, 65, 0.936464486385247, 155.26221005618848, 0, 620, 159.0, 211.0, 232.0, 359.0, 216.2911719796828, 54.45162901008071, 26.57396641581752], "isController": false}, {"data": ["Update character", 6837, 50, 0.7313149041977476, 151.54497586660804, 2, 414, 158.0, 208.0, 219.0, 297.6199999999999, 213.36953468776332, 52.675646543316795, 47.98800635084106], "isController": false}, {"data": ["Get all heroes", 7737, 796, 10.288225410365774, 3390.5600361897323, 3, 31625, 165.0, 23662.399999999954, 30144.499999999996, 31019.539999999997, 240.5559182912042, 236.94670870837612, 26.56967779358269], "isController": false}, {"data": ["Create character", 6875, 38, 0.5527272727272727, 151.36072727272685, 5, 425, 158.0, 207.0, 218.0, 291.9599999999991, 214.27458313853825, 51.98949689301854, 47.86206317204301], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 30,172 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 0.10020040080160321, 0.002842847395951785], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 994, 99.59919839679358, 2.8257903115760747], "isController": false}, {"data": ["The operation lasted too long: It took 31,475 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 0.10020040080160321, 0.002842847395951785], "isController": false}, {"data": ["The operation lasted too long: It took 30,582 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 0.10020040080160321, 0.002842847395951785], "isController": false}, {"data": ["The operation lasted too long: It took 30,898 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 0.10020040080160321, 0.002842847395951785], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 35176, 998, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 994, "The operation lasted too long: It took 30,172 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 31,475 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 30,582 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 30,898 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Delete character", 6786, 49, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 49, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get hero by id", 6941, 65, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 65, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update character", 6837, 50, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 50, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get all heroes", 7737, 796, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 792, "The operation lasted too long: It took 30,172 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 31,475 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 30,582 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 30,898 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1], "isController": false}, {"data": ["Create character", 6875, 38, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 38, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
