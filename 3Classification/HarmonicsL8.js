/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var Landsat8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR"),
    StudyAreaWithWater = ee.FeatureCollection("users/blackwhitezou/TotalStudyArea");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//*******************************************Part 1: Landsat8 preprocessing**************************************//
//Function to mask clouds based on the pixel_qa band of Landsat 8 SR data.
// @param {ee.Image} image input Landsat 8 SR image
// @return {ee.Image} cloudmasked Landsat 8 image
function maskL8sr(image) {
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  // Get the pixel QA band.
  var qa = image.select('pixel_qa');
  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  // Return the masked image, scaled to TOA reflectance, without the QA bands.
  
  return image.updateMask(mask)
      .select("B[4-5]*")
      .copyProperties(image, ["system:time_start"]);
  // // Return the masked image
  // return image.updateMask(mask);
}
var collection1_2013 = Landsat8.map(maskL8sr).filterBounds(StudyAreaWithWater).filterDate('2013-01-01', '2013-12-31');
var collection1_2014 = Landsat8.map(maskL8sr).filterBounds(StudyAreaWithWater).filterDate('2014-01-01', '2014-12-31');
var collection1_2015 = Landsat8.map(maskL8sr).filterBounds(StudyAreaWithWater).filterDate('2015-01-01', '2015-12-31');
var collection1_2016 = Landsat8.map(maskL8sr).filterBounds(StudyAreaWithWater).filterDate('2016-01-01', '2016-12-31');
var collection1_2017 = Landsat8.map(maskL8sr).filterBounds(StudyAreaWithWater).filterDate('2017-01-01', '2017-12-31');
// print(collection1_2013);

// Use this function to add variables for NDVI, time and a constant
// to Landsat 8 imagery.
var addVariables = function(image) {
// Compute time in fractional years since the epoch.
var date = ee.Date(image.get('system:time_start'));
var years = date.difference(ee.Date('1970-01-01'), 'year');
// Return the image with the added bands.
return image
// Add an NDVI band.
.addBands(image.normalizedDifference(['B5', 'B4']).rename('NDVI'))
// Add a time band.
.addBands(ee.Image(years).rename('t'))
.float()
// Add a constant band.
.addBands(ee.Image.constant(1));
};
var collection2_2013 = collection1_2013.map(addVariables);
var collection2_2014 = collection1_2014.map(addVariables);
var collection2_2015 = collection1_2015.map(addVariables);
var collection2_2016 = collection1_2016.map(addVariables);
var collection2_2017 = collection1_2017.map(addVariables);
// print(collection2_2013);

//*************************************Part 2: Calculate harmonic regression for Landsat8*************************//
// Use these independent variables in the harmonic regression.
// Name of the dependent variable.
var dependent = ee.String('NDVI');
// var harmonicIndependents = ee.List(['constant', 't', 'cos', 'sin', 'cos2', 'sin2']);
// var harmonicLandsat = function(image) {
//   var timeRadians = image.select('t').multiply(2 * Math.PI);
//   return image
//   .addBands(timeRadians.cos().rename('cos'))
//   .addBands(timeRadians.sin().rename('sin'))
//   .addBands(timeRadians.multiply(2).cos().rename('cos2'))
//   .addBands(timeRadians.multiply(2).sin().rename('sin2'));
// };
var harmonicIndependents = ee.List(['constant', 't', 'cos', 'sin','cos2', 'sin2']);
var harmonicLandsat = function(image) {
  var timeRadians = image.select('t').multiply(2 * Math.PI);
  return image
  .addBands(timeRadians.cos().rename('cos'))
  .addBands(timeRadians.sin().rename('sin'))
  .addBands(timeRadians.multiply(2).cos().rename('cos2'))
  .addBands(timeRadians.multiply(2).sin().rename('sin2'));
};

