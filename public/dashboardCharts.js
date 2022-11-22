const dates = Array.from({ length: 31 }, (_, i) => i + 1);

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

async function fetchData(interval) {
    const response = await fetch(`/admin/get-data?interval=${interval}`);
    const data = await response.json();
    return data;
}

async function updateChart(value) {
    const data = await fetchData(value);
    numberOfDays = daysInMonth(value.split("-")[1], value.split("-")[0]);

    // update orders chart
    let ordersArr = [];
    for (let i = 1; i <= numberOfDays; i++) {
        var count = 0;
        for (var j = 0; j < data.orders.length; j++) {
            if (new Date(data.orders[j].orderDate.split("T")[0]).getDate() == i)
                count++;
        }
        ordersArr.push(count);
    }
    ordersChart.data.labels = dates.slice(0, numberOfDays);
    ordersChart.data.datasets[0].data = ordersArr;
    ordersChart.update();

    // update users chart
    let usersArr = [];
    for (let i = 1; i <= numberOfDays; i++) {
        var count = 0;
        for (var j = 0; j < data.users.length; j++) {
            if (new Date(data.users[j].date.split("T")[0]).getDate() == i)
                count++;
        }
        usersArr.push(count);
    }
    usersChart.data.labels = dates.slice(0, numberOfDays);
    usersChart.data.datasets[0].data = usersArr;
    usersChart.update();

    // update investments chart
    let investArr = [];
    for (let i = 1; i <= numberOfDays; i++) {
        var count = 0;
        for (var j = 0; j < data.orders.length; j++) {
            if (new Date(data.orders[j].orderDate.split("T")[0]).getDate() == i)
                count = count + data.orders[j].amount;
        }
        investArr.push(count);
    }
    investChart.data.labels = dates.slice(0, numberOfDays);
    investChart.data.datasets[0].data = investArr;
    investChart.update();

    // update investments chart
    let interestArr = [];
    for (let i = 1; i <= numberOfDays; i++) {
        var count = 0;
        let date = new Date(value.split("-")[0], value.split("-")[1] - 1, i);
        for (var j = 0; j < data.allOrders.length; j++) {
            let orderDate = new Date(data.allOrders[j].orderDate.split("T")[0]);
            let endDate = new Date(data.allOrders[j].endDate.split("T")[0]);
            // if is active today, count daily interest
            if (date > orderDate && date <= endDate) {
                let term = 0;
                while (date >= orderDate) {
                    orderDate = new Date(
                        orderDate.setMonth(orderDate.getMonth() + 12)
                    );
                    term++;
                }

                let start = data.allOrders[j].package.price;
                let annualReturn =
                    1 + data.allOrders[j].package.annualReturn / 100;
                for (let i = 0; i < term - 1; i++)
                    start = Math.round(annualReturn * start * 100) / 100;

                count += data.allOrders[j].package.dailyReturn / 100 * start;
            }
        }
        count = Math.round(count * 100) / 100;
        interestArr.push(count);
    }
    interestChart.data.labels = dates.slice(0, numberOfDays);
    interestChart.data.datasets[0].data = interestArr;
    interestChart.update();
}

const ordersData = {
    labels: dates,
    datasets: [
        {
            label: "orders",
            backgroundColor: "#0288d1",
            borderColor: "#0288d1",
            data: [],
        },
    ],
};
const ordersConfig = {
    type: "bar",
    data: ordersData,
    options: {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    },
};

const usersData = {
    labels: dates,
    datasets: [
        {
            label: "users",
            backgroundColor: "#ff5252",
            borderColor: "#ff5252",
            data: [],
        },
    ],
};
const usersConfig = {
    type: "bar",
    data: usersData,
    options: {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    },
};

const investData = {
    labels: dates,
    datasets: [
        {
            label: "Investments",
            backgroundColor: "#43a047",
            borderColor: "#43a047",
            data: [],
        },
    ],
};
const investConfig = {
    type: "bar",
    data: investData,
    options: {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    },
};

const interestData = {
    labels: dates,
    datasets: [
        {
            label: "Interests",
            fill: false,
            backgroundColor: "#ff6f00",
            borderColor: "#ff6f00",
            data: [],
        },
    ],
};
const interestConfig = {
    type: "line",
    data: interestData,
    options: {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    },
};

const ordersChart = new Chart(document.getElementById("orders"), ordersConfig);
const usersChart = new Chart(document.getElementById("users"), usersConfig);
const investChart = new Chart(
    document.getElementById("investments"),
    investConfig
);
const interestChart = new Chart(
    document.getElementById("interests"),
    interestConfig
);

window.onload = async () => {
    const value = document.getElementById("selectMonth").value;
    updateChart(value);
};

document
    .getElementById("selectMonth")
    .addEventListener("change", async event => {
        const value = event.target.value;
        updateChart(value);
    });
