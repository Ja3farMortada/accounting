app.controller('returnController', function ($scope, returnFactory, customersFactory, rateFactory, euroFactory, sellFactory, stockFactory, NotificationService) {

    // define and trigger focus on barcode input
    $scope.triggerFocus = () => {
        $('#barcodeInput').trigger('focus');
        $scope.barcodeInput = null;
    };

    let rateSubscription;
    let euroSubscription;
    let customersSub;
    let recentSub;
    let returnInvoiceSub;
    let itemsSubscription;
    let selectedCustomerSub;
    $scope.$on('$viewContentLoaded', () => {
        rateSubscription = rateFactory.exchangeRate.subscribe(res => {
            $scope.exchangeRate = res;
            calculateTotal()
        })
        euroSubscription = euroFactory.euroRate.subscribe(res => {
            $scope.euroRate = res;
            calculateTotal()
        })

        customersSub = customersFactory.customers.subscribe(res => {
            $scope.customers = res;
        })
        recentSub = returnFactory.recentItems.subscribe(res => {
            $scope.recentItems = res;
        })

        returnInvoiceSub = returnFactory.returnInvoice.subscribe(res => {
            $scope.returnInvoice = res;
        })

        itemsSubscription = stockFactory.items.subscribe(res => {
            $scope.items = res;
        })

        selectedCustomerSub = returnFactory.selectedCustomer.subscribe(res => {
            $scope.selectedCustomer = res;
        })

    })

    // on destroy controller
    $scope.$on('$destroy', () => {
        rateSubscription.unsubscribe();
        euroSubscription.unsubscribe();
        customersSub.unsubscribe();
        recentSub.unsubscribe();
        returnInvoiceSub.unsubscribe();
        itemsSubscription.unsubscribe();
        selectedCustomerSub.unsubscribe();
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
        total = returnFactory.total();
        $scope.totalCost = total.totalCost;
        $scope.totalPrice = total.totalPrice;
    }
    $scope.$watch('returnInvoice', function () {
        calculateTotal();
        $scope.triggerFocus();
    }, true);


    const customersModal = new bootstrap.Modal('#customersModal');
    const select_box = document.querySelector('#customer_select');
    let customerModalType;
    $scope.openCustomerModal = type => {
        customerModalType = type;
        $scope.selectedCustomerID = null;
        customersModal.show();
        $('#customersModal').on('shown.bs.modal', () => {
            // use dselect library to enable live search within select
            dselect(select_box, {
                search: true,
                clearable: true
            })
        })

        $('#customersModal').on('hidden.bs.modal', () => {
            $scope.triggerFocus();
        })
    }

    $scope.submitCustomerModal = () => {
        let index = $scope.customers.findIndex(x => x.customer_ID == $scope.selectedCustomerID);
        returnFactory.selectedCustomer.next($scope.customers[index])
        customersModal.hide();
    }

    // clear selected customer
    $scope.clearSelectedCustomer = () => {
        returnFactory.selectedCustomer.next(null);
        $scope.selectedCustomerID = null;
    }


    // open offcanvas archive
    const archiveOffcanvas = new bootstrap.Offcanvas('#archiveOffcanvas');
    $('#archiveOffcanvas').on('hidden.bs.offcanvas', () => {
        $scope.triggerFocus();
    })
    $scope.openArchiveOffcanvas = () => {
        archiveOffcanvas.show();
        returnFactory.getRecentItems($scope.selectedCustomerID);
    }

    // add selected record to return invoice
    $scope.addToInvoice = data => {
        itemToAdd = {
            record_ID: data.record_ID,
            item_ID: data.item_ID_FK,
            barcode: data.barcode,
            item_description: data.item_description,
            currency: data.currency,
            exchange_rate: $scope.exchangeRate.rate_value,
            euro_rate: $scope.euroRate.rate_value,
            original_cost: data.original_cost,
            original_price: data.original_price,
            discount: 0,
            unit_cost: data.unit_cost,
            unit_price: data.unit_price,
            discounted_price: data.discounted_price,
            qty: 1
        }
        // let found = false;
        let index = $scope.returnInvoice.findIndex(element => {
            return element.record_ID == itemToAdd.record_ID;
        })
        if (index != -1) {
            $scope.returnInvoice[index].qty += 1;
        } else {
            $scope.returnInvoice.push(itemToAdd)
        }
    }


    // substract Qty
    $scope.substractQty = index => {
        if ($scope.returnInvoice[index].qty == 1) {
            $scope.returnInvoice.splice(index, 1);
        } else {
            $scope.returnInvoice[index].qty -= 1;
        }
    }

    // add Qty
    $scope.addQty = index => {
        $scope.returnInvoice[index].qty += 1;
    }

    // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& Submit barcode and name &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

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
                            unitPrice = $scope.euroRate.rate_value * data.item_price;
                            discountedPrice = $scope.euroRate.rate_value * data.item_price;
                            break;
                        case 'dollar':
                            unitCost = data.item_cost;
                            unitPrice = data.item_price;
                            discountedPrice = data.item_price;
                            break;

                    }
                    itemToAdd = {
                        item_ID: data.item_ID,
                        barcode: data.barcode,
                        item_description: data.item_description,
                        currency: data.currency,
                        discount: 0,
                        exchange_rate: $scope.exchangeRate.rate_value,
                        euro_rate: $scope.euroRate.rate_value,
                        original_cost: data.item_cost,
                        original_price: data.item_price,
                        unit_cost: unitCost,
                        unit_price: unitPrice,
                        discounted_price: discountedPrice,
                        qty: 1
                    }
                    let found = false;
                    for (let i = 0; i < $scope.returnInvoice.length; i++) {
                        if (($scope.returnInvoice[i].item_ID || $scope.returnInvoice[i].item_ID_FK) == itemToAdd.item_ID) {
                            $scope.returnInvoice[i].qty += 1;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        $scope.returnInvoice.push(itemToAdd)
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
                        unitPrice = $scope.euroRate.rate_value * data.item_price;
                        discountedPrice = $scope.euroRate.rate_value * data.item_price;
                        break;
                    case 'dollar':
                        unitCost = data.item_cost;
                        unitPrice = data.item_price;
                        discountedPrice = data.item_price;
                        break;

                }
                itemToAdd = {
                    item_ID: data.item_ID,
                    barcode: data.barcode,
                    item_description: data.item_description,
                    currency: data.currency,
                    discount: 0,
                    exchange_rate: $scope.exchangeRate.rate_value,
                    euro_rate: $scope.euroRate.rate_value,
                    original_cost: data.item_cost,
                    original_price: data.item_price,
                    unit_cost: unitCost,
                    unit_price: unitPrice,
                    discounted_price: discountedPrice,
                    qty: 1
                }
                let found = false;
                for (let i = 0; i < $scope.returnInvoice.length; i++) {
                    if ($scope.returnInvoice[i].item_ID == itemToAdd.item_ID) {
                        $scope.returnInvoice[i].qty += 1;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    $scope.returnInvoice.push(itemToAdd)
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

    // checkout return
    $scope.checkout = () => {
        if ($scope.returnInvoice.length > 0) {
            NotificationService.showWarning().then(async res => {
                if (res.isConfirmed) {
                    let response = await returnFactory.checkout($scope.returnInvoice);
                    if (response == 'success') {
                        $scope.$digest(returnFactory.clearInvoice());
                    }
                }
            })
        }
    }


    // ********************************************* open edit price modal *********************************************
    // priceModal
    const priceModal = new bootstrap.Modal('#priceModal');
    $('#priceModal').on('shown.bs.modal', () => {
        $('#newValue').trigger('focus');
    });
    $('#priceModal').on('hidden.bs.modal', () => {
        $scope.triggerFocus()
    })
    let selectedInvoiceIndex;
    $scope.openPriceModal = index => {
        $scope.priceModalData = {
            newValue: null,
            original_currency: $scope.returnInvoice[index].currency
        };
        selectedInvoiceIndex = index;
        $scope.dataToEdit = {};
        angular.copy($scope.returnInvoice[index], $scope.dataToEdit);
        priceModal.show();
    }

    $scope.submitNewValue = () => {
        $scope.returnInvoice[selectedInvoiceIndex]['discounted_price'] = $scope.priceModalData.newValue;
        priceModal.hide();
    }


})