/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var StudyAreaWithWater = ee.FeatureCollection("users/blackwhitezou/TotalStudyArea"),
    Landsat7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR"),
    Landsat5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR");
/***** End of imports. If edited, may not auto-convert in the playground. *****/

//***************************Part 1: Landsat5 & 7 preprocessing*********************************//
//Function to mask clouds based on the pixel_qa band of Landsat 8 SR data.
// @param {ee.Image} image input Landsat 5 & 7 SR image
// @return {ee.Image} cloudmasked Landsat 5 & 7 image
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
  return image.updateMask(cloud.not()).updateMask(mask2).select("B[3-4]*").copyProperties(image, ["system:time_start"]);
};

var collection1_2000 = Landsat7.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2000-01-01', '2000-12-31');
var collection1_2001 = Landsat7.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2001-01-01', '2001-12-31');
var collection1_2002 = Landsat7.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2002-01-01', '2002-12-31');
var collection1_2003 = Landsat5.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2003-01-01', '2003-12-31');
var collection1_2004 = Landsat5.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2004-01-01', '2004-12-31');
var collection1_2005 = Landsat5.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2005-01-01', '2005-12-31');
var collection1_2006 = Landsat5.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2006-01-01', '2006-12-31');
var collection1_2007 = Landsat5.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2007-01-01', '2007-12-31');
var collection1_2008 = Landsat5.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2008-01-01', '2008-12-31');
var collection1_2009 = Landsat5.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2009-01-01', '2009-12-31');
var collection1_2010 = Landsat5.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2010-01-01', '2010-12-31');
var collection1_2011 = Landsat5.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2011-01-01', '2011-12-31');
var collection1_2012 = Landsat7.map(cloudMaskL457).filterBounds(StudyAreaWithWater).filterDate('2012-01-01', '2012-12-31');

// Use this function to add variables for NDVI, time and a constant
// to Landsat 8 imagery.
var addVariables = function(image) {
// Compute time in fractional years since the epoch.
var date = ee.Date(image.get('system:time_start'));
var years = date.difference(ee.Date('1970-01-01'), 'year');
// Return the image with the added bands.
return image
// Add an NDVI band.
.addBands(image.normalizedDifference(['B4', 'B3']).rename('NDVI'))
// Add a time band.
.addBands(ee.Image(years).rename('t'))
.float()
// Add a constant band.
.addBands(ee.Image.constant(1));
};


//**************************Part 2: Calculate harmonic regression for Landsat5 & 7*************************//
// Use these independent variables in the harmonic regression.
// Name of the dependent variable.
var dependent = ee.String('NDVI');
var harmonicIndependents = ee.List(['constant', 't', 'cos', 'sin','cos2', 'sin2']);
var harmonicLandsat = function(image) {
  var timeRadians = image.select('t').multiply(2 * Math.PI);
  return image
  .addBands(timeRadians.cos().rename('cos'))
  .addBands(timeRadians.sin().rename('sin'))
  .addBands(timeRadians.multiply(2).cos().rename('cos2'))
  .addBands(timeRadians.multiply(2).sin().rename('sin2'));
};

var timeRadians_2000 = collection1_2000.map(addVariables).map(harmonicLandsat);
var timeRadians_2001 = collection1_2001.map(addVariables).map(harmonicLandsat);
var timeRadians_2002 = collection1_2002.map(addVariables).map(harmonicLandsat);
var timeRadians_2003 = collection1_2003.map(addVariables).map(harmonicLandsat);
var timeRadians_2004 = collection1_2004.map(addVariables).map(harmonicLandsat);
var timeRadians_2005 = collection1_2005.map(addVariables).map(harmonicLandsat);
var timeRadians_2006 = collection1_2006.map(addVariables).map(harmonicLandsat);
var timeRadians_2007 = collection1_2007.map(addVariables).map(harmonicLandsat);
var timeRadians_2008 = collection1_2008.map(addVariables).map(harmonicLandsat);
var timeRadians_2009 = collection1_2009.map(addVariables).map(harmonicLandsat);
var timeRadians_2010 = collection1_2010.map(addVariables).map(harmonicLandsat);
var timeRadians_2011 = collection1_2011.map(addVariables).map(harmonicLandsat);
var timeRadians_2012 = collection1_2012.map(addVariables).map(harmonicLandsat);

