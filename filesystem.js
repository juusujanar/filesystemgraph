/*
    Filesystem graph visualizing algorithm with Google Charts for graphing

    Copyright (C) 2016  Janar Juusu

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

google.charts.load('current', {
    'packages': ['table']
});
google.charts.setOnLoadCallback(drawTable);

function process(data) {
    var output          = [];
    var disk            = [];
    var usedSpace       = 0;
    var counter         = 1;
    var files           = {}; // all files
    var breakout        = false;

    for (var i = 0; i < 50; i++) {
        disk.push('');
    }

    data.forEach(function(entry) {
        var file = entry.split(',');

        if (file[1] === '-') { // file deletion
            for (var i = 0; i < 50; i++) {
                if (disk[i] === file[0]) {
                    disk[i] = '';
                    usedSpace--;
                }
            }
            delete files[file[0]];
        }

        else { // file creation
            files[file[0]] = {size: file[1], fragmented: false};

            /* Variable to save state: First block was saved.
             * Used for detecting fragmentation by checking
             * if a block is skipped after saving at least one block
             */
            var started = false;

            for (var a = 0; a < 50; a++) {
                if (disk[a] === '') {
                    disk[a] = file[0];
                    file[1]--;
                    usedSpace++;
                    started = true;
                } else if (started) {
                    files[file[0]].fragmented = true;
                }

                if (file[1] === 0) {
                    break;
                }
            }

            if (file[1] !== 0) { // If file can't fit
                breakout = true;
                return;
            }
        }

        output.push([counter.toString(), entry.toString()].concat(disk));
        counter++;
    });

    if (breakout) {
        document.getElementById('frag').innerHTML = 'Not enough space, job cancelled.';
        return output;
    }

    // Fragmentation calculation
    var fragmentedFiles         = 0;
    var fragmentedFilesSpace    = 0;
    var size                    = Object.keys(files).length;

    for (var key in files) {
        if (files[key].fragmented === true) {
            fragmentedFiles++;
            fragmentedFilesSpace += parseInt(files[key].size);
        }
    }

    document.getElementById('fragFiles').innerHTML = ((fragmentedFiles / size) * 100).toFixed(2);
    document.getElementById('fragSpace').innerHTML = ((fragmentedFilesSpace / usedSpace) * 100).toFixed(2);
    return output;
}

function drawTable() {
    var choice = document.getElementById('form').choice.value;
    var data = '';

    switch (choice) {
        case 'default1':
            data = 'A,2;B,3;A,-;C,4;D,5;B,-;E,15';
            break;
        case 'default2':
            data = 'A,4;B,3;C,6;D,5;B,-;E,5;A,-;F,10';
            break;
        case 'default3':
            data = 'A,2;B,3;C,4;D,5;B,-;E,7;D,-;F,10;A,-;G,1;H,1;G,-;I,10;J,8;I,-';
            break;
        default:
            data = form.custom.value;
    }

    var graphData = process(data.split(';'));

    document.getElementById('table').innerHTML = '';

    // Below is table creation and customization

    var table = new google.visualization.Table(document.getElementById('table'));
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Step');
    dataTable.addColumn('string', 'Operation');

    for (var i = 0; i < 50; i++) {
        dataTable.addColumn('string', i.toString());
    }
    dataTable.addRows(graphData);

    var formatter = new google.visualization.ColorFormat();
    formatter.addRange('A', 'Z', 'black', 'lightgreen');
    for (var x = 0; x < 50; x++) {
        formatter.format(dataTable, x + 2);
    }

    table.draw(dataTable, {
        allowHtml: true,
        sort: 'disable'
    });
}