var timeRadians_2013 = collection2_2013.map(harmonicLandsat);
var timeRadians_2014 = collection2_2014.map(harmonicLandsat);
var timeRadians_2015 = collection2_2015.map(harmonicLandsat);
var timeRadians_2016 = collection2_2016.map(harmonicLandsat);
var timeRadians_2017 = collection2_2017.map(harmonicLandsat);
// print(timeRadians_2013);

// **********************Part 3: Transfer the image collection to list and show every image inside for checking the result ***********//
// For 2013
var harmonicTrend2013 = timeRadians_2013
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2014
var harmonicTrend2014 = timeRadians_2014
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2015
var harmonicTrend2015 = timeRadians_2015
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));
// For 2016
var harmonicTrend2016 = timeRadians_2016
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2017
var harmonicTrend2017 = timeRadians_2017
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));
// print(harmonicTrend2013);
// print(harmonicTrend2014);
// print(harmonicTrend2015);
// print(harmonicTrend2016);
// print(harmonicTrend2017);

// **********************Part 4: Turn the array image into a multi-band image of coefficients**********************//
// Turn the array image into a multi-band image of coefficients.
var harmonicTrendCoefficients2013 = harmonicTrend2013.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2014 = harmonicTrend2014.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2015 = harmonicTrend2015.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2016 = harmonicTrend2016.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2017 = harmonicTrend2017.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

// print(harmonicTrendCoefficients2013);

// // Compute fitted values.
// // Compute fitted values for 2013.
// var fittedHarmonic2013 = timeRadians_2013.map(function(image) {
// return image.addBands(
// image.select(harmonicIndependents)
// .multiply(harmonicTrendCoefficients2013)
// .reduce('sum')
// .rename('fitted'));
// });

// // Compute fitted values for 2014.
// var fittedHarmonic2014 = timeRadians_2014.map(function(image) {
// return image.addBands(
// image.select(harmonicIndependents)
// .multiply(harmonicTrendCoefficients2014)
// .reduce('sum')
// .rename('fitted'));
// });

// // Compute fitted values for 2015.
// var fittedHarmonic2015 = timeRadians_2015.map(function(image) {
// return image.addBands(
// image.select(harmonicIndependents)
// .multiply(harmonicTrendCoefficients2015)
// .reduce('sum')
// .rename('fitted'));
// });

// // Compute fitted values for 2016.
// var fittedHarmonic2016 = timeRadians_2016.map(function(image) {
// return image.addBands(
// image.select(harmonicIndependents)
// .multiply(harmonicTrendCoefficients2016)
// .reduce('sum')
// .rename('fitted'));
// });

// // Compute fitted values for 2017.
// var fittedHarmonic2017 = timeRadians_2017.map(function(image) {
// return image.addBands(
// image.select(harmonicIndependents)
// .multiply(harmonicTrendCoefficients2017)
// .reduce('sum')
// .rename('fitted'));
// });
// // print(fittedHarmonic2013);


// // Plot the fitted model and the original data at the ROI.
// print(ui.Chart.image.series(
// fittedHarmonic.select(['fitted','NDVI']), StudyAreaWithWater, ee.Reducer.mean(), 30)
// .setSeriesNames(['NDVI', 'fitted'])
// .setOptions({
// title: 'Harmonic model: original and fitted values',
// lineWidth: 1,
// pointSize: 3,
// }));

// ***************************************Part 5: Compute phase and amplitude *********************************//
// Compute phase and amplitude for 2013.
var phase2013_order1 = harmonicTrendCoefficients2013.select('sin')
.atan2(harmonicTrendCoefficients2013.select('cos'))
// .unitScale(-Math.PI, Math.PI);
// print(phase2013_order1);
var phase2013_order2 = harmonicTrendCoefficients2013.select('sin2')
.atan2(harmonicTrendCoefficients2013.select('cos2'))
// .unitScale(-Math.PI, Math.PI);

var amplitude2013_order1 = harmonicTrendCoefficients2013.select('sin')
.hypot(harmonicTrendCoefficients2013.select('cos'));

var amplitude2013_order2 = harmonicTrendCoefficients2013.select('sin2')
.hypot(harmonicTrendCoefficients2013.select('cos2'))
;
// print(phase2013);
// print(amplitude2013);

