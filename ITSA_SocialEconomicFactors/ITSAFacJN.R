#########################################################################
# Correlation Analysis: Lasso Regression (LR)
# Yuting Zou
# February 2020
#########################################################################

########################## Part1: Set the script environment and workspace ##############################
# Load library what is needed later
install.packages("car")
library(car)
library(nlme)

#Set the workspace for the data file
setwd('D:/college/Paper/Data/ITSA_SocialEconomicFactors')

#################################### Part2: Load data from the file #####################################
Facx1 <- read.csv('X1JNWithoutControlAll9.csv',header = T)
Facx2 <- read.csv('X2JNWithoutControlAll9.csv',header = T)
Facx3 <- read.csv('X3JNWithoutControlAll9.csv',header = T)
Facx4 <- read.csv('X4JNWithoutControlAll9.csv',header = T)
Facx5 <- read.csv('X5JNWithoutControlAll9.csv',header = T)
Facx6 <- read.csv('X6JNWithoutControlAll9.csv',header = T)
Facx7 <- read.csv('X7JNWithoutControlAll9.csv',header = T)
Facx8 <- read.csv('X8JNWithoutControlAll9.csv',header = T)
Facx9 <- read.csv('X9JNWithoutControlAll9.csv',header = T)
Facx10 <- read.csv('X10JNWithoutControlAll9.csv',header = T)
Facx11 <- read.csv('X11JNWithoutControlAll9.csv',header = T)

################################ Part3: A preliminary OLS regression model ##############################
# X1
modelLinear1 <- lm(x1~time + level + trend, data = Facx1) 
summary(modelLinear1)
Confint(modelLinear1)
coef(modelLinear1)

# X2
modelLinear2 <- lm(x2~time + level + trend, data = Facx2) 
summary(modelLinear2)
Confint(modelLinear2)
coef(modelLinear2)

# X3
modelLinear3 <- lm(x3~time + level + trend, data = Facx3) 
summary(modelLinear3)
Confint(modelLinear3)
coef(modelLinear3)

# X4
modelLinear4 <- lm(x4~time + level + trend, data = Facx4) 
summary(modelLinear4)
Confint(modelLinear4)
coef(modelLinear4)

# X5
modelLinear5 <- lm(x5~time + level + trend, data = Facx5) 
summary(modelLinear5)
Confint(modelLinear5)
coef(modelLinear5)

# X6
modelLinear6 <- lm(x6~time + level + trend, data = Facx6) 
summary(modelLinear6)
Confint(modelLinear6)
coef(modelLinear6)

# X7
modelLinear7 <- lm(x7~time + level + trend, data = Facx7) 
summary(modelLinear7)
Confint(modelLinear7)
coef(modelLinear7)

# X8
modelLinear8 <- lm(x8~time + level + trend, data = Facx8) 
summary(modelLinear8)
Confint(modelLinear8)
coef(modelLinear18)

# X10
modelLinear10 <- lm(x10~time + level + trend, data = Facx10) 
summary(modelLinear10)
Confint(modelLinear10)
coef(modelLinear10)

####################### Part4: Autocorrelation and partial autocorrelation plots ########################
# Plot ACF and PACF  for x1
par(mfrow=c(1,2))
# Produce plots
acf(residuals(modelLinear1))
acf(residuals(modelLinear1),type='partial')
# p=0,q=0

# Plot ACF and PACF  for x2
par(mfrow=c(1,2))
# Produce plots
acf(residuals(modelLinear2))
acf(residuals(modelLinear2),type='partial')
# p=0,q=0

# Plot ACF and PACF  for x3
par(mfrow=c(1,2))
# Produce plots
acf(residuals(modelLinear3))
acf(residuals(modelLinear3),type='partial')
# p=0,q=0

# Plot ACF and PACF  for x4
par(mfrow=c(1,2))
# Produce plots
acf(residuals(modelLinear4))
acf(residuals(modelLinear4),type='partial')
# p=q=0

# Plot ACF and PACF  for x5
par(mfrow=c(1,2))
# Produce plots
acf(residuals(modelLinear5))
acf(residuals(modelLinear5),type='partial')
# p=4, q=0


# Plot ACF and PACF  for x16
par(mfrow=c(1,2))
# Produce plots
acf(residuals(modelLinear6))
acf(residuals(modelLinear6),type='partial')
# p=0,q=0

# Plot ACF and PACF  for x7
par(mfrow=c(1,2))
# Produce plots
acf(residuals(modelLinear7))
acf(residuals(modelLinear7),type='partial')
# Note decay in ACF, significant spike at 4 in PACF, model p=4

