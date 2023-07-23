app.factory('returnFactory', function($http, NotificationService, rateFactory, euroFactory,stockFactory, customersFactory, debtsFactory) {

    let url = 'http://localhost:3000';

    const model = {};
    model.recentItems = new BehaviorSubject([])
    model.returnInvoice = new BehaviorSubject([])
    model.selectedCustomer = new BehaviorSubject(null)

    rateFactory.exchangeRate.subscribe(res => {
        model.exchangeRate = res;
    });
    euroFactory.euroRate.subscribe(res => {
        model.euroRate = res;
    })

    // calculate total for return invoice
    model.total = function () {
        let invoice;
        this.returnInvoice.subscribe(res => {
            invoice = res;
        })
        return invoice.reduce(function (memo, item) { // memo is the reduced value initialized by object of zero values
            return {
                totalCost: memo.totalCost + (item.qty * item.unit_cost),
                totalPrice: memo.totalPrice + (item.qty * item.discounted_price)
            };
        }, {
            totalCost: 0,
            totalPrice: 0
        });
    };

    // get selected customer's recent purchased items
    model.getRecentItems = ID => {
        $http.get(`${url}/getRecentItems/${ID}`).then(response => {
            model.recentItems.next(response.data);
        }, error => {
            NotificationService.showError(error);
        })
    }

    // checkout
    model.checkout = (data) => {
        let customerID;
        if (model.selectedCustomer.value) {
            customerID = model.selectedCustomer.value.customer_ID;
        } else {
            customerID = null
        }
        let invoice = {
            user_ID_FK: JSON.parse(localStorage.getItem('setting')).user_ID,
            customer_ID_FK: customerID,
            invoice_type: 'Return',
            total_cost: model.total().totalCost,
            total_price: model.total().totalPrice,
            exchange_rate: model.exchangeRate.rate_value,
            euro_rate: model.euroRate.rate_value,
            invoice_isCompleted: true
        }
        return $http.post(`${url}/checkoutReturn`, {
            items: data,
            invoice: invoice
        }).then(response => {
            NotificationService.showSuccess();
            stockFactory.fetchItems();
            // update models
            model.selectedCustomer.next(null)
            customersFactory.fetchCustomers()
            console.log('called');
            debtsFactory.getCustomerHistory(debtsFactory.selectedCustomer)
            
            return 'success';
        }, error => {
            NotificationService.showErrorText(error);
        })
    }

    // clear invoice
    model.clearInvoice = function () {
        model.returnInvoice.next([])
    };

    return model;
})