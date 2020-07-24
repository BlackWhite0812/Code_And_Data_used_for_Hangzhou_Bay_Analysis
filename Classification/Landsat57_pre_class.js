/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var StudyAreaWithWater = ee.FeatureCollection("users/blackwhitezou/TotalStudyArea"),
    GSWM = ee.Image("JRC/GSW1_1/GlobalSurfaceWater"),
    DEM = ee.Image("USGS/SRTMGL1_003"),
    Landsat7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR"),
    Landsat5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR"),
    geometry = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[120.346688120654, 31.046059987370548],
          [120.346688120654, 28.972292792458184],
          [122.357186167529, 28.972292792458184],
          [122.357186167529, 31.046059987370548]]], null, false),
    geometry2 = 
    /* color: #0b4a8b */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[118.303231089404, 30.74438208427271],
          [118.303231089404, 29.173935768206753],
          [120.346688120654, 29.173935768206753],
          [120.346688120654, 30.74438208427271]]], null, false),
    L7_2000 = ee.FeatureCollection("users/blackwhitezou/L7_2000V2"),
    L7_2001 = ee.FeatureCollection("users/blackwhitezou/L7_2001V2"),
    L7_2002 = ee.FeatureCollection("users/blackwhitezou/L7_2002V2"),
    L5_2003 = ee.FeatureCollection("users/blackwhitezou/L5_2003V2"),
    L5_2004 = ee.FeatureCollection("users/blackwhitezou/L5_2004V2"),
    L5_2005 = ee.FeatureCollection("users/blackwhitezou/L5_2005V2"),
    L5_2006 = ee.FeatureCollection("users/blackwhitezou/L5_2006V2"),
    L5_2007 = ee.FeatureCollection("users/blackwhitezou/L5_2007V2"),
    L5_2008 = ee.FeatureCollection("users/blackwhitezou/L5_2008V2"),
    L5_2009 = ee.FeatureCollection("users/blackwhitezou/L5_2009V2"),
    L5_2010 = ee.FeatureCollection("users/blackwhitezou/L5_2010V2"),
    L5_2011 = ee.FeatureCollection("users/blackwhitezou/L5_2011V2"),
    L7_2012 = ee.FeatureCollection("users/blackwhitezou/L5_2012V2");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// **************************************************************************************************//
// **************All preprocessing and classification for Landsat 5&7 dataset from 2000-2012 *******************//
// **************************************************************************************************//
// var L57VisParams = {
//   bands: ['B3', 'B2', 'B1'],
//   min: 0,
//   max: 3000,
//   gamma: 1.4,
// };

// ******************************* Part1: Import useful datasets *************************************//
// *********************Import hormonic features from script: HarmonicsL8 *************************//
var HarmonicsFeature = require("users/blackwhitezou/Thesis:HarmonicsL5&7");
// The Phase and Amplitude value of harmonic feature for 2013
var Harm2000 = HarmonicsFeature.HarmonicValues2000;
var Harm2001 = HarmonicsFeature.HarmonicValues2001;
var Harm2002 = HarmonicsFeature.HarmonicValues2002;
var Harm2003 = HarmonicsFeature.HarmonicValues2003;
var Harm2004 = HarmonicsFeature.HarmonicValues2004;
var Harm2005 = HarmonicsFeature.HarmonicValues2005;
var Harm2006 = HarmonicsFeature.HarmonicValues2006;
var Harm2007 = HarmonicsFeature.HarmonicValues2007;
var Harm2008 = HarmonicsFeature.HarmonicValues2008;
var Harm2009 = HarmonicsFeature.HarmonicValues2009;
var Harm2010 = HarmonicsFeature.HarmonicValues2010;
var Harm2011 = HarmonicsFeature.HarmonicValues2011;
var Harm2012 = HarmonicsFeature.HarmonicValues2012;

// ********************Part2: Process with useful features for classification *************************//
// ********************* 1. Function for adding some features as bands: *************************//
      //******** Index features: NDVI/NDBI/MNDWI/LSWI/EVI/SAVI **********//
      // ****** Other ancillary dataset: Global surface water mapping ****//
