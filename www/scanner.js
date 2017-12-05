var ctx = document.getElementById('myChart').getContext('2d');
var options = {
    pointStyle: 'rectRounded',
    showLines: false,
    legend: {
        labels: {
            usePointStyle: true,
        },
    },
    scales: {
        xAxes: [{
            gridLines: {
                display: false,
                drawBorder: true
            }
        }],
        yAxes: [{
            gridLines: {
                display: false,
                drawBorder: true
            },
            ticks: {
                min: 0,
                max: 20,
                stepSize: 5
            }
        }]
    },
    animation: {
        duration: 1,
        onComplete: function () {
            var chartInstance = this.chart,
                ctx = chartInstance.ctx;
            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            this.data.datasets.forEach(function (dataset, i) {
                var meta = chartInstance.controller.getDatasetMeta(i);
                meta.data.forEach(function (bar, index) {
                    var data = dataset.device[index] + '(' + dataset.data[index] + ' m.)';
                    ctx.fillText(data, bar._model.x, bar._model.y - 5);
                });
            });
        }
    }
};
var data = {
    labels:[''],
    datasets: [{
        label: 'BLE Devices',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [0],
        device:['d1']
    }]
}

var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: data,

    // Configuration options go here
    options: options
});

function addData(chart, device, data) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
        dataset.device.push(device);
    });
    chart.update();
}

function removeData(chart) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
        dataset.device.pop();
    });
    chart.update();
}

const APPID = 'AssetTracking';
const APPKEY = 'MXZgP4t5lKZFEXK';
const APPSECRET = 'J11b9LQXZwAlHuoFotDnIQmw5';

var microgear = Microgear.create({
    key: APPKEY,
    secret: APPSECRET,
    alias: "webscanner"
});

microgear.on('message', function (topic, msg) {
    console.log(msg);
    var info = msg.split(',');
    removeData(chart);
    addData(chart, info[0].substr(info[0].length - 5), info[1]);
    chart.update();
});

microgear.on('connected', function () {
    microgear.setAlias('webscanner');    /* alias can be renamed anytime with this function */
    console.log('Connected with netpie');
    microgear.subscribe('/device/#');
});

microgear.connect(APPID);

