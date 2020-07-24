#########################################################################
# Stratified Sampling (For the selection of training sample locations)
# Yuting Zou
# October 2019
#########################################################################

########################## Part1: Set the script environment and workspace ##############################
library(raster)
library(rgdal)

#Set the workspace
setwd('D:/college/Thesis/Data/DATA/SamplingData')
#Read a raster, GeoTiff or something
forSampling <- raster('D:/college/Thesis/Data/DATA/ReferenceData/ReferenceMap/Validation2017.tif')

############### Part2:  make stratified sampling for each class #############################

## For cropland ##
forSampling <- raster('D:/college/Thesis/Data/DATA/ReferenceData/ReferenceMap/Validation2017.tif')
forSampling[forSampling != 1] = NA
plot(forSampling, main = "sample for cropland")
cropland = sampleStratified(forSampling, 200, xy = TRUE, sp = T)
points(cropland, pch = "+")

## For forest ##
forSampling <- raster('D:/college/Thesis/Data/DATA/ReferenceData/ReferenceMap/Validation2017.tif')
forSampling[forSampling != 2] = NA
plot(forSampling, main = "sample for forest")
forest = sampleStratified(forSampling, 170, xy = TRUE, sp = T)
points(forest, pch = "+")

## For grassland ##
forSampling <- raster('D:/college/Thesis/Data/DATA/ReferenceData/ReferenceMap/Validation2017.tif')
forSampling[forSampling != 3] = NA
plot(forSampling, main = "sample for grassland")
grassland = sampleStratified(forSampling, 130, xy = TRUE, sp = T)
points(grassland, pch = "+")

## For shrubland ##
forSampling <- raster('D:/college/Thesis/Data/DATA/ReferenceData/ReferenceMap/Validation2017.tif')
forSampling[forSampling != 4] = NA
plot(forSampling, main = "sample for shrubland")
shrubland = sampleStratified(forSampling, 100, xy = TRUE, sp = T)
points(shrubland, pch = "+")

## For wetland ##
forSampling <- raster('D:/college/Thesis/Data/DATA/ReferenceData/ReferenceMap/Validation2017.tif')
forSampling[forSampling != 5] = NA
plot(forSampling, main = "sample for wetland")
wetland = sampleStratified(forSampling, 100, xy = TRUE, sp = T)
points(wetland, pch = "+")

## For water ##
forSampling <- raster('D:/college/Thesis/Data/DATA/ReferenceData/ReferenceMap/Validation2017.tif')
forSampling[forSampling != 6] = NA
plot(forSampling, main = "sample for water")
water = sampleStratified(forSampling, 100, xy = TRUE, sp = T)
points(water, pch = "+")

## For impervious surface ##
forSampling <- raster('D:/college/Thesis/Data/DATA/ReferenceData/ReferenceMap/Validation2017.tif')
forSampling[forSampling != 8] = NA
plot(forSampling, main = "sample for impervious")
impervious = sampleStratified(forSampling, 250, xy = TRUE, sp = T)
points(impervious, pch = "+")

## For bareland ##
forSampling <- raster('D:/college/Thesis/Data/DATA/ReferenceData/ReferenceMap/Validation2017.tif')
forSampling[forSampling != 9] = NA
plot(forSampling, main = "sample for bareland")
bareland = sampleStratified(forSampling, 50, xy = TRUE, sp = T)
points(bareland, pch = "+")

total_sample<-rbind(cropland, forest, grassland, shrubland, wetland, water, impervious, bareland)
forSampling <- raster('D:/college/Thesis/Data/DATA/ReferenceData/ReferenceMap/Validation2017.tif')
plot(forSampling)
points(total_sample, pch ="+")
writeOGR(obj = total_sample, dsn = "D:/college/Thesis/Data/DATA/SamplingData", layer = "sample1100", driver="ESRI Shapefile")
write.csv(total_sample, "sample1100.csv")
##******************************************************************************************************##
