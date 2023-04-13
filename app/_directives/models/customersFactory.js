app.factory('customersFactory', function ($http, NotificationService) {

    // define URL
    const url = `http://localhost:3000`;

    var model = {};
    model.customers = new BehaviorSubject([]);

    const getCustomers = () => {
        return $http.get(`${url}/getCustomers`).then(response => {
            // angular.copy(response.data, model.customers);
            model.customers.next(response.data);
        }, error => {
            NotificationService.showError(error);
        });
    };
    getCustomers();

    model.fetchCustomers = () => {
        return $http.get(`${url}/getCustomers`).then(response => {
            // angular.copy(response.data, model.customers);
            model.customers.next(response.data);
        }, error => {
            NotificationService.showError(error);
        });
    };

    model.addCustomer = data => {
        return $http.post(`${url}/addCustomer`, data).then(response => {
            let updatedCustomers = model.customers.value;
            updatedCustomers.push(response.data);
            model.customers.next(updatedCustomers);
            NotificationService.showSuccess();
            return updatedCustomers;
        }, function (err) {
            NotificationService.showError(err);
        })
    };

    model.updateCustomer = data => {
        return $http.post(`${url}/updateCustomer`, data).then(response => {
            // model.customers[index] = response.data;
            let value = model.customers.value;
            let index = value.findIndex(x => x.customer_ID == data.customer_ID);
            value[index] = response.data;
            model.customers.next(value);
            NotificationService.showSuccess();
            return response.data;
        }, error => {
            NotificationService.showError(error);
        });
    };

    // // delete customer
    model.deleteCustomer = data => {
        NotificationService.showWarning().then(ok => {
            if (ok.isConfirmed) {
                $http.post(`${url}/deleteCustomer`, data).then(response => {
                    if (response.data == 'deleted') {
                        let value = model.customers.value;
                        let index = value.findIndex(x => x.customer_ID == data.customer_ID);
                        value.splice(index, 1);
                        model.customers.next(value)
                        NotificationService.showSuccess();
                    }
                }, error => {
                    NotificationService.showError(error);
                })
            }
        })
    }

    return model;
});