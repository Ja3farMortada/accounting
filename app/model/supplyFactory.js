app.factory('supplyFactory', function ($http, NotificationService, rateFactory, euroFactory, mainFactory, DateService, stockFactory) {

    // define URL
    const url = `http://localhost:3000`;


    var model = {};
    model.invoice = new BehaviorSubject([]);
    rateFactory.exchangeRate.subscribe(res => {
        model.exchangeRate = res;
    });
    euroFactory.euroRate.subscribe(res => {
        model.euroRate = res;
    })
    mainFactory.loggedInUser.subscribe(res => {
        model.loggedInUser = res;
    })

    // calculate total
    model.total = function () {
        let invoice;
        this.invoice.subscribe(res => {
            invoice = res;
        })
        return invoice.reduce(function (memo, item) { // memo is the reduced value initialized by object of zero values
            return {
                totalCost: memo.totalCost + (item.qty * item.item_cost),
                // totalPrice: memo.totalPrice + (item.qty * item.discounted_price)
            };
        }, {
            totalCost: 0
            // totalPrice: 0
        });
    };

    // clear invoice
    model.clearInvoice = function () {
        model.invoice.next([])
    };

    // checkout
    model.checkout = (id, data) => {
        let invoice = {
            user_ID_FK: model.loggedInUser.user_ID,
            supplier_ID_FK: parseInt(id),
            total_cost: model.total().totalCost,
            invoice_type: 'Supply',
            euro_exchange: model.euroRate.rate_value,
            dollar_exchange: model.exchangeRate.rate_value
        }
        return $http.post(`${url}/supplyCheckout`, {
            items: data,
            invoice: invoice
        }).then(async response => {
            model.clearInvoice();
            NotificationService.showSuccess();
            stockFactory.fetchItems();
        }, error => {
            console.log(error);
            NotificationService.showError(error);
        })
    }

    return model;
})