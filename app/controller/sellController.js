app.controller('sellController', function ($scope, sellFactory, stockFactory, rateFactory, euroFactory, customersFactory, NotificationService) {

    // define and trigger focus on barcode input
    $scope.triggerFocus = () => {
        $('#barcodeInput').trigger('focus');
        $scope.barcodeInput = null;
    };

    // on load controller 
    let rateSubscription;
    let euroSubscription;
    let invoiceSubscribtion;
    let incompleteInvoiceSub;
    let onHoldSubscribtion;
    let tabSubscribtion;
    let categoriesSubscription;
    let itemsSubscription;
    let selectedCategorySubscription;
    let searchSubscription;
    $scope.$on('$viewContentLoaded', () => {
        rateSubscription = rateFactory.exchangeRate.subscribe(res => {
            $scope.exchangeRate = res;
            calculateTotal()
        })
        euroSubscription = euroFactory.euroRate.subscribe(res => {
            $scope.euroRate = res;
            calculateTotal()
        })

        invoiceSubscribtion = sellFactory.invoice.subscribe(res => {
            $scope.invoice = res;
        });

        incompleteInvoiceSub = sellFactory.incompleteInvoice.subscribe(res => {
            $scope.incompleteInvoice = res;
        })

        onHoldSubscribtion = sellFactory.invoicesOnHold.subscribe(res => {
            $scope.invoicesOnHold = res;
        });

        tabSubscribtion = sellFactory.selectedTab.subscribe(res => {
            $scope.selectedTab = res;
        })
        categoriesSubscription = stockFactory.categories.subscribe(res => {
            $scope.categories = res;
        })
        itemsSubscription = stockFactory.items.subscribe(res => {
            $scope.items = res;
        })
        selectedCategorySubscription = sellFactory.selectedCategory.subscribe(res => {
            $scope.selectedCategory = res;
        })
        searchSubscription = sellFactory.searchVal.subscribe(res => {
            $scope.searchVal = res;
        })

        $scope.customers = customersFactory.customers;
        $scope.triggerFocus();

    })

    // on destroy controller
    $scope.$on('$destroy', () => {
        document.removeEventListener('keydown', e => {
            console.log(e);
        })
        rateSubscription.unsubscribe();
        euroSubscription.unsubscribe();
        invoiceSubscribtion.unsubscribe();
        incompleteInvoiceSub.unsubscribe();
        onHoldSubscribtion.unsubscribe();
        tabSubscribtion.unsubscribe();
        categoriesSubscription.unsubscribe();
        itemsSubscription.unsubscribe();
        selectedCategorySubscription.unsubscribe();
        searchSubscription.unsubscribe();
    })

    // set category
    $scope.setCategory = category => {
        sellFactory.selectedCategory.next(category);
        $scope.searchVal.category_ID_FK = category.category_ID;
        $scope.triggerFocus();
    }

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
        total = sellFactory.total();
        $scope.totalCost = total.totalCost;
        $scope.totalPrice = total.totalPrice;
    }
    $scope.$watch('invoice', function () {
        calculateTotal();
        $scope.triggerFocus();
    }, true);

    // watch for edit mode
    $scope.$watch('selectedInvoice', () => {
        if ($scope.selectedInvoice) {
            $scope.editMode = true;
        } else {
            $scope.editMode = false;
        }
    })


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
                            unitCost = $scope.euroRound(data.item_cost * $scope.euroRate.rate_value)
                            unitPrice = $scope.euroRound(data.item_price * $scope.euroRate.rate_value)
                            break;
                        case 'dollar':
                            unitCost = data.item_cost;
                            unitPrice = data.item_price;
                            break;

                    }
                    itemToAdd = {
                        item_ID: data.item_ID,
                        barcode: data.barcode,
                        item_description: data.item_description,
                        currency: data.currency,
                        exchange_rate: $scope.exchangeRate.rate_value,
                        euro_rate: $scope.euroRate.rate_value,
                        original_cost: data.item_cost,
                        original_price: data.item_price,
                        unit_cost: unitCost,
                        unit_price: unitPrice,
                        qty: 1
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
                    $scope.triggerFocus();
                } else {
                    NotificationService.showErrorText('Item not defined!').then(() => {
                        $scope.$digest($scope.triggerFocus());
                    })
                }
            })

            // else if barcode field is empty, thus checkout
        } 
        // else {
        //     // checkout
        //     $scope.checkout();
        // }
    }

    // submit name from datalist
    $scope.submitName = () => {
        let foundInItems = false;
        $scope.items.forEach(data => {
            if (data.item_description == $scope.inputName) {
                switch (data.currency) {
                    case 'euro':
                        unitPrice = $scope.round($scope.euroRound(data.item_price * $scope.euroRate.rate_value) * $scope.exchangeRate.rate_value)
                        break;
                    case 'dollar':
                        unitPrice = $scope.round(data.item_price * $scope.exchangeRate.rate_value);
                        break;
                    case 'lira':
                        unitPrice = data.item_price;
                        break;

                }
                itemToAdd = {
                    item_ID: data.item_ID,
                    barcode: data.barcode,
                    item_description: data.item_description,
                    currency: data.currency,
                    exchange_rate: $scope.exchangeRate.rate_value,
                    euro_rate: $scope.euroRate.rate_value,
                    unit_cost: data.item_cost,
                    unit_price: unitPrice,
                    original_price: data.item_price,
                    qty: 1
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

    // checkout
    $scope.checkout = () => {
        if ($scope.invoice.length > 0) {
            NotificationService.showWarning().then(async res => {
                if (res.isConfirmed) {
                    let response = await sellFactory.checkout($scope.invoice);
                    if (response == 'success') {
                        if ($scope.selectedTab) {
                            // $scope.$digest($scope.deleteInvoice($scope.selectedTab - 1));
                            $scope.$digest($scope.invoicesOnHold.splice(($scope.selectedTab - 1), 1));
                            $scope.$digest(sellFactory.clearInvoice());
                        }
                        $scope.$digest(sellFactory.clearInvoice());
                    }
                }
            })
        }
    }

    // checkout customer
    const customersModal = new bootstrap.Modal('#customerModal');
    const select_box = document.querySelector('#customer_select');
    let customerModalType;
    $scope.openCustomerModal = type => {
        customerModalType = type;
        $scope.selectedCustomer = null;
        $scope.sendMessage = false;
        if ($scope.invoice.length > 0) {
            customersModal.show();
            $('#customerModal').on('shown.bs.modal', () => {
                // use dselect library to enable live search within select
                dselect(select_box, {
                    search: true,
                    clearable: true
                })
            })
        } else {
            $scope.triggerFocus()
        }
    }

    $scope.submitCustomerModal = () => {
        if ($scope.selectedCustomer) {
            NotificationService.showWarning().then(async res => {
                if (res.isConfirmed) {
                    if (customerModalType == 'debt') {
                        // checkout invoice as debt if customer was selected
                        await sellFactory.checkoutDebt($scope.selectedCustomer, $scope.invoice, $scope.sendMessage);
                        customersModal.hide();
                        if ($scope.selectedTab) {
                            $scope.$digest($scope.invoicesOnHold.splice(($scope.selectedTab - 1), 1));
                            $scope.$digest(sellFactory.clearInvoice());
                        }
                        $scope.$digest(sellFactory.clearInvoice());
                        $scope.triggerFocus();

                    } else if (customerModalType == 'normal') {
                        // checkout invoice as normal but assign to a customer for reference only
                        await sellFactory.checkoutCustomer($scope.selectedCustomer, $scope.invoice)
                        customersModal.hide();
                        if ($scope.selectedTab) {
                            $scope.$digest($scope.invoicesOnHold.splice(($scope.selectedTab - 1), 1));
                            $scope.$digest(sellFactory.clearInvoice());
                        }
                        $scope.$digest(sellFactory.clearInvoice());
                        $scope.triggerFocus();
                    }
                }
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
    }

    // add Qty
    $scope.addQty = index => {
        $scope.invoice[index].qty += 1;
    }

    // clear invoice
    $scope.clearInvoice = () => {
        if ($scope.invoice.length > 0) {
            sellFactory.clearInvoice()
        }
    }

    $scope.holdInvoice = () => {
        let invoice = [];
        angular.copy($scope.invoice, invoice);
        let title = undefined;
        if ($scope.invoicesOnHold.at(-1)) {
            title = $scope.invoicesOnHold.at(-1)[0]
        }
        $scope.invoicesOnHold.push([(title + 1) || 0, invoice]);
        sellFactory.clearInvoice();
    }

    $scope.switchHoldedInvoice = index => {
        sellFactory.selectedTab.next(index + 1)
        sellFactory.invoice.next($scope.invoicesOnHold[index][1])

    }

    $scope.deleteInvoice = index => {
        NotificationService.showWarning().then(res => {
            if (res.isConfirmed) {
                $scope.$digest($scope.invoicesOnHold.splice(index, 1));
                $scope.$digest(sellFactory.clearInvoice());
            }
        })
    }

    $scope.selectInvoice = data => {
        $scope.selectedInvoice = data;
        // $scope.editMode = true;
        let dataToPush = [];
        angular.copy(data, dataToPush)
        sellFactory.invoice.next(dataToPush.invoice_map)
    }

    $scope.clearSelection = () => {
        $scope.selectedInvoice = null;
        sellFactory.clearInvoice();
    }

    // confirm edit invoice
    $scope.confirmEdit = () => {
        console.log($scope.selectedInvoice);
        console.log($scope.invoice);
        // console.log($scope.invoice[0]);
        // console.log($scope.invoice[1]);
    }





    // ***************************** open edit price modal *********************************************

    // priceModal
    const priceModal = new bootstrap.Modal('#priceModal');
    $('#priceModal').on('shown.bs.modal', () => {
        $('#newPrice').trigger('focus');
    });
    $('#priceModal').on('hidden.bs.modal', () => {
        $scope.triggerFocus()
    })

    let selectedInvoiceIndex;
    $scope.openPriceModal = index => {
        $scope.priceModalData = {
            newPrice: null,
            currency: null,
            original_currency: $scope.invoice[index].currency
        };
        selectedInvoiceIndex = index;
        $scope.dataToEdit = {};
        angular.copy($scope.invoice[index], $scope.dataToEdit);
        priceModal.show();
    }

    $scope.submitNewPrice = () => {
        let data = $scope.invoice[selectedInvoiceIndex];
        if ($scope.priceModalData.currency == 'lira' || $scope.priceModalData.currency == null) {
            data['unit_price'] = $scope.priceModalData.newPrice;
        } else {
            data['original_price'] = $scope.priceModalData.newPrice;
            data['unit_price'] = data['currency'] == 'dollar' ? $scope.round(data.original_price * $scope.exchangeRate.rate_value) : $scope.euroRound(data.original_price * $scope.euroRate.rate_value);
        }
        priceModal.hide();
    }

});