# Plot ACF and PACF  for x8
par(mfrow=c(1,2))
# Produce plots
acf(residuals(modelLinear8))
acf(residuals(modelLinear8),type='partial')
# Note decay in ACF, significant spike at 1 in PACF, model p=1


# Plot ACF and PACF  for x9
par(mfrow=c(1,2))
# Produce plots
acf(residuals(modelLinear9))
acf(residuals(modelLinear9),type='partial')
# Note decay in ACF, significant spike at 4 in PACF, model p=4

# Plot ACF and PACF  for x10
par(mfrow=c(1,2))
# Produce plots
acf(residuals(modelLinear10))
acf(residuals(modelLinear10),type='partial')
# Note decay in ACF, significant spike at 4 in PACF, model p=3

################################# Part5: Fit the GLS regression model ###################################
# Fit the GLS regression model for x1
Model1<- gls(x1 ~ time + level + trend,
             data=Facx1,
             correlation = NULL,
             method="ML")
summary(Model1)

# Fit the GLS regression model for x2
Model2<- gls(x2 ~ time + level + trend,
             data=Facx2,
             correlation = NULL,
             method="ML")
summary(Model2)

# Fit the GLS regression model for x3
Model3<- gls(x3 ~ time + level + trend,
             data=Facx3,
             correlation = NULL,
             method="ML")
summary(Model3)

# Fit the GLS regression model for x4
Model4<- gls(x4 ~ time + level + trend,
             data=Facx4,
             correlation = NULL,
             method="ML") 
summary(Model4)

# Fit the GLS regression model for x5
Model5<- gls(x5 ~ time + level + trend,
             data=Facx5,
             correlation = NULL,
             method="ML") 
summary(Model5)

# Fit the GLS regression model for x6
Model6<- gls(x6 ~ time + level + trend,
              data=Facx6,
              correlation = corARMA(p=2,form=~time),
              method="ML")
summary(Model6)

# Fit the GLS regression model for x7
Model7<- gls(x7 ~ time + level + trend,
              data=Facx7,
              correlation = corARMA(p=4,form=~time),
              method="ML")
summary(Model7)

# Fit the GLS regression model for x8
Model8<- gls(x8 ~ time + level + trend,
              data=Facx8,
              correlation = corARMA(p=1,form=~time),
              method="ML")
summary(Model8)

# Fit the GLS regression model for x9
Model9<- gls(x9 ~ time + level + trend,
              data=Facx9,
              correlation = corARMA(p=4,form=~time),
              method="ML") #p=q=0
summary(Model9)

# Fit the GLS regression model for x10
Model10<- gls(x10 ~ time + level + trend,
              data=Facx10,
              correlation = corARMA(p=3,form=~time),
              method="ML") #p3
summary(Model10)

################################### Part6: Plot the result of ITSA #######################################
# x1
par(mfrow=c(1,1))
plot(Facx1$time, Facx1$x1,
     ylab = 'Primary industry (Ningbo & Jiaxing)',
     ylim = c(100,500),
     xlab = 'year',
     type = 'l',
     col = 'red',
     xaxt = 'n',
     main = 'ITSA for Primary industry in Ningbo & Jiaxing from 2000-2017',
     cex.main = 1.5)
axis(1, at=1:18, labels = Facx1$year)
points(Facx1$time,Facx1$x1,
       col = 'red',
       pch = 20)
abline(v=9.5,lty = 2)
# Plot the first line segment
lines(Facx1$time[1:9], fitted(Model1)[1:9], col="red",lwd=2)
# Plot the second line segmentModelRE
lines(Facx1$time[10:18], fitted(Model1)[10:18], col="red",lwd=2)
# And the counterfactual
segments(1,
         Model1$coef[1]+Model1$coef[2],
         18,
         Model1$coef[1]+Model1$coef[2]*18,
         lty=2,
         lwd=2,
         col='red')

# x2
par(mfrow=c(1,1))
plot(Facx2$time, Facx2$x2,
     ylab = 'Secondary industry (Ningbo & Jiaxing)',
     ylim = c(700,8000),
     xlab = 'year',
     type = 'l',
     col = 'red',
     xaxt = 'n',
     main = 'ITSA for Secondary industry in Ningbo & Jiaxing from 2000-2017',
     cex.main = 1.5)
axis(1, at=1:18, labels = Facx2$year)
points(Facx2$time,Facx2$x2,
       col = 'red',
       pch = 20)
