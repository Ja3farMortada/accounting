app.controller('supplyController', function ($scope, supplyFactory, NotificationService, suppliersFactory, stockFactory, sellFactory, rateFactory, euroFactory) {

    // define and trigger focus on barcode input
    $scope.triggerFocus = () => {
        $('#barcodeInput').trigger('focus');
        $scope.barcodeInput = null;
    };


    let supplierSubscription;
    let itemsSubscription;
    let invoiceSubscribtion;
    let rateSubscription;
    let euroSubscription;

    // on init controller
    $scope.$on('$viewContentLoaded', () => {
        $scope.triggerFocus()
        supplierSubscription = suppliersFactory.suppliers.subscribe(res => {
            $scope.suppliers = res;
        })
        itemsSubscription = stockFactory.items.subscribe(res => {
            $scope.items = res;
        })
        invoiceSubscribtion = supplyFactory.invoice.subscribe(res => {
            $scope.invoice = res;
        });
        rateSubscription = rateFactory.exchangeRate.subscribe(res => {
            $scope.exchangeRate = res;
            calculateTotal()
        })
        euroSubscription = euroFactory.euroRate.subscribe(res => {
            $scope.euroRate = res;
            calculateTotal()
        })
    })

    // on destroy controller
    $scope.$on('$destroy', () => {
        supplierSubscription.unsubscribe();
        itemsSubscription.unsubscribe();
        invoiceSubscribtion.unsubscribe();
        rateSubscription.unsubscribe();
        euroSubscription.unsubscribe();
    })

    // initialize Round calculation function
    $scope.round = data => {
        return Math.ceil(data / $scope.exchangeRate.round_value) * $scope.exchangeRate.round_value;
    }
    $scope.euroRound = data => {
        return Math.ceil(data / $scope.euroRate.round_value) * $scope.euroRate.round_value;
    }

    // watch for invoice changes and calculate invoice's total cost and price
    let total;

    function calculateTotal() {
        total = supplyFactory.total();
        $scope.totalCost = total.totalCost;
        // $scope.totalPrice = total.totalPrice;
    }
    $scope.$watch('invoice', function () {
        calculateTotal();
        // $scope.triggerFocus();
    }, true);

    // define itemToAdd Variable
    let itemToAdd;
    let unitPrice;
    let unitCost;
    // scan barcode logic
    $scope.submitBarcode = () => {
        if ($scope.barcodeInput) {
            // if ($scope.barcodeInput.toString().length > 10) {
            sellFactory.submitBarcode($scope.barcodeInput).then(data => {
                if (data) {
                    switch (data.currency) {
                        case 'euro':
                            unitCost = $scope.euroRate.rate_value * data.item_cost;
                            break;
                        case 'dollar':
                            unitCost = data.item_cost;
                            break;

                    }
                    itemToAdd = {
                        item_ID: data.item_ID,
                        barcode: data.barcode,
                        item_description: data.item_description,
                        percentage_cost: data.percentage_cost,
                        item_cost: data.item_cost,
                        qty: 1,
                        currency: data.currency
                    }
                    let found = false;
                    for (let i = 0; i < $scope.invoice.length; i++) {
                        if (($scope.invoice[i].item_ID || $scope.invoice[i].item_ID_FK) == itemToAdd.item_ID) {
                            $scope.invoice[i].qty += 1;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        $scope.invoice.push(itemToAdd)
                    }
                    $scope.triggerFocus();
                } else {
                    NotificationService.showErrorText('Item not defined!').then(() => {
                        $scope.$digest($scope.triggerFocus());
                    })
                }
            })
        }
    }

    // submit name from datalist
    $scope.submitName = () => {
        let foundInItems = false;
        $scope.items.forEach(data => {
            if (data.item_description == $scope.inputName) {
                switch (data.currency) {
                    case 'euro':
                        unitCost = $scope.euroRate.rate_value * data.item_cost;
                        break;
                    case 'dollar':
                        unitCost = data.item_cost;
                        break;

                }
                itemToAdd = {
                    item_ID: data.item_ID,
                        barcode: data.barcode,
                        item_description: data.item_description,
                        percentage_cost: data.percentage_cost,
                        item_cost: data.item_cost,
                        qty: 1,
                        currency: data.currency
                }
                let found = false;
                for (let i = 0; i < $scope.invoice.length; i++) {
                    if ($scope.invoice[i].item_ID == itemToAdd.item_ID) {
                        $scope.invoice[i].qty += 1;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    $scope.invoice.push(itemToAdd)
                }
                $scope.inputName = null;
                foundInItems = true;
                return;
            }
        });
        if (!foundInItems) {
            NotificationService.showErrorText('Item not defined!').then(() => {
                $scope.$digest($scope.inputName = null);
            })
        }
    }


    // substract Qty
    $scope.substractQty = index => {
        if ($scope.invoice[index].qty == 1) {
            $scope.invoice.splice(index, 1);
        } else {
            $scope.invoice[index].qty -= 1;
        }
        $scope.triggerFocus();
    }

    // add Qty
    $scope.addQty = index => {
        $scope.invoice[index].qty += 1;
        $scope.triggerFocus();
    }

    // clear invoice
    $scope.clearInvoice = () => {
        if ($scope.invoice.length > 0) {
            supplyFactory.clearInvoice()
            $scope.triggerFocus();
        }
    }

    // checkout supplier
    const supplierModal = new bootstrap.Modal('#supplierModal');
    const select_box = document.querySelector('#supplier_select');
    $scope.openSupplierModal = type => {
        supplierModalType = type;
        $scope.selectedSupplier = null;
        $scope.sendMessage = false;
        if ($scope.invoice.length > 0) {
            supplierModal.show();
            $('#supplierModal').on('shown.bs.modal', () => {
                dselect(select_box, {
                    search: true,
                    clearable: true
                })
            })
        } else {
            $scope.triggerFocus()
        }
    }

    $scope.submitSupplierModal = () => {
        if ($scope.selectedSupplier) {
            NotificationService.showWarning().then(async res => {
                if (res.isConfirmed) {
                    // checkout invoice as debt if customer was selected
                    await supplyFactory.checkout($scope.selectedSupplier, $scope.invoice);
                    supplierModal.hide();
                    $scope.$digest(supplyFactory.clearInvoice());
                    $scope.triggerFocus();
                }
            })
        }
    }


})