// ******************Part 3: Transfer the image collection to list and show every image inside for checking the result**************//
// For 2000
var harmonicTrend2000 = timeRadians_2000
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2001
var harmonicTrend2001 = timeRadians_2001
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2002
var harmonicTrend2002 = timeRadians_2002
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2003
var harmonicTrend2003 = timeRadians_2003
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2004
var harmonicTrend2004 = timeRadians_2004
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2005
var harmonicTrend2005 = timeRadians_2005
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2006
var harmonicTrend2006 = timeRadians_2006
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2007
var harmonicTrend2007 = timeRadians_2007
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2008
var harmonicTrend2008 = timeRadians_2008
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2009
var harmonicTrend2009 = timeRadians_2009
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2010
var harmonicTrend2010 = timeRadians_2010
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2011
var harmonicTrend2011 = timeRadians_2011
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// For 2012
var harmonicTrend2012 = timeRadians_2012
.select(harmonicIndependents.add(dependent))
// The output of this reducer is a 4x1 array image.
.reduce(ee.Reducer.linearRegression({
numX: harmonicIndependents.length(),
numY: 1
}));

// ***********************Part 4: Turn the array image into a multi-band image of coefficients*******************************//
// Turn the array image into a multi-band image of coefficients.
var harmonicTrendCoefficients2000 = harmonicTrend2000.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2001 = harmonicTrend2001.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2002 = harmonicTrend2002.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2003 = harmonicTrend2003.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2004 = harmonicTrend2004.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2005 = harmonicTrend2005.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2006 = harmonicTrend2006.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2007 = harmonicTrend2007.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2008 = harmonicTrend2008.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2009 = harmonicTrend2009.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2010 = harmonicTrend2010.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2011 = harmonicTrend2011.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

var harmonicTrendCoefficients2012 = harmonicTrend2012.select('coefficients')
.arrayProject([0])
.arrayFlatten([harmonicIndependents]);

//*********************************************Part 5: Compute phase and amplitude**************************************//
// Compute phase and amplitude for 2000.
var phase2000_order1 = harmonicTrendCoefficients2000.select('sin')
.atan2(harmonicTrendCoefficients2000.select('cos'));
// .unitScale(-Math.PI, Math.PI);

var phase2000_order2 = harmonicTrendCoefficients2000.select('sin2')
.atan2(harmonicTrendCoefficients2000.select('cos2'));
// .unitScale(-Math.PI, Math.PI);

var amplitude2000_order1 = harmonicTrendCoefficients2000.select('sin')
.hypot(harmonicTrendCoefficients2000.select('cos'));
// .multiply(5);
var amplitude2000_order2 = harmonicTrendCoefficients2000.select('sin2')
.hypot(harmonicTrendCoefficients2000.select('cos2'));
// .multiply(5);


// Compute phase and amplitude for 2001.
var phase2001_order1 = harmonicTrendCoefficients2001.select('sin')
.atan2(harmonicTrendCoefficients2001.select('cos'));
// .unitScale(-Math.PI, Math.PI);

var phase2001_order2 = harmonicTrendCoefficients2001.select('sin2')
.atan2(harmonicTrendCoefficients2001.select('cos2'));
// .unitScale(-Math.PI, Math.PI);

var amplitude2001_order2 = harmonicTrendCoefficients2001.select('sin2')
.hypot(harmonicTrendCoefficients2001.select('cos2'));

var amplitude2001_order1 = harmonicTrendCoefficients2001.select('sin')
.hypot(harmonicTrendCoefficients2001.select('cos'));


// Compute phase and amplitude for 2002.
var phase2002_order1 = harmonicTrendCoefficients2002.select('sin')
.atan2(harmonicTrendCoefficients2002.select('cos'));
// .unitScale(-Math.PI, Math.PI);

