document.getElementById('syncRange').addEventListener('change', () => {
    this.document.getElementById('syncLbl').innerHTML = this.document.getElementById('syncRange').value
})

window.onload = () => {
    document.querySelectorAll("#att").forEach(function(item, i) {
        document.querySelectorAll("#lbl")[i].value = item.value
    })
}

window.onunload = () => {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", '/logout', false)
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                window.location = '/'
            }
        }
    }
    xhr.send()
    if (socket) socket.disconnect()
}
function sortOnKeys(dict) {

    var sorted = [];
    for (var key in dict) {
        sorted[sorted.length] = key;
    }
    sorted.sort();

    var tempDict = {};
    for (var i = 0; i < sorted.length; i++) {
        tempDict[sorted[i]] = dict[sorted[i]];
    }

    return tempDict;
}

let socket = null;

function getJSON(url, success, error) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                success(JSON.parse(xhr.responseText));
            } else {
                error(xhr.responseText);
            }
        }
    }
    xhr.open('GET', url);
    xhr.send();
};

document.getElementById('getBtn').addEventListener("click", function () {
    getJSON('/get', function (data) {
        JSON.parse(data).data.forEach(function (item, i) {
            document.getElementById("att" + i).value = item;
            document.getElementById("lbl" + i).value = item;
        }, this);
        JSON.parse(data).status.forEach(function (item, i) {
            document.querySelectorAll('input[type=checkbox]')[i].checked = item;
        });
        document.getElementById('syncRange').value = JSON.parse(data).syncRange;
        document.getElementById('syncRangeLbl').value = JSON.parse(data).syncRange
    });
});
document.getElementById('sendBtn').addEventListener("click", function () {
    const xhr = new XMLHttpRequest();
    data = []
    document.querySelectorAll('[id*=att]').forEach(function (item, i) {
        data.push(item.value);
    });
    document.querySelectorAll('input[type=checkbox]').forEach(function (item, i) {
        data.push(item.checked);
    });
    data.push(document.getElementById('syncRange').value);
    xhr.open("POST", '/send', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({ data: data }));
});
function delChannel(e) {
    document.getElementById("item" + e.id).remove();
    document.querySelector('option[value=' + "'" + e.id + "'" + ']').selected = false;
}
function randomColorGenerator() {
    return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
};

const initChart = (ctx, maxX) => {
    const chart = new Chart(ctx, {
        width: ctx.width,
        height: ctx.height,
        type: 'line',
        data: {
            labels: Array.apply(null, { length: maxX }).map(Number.call, Number),
            datasets: [],
        },

        options: {
            responsive: false,
            maintainAspectRatio: false,
            animation: false,
            elements: {
                point: {
                    radius: 0
                }
            },

            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 80,
                    fontColor: 'black',
                    padding: 20
                }
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Seconds',
                        fontSize: 20
                    },
                    ticks: {
                        autoSkip: true,
                    }


                }],
                yAxes: [{
                    stacked: false,
                    scaleLabel: {
                        display: true,
                        labelString: 'ADC noise, K',
                        fontSize: 20
                    }
                }]
            }
        }

    });
    return chart
}
window.onresize = () => {
    const ctx = document.getElementById("chart");
    if (window.innerWidth <= 600) {
        ctx.width = window.innerWidth * 0.95
    } else {
        ctx.width = window.innerWidth * 0.58;
    }
    ctx.height = window.innerHeight * 0.65;
}


document.getElementById("channelsOk").addEventListener("click", function (e) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {

            } else {
                console.log(JSON.parse(xhr.responseText))
            }
        }
    }

    xhr.open("POST", '/openConnection', true)
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        channels: document.getElementById("channels").value.split(";"),
        maxX: parseInt(document.getElementById('maxX').value)
    }));
    // if (chart) chart.destroy()
    const ctx = document.getElementById("chart").getContext("2d")
    chart = initChart(ctx, parseInt(document.getElementById('maxX').value))
    document.getElementById("channels").value.split(";").forEach(channel => {
        chart.data.datasets.push({
            label: 'Channel ' + channel,
            fill: false,
            borderColor: randomColorGenerator(),
            data: [],
        });
    });
    socket = io.connect('http://localhost:3000');
    socket.on('connect', () => {
        let tick = 0;
        socket.on('message', (msg) => {
            msg.coords.forEach((coord, index) => {
                chart.data.datasets[index].data.push(coord);
                tick++;
                if (tick == 10) { 
                    tick = 0; 
                    chart.update(); 
                    if (chart.data.datasets[0].data.length >= parseInt(document.getElementById('maxX').value)) {
                        chart.data.labels.forEach((item, i) => { chart.data.labels[i] += 1 })                     
                    }
                }

            })
        })
    });
}, false);


document.getElementById('logout').addEventListener('click', () => {
    if (socket) socket.disconnect();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/logout');
    xhr.send();
    window.location = '/'
})