var L57_AddBand = function(image) {
  var ndvi = image.normalizedDifference(['B4_median', 'B3_median']).rename('NDVI');
  var ndbi = image.normalizedDifference(['B5_median', 'B4_median']).rename('NDBI');
  var mndwi = image.normalizedDifference(['B2_median', 'B5_median']).rename('MNDWI');
var lswi = image.normalizedDifference(['B4_median', 'B5_median']).rename('LSWI');
// Compute the EVI using an expression.
  var evi = image.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
      'NIR': image.select('B4_median'),
      'RED': image.select('B3_median'),
      'BLUE': image.select('B1_median')
  }).rename('EVI');

  // Compute the SAVI using an expression.
  var savi = image.expression(
    '((NIR - RED) / (NIR + RED + 0.5)) * 1.5', {
      'NIR': image.select('B4_median'),
      'RED': image.select('B3_median')
  }).rename('SAVI');
  var gswm = GSWM.select('occurrence').clip(StudyAreaWithWater).rename('GSWM');
  return image.addBands(ndvi).addBands(evi).addBands(ndbi).addBands(mndwi).addBands(lswi).addBands(savi).addBands(gswm);
};

//****************************** 2. Mask cloud function *********************************//
//Function to mask clouds based on the pixel_qa band of Landsat 5&7 SR data.
var cloudMaskL457 = function(image) {
  var qa = image.select('pixel_qa');
  // If the cloud bit (5) is set and the cloud confidence (7) is high
  // or the cloud shadow bit is set (3), then it's a bad pixel.
  var cloud = qa.bitwiseAnd(1 << 5)
                  .and(qa.bitwiseAnd(1 << 7))
                  .or(qa.bitwiseAnd(1 << 3));
  //var water = qa.bitwiseAnd(1<<2);
  // Remove edge pixels that don't occur in all bands
  var mask2 = image.mask().reduce(ee.Reducer.min());
  return image.updateMask(cloud.not()).updateMask(mask2);
};
// var dataset = ee.ImageCollection(Landsat5.filterDate('2010-01-01', '2010-12-31').map(cloudMaskL457));
// Map.addLayer(dataset.median().clip(StudyAreaWithWater), L57VisParams,'data2010');

//********************* 3. Stack Time series data from Landsat8 ************************//
var dataset_L7 = ee.ImageCollection(Landsat7.map(cloudMaskL457));
var Years_L7 = ee.List.sequence(2000, 2002);
  // Set the function to get the images collection
var ResearchData_L7 = ee.ImageCollection(Years_L7.map(function(y){
    var start = ee.Date.fromYMD(y, 1, 1);
    var end = start.advance(12, 'month');
    return dataset_L7.filterDate(start, end).reduce(ee.Reducer.median()).clip(StudyAreaWithWater).select(['B1_median', 'B2_median', 'B3_median', 'B4_median', 'B5_median', 'B6_median', 'B7_median']);
}));

var dataset_L5 = ee.ImageCollection(Landsat5.map(cloudMaskL457));
var Years_L5 = ee.List.sequence(2003, 2011);
  // Set the function to get the images collection
var ResearchData_L50311 = ee.ImageCollection(Years_L5.map(function(y){
    var start = ee.Date.fromYMD(y, 1, 1);
    var end = start.advance(12, 'month');
    return dataset_L5.filterDate(start, end).reduce(ee.Reducer.median()).clip(StudyAreaWithWater).select(['B1_median', 'B2_median', 'B3_median', 'B4_median', 'B5_median', 'B6_median', 'B7_median']);
}));
var data2012 =  dataset_L7.filterDate('2012-01-01', '2012-12-31').reduce(ee.Reducer.median()).clip(StudyAreaWithWater).select(['B1_median', 'B2_median', 'B3_median', 'B4_median', 'B5_median', 'B6_median', 'B7_median']);
var ResearchData_L5 = ResearchData_L50311.merge(data2012);