var phase2002_order2 = harmonicTrendCoefficients2002.select('sin2')
.atan2(harmonicTrendCoefficients2002.select('cos2'));
// .unitScale(-Math.PI, Math.PI);

var amplitude2002_order2 = harmonicTrendCoefficients2002.select('sin2')
.hypot(harmonicTrendCoefficients2002.select('cos2'));

var amplitude2002_order1 = harmonicTrendCoefficients2002.select('sin')
.hypot(harmonicTrendCoefficients2002.select('cos'));

// Compute phase and amplitude for 2003.
var phase2003_order1 = harmonicTrendCoefficients2003.select('sin')
.atan2(harmonicTrendCoefficients2003.select('cos'));
// .unitScale(-Math.PI, Math.PI);

var phase2003_order2 = harmonicTrendCoefficients2003.select('sin2')
.atan2(harmonicTrendCoefficients2003.select('cos2'));
// .unitScale(-Math.PI, Math.PI);

var amplitude2003_order2 = harmonicTrendCoefficients2003.select('sin2')
.hypot(harmonicTrendCoefficients2003.select('cos2'));

var amplitude2003_order1 = harmonicTrendCoefficients2003.select('sin')
.hypot(harmonicTrendCoefficients2003.select('cos'));

// Compute phase and amplitude for 2004.
var phase2004_order1 = harmonicTrendCoefficients2004.select('sin')
.atan2(harmonicTrendCoefficients2004.select('cos'));
// .unitScale(-Math.PI, Math.PI);

var phase2004_order2 = harmonicTrendCoefficients2004.select('sin2')
.atan2(harmonicTrendCoefficients2004.select('cos2'));
// .unitScale(-Math.PI, Math.PI);

var amplitude2004_order2 = harmonicTrendCoefficients2004.select('sin2')
.hypot(harmonicTrendCoefficients2004.select('cos2'));

var amplitude2004_order1 = harmonicTrendCoefficients2004.select('sin')
.hypot(harmonicTrendCoefficients2004.select('cos'));

// Compute phase and amplitude for 2005.
var phase2005_order1 = harmonicTrendCoefficients2005.select('sin')
.atan2(harmonicTrendCoefficients2005.select('cos'));
// .unitScale(-Math.PI, Math.PI);

var phase2005_order2 = harmonicTrendCoefficients2005.select('sin2')
.atan2(harmonicTrendCoefficients2005.select('cos2'));
// .unitScale(-Math.PI, Math.PI);

var amplitude2005_order2 = harmonicTrendCoefficients2005.select('sin2')
.hypot(harmonicTrendCoefficients2005.select('cos2'));

var amplitude2005_order1 = harmonicTrendCoefficients2005.select('sin')
.hypot(harmonicTrendCoefficients2005.select('cos'));

// Compute phase and amplitude for 2006.
var phase2006_order1 = harmonicTrendCoefficients2006.select('sin')
.atan2(harmonicTrendCoefficients2006.select('cos'));
// .unitScale(-Math.PI, Math.PI);

var phase2006_order2 = harmonicTrendCoefficients2006.select('sin2')
.atan2(harmonicTrendCoefficients2006.select('cos2'));
// .unitScale(-Math.PI, Math.PI);

var amplitude2006_order2 = harmonicTrendCoefficients2006.select('sin2')
.hypot(harmonicTrendCoefficients2006.select('cos2'));

var amplitude2006_order1 = harmonicTrendCoefficients2006.select('sin')
.hypot(harmonicTrendCoefficients2006.select('cos'));

// Compute phase and amplitude for 2007.
var phase2007_order1 = harmonicTrendCoefficients2007.select('sin')
.atan2(harmonicTrendCoefficients2007.select('cos'));
// .unitScale(-Math.PI, Math.PI);

var phase2007_order2 = harmonicTrendCoefficients2007.select('sin2')
.atan2(harmonicTrendCoefficients2007.select('cos2'));
// .unitScale(-Math.PI, Math.PI);

