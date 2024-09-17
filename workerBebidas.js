self.onmessage = function(e) {
    console.log("teste bebida")
    console.log(e.data.orderId)
    const { orderId, item, time } = e.data;
    setTimeout(() => {
        postMessage({ orderId, item, status: 'completed' });
    }, time);
};
