/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var HZ = ee.FeatureCollection("users/blackwhitezou/HZ"),
    JX = ee.FeatureCollection("users/blackwhitezou/JX"),
    SX = ee.FeatureCollection("users/blackwhitezou/SX"),
    NB = ee.FeatureCollection("users/blackwhitezou/NB");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// ******************************* Part1: Import useful datasets *************************************//
// *********************Import classified images from script: Landsat8_pre_clasV2 *************************//
// Import the classified image from other script
var File1317 = require("users/blackwhitezou/Thesis:Landsat8_pre_clasV2");
var File0012 = require("users/blackwhitezou/Thesis:Landsat57_pre_clasV2");
var Image1317 = File1317.classified1317;
var Image0012 = File0012.classified0012;
var Image0017 = Image0012.merge(Image1317);

// ********************* 2. Analysis for land use/cover change ***********************//
// Calculation for land use/cover change from 2000-2008 (before the bridge connection)
// NingboV2
// var IP0017NB = Image0017.map(function(img){
//   // var IPNingbo = img.select('remapped').eq([10, 20, 30, 40, 50, 60, 70, 80]).clip(NB).multiply(ee.Image.pixelArea()).rename('AG','FR','GL','SL','WE','WA','IP','BL');
//   var IPNingbo = img.select('remapped').eq(70).clip(NB).multiply(ee.Image.pixelArea()).rename('IP');
//   return IPNingbo;
// });

// var IPlistNB = IP0017NB.toList(IP0017NB.size());
// var AreaFucNB = ee.Image(IPlistNB.get(0)).reduceRegion({
// reducer:ee.Reducer.sum(),
// geometry: NB,
// scale:250,
// bestEffort:true,
// maxPixels: 1e10,
// tileScale: 8
// });
// var AreaNB = ee.Number(AreaFucNB)
// print(AreaNB)

// Jiaxing
// var IP0017JX = Image0017.map(function(img){
//   var IPJiaxing = img.select('remapped').eq([10, 20, 30, 40, 50, 60, 70, 80]).clip(JX).multiply(ee.Image.pixelArea()).rename('AG','FR','GL','SL','WE','WA','IP','BL');
//   return IPJiaxing;
// });
// // print(IP0017SX)
// var IPlistJX = IP0017JX.toList(IP0017JX.size());
// var AreaFucJX = ee.Image(IPlistJX.get(0)).reduceRegion({
// reducer:ee.Reducer.sum(),
// geometry: JX,
// scale:250,
// bestEffort:true,
// maxPixels: 1e10,
// tileScale: 8
// });
// var AreaJX = ee.Number(AreaFucJX)
// print(AreaJX)

// // Shaoxing
// var IP0017SX = Image0017.map(function(img){
//   var IPShaoxing = img.select('remapped').eq([10, 20, 30, 40, 50, 60, 70, 80]).clip(SX).multiply(ee.Image.pixelArea()).rename('AG','FR','GL','SL','WE','WA','IP','BL');
//   return IPShaoxing;
// });
// // print(IP0017SX)
// var IPlistSX = IP0017SX.toList(IP0017SX.size());
// var AreaFucSX = ee.Image(IPlistSX.get(0)).reduceRegion({
// reducer:ee.Reducer.sum(),
// geometry: SX,
// scale:250,
// bestEffort:true,
// maxPixels: 1e10,
// tileScale: 8
// });
// var AreaSX = ee.Number(AreaFucSX)
// print(AreaSX)

// Hangzhou
// var IP0017HZ = Image0017.map(function(img){
//   var IPHangzhou = img.select('remapped').eq([10, 20, 30, 40, 50, 60, 70, 80]).clip(HZ).multiply(ee.Image.pixelArea()).rename('AG','FR','GL','SL','WE','WA','IP','BL');
//   return IPHangzhou;
// });

// var IPlistHZ = IP0017HZ.toList(IP0017HZ.size());
// var AreaFucHZ = ee.Image(IPlistHZ.get(0)).reduceRegion({
// reducer:ee.Reducer.sum(),
// geometry: HZ,
// scale:250,
// bestEffort:true,
// maxPixels: 1e10,
// tileScale: 8
// });
// var AreaHZ = ee.Number(AreaFucHZ)
// print(AreaHZ)
