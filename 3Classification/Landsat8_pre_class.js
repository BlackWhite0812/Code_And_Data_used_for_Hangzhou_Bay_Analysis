/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var Landsat8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR"),
    StudyAreaWithWater = ee.FeatureCollection("users/blackwhitezou/TotalStudyArea"),
    GSWM = ee.Image("JRC/GSW1_1/GlobalSurfaceWater"),
    DEM = ee.Image("USGS/SRTMGL1_003"),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[120.1909347794558, 31.054081187187556],
          [120.1909347794558, 28.9612603501937],
          [122.3332687638308, 28.9612603501937],
          [122.3332687638308, 31.054081187187556]]], null, false),
    geometry2 = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[118.3122726700808, 30.582332107436585],
          [118.3122726700808, 29.15333076526749],
          [120.1909347794558, 29.15333076526749],
          [120.1909347794558, 30.582332107436585]]], null, false),
    L8_2013 = ee.FeatureCollection("users/blackwhitezou/L8_2013V2"),
    L8_2014 = ee.FeatureCollection("users/blackwhitezou/L8_2014V2"),
    L8_2015 = ee.FeatureCollection("users/blackwhitezou/L8_2015V2"),
    L8_2016 = ee.FeatureCollection("users/blackwhitezou/L8_2016V2"),
    L8_2017 = ee.FeatureCollection("users/blackwhitezou/L8_2017V2"),
    geometry3 = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[120.57112940764091, 30.780594712096757],
          [120.57112940764091, 30.06058939398951],
          [121.62032374357841, 30.06058939398951],
          [121.62032374357841, 30.780594712096757]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// Set some Visualization parameters 
// var L8medianVisParams = {
//   bands: ['B4', 'B3', 'B2'],
//   min: 0,
//   max: 3000,
//   gamma: 1.4,
// };
// var ReclassifiedPalette = [
//   '808000', // Cropland: Greenhouse, open field
//   '008000', // forest
//   '9ACD32', // Grass
//   '556B2F', // Shrub
//   '48D1CC', // wetlands
//   '008B8B', // water
//   'A52A2A',   // impervious surface: industrail, residential, others
//   'D2B48C', // bareland
// ];

// **************************************************************************************************//
// ************************* All preprocessing for Landsat 8 dataset from 2013-2017 *******************//
// **************************************************************************************************//

// ******************************* Part1: Import useful datasets *************************************//
// *********************Import hormonic features from script: HarmonicsL8 *************************//
var HarmonicsFeature = require("users/blackwhitezou/Thesis:HarmonicsL8");
var Harm2013 = HarmonicsFeature.HarmonicValues2013;
var Harm2014 = HarmonicsFeature.HarmonicValues2014;
var Harm2015 = HarmonicsFeature.HarmonicValues2015;
var Harm2016 = HarmonicsFeature.HarmonicValues2016;
var Harm2017 = HarmonicsFeature.HarmonicValues2017;

// ********************Part2: Process with useful features for classification *************************//
// ********************* 1. Function for adding some features as bands: *************************//
      //******** Index features: NDVI/NDBI/MNDWI/LSWI/EVI/SAVI **********//
      // ****** Other ancillary dataset: Global surface water mapping ****//
var L8_AddBand = function(image) {
  var ndvi = image.normalizedDifference(['B5_median', 'B4_median']).rename('NDVI');
  var ndbi = image.normalizedDifference(['B6_median', 'B5_median']).rename('NDBI');
  var mndwi = image.normalizedDifference(['B3_median', 'B6_median']).rename('MNDWI');
  var lswi = image.normalizedDifference(['B5_median', 'B6_median']).rename('LSWI');
  // Compute the EVI using an expression.
  var evi = image.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
      'NIR': image.select('B5_median'),
      'RED': image.select('B4_median'),
      'BLUE': image.select('B2_median')
  }).rename('EVI');
  // Compute the SAVI using an expression.
  var savi = image.expression(
    '((NIR - RED) / (NIR + RED + 0.5)) * 1.5', {
      'NIR': image.select('B5_median'),
      'RED': image.select('B4_median')
  }).rename('SAVI');
  var gswm = GSWM.select('occurrence').clip(StudyAreaWithWater).rename('GSWM');
  // var pha2017_1 = HarmonicsFeature.amplitude2017_order1.select('sin').rename('Pha2017_1');
  // Calculate GLCM texture measures
  return image.addBands(ndvi).addBands(evi).addBands(ndbi).addBands(mndwi).addBands(lswi).addBands(savi).addBands(gswm);
};

