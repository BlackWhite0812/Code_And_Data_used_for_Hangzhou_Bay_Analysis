// *********************Import hormonic features from script: HarmonicsL8 *************************//
var TraniningData = require("users/blackwhitezou/Thesis:Landsat57_pre_clasV2");
// The Phase and Amplitude value of harmonic feature for 2013
var TrainingPtL75 = TraniningData.TrainingPtL75;
var CombinedBand = TraniningData.CombinedBands;
// *******************************Script for classification with hold out cross validation*********************************//
// ——————————————————————————————————————————————————————————————————————————————————————————————————
// Input parameters for future function 
var inputtedFeatureCollection = TrainingPtL75;

var k = 5;

var seed = 10;

var classifierOfChoice = ee.Classifier.randomForest(40,seed);

var propertyToPredictAsString = 'class';

var scaleToSample = 30;

// **************************Part1: Preparation of the inputted feature collection of sample points*************************//


	var collLength = inputtedFeatureCollection.size();
// print('Number of Sample Points',collLength);

	var sampleSeq = ee.List.sequence(1, collLength);
// // print('Sample Sequence',sampleSeq);

	var inputtedFCWithRand = inputtedFeatureCollection.randomColumn('Rand_Num', 42).sort('Rand_Num').toList(collLength);
// print('Total FC with Random Column',inputtedFCWithRand);

	// Prep the feature collection with random fold assignment numbers
	var preppedListOfFeats = sampleSeq.map(function(numberToSet) {
		return ee.Feature(inputtedFCWithRand.get(ee.Number(numberToSet).subtract(1))).set('Fold_ID', ee.Number(numberToSet));
	});
// print('Prepped FC', preppedListOfFeats);

//************************** Part 2: Divides the feature collection into the k folds**************************//

	var averageFoldSize = collLength.divide(k).floor();
// print('Average Fold Size',averageFoldSize);

	var remainingSampleSize = collLength.mod(k);
// print('Remaining Sample Size', remainingSampleSize);

	var foldSequenceWithoutRemainder = ee.List.sequence(0, k - 1).map(function(fold) {
		var foldStart = ee.Number(fold).multiply(averageFoldSize).add(1);
		var foldEnd = ee.Number(foldStart).add(averageFoldSize.subtract(1));
		var foldNumbers = ee.List.sequence(foldStart, foldEnd);
		return ee.List(foldNumbers);
	});
// print('Fold Sequence Without Remaining Samples',foldSequenceWithoutRemainder);

	var remainingFoldSequence = ee.List.sequence(ee.Number(ee.List(foldSequenceWithoutRemainder.get(foldSequenceWithoutRemainder.length().subtract(1))).get(averageFoldSize.subtract(1))),
		ee.Number(ee.List(foldSequenceWithoutRemainder.get(foldSequenceWithoutRemainder.length().subtract(1))).get(averageFoldSize.subtract(1))).add(ee.Number(remainingSampleSize).subtract(1)));
// print('Remaining Fold Sequence',remainingFoldSequence);

// This is a list of lists describing which features will go into each fold
	var listsWithRemaindersAdded = foldSequenceWithoutRemainder.zip(remainingFoldSequence).map(function(list) {
		return ee.List(list).flatten();
	});
// print('Lists with Remainders Added',listsWithRemaindersAdded);

	var finalFoldLists = listsWithRemaindersAdded.cat(foldSequenceWithoutRemainder.slice(listsWithRemaindersAdded.length()));
// print('Final Fold Lists Formatted',finalFoldLists);

	var mainFoldList = ee.List.sequence(0, k - 1);
// print('Main Fold List',mainFoldList);


	// Compute the collected training data
	var trainingData = mainFoldList.map(function(foldNumber) {
		var listWithoutFold = finalFoldLists.get(foldNumber);
		var foldListOfLists = ee.FeatureCollection(preppedListOfFeats).filter(ee.Filter.inList('Fold_ID', listWithoutFold).not()).toList(collLength);
		return foldListOfLists;
	});
// print('Training Data Folds', trainingData);


	// Compute the validation folds
	var validationData = mainFoldList.map(function(foldNumber) {
		var listWithoutFold = finalFoldLists.get(foldNumber);
		var foldListOfLists = ee.FeatureCollection(preppedListOfFeats).filter(ee.Filter.inList('Fold_ID', listWithoutFold)).toList(collLength);
		return foldListOfLists;
	});
// print('Validation Data Folds', validationData);

//************************** Part3: Train the data and retrieve the values at the sample points**************************//
	// Classify the images based on the training folds
  var TrainingAccuracy = mainFoldList.map(function(foldNumber) {
		var CollectionTrain = ee.FeatureCollection(ee.List(trainingData.get(foldNumber)));
		var CollectionTest = ee.FeatureCollection(ee.List(validationData.get(foldNumber)));
		var trainedClassifier = classifierOfChoice.train(CollectionTrain, propertyToPredictAsString, CombinedBand);
		var trainAccuracy = trainedClassifier.confusionMatrix();
		var OverallAccuracy = trainAccuracy.accuracy();
		return OverallAccuracy;
	});
// print('Training overall accuracy: ', TrainingAccuracy);

// using test collection to get model estimation errors
	var TestAccuracy = mainFoldList.map(function(foldNumber) {
		// var trainingFold = imageToClassify.sampleRegions({
		var CollectionTrain = ee.FeatureCollection(ee.List(trainingData.get(foldNumber)));
		var CollectionTest = ee.FeatureCollection(ee.List(validationData.get(foldNumber)));
		var trainedClassifier = classifierOfChoice.train(CollectionTrain, propertyToPredictAsString, CombinedBand);
		var classifiedImages = CollectionTest.classify(trainedClassifier);
		var FoldVal = ee.FeatureCollection(classifiedImages);
    var FoldVal = FoldVal.remap([11,12,20,30,41,42,51,52,61,62,71,72,73,80],[10,10,20,30,40,40,50,50,60,60,71,72,73,80],'class')
	  var FoldVal = FoldVal.remap([11,12,20,30,41,42,51,52,61,62,71,72,73,80],[10,10,20,30,40,40,50,50,60,60,71,72,73,80],'classification')
		
		var testAccuracyMatrix = FoldVal.errorMatrix('class', 'classification');
		var testAccuracy = testAccuracyMatrix.accuracy();
		// var PA =testAccuracyMatrix.producersAccuracy();
		// var UA =testAccuracyMatrix.consumersAccuracy();
		// var TestAccuArray1 = ee.Array(FoldVal.aggregate_array('class'));
		// var TestAccuArray2 = ee.Array(FoldVal.aggregate_array('classification'));
		// Calculate the RMSE
    // var RMSE0 = ee.Number((TestAccuArray1.subtract(TestAccuArray2)).pow(2));       // array calculations
    // var RMSE1 = RMSE0.reduce('sum', [0]).get([0]);  // reduce the array to the sum -> output is a ee.Number()
    // var RMSE2 = RMSE1.divide(TestAccuArray1.length().get([0]));    // divide by the amount of observations
    // var RMSE3 = RMSE2.sqrt();                       // Get the RMSE
		return testAccuracyMatrix;
	});
print('Test accuracy: ', TestAccuracy);

