app.controller('stockController', function ($scope, stockFactory, rateFactory, euroFactory) {

    // on load controller
    let selectionSubscription;
    let rateSubscription;
    let euroSubscription;
    let categoriesSubscription;
    let itemsSubscription;
    let lowStockSub;
    let searchSubscription;
    let perPageSub;
    $scope.$on('$viewContentLoaded', () => {
        selectionSubscription = stockFactory.selectedCategory.subscribe(res => {
            $scope.selectedCategory = res;
        })
        rateSubscription = rateFactory.exchangeRate.subscribe(res => {
            $scope.exchangeRate = res;
        })
        euroSubscription = euroFactory.euroRate.subscribe(res => {
            $scope.euroRate = res;
        })
        categoriesSubscription = stockFactory.categories.subscribe(res => {
            $scope.categories = res;
        })
        itemsSubscription = stockFactory.items.subscribe(res => {
            $scope.items = res;
        })
        lowStockSub = stockFactory.lowStockItems.subscribe(res => {
            $scope.lowStockItems = res;
        })
        searchSubscription = stockFactory.searchVal.subscribe(res => {
            $scope.searchVal = res;
        })
        perPageSub = stockFactory.itemsPerPage.subscribe(res => {
            $scope.itemsPerPage = res;
        })

    })

    // on destroy controller
    $scope.$on('$destroy', () => {
        selectionSubscription.unsubscribe();
        rateSubscription.unsubscribe();
        euroSubscription.unsubscribe();
        categoriesSubscription.unsubscribe();
        itemsSubscription.unsubscribe();
        lowStockSub.unsubscribe();
        searchSubscription.unsubscribe();
        perPageSub.unsubscribe();
    })

    // tab selection
    $scope.selectedTab = stockFactory.selectedTab;
    $scope.setTab = tab => {
        stockFactory.setTab(tab);
        $scope.selectedTab = stockFactory.selectedTab;
    }

    // items per page init
    $scope.options = stockFactory.setItemsPerPage();

    // initialize Round calculation function
    $scope.round = data => {
        return Math.ceil(data / $scope.exchangeRate.round_value) * $scope.exchangeRate.round_value;
    }

    $scope.euroRound = data => {
        return Math.ceil(data / $scope.euroRate.round_value) * $scope.euroRate.round_value;
    }

    // sorting opions
    $scope.sortOptions = {
        animation: 350,
        handle: '.grab-handle',
        sort: true,
        onSort: function (e) {
            stockFactory.sortCategories(e.models)
        }
    };

    // select category function
    $scope.selectCategory = data => {
        stockFactory.selectedCategory.next(data);
        $scope.searchVal.category_ID_FK = data.category_ID;
    }

    // define category modal
    const categoryModal = new bootstrap.Modal('#categoryModal');
    $('#categoryModal').on('shown.bs.modal', () => {
        $('#categoryName').trigger('focus')
    })

    // open category modal
    $scope.opencategoryModal = (type, data) => {
        if (type == 'Edit') {
            $scope.modalType = 'Edit'
            $scope.modalData = {};
            data.show_on_sell = data.show_on_sell == 1 ? true : false;
            angular.copy(data, $scope.modalData);
            categoryModal.show();
        } else {
            $scope.modalType = 'Add'
            $scope.modalData = {
                category_name: null,
                show_on_sell: true
            }
            categoryModal.show();
        }
    }

    // submit categoryModal
    $scope.submitCategory = () => {
        switch ($scope.modalType) {
            case 'Add':
                stockFactory.addCategory($scope.modalData).then(response => {
                    if (response) {
                        $scope.modalData = {
                            category_name: null,
                            category_color: null
                        }
                    }
                })
                categoryModal.hide()
                break;
            case 'Edit':
                stockFactory.updateCategory($scope.modalData).then(response => {
                    if (response) {
                        categoryModal.hide()
                    }
                })
                break;
        }
    }

    // Delete category
    $scope.deleteCategory = data => {
        stockFactory.deleteCategory(data).then(res => {
            if (res == 'deleted') {
                if ($scope.selectedCategory.category_ID == data.category_ID) {
                    $scope.$digest(stockFactory.selectedCategory.next({
                        category_name: null
                    }))
                }
            }
        })
    }


    // ############################ Items ###############################
    // define itemsModal
    const itemsModal = new bootstrap.Modal('#itemsModal');
    $('#itemsModal').on('shown.bs.modal', () => {
        $scope.submitItemLoading = false;
        $('#itemName').trigger('focus');
    })

    // open itemsModal for add or edit
    $scope.openItemsModal = (type, data) => {
        if (type == 'edit') {
            $scope.itemsModalType = 'edit';
            $scope.itemsModal = {};
            angular.copy(data, $scope.itemsModal);
            itemsModal.show();
        } else {
            $scope.itemsModalType = 'add';
            $scope.itemsModal = {
                item_description: null,
                barcode: null,
                item_type: 'barcode',
                category_ID_FK: data == 'default' ? null : $scope.selectedCategory.category_ID,
                cost_type: null,
                currency: null,
                qty: null,
                qty_limit: null,
                item_cost: null,
                percentage_cost: null,
                item_price: null,
                item_notes: null
            }
            $scope.barcodeExisted = false;
            itemsModal.show();
        }
    }

    // validate barcode input if set invalid
    $scope.setValid = () => {
        if ($scope.barcodeExisted) {
            $scope.barcodeExisted = false;
        }
    }

    // submit itemsModal
    $scope.submitItem = () => {
        $scope.submitItemLoading  = true;
        switch ($scope.itemsModalType) {
            case 'add':
                if ($scope.itemsModal.barcode) {
                    stockFactory.checkBarcode($scope.itemsModal.barcode).then(response => {
                        $scope.submitItemLoading  = false;
                        if (response) { //if barcode not existed
                            stockFactory.addItem($scope.itemsModal).then(response => {
                                if (response) {
                                    $scope.items.push(response);
                                    itemsModal.hide();
                                }
                            })
                        } else {
                            $scope.barcodeExisted = true;
                            $('#barcodeInput').trigger('select');
                        }
                    })
                } else {
                    stockFactory.addItem($scope.itemsModal).then(response => {
                        $scope.submitItemLoading  = false;
                        if (response) {
                            $scope.items.push(response)
                            itemsModal.hide();
                        }
                    })
                }
                break;

            case 'edit':
                stockFactory.updateItem($scope.itemsModal).then(response => {
                    $scope.submitItemLoading  = false;
                    if (response) {
                        let index = $scope.items.findIndex(x => x.item_ID == response.item_ID);
                        $scope.items[index] = response;
                        itemsModal.hide();
                    }
                })
                break;
        }
    }

    // Delete Item
    $scope.deleteItem = () => {
        stockFactory.deleteItem($scope.itemsModal);
    }

    $scope.barcodeSearch = () => {
        $('#barcodeSearch').trigger('select');
        $('#barcodeSearch2').trigger('select');
    }

    // refresh low on stock
    $scope.refresh = () => {
        stockFactory.fetchLowStockItems();
    }

});