var amplitude2007_order2 = harmonicTrendCoefficients2007.select('sin2')
.hypot(harmonicTrendCoefficients2007.select('cos2'));

var amplitude2007_order1 = harmonicTrendCoefficients2007.select('sin')
.hypot(harmonicTrendCoefficients2007.select('cos'));

// Compute phase and amplitude for 2008.
var phase2008_order1 = harmonicTrendCoefficients2008.select('sin')
.atan2(harmonicTrendCoefficients2008.select('cos'))
// .unitScale(-Math.PI, Math.PI);

var phase2008_order2 = harmonicTrendCoefficients2008.select('sin2')
.atan2(harmonicTrendCoefficients2008.select('cos2'));
// .unitScale(-Math.PI, Math.PI);

var amplitude2008_order2 = harmonicTrendCoefficients2008.select('sin2')
.hypot(harmonicTrendCoefficients2008.select('cos2'));

var amplitude2008_order1 = harmonicTrendCoefficients2008.select('sin')
.hypot(harmonicTrendCoefficients2008.select('cos'));

// Compute phase and amplitude for 2009.
var phase2009_order1 = harmonicTrendCoefficients2009.select('sin')
.atan2(harmonicTrendCoefficients2009.select('cos'));
// .unitScale(-Math.PI, Math.PI);

var phase2009_order2 = harmonicTrendCoefficients2009.select('sin2')
.atan2(harmonicTrendCoefficients2009.select('cos2'));
// .unitScale(-Math.PI, Math.PI);

var amplitude2009_order2 = harmonicTrendCoefficients2009.select('sin2')
.hypot(harmonicTrendCoefficients2009.select('cos2'));

var amplitude2009_order1 = harmonicTrendCoefficients2009.select('sin')
.hypot(harmonicTrendCoefficients2009.select('cos'));

// Compute phase and amplitude for 2010.
var phase2010_order1 = harmonicTrendCoefficients2010.select('sin')
.atan2(harmonicTrendCoefficients2010.select('cos'));
// .unitScale(-Math.PI, Math.PI);

var phase2010_order2 = harmonicTrendCoefficients2010.select('sin2')
.atan2(harmonicTrendCoefficients2010.select('cos2'))
// .unitScale(-Math.PI, Math.PI);

var amplitude2010_order2 = harmonicTrendCoefficients2010.select('sin2')
.hypot(harmonicTrendCoefficients2010.select('cos2'));

var amplitude2010_order1 = harmonicTrendCoefficients2010.select('sin')
.hypot(harmonicTrendCoefficients2010.select('cos'));

// Compute phase and amplitude for 2011.
var phase2011_order1 = harmonicTrendCoefficients2011.select('sin')
.atan2(harmonicTrendCoefficients2011.select('cos'));
// .unitScale(-Math.PI, Math.PI);
var phase2011_order2 = harmonicTrendCoefficients2011.select('sin2')
.atan2(harmonicTrendCoefficients2011.select('cos2'));
// .unitScale(-Math.PI, Math.PI);
var amplitude2011_order2 = harmonicTrendCoefficients2011.select('sin2')
.hypot(harmonicTrendCoefficients2011.select('cos2'));

var amplitude2011_order1 = harmonicTrendCoefficients2011.select('sin')
.hypot(harmonicTrendCoefficients2011.select('cos'));

// Compute phase and amplitude for 2012.
var phase2012_order1 = harmonicTrendCoefficients2012.select('sin')
.atan2(harmonicTrendCoefficients2012.select('cos'))
// .unitScale(-Math.PI, Math.PI);

var phase2012_order2 = harmonicTrendCoefficients2012.select('sin2')
.atan2(harmonicTrendCoefficients2012.select('cos2'))
// .unitScale(-Math.PI, Math.PI);

var amplitude2012_order2 = harmonicTrendCoefficients2012.select('sin2')
.hypot(harmonicTrendCoefficients2012.select('cos2'));

var amplitude2012_order1 = harmonicTrendCoefficients2012.select('sin')
.hypot(harmonicTrendCoefficients2012.select('cos'));