// Compute phase and amplitude for 2014.
var phase2014_order1 = harmonicTrendCoefficients2014.select('sin')
.atan2(harmonicTrendCoefficients2014.select('cos'))
// Scale to [0, 1] from radians.
// .unitScale(-Math.PI, Math.PI);
var phase2014_order2 = harmonicTrendCoefficients2014.select('sin2')
.atan2(harmonicTrendCoefficients2014.select('cos2'))
// Scale to [0, 1] from radians.
// .unitScale(-Math.PI, Math.PI);
var amplitude2014_order2 = harmonicTrendCoefficients2014.select('sin2')
.hypot(harmonicTrendCoefficients2014.select('cos2'))
// Add a scale factor for visualization.
// .multiply(5);
var amplitude2014_order1 = harmonicTrendCoefficients2014.select('sin')
.hypot(harmonicTrendCoefficients2014.select('cos'))
// Add a scale factor for visualization.
// .multiply(5);

// Compute phase and amplitude for 2015.
var phase2015_order1 = harmonicTrendCoefficients2015.select('sin')
.atan2(harmonicTrendCoefficients2015.select('cos'))
// Scale to [0, 1] from radians.
// .unitScale(-Math.PI, Math.PI);
var phase2015_order2 = harmonicTrendCoefficients2015.select('sin2')
.atan2(harmonicTrendCoefficients2015.select('cos2'))
// Scale to [0, 1] from radians.
// .unitScale(-Math.PI, Math.PI);
var amplitude2015_order2 = harmonicTrendCoefficients2015.select('sin2')
.hypot(harmonicTrendCoefficients2015.select('cos2'))
// Add a scale factor for visualization.
// .multiply(5);
var amplitude2015_order1 = harmonicTrendCoefficients2015.select('sin')
.hypot(harmonicTrendCoefficients2015.select('cos'))
// Add a scale factor for visualization.
// .multiply(5);

// Compute phase and amplitude for 2016.
var phase2016_order1 = harmonicTrendCoefficients2016.select('sin')
.atan2(harmonicTrendCoefficients2016.select('cos'))
// Scale to [0, 1] from radians.
// .unitScale(-Math.PI, Math.PI);
var phase2016_order2 = harmonicTrendCoefficients2016.select('sin2')
.atan2(harmonicTrendCoefficients2016.select('cos2'))
// Scale to [0, 1] from radians.
// .unitScale(-Math.PI, Math.PI);
var amplitude2016_order2 = harmonicTrendCoefficients2016.select('sin2')
.hypot(harmonicTrendCoefficients2016.select('cos2'))
// Add a scale factor for visualization.
// .multiply(5);
var amplitude2016_order1 = harmonicTrendCoefficients2016.select('sin')
.hypot(harmonicTrendCoefficients2016.select('cos'))
// Add a scale factor for visualization.
// .multiply(5);

// Compute phase and amplitude for 2017.
var phase2017_order1 = harmonicTrendCoefficients2017.select('sin')
.atan2(harmonicTrendCoefficients2017.select('cos'))
// Scale to [0, 1] from radians.
// .unitScale(-Math.PI, Math.PI);
var phase2017_order2 = harmonicTrendCoefficients2017.select('sin2')
.atan2(harmonicTrendCoefficients2017.select('cos2'))
// Scale to [0, 1] from radians.
// .unitScale(-Math.PI, Math.PI);
var amplitude2017_order2 = harmonicTrendCoefficients2017.select('sin2')
.hypot(harmonicTrendCoefficients2017.select('cos2'));
// Add a scale factor for visualization.
var amplitude2017_order1 = harmonicTrendCoefficients2017.select('sin')
.hypot(harmonicTrendCoefficients2017.select('cos'));
// Add a scale factor for visualization.
// print(phase2017);
// print(amplitude2017);

