app.controller('sellController', function ($scope, sellFactory, stockFactory, rateFactory, euroFactory, customersFactory, NotificationService, DateService) {

    // define and trigger focus on barcode input
    $scope.triggerFocus = () => {
        $('#barcodeInput').trigger('focus');
        $scope.barcodeInput = null;
    };

    // V.A.T 11%
    $scope.tva = 1.1;

    $scope.tvaSelected = true

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
    let selectedInvoiceSub;
    let itemsToReturnSub;
    let customersSub;
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

        tabSubscribtion = sellFactory.selectedInvoiceTab.subscribe(res => {
            $scope.selectedInvoiceTab = res;
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
        selectedInvoiceSub = sellFactory.selectedInvoice.subscribe(res => {
            $scope.selectedInvoice = res;
        })

        customersSub = customersFactory.customers.subscribe(res => {
            $scope.customers = res;
        })
        $scope.triggerFocus();

        itemsToReturnSub = sellFactory.itemsToReturn.subscribe(res => {
            $scope.itemsToReturn = res;
        })

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
        selectedInvoiceSub.unsubscribe();
        customersSub.unsubscribe();
    })

    $scope.setTab = tab => {
        sellFactory.selectedTab.next(tab);
        if (tab == 1) {
            $scope.triggerFocus();
        } else {
            $('#searchInvoice').trigger('focus');
        }
    }

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
                        exchange_rate: $scope.exchangeRate.rate_value,
                        euro_rate: $scope.euroRate.rate_value,
                        original_cost: data.item_cost,
                        original_price: data.item_price,
                        discount: 0,
                        unit_cost: unitCost,
                        unit_price: unitPrice,
                        discounted_price: discountedPrice,
                        qty: 1
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
                    exchange_rate: $scope.exchangeRate.rate_value,
                    euro_rate: $scope.euroRate.rate_value,
                    original_cost: data.item_cost,
                    original_price: data.item_price,
                    discount: 0,
                    unit_cost: unitCost,
                    unit_price: unitPrice,
                    discounted_price: discountedPrice,
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
                        if ($scope.selectedInvoiceTab) {
                            $scope.$digest($scope.invoicesOnHold.splice(($scope.selectedInvoiceTab - 1), 1));
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
                        if ($scope.selectedInvoiceTab) {
                            $scope.$digest($scope.invoicesOnHold.splice(($scope.selectedInvoiceTab - 1), 1));
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

    // switch holded invoice
    $scope.switchHoldedInvoice = index => {
        $scope.clearSelection();
        sellFactory.selectedInvoiceTab.next(index + 1);
        sellFactory.invoice.next($scope.invoicesOnHold[index][1]);

    }

    // delete holded invoice
    $scope.deleteInvoice = index => {
        NotificationService.showWarning().then(res => {
            if (res.isConfirmed) {
                $scope.$digest($scope.invoicesOnHold.splice(index, 1));
                $scope.$digest(sellFactory.clearInvoice());
            }
        })
    }

    // select from customers open invoice
    $scope.selectInvoice = data => {
        sellFactory.clearInvoice()
        sellFactory.selectedInvoice.next(data);
        let dataToPush = [];
        angular.copy(data, dataToPush);
        sellFactory.invoice.next(dataToPush.invoice_map)
    }

    // clear customer's opened invoice
    $scope.clearSelection = () => {
        sellFactory.selectedInvoice.next(null);
        sellFactory.clearInvoice();
        $scope.triggerFocus();
    }

    // confirm edit invoice
    $scope.confirmEdit = async () => {
        let res = await NotificationService.showConfirm();
        if (res.isConfirmed) {
            sellFactory.confirmEdit($scope.selectedInvoice, $scope.invoice);
        }
    }

    // completeInvoice
    $scope.completeInvoice = async () => {
        let res = await NotificationService.showConfirm();
        if (res.isConfirmed) {
            sellFactory.completeInvoice($scope.selectedInvoice);
        }
    }

    // cancel edit invoice
    $scope.cancelEdit = async () => {
        let res = await NotificationService.showWarning();
        if (res.isConfirmed) {
            $scope.$digest($scope.selectInvoice($scope.selectedInvoice));
            $scope.triggerFocus();
        }
    }




    // ***************************** open edit price modal *********************************************

    // priceModal
    const priceModal = new bootstrap.Modal('#priceModal');
    $('#priceModal').on('shown.bs.modal', () => {
        $('#newValue').trigger('focus');
    });
    $('#priceModal').on('hidden.bs.modal', () => {
        $scope.triggerFocus()
    })

    // price modal and percentage modal
    let selectedInvoiceIndex;
    $scope.openPriceModal = index => {
        $scope.priceModalData = {
            newValue: null,
            original_currency: $scope.invoice[index].currency
        };
        selectedInvoiceIndex = index;
        $scope.dataToEdit = {};
        angular.copy($scope.invoice[index], $scope.dataToEdit);
        priceModal.show();
    }

    $scope.submitNewValue = () => {
        $scope.invoice[selectedInvoiceIndex]['discounted_price'] = $scope.priceModalData.newValue;
        priceModal.hide();
    }

    // percentage modal
    const percentageModal = new bootstrap.Modal('#percentageModal');
    $('#percentageModal').on('shown.bs.modal', () => {
        $('#newPercentage').trigger('focus');
    });
    $('#percentageModal').on('hidden.bs.modal', () => {
        $scope.triggerFocus()
    })
    $scope.openPercentageModal = index => {
        $scope.percentageModalData = {
            newValue: null
        };
        selectedInvoiceIndex = index;
        $scope.dataToEdit = {};
        angular.copy($scope.invoice[index], $scope.dataToEdit);
        percentageModal.show();
    }

    $scope.submitNewPercentage = () => {
        $scope.invoice[selectedInvoiceIndex]['discount'] = $scope.percentageModalData.newValue;
        $scope.invoice[selectedInvoiceIndex]['discounted_price'] = $scope.invoice[selectedInvoiceIndex]['unit_price'] - ($scope.invoice[selectedInvoiceIndex]['unit_price'] * $scope.percentageModalData.newValue / 100)
        percentageModal.hide();
    }


    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Print Invoice %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    $scope.printInvoice = async () => {
        let printData = {
            type: 'عرض أسعار',
            date: DateService.getDate(),
            invoice: $scope.invoice,
            name: null
        }
        await window.electron.ipcRenderer.invoke('print-invoice', printData)
    }

});