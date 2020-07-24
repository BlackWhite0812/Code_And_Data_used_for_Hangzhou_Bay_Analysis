#########################################################################
# Interrupted Time-series Analysis on Other land of Impervious Land in Bridge-connected Cities
# Yuting Zou
# March 2020
#########################################################################

########################## Part1: Set the script environment and workspace ##############################
# Load library what is needed later
install.packages("car")
library(car)
library(nlme)

#Set the workspace for the data file
setwd('D:/college/Paper/CorrelationAnalysis/Data/InterruptedTime-seriesAnalysis/ITSA_LULC')

#################################### Part2: Load data from the file #####################################
# Load data from data file
dataJNHZ <- read.csv('InfraJNHZ.csv',header = T)
dataJXHZ <- read.csv('InfraJXHZ.csv',header = T)
dataNBHZ <- read.csv('InfraNBHZ.csv',header = T)

############################################# Part3: Initial Plot #######################################
# Plot the time series for the Impervious Surface area in Jiaxing
# plot(dataJNHZ$time[1:18],dataJNHZ$AG[1:18],
#      ylab = "Agricultural land for Jiaxing and Ningbo",
#      ylim = c(2000,9000),
#      xlab = 'Year',
#      type = 'l',
#      col = 'blue',
#      xaxt = 'n',
#      main = 'Area change of Agricultural land in Jiaxing & Ningbo and Hangzhou 
#      from 2000-2017')

# # Add in control group Impervious surface area in Hangzhou
# points(dataJNHZ$time[19:36],dataJNHZ$AG[19:36],
#        type = 'l',
#        col = 'red')
# 
# # Add in legend
# legend("bottomright",legend = c('Jiaxing & Ningbo','Hangzhou'),
#        col = c('blue', 'red'), pch = 20)
# 
# # Add x-axies year labels
# axis(1, at = 1:18, labels = dataJNHZ$year[1:18])
# 
# # Add individual point for the figure
# points(dataJNHZ$time[1:18],dataJNHZ$AG[1:18],
#        col = 'blue',
#        pch = 20)
# 
# points(dataJNHZ$time[19:36], dataJNHZ$AG[19:36],
#        col = 'red',
#        pch = 20)
# 
# # Lable the time when the bridge is open to traffic
# abline(v = 9.5,lty = 2)
# 
# # Add in legend
# legend("bottomright",legend = c('Jiaxing & Ningbo','Hangzhou'),
#        col = c('blue', 'red'), pch = 20)

#################################### Part 4: Preliminary Analysis (check autocorrelation) ######################################
#############################Jiaxing and Ningbo
# Standard OLS regression model
modelJN_ols <- lm(OT ~ time + NBJX + NBJXtime + level + trend + NBJXlevel + NBJXtrend, data = dataJNHZ)
# ACF plots
par(mfrow = c(1,2),ask = F)
acf(residuals(modelJN_ols))
acf(residuals(modelJN_ols),type = 'partial')

#############################Jiaxing
# Standard OLS regression model for Jiaxing 
modelJX_ols <- lm(OT ~ time + Jiaxing + Jiaxingtime + level + trend + Jiaxinglevel + Jiaxingtrend, data = dataJXHZ)
# ACF plots
par(mfrow = c(1,2),ask = F)
acf(residuals(modelJX_ols))
acf(residuals(modelJX_ols),type = 'partial')

#############################Ningbo
modelNB_ols <- lm(OT ~ time + Ningbo + Ningbotime + level + trend + Ningbolevel + Ningbotrend, data = dataNBHZ)
# ACF plots
par(mfrow = c(1,2),ask = F)
acf(residuals(modelNB_ols))
acf(residuals(modelNB_ols),type = 'partial')
######################################### Part 5: Modeling #############################################
#############################Jiaxing and Ningbo
JNmodel_q2 = gls(OT ~ time + NBJX + NBJXtime + level + trend + NBJXlevel + NBJXtrend,  
                 data = dataJNHZ, correlation=corARMA(q=2,form=~time|NBJX), method = 'ML')
summary(JNmodel_q2)
confint(JNmodel_q2)

#############################Jiaxing 
JXmodel_p2 = gls(OT ~ time + Jiaxing + Jiaxingtime + level + trend + Jiaxinglevel + Jiaxingtrend, 
                 data = dataJXHZ, correlation=corARMA(p=2,form=~time|Jiaxing), method = 'ML')
summary(JXmodel_p2)
confint(JXmodel_p2)
#############################Ningbo
# Fit the GLS regression model
NBmodel_p2 = gls(OT ~ time + Ningbo + Ningbotime + level + trend + Ningbolevel + Ningbotrend, 
                 data = dataNBHZ, correlation=corARMA(p=2,form=~time|Ningbo),method = 'ML')