abline(v=9.5,lty = 2)
# Plot the first line segment
lines(Facx2$time[1:9], fitted(Model2)[1:9], col="red",lwd=2)
# Plot the second line segmentModelRE
lines(Facx2$time[10:18], fitted(Model2)[10:18], col="red",lwd=2)
# And the counterfactual
segments(1,
         Model2$coef[1]+Model2$coef[2],
         18,
         Model2$coef[1]+Model2$coef[2]*18,
         lty=2,
         lwd=2,
         col='red')

# x3
par(mfrow=c(1,1))
plot(Facx3$time, Facx3$x3,
     ylab = 'Tertiary industry (Ningbo & Jiaxing)',
     ylim = c(300,8000),
     xlab = 'year',
     type = 'l',
     col = 'red',
     xaxt = 'n',
     main = 'ITSA for Tertiary industry in Ningbo & Jiaxing from 2000-2017',
     cex.main = 1.5)
axis(1, at=1:18, labels = Facx3$year)
points(Facx3$time,Facx3$x3,
       col = 'red',
       pch = 20)
abline(v=9.5,lty = 2)
# Plot the first line segment
lines(Facx3$time[1:9], fitted(Model3)[1:9], col="red",lwd=2)
# Plot the second line segmentModelRE
lines(Facx3$time[10:18], fitted(Model3)[10:18], col="red",lwd=2)
# And the counterfactual
segments(1,
         Model3$coef[1]+Model3$coef[2],
         18,
         Model3$coef[1]+Model3$coef[2]*18,
         lty=2,
         lwd=2,
         col='red')

# x4
par(mfrow=c(1,1))
plot(Facx4$time, Facx4$x4,
     ylab = 'GDP (Ningbo & Jiaxing)',
     ylim = c(30000,300000),
     xlab = 'year',
     type = 'l',
     col = 'red',
     xaxt = 'n',
     main = 'ITSA for GDP in Ningbo & Jiaxing from 2000-2017',
     cex.main = 1.5)
axis(1, at=1:18, labels = Facx4$year)
points(Facx4$time,Facx4$x4,
       col = 'red',
       pch = 20)
abline(v=9.5,lty = 2)
# Plot the first line segment
lines(Facx4$time[1:9], fitted(Model4)[1:9], col="red",lwd=2)
# Plot the second line segmentModelRE
lines(Facx4$time[10:18], fitted(Model4)[10:18], col="red",lwd=2)
# And the counterfactual
segments(1,
         Model4$coef[1]+Model4$coef[2],
         18,
         Model4$coef[1]+Model4$coef[2]*18,
         lty=2,
         lwd=2,
         col='red')

# x5
par(mfrow=c(1,1))
plot(Facx5$time, Facx5$x5,
     ylab = 'Population (Ningbo & Jiaxing)',
     ylim = c(830,980),
     xlab = 'year',
     type = 'l',
     col = 'red',
     xaxt = 'n',
     main = 'ITSA for Population in Ningbo & Jiaxing from 2000-2017',
     cex.main = 1.5)
axis(1, at=1:18, labels = Facx5$year)
points(Facx5$time,Facx5$x5,
       col = 'red',
       pch = 20)
abline(v=9.5,lty = 2)
# Plot the first line segment
lines(Facx5$time[1:9], fitted(Model5)[1:9], col="red",lwd=2)
# Plot the second line segmentModelRE
lines(Facx5$time[10:18], fitted(Model5)[10:18], col="red",lwd=2)
# And the counterfactual
segments(1,
         Model5$coef[1]+Model5$coef[2],
         18,
         Model5$coef[1]+Model5$coef[2]*18,
         lty=2,
         lwd=2,
         col='red')

# x6
par(mfrow=c(1,1))
plot(Facx6$time, Facx6$x6,
     ylab = 'Fixed Assets (Ningbo & Jiaxing)',
     ylim = c(500,9000),
     xlab = 'year',
     type = 'l',
     col = 'red',
     xaxt = 'n',
     main = 'ITSA for Fixed Assets in Ningbo & Jiaxing from 2000-2017',
     cex.main = 1.5)
axis(1, at=1:18, labels = Facx6$year)
points(Facx6$time,Facx6$x6,
       col = 'red',
       pch = 20)
