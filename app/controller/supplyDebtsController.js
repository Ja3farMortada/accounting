app.controller('supplierDebtsController', function ($scope, suppliersFactory, rateFactory, euroFactory) {

    let rateSubscription;
    let euroSubscription;
    let suppliersSub;
    $scope.$on('$viewContentLoaded', () => {
        rateSubscription = rateFactory.exchangeRate.subscribe(res => {
            $scope.exchangeRate = res;
        })
        euroSubscription = euroFactory.euroRate.subscribe(res => {
            $scope.euroRate = res;
        })
        suppliersSub = suppliersFactory.suppliers.subscribe(res => {
            $scope.suppliers = res;
        })

        $scope.selectedSupplier = suppliersFactory.selectedSupplier;
        $scope.selectedSupplierHistory = suppliersFactory.selectedSupplierHistory;
        $scope.searchSupplier = suppliersFactory.searchSupplier;

        $('#searchSupplier').trigger('select');
    })

    // on destroy controller
    $scope.$on('$destroy', () => {
        rateSubscription.unsubscribe();
        euroSubscription.unsubscribe();
        suppliersSub.unsubscribe();
    })


    $scope.getSupplierHistory = data => {
        suppliersFactory.getSupplierHistory(data).then(() => {
            $scope.selectedSupplier = suppliersFactory.selectedSupplier;
        })
    }

    $scope.searchVal = {
        date: ''
    };


    // define datepicker for filtering
    function datepicker() {
        $('#transactionsDatepicker').datepicker({
            dateFormat: 'yy-mm-dd',
            onSelect: function () {
                var d = $('#transactionsDatepicker').datepicker({
                    dateFormat: 'yy-mm-dd'
                }).val();
                // suppliersFactory.datePickerValue = d;
                $scope.$digest($scope.searchVal.date = d);
            }
        }).datepicker("setDate", $scope.searchVal.date);
    };
    datepicker();

    // open payment modal
    const paymentModal = new bootstrap.Modal('#paymentModal');
    let modalType;
    $scope.openPaymentModal = (type, data) => {
        if (type == 'add') {
            modalType = 'add';
            $scope.modalData = {
                supplier_ID_FK: $scope.selectedSupplier.supplier_ID,
                payment_account: 'dollar',
                payment_currency: false,
                payment_value: null,
                actual_payment_value: null,
                payment_notes: null,
                exchange_rate: $scope.exchangeRate.rate_value,
                euro_rate: $scope.euroRate.rate_value
            }
            paymentModal.show();
        } else {
            modalType = 'edit';
            $scope.modalData = {};
            angular.copy(data, $scope.modalData);
        }
    }

    $scope.submitPayment = () => {
        switch (modalType) {
            case 'add':
                suppliersFactory.addSupplierPayment($scope.modalData).then(res => {
                    paymentModal.hide();
                })
                break;

            case 'edit':
                suppliersFactory.editSupplierPayment($scope.modalData).then(res => {
                    paymentModal.hide();
                })
                break;
        }
    }

    $scope.openDetailsModal = data => {
        $scope.invoiceDetails = JSON.parse(data.invoice_map);
        $('#detailsModal').modal('show');
    }
})