// The Phase and Amplitude value of harmonic feature for 2013
var pha2013_1 = phase2013_order1.select('sin').rename('Pha2013_1');
var pha2013_2 = phase2013_order2.select('sin2').rename('Pha2013_2');
var amp2013_1 = amplitude2013_order1.select('sin').rename('amp2013_1');
var amp2013_2 = amplitude2013_order2.select('sin2').rename('amp2013_2');

// The Phase and Amplitude value of harmonic feature for 2017
var pha2014_1 = phase2014_order1.select('sin').rename('Pha2014_1');
var pha2014_2 = phase2014_order2.select('sin2').rename('Pha2014_2');
var amp2014_1 = amplitude2014_order1.select('sin').rename('amp2014_1');
var amp2014_2 = amplitude2014_order2.select('sin2').rename('amp2014_2');

// The Phase and Amplitude value of harmonic feature for 2017
var pha2015_1 = phase2015_order1.select('sin').rename('Pha2015_1');
var pha2015_2 = phase2015_order2.select('sin2').rename('Pha2015_2');
var amp2015_1 = amplitude2015_order1.select('sin').rename('amp2015_1');
var amp2015_2 = amplitude2015_order2.select('sin2').rename('amp2015_2');

// The Phase and Amplitude value of harmonic feature for 2017
var pha2016_1 = phase2016_order1.select('sin').rename('Pha2016_1');
var pha2016_2 = phase2016_order2.select('sin2').rename('Pha2016_2');
var amp2016_1 = amplitude2016_order1.select('sin').rename('amp2016_1');
var amp2016_2 = amplitude2016_order2.select('sin2').rename('amp2016_2');

// The Phase and Amplitude value of harmonic feature for 2017
var pha2017_1 = phase2017_order1.select('sin').rename('Pha2017_1');
var pha2017_2 = phase2017_order2.select('sin2').rename('Pha2017_2');
var amp2017_1 = amplitude2017_order1.select('sin').rename('amp2017_1');
var amp2017_2 = amplitude2017_order2.select('sin2').rename('amp2017_2');
// // print(amp2015_1);

// ****************************Part 6: Create a collection by giving a list to the constructor***********************//
// var HarmonicValues2013 = ee.ImageCollection([pha2013_1, pha2013_2, amp2013_1, amp2013_2]);
var HarmonicValues2013 = ee.ImageCollection([pha2013_1, pha2013_2, amp2013_1, amp2013_2]);
var HarmonicValues2014 = ee.ImageCollection([pha2014_1, pha2014_2, amp2014_1, amp2014_2]);
var HarmonicValues2015 = ee.ImageCollection([pha2015_1, pha2015_2, amp2015_1, amp2015_2]);
var HarmonicValues2016 = ee.ImageCollection([pha2016_1, pha2016_2, amp2016_1, amp2016_2]);
var HarmonicValues2017 = ee.ImageCollection([pha2017_1, pha2017_2, amp2017_1, amp2017_2]);

//*********************************Part 7: Export the harmonic features********************************************//
exports = {
  // pha2013_1 : pha2013_1,
  // pha2013_2 : pha2013_2,
  // amp2013_1 : amp2013_1,
  // amp2013_2 : amp2013_2,
  
  // pha2014_1 : pha2014_1,
  // pha2014_2 : pha2014_2,
  // amp2014_1 : amp2014_1,
  // amp2014_2 : amp2014_2,
  
  // pha2015_1 : pha2015_1,
  // pha2015_2 : pha2015_2,
  // amp2015_1 : amp2015_1,
  // amp2015_2 : amp2015_2,
  
  // pha2016_1 : pha2014_1,
  // pha2016_2 : pha2014_2,
  // amp2016_1 : amp201_1,
  // amp2016_2 : amp2016_2,
  
  HarmonicValues2013 : HarmonicValues2013,
  HarmonicValues2014 : HarmonicValues2014,
  HarmonicValues2015 : HarmonicValues2015,
  HarmonicValues2016 : HarmonicValues2016,
  HarmonicValues2017 : HarmonicValues2017,

  };