summary(NBmodel_p2)
confint(NBmodel_p2)

####################################### Part 6: Diagnostic tests #########################################
# Likelihood-ratio tests to check whether the parameters of the AR process for the errors are necessary and sufficient
#model_p10q1 <- update(model_q1p1,correlation=corARMA(q=5,p=4,form=~time|NBJX))
#anova(model_q1p1,model_p10q1)
#AIC(model_q1p1)
#AIC(model_p10q1)

####################################### Part 7: Plot results ############################################
# First plot the raw data points for the Ningbo
par(mfrow=c(1,1))
plot(dataJNHZ$time[1:18],dataJNHZ$OT[1:18],
     ylim=c(0,1200),
     ylab="Infrastructure area (km2)",
     xlab="Year",
     pch=20,
     col="white",
     xaxt="n",
     main = "ITSA for Infrastructure area change in bridge-connected cities 
     (with control group of Hangzhou)")

# Add x-axis year labels
axis(1, at=1:18, labels=dataJNHZ$year[1:18])
# Label the policy change
abline(v=9.5,lty=2)

# # Add in the points for control and other intervention groups
# points(dataJNHZ$time[19:36],dataJNHZ$OT[19:36],
#        col="pink",
#        pch=20)
# points(dataJXHZ$time[1:18],dataJXHZ$OT[1:18],
#        col="navy",
#        pch=20)
# points(dataNBHZ$time[1:18],dataNBHZ$OT[1:18],
#        col="orange",
#        pch=20)

# Plot the first line segment for the intervention groups
lines(dataJNHZ$time[1:9], fitted(JNmodel_q2)[1:9], col="blue",lwd=2)
lines(dataJXHZ$time[1:9], fitted(JXmodel_p2)[1:9], col="navy",lwd=2)
lines(dataNBHZ$time[1:9], fitted(NBmodel_p2)[1:9], col="orange",lwd=2)

# Add the second line segment for the intervention groupS
lines(dataJNHZ$time[10:18], fitted(JNmodel_q2)[10:18], col="blue",lwd=2)
lines(dataJXHZ$time[10:18], fitted(JXmodel_p2)[10:18], col="navy",lwd=2)
lines(dataNBHZ$time[10:18], fitted(NBmodel_p2)[10:18], col="orange",lwd=2)

# Add the counterfactual for the intervention groups
segments(10, JNmodel_q2$coef[1] + JNmodel_q2$coef[2]*10 + JNmodel_q2$coef[3]+JNmodel_q2$coef[4]*10 + 
           JNmodel_q2$coef[5] + JNmodel_q2$coef[6],
         18, JNmodel_q2$coef[1] + JNmodel_q2$coef[2]*18 + JNmodel_q2$coef[3]+JNmodel_q2$coef[4]*18 + 
           JNmodel_q2$coef[5] + JNmodel_q2$coef[6]*9,
         lty=2,col='blue',lwd=2)
segments(10, JXmodel_p2$coef[1] + JXmodel_p2$coef[2]*10 + JXmodel_p2$coef[3]+JXmodel_p2$coef[4]*10 + 
           JXmodel_p2$coef[5] + JXmodel_p2$coef[6],
         18, JXmodel_p2$coef[1] + JXmodel_p2$coef[2]*18 + JXmodel_p2$coef[3]+JXmodel_p2$coef[4]*18 + 
           JXmodel_p2$coef[5] + JXmodel_p2$coef[6]*9,
         lty=2,col='navy',lwd=2)
segments(10, NBmodel_p2$coef[1] + NBmodel_p2$coef[2]*10 + NBmodel_p2$coef[3]+NBmodel_p2$coef[4]*10 + 
           NBmodel_p2$coef[5] + NBmodel_p2$coef[6],
         18, NBmodel_p2$coef[1] + NBmodel_p2$coef[2]*18 + NBmodel_p2$coef[3]+NBmodel_p2$coef[4]*18 + 
           NBmodel_p2$coef[5] + NBmodel_p2$coef[6]*9,
         lty=2,col='orange',lwd=2)

# Plot the first line segment for the control group
lines(dataJNHZ$time[19:27], fitted(JNmodel_q2)[19:27], col="red",lwd=2)

# Add the second line segment for the control
lines(dataJNHZ$time[28:36], fitted(JNmodel_q2)[28:36], col="red",lwd=2)

# Add the counterfactual for the control group
segments(1, JNmodel_q2$coef[1]+JNmodel_q2$coef[2],
         18,JNmodel_q2$coef[1]+JNmodel_q2$coef[2]*18,
         lty=2,col='red',lwd=2)

# Add in a legend
legend("topleft", legend=c("Jiaxing & Ningbo **","Jiaxing ***","Ningbo **","Hangzhou"), col=c("blue","navy","orange","red"),lwd=2)
