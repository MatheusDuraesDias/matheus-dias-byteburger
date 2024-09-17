let orderItems = [];

var waitTime = 0
var waitTimeWithPriority = 0

let waitTimes = {
        'Callback Burguer': 13,
        'Null-Burguer': 13,
        'Mongo Melt': 4,
        'Crispy Turing': 13,
        'Webwrap': 6,
        'NPM Nuggets': 4,
        'Float Juice': 7,
        'Array Apple': 7,
        'Async Berry': 4
}

let waitTimesPriority = {
        'Callback Burguer': 10,
        'Null-Burguer': 10,
        'Mongo Melt': 2,
        'Crispy Turing': 10,
        'Webwrap': 2,
        'NPM Nuggets': 3,
        'Float Juice': 5,
        'Array Apple': 5,
        'Async Berry': 2
}

function addItem(itemName) {
    orderItems.push(itemName);
    updateOrderList();
}

function clearOrder() {
    orderItems = [];
    updateOrderList();
    waitTime = 0
    waitTimeWithPriority = 0
    estimatedTime.innerText = `Tempo estimado: 0m 0s`
    estimatedTimePriority.innerText = `Tempo estimado com prioridade: 0m 0s`
}

function updateOrderList() {
    const orderList = document.getElementById('orderItems');
    const estimatedTime = document.getElementById('estimatedTime');
    const estimatedTimePriority = document.getElementById('estimatedTimePriority');
    orderList.innerHTML = '';
    orderItems.forEach((item) => {
        waitTime += waitTimes[item]
        waitTimeWithPriority += waitTimesPriority[item]
        waitTime
        const li = document.createElement('li');
        li.textContent = `${item}`;
        orderList.appendChild(li);
    });
    
    estimatedTime.innerText = `Tempo estimado: ${Math.floor(waitTime/60)}m ${waitTime%60}s`
    estimatedTimePriority.innerText = `Tempo estimado com prioridade: ${Math.floor(waitTimeWithPriority/60)}m ${waitTimeWithPriority%60}s`
}

function submitOrder(isPriority) {
    if (orderItems.length === 0) return;
    priority=""
    if (isPriority == true){
        priority = "Prioritário"
    }

    const orderId = Date.now();
    const orderList = document.getElementById('orderList');
    const li = document.createElement('li');
    li.id = `order-${orderId}`;
    li.innerHTML = `
        Pedido #${orderId} (${orderItems.join(', ')}) ${priority}
        <span class="status">Preparando</span>
        <button onclick="cancelOrder(${orderId})">Cancelar Pedido</button>
    `;
    orderList.appendChild(li);

    processOrder(orderId, orderItems, isPriority);
    clearOrder();
}

function processOrder(orderId, items, isPriority) {
    const workers = {
        cortar: new Worker('workerCortar.js'),
        grelhar: new Worker('workerGrelhar.js'),
        montar: new Worker('workerMontar.js'),
        bebidas: new Worker('workerBebidas.js')
    };

    let completedSteps = 0;
    let totalSteps = 0; 
    let stepQueue = [];

    items.forEach(item => {
        const steps = getProcessSteps(item, isPriority);
        totalSteps += steps.length;
        steps.forEach(step => {
            stepQueue.push({ item, ...step });
        });
    });

    function processNextStep() {
        if (stepQueue.length > 0) {
            const { item, worker, time } = stepQueue.shift();
            workers[worker].postMessage({ orderId, item, time });
            workers[worker].onmessage = function() {
                completedSteps++;
                processNextStep();
            };
        } else {
            updateStatus();
        }
    }

    function getProcessSteps(itemName, isPriority) {
        const steps = {
            'Callback Burguer': [
                { worker: 'cortar', time: 3000 },
                { worker: 'grelhar', time: 8000 },
                { worker: 'montar', time: 2000 }
            ],
            'Null-Burguer': [
                { worker: 'cortar', time: 4000 },
                { worker: 'grelhar', time: 7000 },
                { worker: 'montar', time: 2000 }
            ],
            'Mongo Melt': [
                { worker: 'cortar', time: 1000 },
                { worker: 'grelhar', time: 3000 }
            ],
            'Crispy Turing': [
                { worker: 'cortar', time: 2000 },
                { worker: 'grelhar', time: 10000 },
                { worker: 'montar', time: 1000 }
            ],
            'Webwrap': [
                { worker: 'cortar', time: 4000 },
                { worker: 'montar', time: 2000 }
            ],
            'NPM Nuggets': [
                { worker: 'grelhar', time: 4000 }
            ],
            'Float Juice': [
                { worker: 'cortar', time: 4000 },
                { worker: 'bebidas', time: 3000 }
            ],
            'Array Apple': [
                { worker: 'cortar', time: 4000 },
                { worker: 'bebidas', time: 3000 }
            ],
            'Async Berry': [
                { worker: 'cortar', time: 2000 },
                { worker: 'bebidas', time: 2000 }
            ]
        }[itemName] || [];

        if (isPriority && steps.length > 0) {
            steps[0].time = Math.max(steps[0].time - 1000, 0);
            if (steps[1]){
                steps[1].time = Math.max(steps[1].time - 1000, 0);
            }
            if (steps[2]){
                steps[2].time = Math.max(steps[2].time - 1000, 0);
            }
        }

        return steps;
    }

    function updateStatus() {
        const status = completedSteps >= totalSteps ? 'Finalizado' : 'Preparando';
        document.querySelector(`#order-${orderId} .status`).textContent = status;
    }

    processNextStep();
}

function cancelOrder(orderId) {
    console.log("uwaaaaaa")
    console.log(orderId)
    document.getElementById(`order-${orderId}`).remove();
}
