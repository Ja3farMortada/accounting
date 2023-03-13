app.directive('euroRate', function (euroFactory) {
    return {
        restrict: 'E',
        templateUrl: '_directives/templates/euroRate.html',
        scope: {

        },
        link: function (scope) {

            euroFactory.euroRate.subscribe(res => {
                scope.euroRate = res;
            })

            const rateModal = new bootstrap.Modal('#euroModal');
            $('#euroModal').on('shown.bs.modal', () => {
                $('#rateValue').trigger('focus')
            })

            scope.openRateModal = () => {
                scope.modalData = {}
                angular.copy(scope.euroRate, scope.modalData);
                rateModal.show()
            }

            scope.submitRate = function () {
                euroFactory.updateEuroRate(scope.modalData);
                rateModal.hide()
            };
        }
    }
});