//****************************** 2. Mask cloud function *********************************//
//Function to mask clouds based on the pixel_qa band of Landsat 8 SR data.
function maskL8sr(image) {
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  // Get the pixel QA band.
  var qa = image.select('pixel_qa');
  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}

//********************* 3. Stack Time series data from Landsat8 ************************//
var dataset_L8 = ee.ImageCollection(Landsat8.map(maskL8sr));
var Years_L8 = ee.List.sequence(2013, 2017);
  // Set the function to get the images collection
var ResearchData_L8 = ee.ImageCollection(Years_L8.map(function(y){
    var start = ee.Date.fromYMD(y, 1, 1);
    var end = start.advance(12, 'month');
    return dataset_L8.filterDate(start, end).reduce(ee.Reducer.median()).clip(StudyAreaWithWater).select(['B2_median', 'B3_median', 'B4_median', 'B5_median', 'B6_median', 'B7_median']);
}));

// Display specific year's image for checking
// var dataset = ee.ImageCollection(Landsat8.filterDate('2017-01-01', '2017-12-31').map(maskL8sr));
// Map.addLayer(dataset.median().clip(StudyAreaWithWater), L8medianVisParams,'data2017');

//****************** 4. Function for adding texture features for classification ******************//
var Ndvi_texture = function(image) {
  var ndvi = image.select('NDVI');
  var texturendvi_input = ndvi.add(127.5).multiply(127.5).toUint16();
  // Calculate GLCM texture measures
  var textureMeasures = ['NDVI_asm', 'NDVI_contrast', 'NDVI_corr', 'NDVI_var', 'NDVI_idm', 'NDVI_savg', 'NDVI_ent', 'NDVI_diss'];
  var glcm_ndvi = texturendvi_input.glcmTexture().select(textureMeasures);
  return image.addBands(glcm_ndvi);
};

//********************* 5. Function for adding DEM features for classification *******************//
var terrain = function(image) {
  var elevation = DEM.select('elevation').clip(StudyAreaWithWater).rename('ELEVATION');
  var slope = ee.Terrain.slope(elevation).rename('SLOPE');
  return image.addBands(elevation).addBands(slope);
};

//********************* 6. Implement all functions to combine all features together *******************//
var L8features = ResearchData_L8
  .map(L8_AddBand)
  .map(Ndvi_texture)
  .map(terrain);
  
