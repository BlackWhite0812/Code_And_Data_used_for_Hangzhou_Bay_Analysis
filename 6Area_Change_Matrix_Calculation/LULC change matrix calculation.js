/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var StudyAreaWithWater = ee.FeatureCollection("users/blackwhitezou/TotalStudyArea"),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[118.264710747751, 30.611842701407788],
          [118.264710747751, 29.15448794844207],
          [119.879700982126, 29.15448794844207],
          [119.879700982126, 30.611842701407788]]], null, false),
    geometry2 = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[119.879700982126, 31.036391134072446],
          [119.879700982126, 28.962419690757272],
          [122.362611138376, 28.962419690757272],
          [122.362611138376, 31.036391134072446]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// ******************************* Part1: Import useful datasets *************************************//
// *********************Import hormonic features from script: HarmonicsL8 *************************//
// Import the classified image from other script
var File1317 = require("users/blackwhitezou/Thesis:Landsat8_pre_clasV2");
var File0012 = require("users/blackwhitezou/Thesis:Landsat57_pre_clasV2");
var Image1317 = File1317.classified1317;
var Image0012 = File0012.classified0012;
var Image0017 = Image0012.merge(Image1317);

// ********************* 2. Analysis for land use/cover change ***********************//
// Calculation for land use/cover change from 2000-2008 (before the bridge connection)
// Select images which are used for post-classfication 
// var Image0017List = Image0017.toList(Image0017.size());
// var Image2000 = ee.Image(Image0017List.get(0));
// var Image2008 = ee.Image(Image0017List.get(8));

// //look at tree cover, find the area
// var ChangePro2000 = Image2000.select('remapped').remap([10,20,30,40,50,60,70,80],[1,2,3,4,5,6,7,8]);
// var LULCC0008 =  ChangePro2000.subtract(Image2008);

// Calculate for area of each class
// var ChangeCover = LULCC0008.select(['remapped']);
// var AreaCover = ChangeCover.eq(-14).multiply(ee.Image.pixelArea()).rename('areacover');
// var stats = AreaCover.reduceRegion({
//   reducer: ee.Reducer.sum(),
//   geometry: StudyAreaWithWater,
//   scale: 250,
//   maxPixels: 1e10,
//   tileScale: 2
// });
// print(stats.get('areacover'));

// Calculation for land use/cover change from 2008-2017 (after the bridge connection)
// Select images which are used for post-classfication 
var Image0017List = Image0017.toList(Image0017.size());
var Image2008 = ee.Image(Image0017List.get(8));
var Image2017 = ee.Image(Image0017List.get(17));
// Change the class number
var ChangePro2008 = Image2008.select('remapped').remap([10,20,30,40,50,60,71,72,73,80],[1,2,3,4,5,6,7,8,9,10]);
// Calculate the land use/cover change
var LULCC0817 =  ChangePro2008.subtract(Image2017);
var ChangeCover = LULCC0817.select(['remapped']);
// Calculate the area for each change (change the eq num one by one)
var AreaCover = ChangeCover.eq(-63).multiply(ee.Image.pixelArea()).rename('areacover');
var Area0817 = AreaCover.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: StudyAreaWithWater,
  scale: 250,
  maxPixels: 1e10,
  tileScale: 2
});

print(Area0817.get('areacover'));                    



