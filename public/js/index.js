document.getElementById('syncRange').addEventListener('change', () => {
    this.document.getElementById('syncLbl').innerHTML = this.document.getElementById('syncRange').value
})

window.onload = () => {
    document.querySelectorAll("#att").forEach(function (item, i) {
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

document.getElementById('getBtn').addEventListener("click", function () {
    const svgContent = document.getElementById("scheme").contentDocument;
    fetch('/get', { method: 'GET' }).then(function (res) {
        return res.json()
    }).then(function (data) {
        const jsonData = JSON.parse(data);
        jsonData.data.forEach(function (item, i) {
            document.getElementById("att" + i).value = item;
            document.getElementById("lbl" + i).value = item;
            svgContent.getElementById(`el${i}`).innerHTML = `${item} db`
        }, this);
        jsonData.status.forEach(function (item, i) {
            document.querySelectorAll('input[type=checkbox]')[i].checked = item;
        });
        document.getElementById('syncRange').value = jsonData.syncRange;
        document.getElementById('syncRangeLbl').value = jsonData.syncRange;
        svgContent.getElementById("main").style.stroke = "rgb(150,150,150)"
        svgContent.getElementById("lp").style.stroke = "rgb(150,150,150)"
        svgContent.getElementById("rp").style.stroke = "rgb(150,150,150)"
        for (let i = 0; i < 11; i++) {
            svgContent.getElementById("att" + i).style.stroke = "#0f0";
        }
        if (jsonData.status[3]) { // если включена правая поляризация антенны
            svgContent.getElementById("rp").style.stroke = "#0f0"
            svgContent.getElementById("lp").style.stroke = "rgb(150,150,150)"
            
        } else { // если включена левая поляризация антенны
            svgContent.getElementById("lp").style.stroke = "#0f0"
            svgContent.getElementById("rp").style.stroke = "rgb(150,150,150)"
        }
        if (jsonData.status[0]) { // если включен ГШ 
            svgContent.getElementById("ng").style.stroke = "#e5f442";
            for (let i = 0; i < 11; i++) {
                svgContent.getElementById("att" + i).style.stroke = "#e5f442";
            }
            if (jsonData.status[1]) { // если включена первая правая поляризация
                svgContent.getElementById("rNg").style.stroke = "#e5f442"
                svgContent.getElementById("lNg").style.stroke = "rgb(150,150,150)"
                for (let i = 0; i < 11; i++) {
                    svgContent.getElementById("att" + i).style.stroke = "#0f0";
                }
            } else { // если включена первая левая поляризация
                svgContent.getElementById("lNg").style.stroke = "#e5f442"
                svgContent.getElementById("rNg").style.stroke = "rgb(150,150,150)"
                for (let i = 0; i < 11; i++) {
                    svgContent.getElementById("att" + i).style.stroke = "#0f0";
                }
            }
        }
        else {
            svgContent.getElementById("ng").style.stroke = "rgb(150,150,150)";
            svgContent.getElementById("rNg").style.stroke = "rgb(150,150,150)";
            svgContent.getElementById("lNg").style.stroke = "rgb(150,150,150)";
        }
        if (jsonData.status[2]) { // если включена модуляция
            svgContent.getElementById("md").style.stroke = "#e5f442"
            svgContent.getElementById("rp").style.stroke = "#e5f442"
            svgContent.getElementById("lp").style.stroke = "#e5f442"
            for (let i = 0; i < 11; i++) {
                svgContent.getElementById("att" + i).style.stroke = "#e5f442";
            }
        } else {
            svgContent.getElementById("md").style.stroke = "rgb(150,150,150)"
        }

        let text = svgContent.getElementsByTagName("text")
        for (let i = 0; i < text.length; i++) {
            text[i].style.stroke = "#000"
        }
    })
});
document.getElementById('sendBtn').addEventListener("click", function () {
    data = []
    document.querySelectorAll('[id*=att]').forEach(function (item, i) {
        data.push(item.value);
    });
    document.querySelectorAll('input[type=checkbox]').forEach(function (item, i) {
        data.push(item.checked);
    });
    data.push(document.getElementById('syncRange').value);
    fetch('/send', { method: 'POST', headers: { "Content-Type": "application/json;charset=UTF-8" }, body: JSON.stringify({ data: data }) })
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
    if (document.getElementById("channelsOk").innerHTML == "Start") {
        document.getElementById("channelsOk").innerHTML = "Stop"
        fetch("/openConnection", {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                channels: document.getElementById("channels").value.split(";"),
                maxX: parseInt(document.getElementById('maxX').value)
            })
        })
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
    }
    else {
        socket.disconnect()
        document.getElementById("channelsOk").innerHTML = "Start"
    }

}, false);


document.getElementById('logout').addEventListener('click', () => {
    fetch('/logout', { method: 'GET', credentials: 'include', redirect: 'follow' })
    location.reload()
})
