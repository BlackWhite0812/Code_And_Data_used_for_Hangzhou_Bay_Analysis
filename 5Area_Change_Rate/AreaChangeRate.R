#########################################################################
# Calculation for area change rate
# Yuting Zou
# March 2020
#########################################################################

########################## Part1: Set the script environment and workspace ##############################
# Set workspace
setwd('D:/college/Paper/CorrelationAnalysis/Data')

# Load data
AreaChange0008 <- read.csv('AreaChange0008.csv', header = T)
AreaChange0817 <- read.csv('AreaChange0817.csv', header = T)

########################## Part2: Calculate the coefficients based on linear regression ##############################
# Time period: 2000-2008
changerateag0008 <- lm(Agriculture ~ Year, data = AreaChange0008)
summary(changerateag0008)
changeratefr0008 <- lm(Forest ~ Year, data = AreaChange0008)
summary(changeratefr0008)
changerateip0008 <- lm(Impervious ~ Year, data = AreaChange0008)
summary(changerateip0008)
changeratere0008 <- lm(Residential ~ Year, data = AreaChange0008)
summary(changeratere0008)
changeratein0008 <- lm(Industrial ~ Year, data = AreaChange0008)
summary(changeratein0008)
changerateot0008 <- lm(Others ~ Year, data = AreaChange0008)
summary(changerateot0008)
plot(AreaChange0008$Year, AreaChange0008$Residential,pch = 16, cex = 1.3, 
     col = "blue", main = "Residential time series (00-08)", xlab = "Year", ylab = "Residential area")
abline(changeratere0008)

# Time period: 2008-2017
changerateag0817 <- lm(Agriculture ~ Year, data = AreaChange0817)
summary(changerateag0817)
changeratefr0817 <- lm(Forest ~ Year, data = AreaChange0817)
summary(changeratefr0817)
changerateip0817 <- lm(Impervious ~ Year, data = AreaChange0817)
summary(changerateip0817)
changeratere0817 <- lm(Residential ~ Year, data = AreaChange0817)
summary(changeratere0817)
changeratein0817 <- lm(Industrial ~ Year, data = AreaChange0817)
summary(changeratein0817)
changerateot0817 <- lm(Others ~ Year, data = AreaChange0817)
summary(changerateot0817)

