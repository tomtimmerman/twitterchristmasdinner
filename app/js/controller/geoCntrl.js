function GeoCntrl($scope, locations) {
	$scope.ingredients = locations;
	$scope.ingredient = $scope.ingredients[0]; // default selected value
}
