app.factory('returnFactory', function($http, NotificationService) {

    let url = 'http://localhost:3000';

    const model = {};
    model.recentItems = new BehaviorSubject([])

    // get selected customer's recent purchased items
    model.getRecentItems = ID => {
        $http.get(`${url}/getRecentItems/${ID}`).then(response => {
            model.recentItems.next(response.data);
        }, error => {
            NotificationService.showError(error);
        })
    }

    return model;
})