//****************** 4. Function for adding texture features for classification ******************//
// Add NDVI band into image for every year
var L7withIndex = ResearchData_L7.map(L57_AddBand);
var L5withIndex = ResearchData_L5.map(L57_AddBand);
var Ndvi_texture = function(image) {
  var ndvi = image.select('NDVI');
  var texturendvi_input = ndvi.add(127.5).multiply(127.5).toUint16();
  var textureMeasures = ['NDVI_asm', 'NDVI_contrast', 'NDVI_corr', 'NDVI_var', 'NDVI_idm', 'NDVI_savg', 'NDVI_ent', 'NDVI_diss'];
  var glcm_ndvi = texturendvi_input.glcmTexture().select(textureMeasures);
  return image.addBands(glcm_ndvi);
};
var L7texture_NDVI = L7withIndex.map(Ndvi_texture);
var L5texture_NDVI = L5withIndex.map(Ndvi_texture);

//********************* 5. Function for adding DEM features for classification *******************//
var terrain = function(image) {
  var elevation = DEM.select('elevation').clip(StudyAreaWithWater).rename('ELEVATION');
  var slope = ee.Terrain.slope(elevation).rename('SLOPE');
  return image.addBands(elevation).addBands(slope);
};
var L7features = L7texture_NDVI.map(terrain);
var L5features = L5texture_NDVI.map(terrain);
// Merge all image collections of Landsat5 & 7 from 2000-2012
var collection75 = ee.ImageCollection(L7features.merge(L5features));

// ********************** 6. Script for function: Add harmonic features ***************************//
var collection75List = collection75.toList(collection75.size());
var AunalImage2000 = ee.Image(collection75List.get(0));
var AunalImage2001 = ee.Image(collection75List.get(1));
var AunalImage2002 = ee.Image(collection75List.get(2));
var AunalImage2003 = ee.Image(collection75List.get(3));
var AunalImage2004 = ee.Image(collection75List.get(4));
var AunalImage2005 = ee.Image(collection75List.get(5));
var AunalImage2006 = ee.Image(collection75List.get(6));
var AunalImage2007 = ee.Image(collection75List.get(7));
var AunalImage2008 = ee.Image(collection75List.get(8));
var AunalImage2009 = ee.Image(collection75List.get(9));
var AunalImage2010 = ee.Image(collection75List.get(10));
var AunalImage2011 = ee.Image(collection75List.get(11));
var AunalImage2012 = ee.Image(collection75List.get(12));