// The Phase and Amplitude value of harmonic feature for 2000
var pha2000_1 = phase2000_order1.select('sin').rename('Pha2000_1');
var pha2000_2 = phase2000_order2.select('sin2').rename('Pha2000_2');
var amp2000_1 = amplitude2000_order1.select('sin').rename('amp2000_1');
var amp2000_2 = amplitude2000_order2.select('sin2').rename('amp2000_2');

// The Phase and Amplitude value of harmonic feature for 2001
var pha2001_1 = phase2001_order1.select('sin').rename('Pha2001_1');
var pha2001_2 = phase2001_order2.select('sin2').rename('Pha2001_2');
var amp2001_1 = amplitude2001_order1.select('sin').rename('amp2001_1');
var amp2001_2 = amplitude2001_order2.select('sin2').rename('amp2001_2');

// The Phase and Amplitude value of harmonic feature for 2002
var pha2002_1 = phase2002_order1.select('sin').rename('Pha2002_1');
var pha2002_2 = phase2002_order2.select('sin2').rename('Pha2002_2');
var amp2002_1 = amplitude2002_order1.select('sin').rename('amp2002_1');
var amp2002_2 = amplitude2002_order2.select('sin2').rename('amp2002_2');

// The Phase and Amplitude value of harmonic feature for 2003
var pha2003_1 = phase2003_order1.select('sin').rename('Pha2003_1');
var pha2003_2 = phase2003_order2.select('sin2').rename('Pha2003_2');
var amp2003_1 = amplitude2003_order1.select('sin').rename('amp2003_1');
var amp2003_2 = amplitude2003_order2.select('sin2').rename('amp2003_2');

// The Phase and Amplitude value of harmonic feature for 2004
var pha2004_1 = phase2004_order1.select('sin').rename('Pha2004_1');
var pha2004_2 = phase2004_order2.select('sin2').rename('Pha2004_2');
var amp2004_1 = amplitude2004_order1.select('sin').rename('amp2004_1');
var amp2004_2 = amplitude2004_order2.select('sin2').rename('amp2004_2');

// The Phase and Amplitude value of harmonic feature for 2005
var pha2005_1 = phase2005_order1.select('sin').rename('Pha2005_1');
var pha2005_2 = phase2005_order2.select('sin2').rename('Pha2005_2');
var amp2005_1 = amplitude2005_order1.select('sin').rename('amp2005_1');
var amp2005_2 = amplitude2005_order2.select('sin2').rename('amp2005_2');

// The Phase and Amplitude value of harmonic feature for 2006
var pha2006_1 = phase2006_order1.select('sin').rename('Pha2006_1');
var pha2006_2 = phase2006_order2.select('sin2').rename('Pha2006_2');
var amp2006_1 = amplitude2006_order1.select('sin').rename('amp2006_1');
var amp2006_2 = amplitude2006_order2.select('sin2').rename('amp2006_2');

// The Phase and Amplitude value of harmonic feature for 2007
var pha2007_1 = phase2007_order1.select('sin').rename('Pha2007_1');
var pha2007_2 = phase2007_order2.select('sin2').rename('Pha2007_2');
var amp2007_1 = amplitude2007_order1.select('sin').rename('amp2007_1');
var amp2007_2 = amplitude2007_order2.select('sin2').rename('amp2007_2');

// The Phase and Amplitude value of harmonic feature for 2008
var pha2008_1 = phase2008_order1.select('sin').rename('Pha2008_1');
var pha2008_2 = phase2008_order2.select('sin2').rename('Pha2008_2');
var amp2008_1 = amplitude2008_order1.select('sin').rename('amp2008_1');
var amp2008_2 = amplitude2008_order2.select('sin2').rename('amp2008_2');

// The Phase and Amplitude value of harmonic feature for 2009
var pha2009_1 = phase2009_order1.select('sin').rename('Pha2009_1');
var pha2009_2 = phase2009_order2.select('sin2').rename('Pha2009_2');
var amp2009_1 = amplitude2009_order1.select('sin').rename('amp2009_1');
var amp2009_2 = amplitude2009_order2.select('sin2').rename('amp2009_2');