// ********************** 7. Script for function: Add harmonic features ***************************//
var L8features = L8features.toList(L8features.size());
var AunalImage2013 = ee.Image(L8features.get(0));
var AunalImage2014 = ee.Image(L8features.get(1));
var AunalImage2015 = ee.Image(L8features.get(2));
var AunalImage2016 = ee.Image(L8features.get(3));
var AunalImage2017 = ee.Image(L8features.get(4));
var HarmImage2013 = ee.Image(Harm2013.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2014 = ee.Image(Harm2014.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2015 = ee.Image(Harm2015.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2016 = ee.Image(Harm2016.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2017 = ee.Image(Harm2017.toBands()).rename('pha1','pha2','amp1','amp2');
var Img2013 = ee.Image(AunalImage2013.addBands(HarmImage2013));
var Img2014 = ee.Image(AunalImage2014.addBands(HarmImage2014));
var Img2015 = ee.Image(AunalImage2015.addBands(HarmImage2015));
var Img2016 = ee.Image(AunalImage2016.addBands(HarmImage2016));
var Img2017 = ee.Image(AunalImage2017.addBands(HarmImage2017));
var Image8 = ee.ImageCollection([Img2013, Img2014, Img2015, Img2016, Img2017]);

// // ************ 8. Script for training dataset: extract all feature values from Landsat data based on samples **********//
//  Combine sample points from 2013-2017
var featL8 = ee.FeatureCollection([ee.FeatureCollection(L8_2013), ee.FeatureCollection(L8_2014), ee.FeatureCollection(L8_2015),ee.FeatureCollection(L8_2016),ee.FeatureCollection(L8_2017)]);

//  Extract feature values from Landsat images
var ImgList = Image8.toList(5);
var CombinedBands = ['B2_median','B3_median','B4_median','B5_median','B6_median','B7_median',
                    'NDVI','EVI','NDBI','MNDWI','LSWI', 'SAVI',
                    'NDVI_asm', 'NDVI_contrast', 'NDVI_corr', 'NDVI_var', 'NDVI_idm', 'NDVI_savg', 'NDVI_ent', 'NDVI_diss','ELEVATION','SLOPE',
                    'pha1', 'pha2', 'amp1','amp2'];

var ExtractFuc = ImgList.map(function(item){
    var TrainingPointL8 = ee.Image(item).select(CombinedBands).sampleRegions({
      collection: featL8.flatten().filter(ee.Filter.neq('class',0)),
      properties: ['class','year'],
      scale: 30,
      tileScale: 8,
      geometries: true
    });
  return TrainingPointL8;  
});

// Combine all of feature collection as the training dataset from 2013-2017
var TrainingPtImCol2013 = ee.FeatureCollection(ExtractFuc.get(0)).filter(ee.Filter.eq('year',2013));
var TrainingPtImCol2014 = ee.FeatureCollection(ExtractFuc.get(1)).filter(ee.Filter.eq('year',2014));
var TrainingPtImCol2015 = ee.FeatureCollection(ExtractFuc.get(2)).filter(ee.Filter.eq('year',2015));
var TrainingPtImCol2016 = ee.FeatureCollection(ExtractFuc.get(3)).filter(ee.Filter.eq('year',2016));
var TrainingPtImCol2017 = ee.FeatureCollection(ExtractFuc.get(4)).filter(ee.Filter.eq('year',2017));
var TrainingPtL8 = TrainingPtImCol2013.merge(TrainingPtImCol2014).merge(TrainingPtImCol2015).merge(TrainingPtImCol2016).merge(TrainingPtImCol2017);


// *********************************** Part3: Estimation fo Classification model**************************************//
// ***************************** 1. Script for classification with hold out cross validation ***********//
// //Split the traning dataset into two sub feature collection: training and test 
// var withRandom = TrainingPtL8.randomColumn('random');

// //Roughly 70% training, 30% testing.
// var split = 0.7;  
// var trainingPartition = withRandom.filter(ee.Filter.lt('random', split));
// var testingPartition = withRandom.filter(ee.Filter.gte('random', split));

// //Trained with 70% of our data.
// var trainedClassifier = ee.Classifier.randomForest(50).train({
//   features: trainingPartition,
//   classProperty: 'class',
//   inputProperties: CombinedBands
// });

//// Show the accuracy of the model
// var trainAccuracy = trainedClassifier.confusionMatrix();
// var OA = trainAccuracy.accuracy();
// print('Training overall accuracy: ', OA);

// //Show the accuracy of the model (out-of-bag)
// var validated = testingPartition.classify(trainedClassifier);
// //Get a confusion matrix representing expected accuracy.
// var testAccuracy = validated.errorMatrix('class', 'classification');
// print('Validation overall accuracy: ', testAccuracy.accuracy());

// ***************************** 2. Script for classification with 5-Fold cross validation ***********//
// In script: users/blackwhitezou/Thesis/CrossValidation8

// *********************************** Part4: Classification and area calculation for 2013-2017 **************************************//
// ***************************** 1. Script for classification with all training data ***********//
// Landsat images for classification from 2013-2017
var classified1317 = Image8.map(function(img){
  var trainedClassifier = ee.Classifier.randomForest(50).train({
  features: TrainingPtL8,
  classProperty: 'class',
  inputProperties: CombinedBands
});
  var classified = img.select(CombinedBands).classify(trainedClassifier);
  var RemapImg = classified.select('classification').remap([11,12,20,30,41,42,51,52,61,62,71,72,73,80],[10,10,20,30,40,40,50,50,60,60,71,72,73,80]);
  var FinalImg = RemapImg.updateMask(RemapImg).clip(StudyAreaWithWater);
  return FinalImg;
});

// var ReclassifiedPalette = [
//   '808000', // Cropland: Greenhouse, open field
//   '008000', // forest
//   '9ACD32', // Grass
//   '556B2F', // Shrub
//   '48D1CC', // wetlands
//   '008B8B', // water
//   'A52A2A',   // impervious surface: industrail, residential, others
//   'D2B48C', // bareland
// ];

// Display the results for checking
// var classified1317List = classified1317.toList(classified1317.size());
// var Classified2014 = ee.Image(classified1317List.get(2));
// Map.addLayer(Classified2013.select('remapped'), {palette: ReclassifiedPalette}, 'classification13');

// // // *****************************************2. Export classified image to drive**********************************************//
// Export.image.toDrive({
//   image: Classified2014.select('remapped'),
//   description: 'Img2014_1',
//   scale: 30,
//   region: geometry,

// });
// Export.image.toDrive({
//   image: Classified2014.select('remapped'),
//   description: 'Img2014_2',
//   scale: 30,
//   region: geometry2,

// });

// ***************************** 3. Script for calculating area of each class ****************************//
// Calculte the area of each class
// var AreaProFuc = classified1317.map(function(img){
//   var area = ee.Image.pixelArea();
//   var AgriMask = img.select('remapped').eq(10).multiply(area).rename('Agriculture');
//   var ForestMask = img.select('remapped').eq(20).multiply(area).rename('Forest');
//   var GrassMask = img.select('remapped').eq(30).multiply(area).rename('Grassland');
//   var ShrubMask = img.select('remapped').eq(40).multiply(area).rename('Shrubland');
//   var WetMask = img.select('remapped').eq(50).multiply(area).rename('Wetland');
//   var WaterMask = img.select('remapped').eq(60).multiply(area).rename('Water');
//   var ImperMask = img.select('remapped').eq(70).multiply(area).rename('Impervious');
//   var BareMask = img.select('remapped').eq(80).multiply(area).rename('Bareland');
  
//   var AreaImage = img.addBands(AgriMask)
//                       .addBands(ForestMask)
//                       .addBands(GrassMask)
//                       .addBands(ShrubMask)
//                       .addBands(WetMask)
//                       .addBands(WaterMask)
//                       .addBands(ImperMask)
//                       .addBands(BareMask);
//   return AreaImage;
// });


// // Calalculate the area of each class for 2013
// // Covert image collection to list
// var AreaProFuc = AreaProFuc.toList(AreaProFuc.size());
// var AreaFuc2013 = ee.Image(AreaProFuc.get(0)).reduceRegion({
//   reducer:ee.Reducer.sum(),
//   geometry: StudyAreaWithWater,
//   scale:250,
//   bestEffort:true,
//   maxPixels: 1e10,
//   tileScale: 8
// });
// var Area2013 = ee.Number(AreaFuc2013)
// print('Area of each LULC class in 2013: ', Area2013, 'square meters');

// var AreaFuc2014 = ee.Image(AreaProFuc.get(1)).reduceRegion({
//   reducer:ee.Reducer.sum(),
//   geometry: StudyAreaWithWater,
//   scale:250,
//   bestEffort:true,
//   maxPixels: 1e10,
//   tileScale: 8
// });
// var Area2014 = ee.Number(AreaFuc2014)
// print('Area of each LULC class in 2014: ', Area2014, 'square meters');

// var AreaFuc2015 = ee.Image(AreaProFuc.get(2)).reduceRegion({
//   reducer:ee.Reducer.sum(),
//   geometry: StudyAreaWithWater,
//   scale:250,
//   bestEffort:true,
//   maxPixels: 1e10,
//   tileScale: 8
// });
// var Area2015 = ee.Number(AreaFuc2015);
// print('Area of each LULC class in 2015: ', Area2015, 'square meters');

// var AreaFuc2016 = ee.Image(AreaProFuc.get(3)).reduceRegion({
//   reducer:ee.Reducer.sum(),
//   geometry: StudyAreaWithWater,
//   scale:250,
//   bestEffort:true,
//   maxPixels: 1e10,
//   tileScale: 8
// });
// var Area2016 = ee.Number(AreaFuc2016)
// print('Area of each LULC class in 2016: ', Area2016, 'square meters');

// var AreaFuc2017 = ee.Image(AreaProFuc.get(4)).reduceRegion({
//   reducer:ee.Reducer.sum(),
//   geometry: StudyAreaWithWater,
//   scale:250,
//   bestEffort:true,
//   maxPixels: 1e10,
//   tileScale: 8
// });
// var Area2017 = ee.Number(AreaFuc2017)
// print('Area of each LULC class in 2017: ', Area2017, 'square meters');

exports = {
  classified1317 : classified1317,
  CombinedBands  : CombinedBands,
  TrainingPtL8   : TrainingPtL8
}