// Extract harmonic features and rename the name of bands
var HarmImage2000 = ee.Image(Harm2000.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2001 = ee.Image(Harm2001.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2002 = ee.Image(Harm2002.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2003 = ee.Image(Harm2003.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2004 = ee.Image(Harm2004.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2005 = ee.Image(Harm2005.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2006 = ee.Image(Harm2006.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2007 = ee.Image(Harm2007.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2008 = ee.Image(Harm2008.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2009 = ee.Image(Harm2009.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2010 = ee.Image(Harm2010.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2011 = ee.Image(Harm2011.toBands()).rename('pha1','pha2','amp1','amp2');
var HarmImage2012 = ee.Image(Harm2012.toBands()).rename('pha1','pha2','amp1','amp2');

// Add harmonic features as four bands into image
var Image2000CO = ee.Image(AunalImage2000.addBands(HarmImage2000));
var Image2001CO = ee.Image(AunalImage2001.addBands(HarmImage2001));
var Image2002CO = ee.Image(AunalImage2002.addBands(HarmImage2002));
var Image2003CO = ee.Image(AunalImage2003.addBands(HarmImage2003));
var Image2004CO = ee.Image(AunalImage2004.addBands(HarmImage2004));
var Image2005CO = ee.Image(AunalImage2005.addBands(HarmImage2005));
var Image2006CO = ee.Image(AunalImage2006.addBands(HarmImage2006));
var Image2007CO = ee.Image(AunalImage2007.addBands(HarmImage2007));
var Image2008CO = ee.Image(AunalImage2008.addBands(HarmImage2008));
var Image2009CO = ee.Image(AunalImage2009.addBands(HarmImage2009));
var Image2010CO = ee.Image(AunalImage2010.addBands(HarmImage2010));
var Image2011CO = ee.Image(AunalImage2011.addBands(HarmImage2011));
var Image2012CO = ee.Image(AunalImage2012.addBands(HarmImage2012));

// Merge all image collections from 2000-2012
var Image57 = ee.ImageCollection([Image2000CO,Image2001CO,Image2002CO,Image2003CO,Image2004CO,
                                  Image2005CO,Image2006CO,Image2007CO,Image2008CO,Image2009CO,
                                  Image2010CO,Image2011CO,Image2012CO]);

// // ************ 7. Script for training dataset: extract all feature values from Landsat data based on samples **********//
//  Combine sample points from 2000-2012
var featL57 = ee.FeatureCollection([ee.FeatureCollection(L7_2000), ee.FeatureCollection(L7_2001), ee.FeatureCollection(L7_2002),
ee.FeatureCollection(L5_2003), ee.FeatureCollection(L5_2004), ee.FeatureCollection(L5_2005),
ee.FeatureCollection(L5_2006), ee.FeatureCollection(L5_2007), ee.FeatureCollection(L5_2008),
ee.FeatureCollection(L5_2009), ee.FeatureCollection(L5_2010), ee.FeatureCollection(L5_2011), ee.FeatureCollection(L7_2012)]);
var CombinedBands = ['B1_median','B2_median','B3_median','B4_median','B5_median','B6_median','B7_median',
                    'NDVI','EVI','NDBI','MNDWI','LSWI', 'SAVI',
                    'NDVI_asm', 'NDVI_contrast', 'NDVI_corr', 'NDVI_var', 'NDVI_idm', 'NDVI_savg', 'NDVI_ent', 'NDVI_diss','ELEVATION','SLOPE',
                    'pha1', 'pha2', 'amp1','amp2'];

//  Extract feature values from Landsat images
var ImgList = Image57.toList(13);
var ExtractFuc = ImgList.map(function(item){
    var TrainingPointL57 = ee.Image(item).select(CombinedBands).sampleRegions({
      collection: featL57.flatten().filter(ee.Filter.neq('class',0)),
      properties: ['class','year'],
      scale: 30,
      tileScale: 8,
      geometries: true
    });
  return TrainingPointL57;  
});

// Combine all of feature collection as the training dataset from 2000-2012
var TrainingPtImCol2000 = ee.FeatureCollection(ExtractFuc.get(0)).filter(ee.Filter.eq('year',2000));
var TrainingPtImCol2001 = ee.FeatureCollection(ExtractFuc.get(1)).filter(ee.Filter.eq('year',2001));
var TrainingPtImCol2002 = ee.FeatureCollection(ExtractFuc.get(2)).filter(ee.Filter.eq('year',2002));
var TrainingPtImCol2003 = ee.FeatureCollection(ExtractFuc.get(3)).filter(ee.Filter.eq('year',2003));
var TrainingPtImCol2004 = ee.FeatureCollection(ExtractFuc.get(4)).filter(ee.Filter.eq('year',2004));
var TrainingPtImCol2005 = ee.FeatureCollection(ExtractFuc.get(5)).filter(ee.Filter.eq('year',2005));
var TrainingPtImCol2006 = ee.FeatureCollection(ExtractFuc.get(6)).filter(ee.Filter.eq('year',2006));
var TrainingPtImCol2007 = ee.FeatureCollection(ExtractFuc.get(7)).filter(ee.Filter.eq('year',2007));
var TrainingPtImCol2008 = ee.FeatureCollection(ExtractFuc.get(8)).filter(ee.Filter.eq('year',2008));
var TrainingPtImCol2009 = ee.FeatureCollection(ExtractFuc.get(9)).filter(ee.Filter.eq('year',2009));
var TrainingPtImCol2010 = ee.FeatureCollection(ExtractFuc.get(10)).filter(ee.Filter.eq('year',2010));
var TrainingPtImCol2011 = ee.FeatureCollection(ExtractFuc.get(11)).filter(ee.Filter.eq('year',2011));
var TrainingPtImCol2012 = ee.FeatureCollection(ExtractFuc.get(12)).filter(ee.Filter.eq('year',2012));
var TrainingPtL75 = TrainingPtImCol2000.merge(TrainingPtImCol2001).merge(TrainingPtImCol2002)
                    .merge(TrainingPtImCol2003).merge(TrainingPtImCol2004)
                    .merge(TrainingPtImCol2005).merge(TrainingPtImCol2006)
                    .merge(TrainingPtImCol2007).merge(TrainingPtImCol2008)
                    .merge(TrainingPtImCol2009).merge(TrainingPtImCol2010)
                    .merge(TrainingPtImCol2011).merge(TrainingPtImCol2012);

// *********************************** Part3: Estimation fo Classification model**************************************//
// ***************************** 1. Script for classification with hold out cross validation ***********//
// // Split the traning dataset into two sub feature collection: training and test 
// var withRandom = TrainingPtL75.randomColumn('random');
// // Roughly 70% training, 30% testing.
// var split = 0.7;  
// var trainingPartition = withRandom.filter(ee.Filter.lt('random', split));
// var testingPartition = withRandom.filter(ee.Filter.gte('random', split));

// Trained with 70% of our data.
// var trainedClassifier = ee.Classifier.randomForest(40).train({
//   features: trainingPartition,
//   classProperty: 'class',
//   inputProperties: CombinedBands
// });

//// Show the accuracy of the model
// var trainAccuracy = trainedClassifier.confusionMatrix();
// var OA = trainAccuracy.accuracy();
// print('Training overall accuracy: ', OA);
// // var CA = trainAccuracy.consumersAccuracy();
// // var PA = trainAccuracy.producersAccuracy();
// Classify the validation data.
// var validated = testingPartition.classify(trainedClassifier);
// // // Get a confusion matrix representing expected accuracy.
// var testAccuracy = validated.errorMatrix('class', 'classification');
// // // print('Validation error matrix: ', testAccuracy);
// print('Validation overall accuracy: ', testAccuracy.accuracy());

// / ***************************** 2. Script for classification with 5-Fold cross validation ***********//
// In script: users/blackwhitezou/Thesis/CrossValidation57

// *********************************** Part4: Classification for 2000-2012 **************************************//
// ***************************** 1. Script for classification with all training data ***********//
// Function to use all training dataset to train RF model and classify image from 2000-2012 and remap the classified image
var classified0012 = Image57.map(function(img){
  var trainedClassifier = ee.Classifier.randomForest(40).train({
  features: TrainingPtL75,
  classProperty: 'class',
  inputProperties: CombinedBands
});
  var classified = img.select(CombinedBands).classify(trainedClassifier);
  var RemapImg = classified.select('classification').remap([11,12,20,30,41,42,51,52,61,62,71,72,73,80],[10,10,20,30,40,40,50,50,60,60,71,72,73,80]);
  var FinalImg = RemapImg.updateMask(RemapImg).clip(StudyAreaWithWater);
  return FinalImg
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
// var classfied0012List = classified0012.toList(classified0012.size());
// var Classified2004 = ee.Image(classfied0012List.get(4));
// Map.addLayer(Classified2000.select('remapped'), {palette: ReclassifiedPalette}, 'classification00');

// // // ***************************************** 2. Export classified image to drive **********************************************//
// // Export.image.toDrive({
// //   image: Final2010.select('remapped'),
// //   description: 'Img2010_2',
// //   scale: 30,
// //   region: geometry2,

// // });
// Export.image.toDrive({
//   image: Classified2004.select('remapped'),
//   description: 'Img2004_1',
//   scale: 30,
//   region: geometry,

// });
// Export.image.toDrive({
//   image: Classified2004.select('remapped'),
//   description: 'Img2004_2',
//   scale: 30,
//   region: geometry2,

// });


// // // // // // **************************************** 3. Calculate the area of each class ***********************************************************//
// // var classList = classified0012.toList(classified0012.size());
// var AreaPro = classified0012.map(function(img){
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
// // print(AreaPro)

// // Calalculate the area of each class for 2013
// // Covert image collection to list
// var AreaPro = AreaPro.toList(AreaPro.size());

// var AreaFuc2000 = ee.Image(AreaPro.get(0)).reduceRegion({
//   reducer:ee.Reducer.sum(),
//   geometry: StudyAreaWithWater,
//   scale:250,
//   bestEffort:true,
//   maxPixels: 1e10,
//   tileScale: 8
// });
// var Area2000 = ee.Number(AreaFuc2000)
// // .divide(1e6);
// // var calArea2 = ee.Number(reducearea.get('Water')).divide(1e6);
// print('Area of each LULC class in 2000: ', Area2000, 'square meters');

// // var AreaFuc2001 = ee.Image(AreaPro.get(1)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2001 = ee.Number(AreaFuc2001)
// // print('Area of each LULC class in 2001: ', Area2001, 'square meters');

// // var AreaFuc2002 = ee.Image(AreaPro.get(2)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2002 = ee.Number(AreaFuc2002)
// // print('Area of each LULC class in 2002: ', Area2002, 'square meters');

// // var AreaFuc2003 = ee.Image(AreaPro.get(3)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2003 = ee.Number(AreaFuc2003)
// // print('Area of each LULC class in 2003: ', Area2003, 'square meters');

// // var AreaFuc2004 = ee.Image(AreaPro.get(4)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2004 = ee.Number(AreaFuc2004)
// // print('Area of each LULC class in 2004: ', Area2004, 'square meters');

// // var AreaFuc2005 = ee.Image(AreaPro.get(5)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2005 = ee.Number(AreaFuc2005)
// // print('Area of each LULC class in 2005: ', Area2005, 'square meters');

// // var AreaFuc2006 = ee.Image(AreaPro.get(6)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2006 = ee.Number(AreaFuc2006)
// // print('Area of each LULC class in 2006: ', Area2006, 'square meters');

// // var AreaFuc2007 = ee.Image(AreaPro.get(7)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2007 = ee.Number(AreaFuc2007)
// // print('Area of each LULC class in 2007: ', Area2007, 'square meters');

// // var AreaFuc2008 = ee.Image(AreaPro.get(8)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2008 = ee.Number(AreaFuc2008)
// // print('Area of each LULC class in 2008: ', Area2008, 'square meters');

// // var AreaFuc2009 = ee.Image(AreaPro.get(9)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2009 = ee.Number(AreaFuc2009)
// // print('Area of each LULC class in 2009: ', Area2009, 'square meters');

// // var AreaFuc2010 = ee.Image(AreaPro.get(10)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2010 = ee.Number(AreaFuc2010)
// // print('Area of each LULC class in 2010: ', Area2010, 'square meters');

// // var AreaFuc2011 = ee.Image(AreaPro.get(11)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2011 = ee.Number(AreaFuc2011)
// // print('Area of each LULC class in 2011: ', Area2011, 'square meters');

// // var AreaFuc2012 = ee.Image(AreaPro.get(12)).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   tileScale: 8
// // });
// // var Area2012 = ee.Number(AreaFuc2012)
// // print('Area of each LULC class in 2012: ', Area2012, 'square meters');

// // Trying to create a function for calculate the area of each class from 2000-2012 (computation timed out)
// // var AreaPro = AreaPro.toList(AreaPro.size())
// // var AreaFunc = AreaPro.map(function(item){
// //   // var ImgArea = AreaPro.get(num);
// //   var AreaFuc = ee.Image(item).reduceRegion({
// //   reducer:ee.Reducer.sum(),
// //   geometry: StudyAreaWithWater,
// //   scale:250,
// //   bestEffort:true,
// //   maxPixels: 1e10,
// //   // tileScale: 1,
// //   tileScale: 8
// //   });
// //   // var Area = ee.Feature(null, AreaFuc);
// //   return AreaFuc;
// // });
// // print(AreaFunc);

exports = {
  classified0012 : classified0012,
  TrainingPtL75  : TrainingPtL75,
  CombinedBands  : CombinedBands
}