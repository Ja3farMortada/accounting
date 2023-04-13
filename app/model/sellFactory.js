app.factory('sellFactory', function ($http, NotificationService, rateFactory, euroFactory, mainFactory, customersFactory, debtsFactory, DateService, stockFactory) {

    // define URL
    const url = `http://localhost:3000`;

    var model = {};
    model.selectedCategory = new BehaviorSubject({
        category_name: 'No Category Selected!'
    });
    model.invoice = new BehaviorSubject([]);
    // model.searchedInvoice = new BehaviorSubject();
    // model.searchedInvoiceMap = new BehaviorSubject();
    model.incompleteInvoice = new BehaviorSubject([]);
    model.invoicesOnHold = new BehaviorSubject([]);
    model.selectedInvoiceTab = new BehaviorSubject();
    model.selectedInvoice = new BehaviorSubject(null);
    // model.selectedTab = new BehaviorSubject(1);
    model.searchVal = new BehaviorSubject({
        category_ID_FK: null
    })
    rateFactory.exchangeRate.subscribe(res => {
        model.exchangeRate = res;
    });
    euroFactory.euroRate.subscribe(res => {
        model.euroRate = res;
    })
    mainFactory.loggedInUser.subscribe(res => {
        model.loggedInUser = res;
    })

    model.itemsToReturn = new BehaviorSubject([])


    // calculate total
    model.total = function () {
        let invoice;
        this.invoice.subscribe(res => {
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

    const getIncompleteInvoice = () => {
        $http.get(`${url}/getIncompleteInvoices`).then(response => {
            model.incompleteInvoice.next(response.data);
        }, error => {
            NotificationService.showError(error);
        })
    }
    getIncompleteInvoice();

    // get incompleted invoices
    model.fetchIncompleteInvoice = () => {
        $http.get(`${url}/getIncompleteInvoices`).then(response => {
            model.incompleteInvoice.next(response.data);
        }, error => {
            NotificationService.showError(error);
        })
    }

    // get item with barcode
    model.submitBarcode = barcode => {
        return $http.post(`${url}/getBarcode`, {
            data: barcode
        }).then(response => {
            return response.data;
        }, error => {
            NotificationService.showError(error);
        })
    }

    // checkout
    model.checkout = (data, type) => {
        let invoice = {
            user_ID_FK: JSON.parse(localStorage.getItem('setting')).user_ID,
            invoice_type: 'Sale',
            total_cost: model.total().totalCost,
            total_price: model.total().totalPrice,
            exchange_rate: model.exchangeRate.rate_value,
            euro_rate: model.euroRate.rate_value
        }
        return $http.post(`${url}/checkout`, {
            items: data,
            invoice: invoice
        }).then(response => {
            NotificationService.showSuccess();
            return 'success';
        }, error => {
            NotificationService.showErrorText(error);
        })
    }

    // checkout with debt
    model.checkoutDebt = (id, data, msg) => {
        let invoice = {
            user_ID_FK: model.loggedInUser.user_ID,
            customer_ID_FK: parseInt(id),
            invoice_type: 'Debt',
            total_cost: model.total().totalCost,
            total_price: model.total().totalPrice,
            exchange_rate: model.exchangeRate.rate_value,
            euro_rate: model.euroRate.rate_value
        }
        return $http.post(`${url}/checkoutDebt`, {
            items: data,
            invoice: invoice
        }).then(async response => {
            model.clearInvoice();
            NotificationService.showSuccess();
            debtsFactory.getCustomerHistory(debtsFactory.selectedCustomer);
            // fetch customers to update debts
            await customersFactory.fetchCustomers();
            model.fetchIncompleteInvoice();
        }, error => {
            NotificationService.showError(error);
        })
    }

    // confirm edit
    model.confirmEdit = (selectedInvoice, data) => {
        let invoice = {
            invoice_ID: selectedInvoice.invoice_ID,
            customer_ID_FK: selectedInvoice.customer_ID,
            invoice_type: 'Debt',
            total_cost: model.total().totalCost,
            total_price: model.total().totalPrice,
            edited_datetime: `${DateService.getDate()} ${DateService.getTime()}`
        }
        $http.post(`${url}/confirmEditInvoice`, {
            oldInvoice: selectedInvoice,
            invoice: invoice,
            items: data
        }).then(response => {
            NotificationService.showSuccess();
            customersFactory.fetchCustomers();
            model.fetchIncompleteInvoice();
            model.selectedInvoice.next(response.data);
            stockFactory.fetchItems();
        }, error => {
            NotificationService.showError(error);
        })
    }

    model.completeInvoice = invoice => {
        let datetime = `${DateService.getDate()} ${DateService.getTime()}`
        $http.post(`${url}/completeInvoice`, [invoice, datetime]).then(response => {
            NotificationService.showSuccess();
            model.fetchIncompleteInvoice();
            model.selectedInvoice.next(null);
            model.clearInvoice();
        }, error => {
            NotificationService.showError(error);
        })
    }

    // clear invoice
    model.clearInvoice = function () {
        model.invoice.next([])
        model.selectedInvoiceTab.next(null)
    };


    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Search invoice logic %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    // model.searchInvoice = id => {
    //     $http.get(`${url}/searchInvoice/${id}`).then(response => {
    //         // if (response.data.length)
    //         if (response.data) {
    //             model.searchedInvoice.next(response.data);
    //             model.searchedInvoiceMap.next(response.data.invoice_map)
    //         } else {
    //             NotificationService.showErrorText(`No Invoice Found!`)
    //         }
    //     }, error => {
    //         NotificationService.showError(error);
    //     })
    // }


    return model;
});