abline(v=9.5,lty = 2)
# Plot the first line segment
lines(Facx6$time[1:9], fitted(Model6)[1:9], col="red",lwd=2)
# Plot the second line segmentModelRE
lines(Facx6$time[10:18], fitted(Model6)[10:18], col="red",lwd=2)
# And the counterfactual
segments(1,
         Model6$coef[1]+Model6$coef[2],
         18,
         Model6$coef[1]+Model6$coef[2]*18,
         lty=2,
         lwd=2,
         col='red')

# x7
par(mfrow=c(1,1))
plot(Facx7$time, Facx7$x7,
     ylab = 'Real estate (Ningbo & Jiaxing)',
     ylim = c(50,3000),
     xlab = 'year',
     type = 'l',
     col = 'red',
     xaxt = 'n',
     main = 'ITSA for Real estate in Ningbo & Jiaxing from 2000-2017',
     cex.main = 1.5)
axis(1, at=1:18, labels = Facx7$year)
points(Facx7$time,Facx7$x7,
       col = 'red',
       pch = 20)
abline(v=9.5,lty = 2)
# Plot the first line segment
lines(Facx7$time[1:9], fitted(Model7)[1:9], col="red",lwd=2)
# Plot the second line segmentModelRE
lines(Facx7$time[10:18], fitted(Model7)[10:18], col="red",lwd=2)
# And the counterfactual
segments(1,
         Model7$coef[1]+Model7$coef[2],
         18,
         Model7$coef[1]+Model7$coef[2]*18,
         lty=2,
         lwd=2,
         col='red')

# x8
par(mfrow=c(1,1))
plot(Facx8$time, Facx8$x8,
     ylab = 'Tourism (Ningbo & Jiaxing)',
     ylim = c(90,3500),
     xlab = 'year',
     type = 'l',
     col = 'red',
     xaxt = 'n',
     main = 'ITSA for Tourism in Ningbo & Jiaxing from 2000-2017',
     cex.main = 1.5)
axis(1, at=1:18, labels = Facx8$year)
points(Facx8$time,Facx8$x8,
       col = 'red',
       pch = 20)
abline(v=9.5,lty = 2)
# Plot the first line segment
lines(Facx8$time[1:9], fitted(Model8)[1:9], col="red",lwd=2)
# Plot the second line segmentModelRE
lines(Facx8$time[10:18], fitted(Model8)[10:18], col="red",lwd=2)
# And the counterfactual
segments(1,
         Model8$coef[1]+Model8$coef[2],
         18,
         Model8$coef[1]+Model8$coef[2]*18,
         lty=2,
         lwd=2,
         col='red')

# x9
par(mfrow=c(1,1))
plot(Facx9$time, Facx9$x9,
     ylab = 'Freight (Ningbo & Jiaxing)',
     ylim = c(10000,45000),
     xlab = 'year',
     type = 'l',
     col = 'red',
     xaxt = 'n',
     main = 'ITSA for Freight in Ningbo & Jiaxing from 2000-2017',
     cex.main = 1.5)
axis(1, at=1:18, labels = Facx9$year)
points(Facx9$time,Facx9$x9,
       col = 'red',
       pch = 20)
abline(v=9.5,lty = 2)
# Plot the first line segment
lines(Facx9$time[1:9], fitted(Model19)[1:9], col="red",lwd=2)
# Plot the second line segmentModelRE
lines(Facx9$time[10:18], fitted(Model19)[10:18], col="red",lwd=2)
# And the counterfactual
segments(1,
         Model19$coef[1]+Model19$coef[2],
         18,
         Model19$coef[1]+Model19$coef[2]*18,
         lty=2,
         lwd=2,
         col='red')

# x10
par(mfrow=c(1,1))
plot(Facx10$time, Facx10$x10,
     ylab = 'Grain (Ningbo & Jiaxing)',
     ylim = c(50,400),
     xlab = 'year',
     type = 'l',
     col = 'red',
     xaxt = 'n',
     main = 'ITSA for Grain in Ningbo & Jiaxing from 2000-2017',
     cex.main = 1.5)
axis(1, at=1:18, labels = Facx10$year)
points(Facx10$time,Facx10$x10,
       col = 'red',
       pch = 20)
abline(v=9.5,lty = 2)
# Plot the first line segment
lines(Facx10$time[1:9], fitted(Model10)[1:9], col="red",lwd=2)
# Plot the second line segmentModelRE
lines(Facx10$time[10:18], fitted(Model10)[10:18], col="red",lwd=2)
# And the counterfactual
segments(1,
         Model10$coef[1]+Model10$coef[2],
         18,
         Model10$coef[1]+Model10$coef[2]*18,
         lty=2,
         lwd=2,
         col='red')