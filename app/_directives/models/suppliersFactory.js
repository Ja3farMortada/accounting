app.factory('suppliersFactory', function ($http, NotificationService) {

    // define URL
    const url = `http://localhost:3000`;

    var model = {};
    model.suppliers = new BehaviorSubject([]);

    const getSuppliers = () => {
        return $http.get(`${url}/getSuppliers`).then(response => {
            // angular.copy(response.data, model.suppliers);
            model.suppliers.next(response.data);
        }, error => {
            NotificationService.showError(error);
        });
    };
    getSuppliers();

    model.fetchSuppliers = () => {
        return $http.get(`${url}/getSuppliers`).then(response => {
            // angular.copy(response.data, model.suppliers);
            model.suppliers.next(response.data);
        }, error => {
            NotificationService.showError(error);
        });
    };

    model.addSupplier = data => {
        return $http.post(`${url}/addSupplier`, data).then(response => {
            let updatedSuppliers = model.suppliers.value;
            updatedSuppliers.push(response.data);
            model.suppliers.next(updatedSuppliers);
            NotificationService.showSuccess();
            return updatedSuppliers;
        }, function (err) {
            NotificationService.showError(err);
        })
    };

    model.updateSupplier = data => {
        return $http.post(`${url}/updateSupplier`, data).then(response => {
            // model.suppliers[index] = response.data;
            let value = model.suppliers.value;
            let index = value.findIndex(x => x.supplier_ID == data.supplier_ID);
            value[index] = response.data;
            model.suppliers.next(value);
            NotificationService.showSuccess();
            return response.data;
        }, error => {
            NotificationService.showError(error);
        });
    };

    // // delete Supplier
    model.deleteSupplier = data => {
        NotificationService.showWarning().then(ok => {
            if (ok.isConfirmed) {
                $http.post(`${url}/deleteSupplier`, data).then(response => {
                    if (response.data == 'deleted') {
                        let value = model.suppliers.value;
                        let index = value.findIndex(x => x.supplier_ID == data.supplier_ID);
                        value.splice(index, 1);
                        model.suppliers.next(value)
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