// The Phase and Amplitude value of harmonic feature for 2010
var pha2010_1 = phase2010_order1.select('sin').rename('Pha2010_1');
var pha2010_2 = phase2010_order2.select('sin2').rename('Pha2010_2');
var amp2010_1 = amplitude2010_order1.select('sin').rename('amp2010_1');
var amp2010_2 = amplitude2010_order2.select('sin2').rename('amp2010_2');

// The Phase and Amplitude value of harmonic feature for 2011
var pha2011_1 = phase2011_order1.select('sin').rename('Pha2011_1');
var pha2011_2 = phase2011_order2.select('sin2').rename('Pha2011_2');
var amp2011_1 = amplitude2011_order1.select('sin').rename('amp2011_1');
var amp2011_2 = amplitude2011_order2.select('sin2').rename('amp2011_2');

// The Phase and Amplitude value of harmonic feature for 2012
var pha2012_1 = phase2012_order1.select('sin').rename('Pha2012_1');
var pha2012_2 = phase2012_order2.select('sin2').rename('Pha2012_2');
var amp2012_1 = amplitude2012_order1.select('sin').rename('amp2012_1');
var amp2012_2 = amplitude2012_order2.select('sin2').rename('amp2012_2');

// **************************Part 6: Create a collection by giving a list to the constructor***************************************//
// Create a collection by giving a list to the constructor.
var HarmonicValues2000 = ee.ImageCollection([pha2000_1, pha2000_2, amp2000_1, amp2000_2]);
var HarmonicValues2001 = ee.ImageCollection([pha2001_1, pha2001_2, amp2001_1, amp2001_2]);
var HarmonicValues2002 = ee.ImageCollection([pha2002_1, pha2002_2, amp2002_1, amp2002_2]);
var HarmonicValues2003 = ee.ImageCollection([pha2003_1, pha2003_2, amp2003_1, amp2003_2]);
var HarmonicValues2004 = ee.ImageCollection([pha2004_1, pha2004_2, amp2004_1, amp2004_2]);
var HarmonicValues2005 = ee.ImageCollection([pha2005_1, pha2005_2, amp2005_1, amp2005_2]);
var HarmonicValues2006 = ee.ImageCollection([pha2006_1, pha2006_2, amp2006_1, amp2006_2]);
var HarmonicValues2007 = ee.ImageCollection([pha2007_1, pha2007_2, amp2007_1, amp2007_2]);
var HarmonicValues2008 = ee.ImageCollection([pha2008_1, pha2008_2, amp2008_1, amp2008_2]);
var HarmonicValues2009 = ee.ImageCollection([pha2009_1, pha2009_2, amp2009_1, amp2009_2]);
var HarmonicValues2010 = ee.ImageCollection([pha2010_1, pha2010_2, amp2010_1, amp2010_2]);
var HarmonicValues2011 = ee.ImageCollection([pha2011_1, pha2011_2, amp2011_1, amp2011_2]);
var HarmonicValues2012 = ee.ImageCollection([pha2012_1, pha2012_2, amp2012_1, amp2012_2]);

// ****************************************Part 7: Export the harmonic features*****************************************************//
exports = {
  HarmonicValues2000 : HarmonicValues2000,
  HarmonicValues2001 : HarmonicValues2001,
  HarmonicValues2002 : HarmonicValues2002,
  HarmonicValues2003 : HarmonicValues2003,
  HarmonicValues2004 : HarmonicValues2004,
  HarmonicValues2005 : HarmonicValues2005,
  HarmonicValues2006 : HarmonicValues2006,
  HarmonicValues2007 : HarmonicValues2007,
  HarmonicValues2008 : HarmonicValues2008,
  HarmonicValues2009 : HarmonicValues2009,
  HarmonicValues2010 : HarmonicValues2010,
  HarmonicValues2011 : HarmonicValues2011,
  HarmonicValues2012 : HarmonicValues2012,

  };
