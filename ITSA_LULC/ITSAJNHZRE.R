#########################################################################
# Interrupted Time-series Analysis on Residential land in Bridge-connected Cities
# Yuting Zou
# March 2020
#########################################################################

########################## Part1: Set the script environment and workspace ##############################
# Load library what is needed later
install.packages("car")
library(car)
library(nlme)

#Set the workspace for the data file
setwd('D:/college/Thesis/R code/data/InterruptedTime-seriesAnalysis/ITSA_LULC')

#################################### Part2: Load data from the file #####################################
# Load data from data file
dataJNHZ <- read.csv('REJNHZ.csv',header = T)
dataJXHZ <- read.csv('REJXHZ.csv',header = T)
dataNBHZ <- read.csv('RENBHZ.csv',header = T)

#################################### Part3: Preliminary Analysis (check autocorrelation)######################################
#############################Jiaxing and Ningbo
# Standard OLS regression model
modelJN_ols <- lm(RE ~ time + NBJX + NBJXtime + level + trend + NBJXlevel + NBJXtrend, data = dataJNHZ)
# ACF plots
par(mfrow = c(1,2),ask = F)
acf(residuals(modelJN_ols))
acf(residuals(modelJN_ols),type = 'partial')

#############################Jiaxing
# Standard OLS regression model for Jiaxing 
modelJX_ols <- lm(RE ~ time + Jiaxing + Jiaxingtime + level + trend + Jiaxinglevel + Jiaxingtrend, data = dataJXHZ)
# ACF plots
par(mfrow = c(1,2),ask = F)
acf(residuals(modelJX_ols))
acf(residuals(modelJX_ols),type = 'partial')

#############################Ningbo
modelNB_ols <- lm(RE ~ time + Ningbo + Ningbotime + level + trend + Ningbolevel + Ningbotrend, data = dataNBHZ)
# ACF plots
par(mfrow = c(1,2),ask = F)
acf(residuals(modelNB_ols))
acf(residuals(modelNB_ols),type = 'partial')
############################# Part4: Fit the GLS regression model #################################
#############################Jiaxing and Ningbo
JNmodel_p6q3 = gls(RE ~ time + NBJX + NBJXtime + level + trend + NBJXlevel + NBJXtrend,  
                 data = dataJNHZ, correlation=corARMA(p=6,q=3,form=~time|NBJX), method = 'ML')
summary(JNmodel_p6q3)
confint(JNmodel_p6q3)

#############################Jiaxing 
JXmodel_p8 = gls(RE ~ time + Jiaxing + Jiaxingtime + level + trend + Jiaxinglevel + Jiaxingtrend, 
                 data = dataJXHZ, correlation=corARMA(p=8,form=~time|Jiaxing), method = 'ML')
summary(JXmodel_p8)
confint(JXmodel_p8)
#############################Ningbo
# Fit the GLS regression model
NBmodel_p1q1 = gls(RE ~ time + Ningbo + Ningbotime + level + trend + Ningbolevel + Ningbotrend, 
                 data = dataNBHZ, correlation=corARMA(p=1,q=1, form=~time|Ningbo),method = 'ML')
summary(NBmodel_p1q1)
confint(NBmodel_p1q1)
####################################### Part5: Diagnostic tests #########################################
# Likelihood-ratio tests to check whether the parameters of the AR process for the errors are necessary and sufficient
#model_p10q1 <- update(model_q1p1,correlation=corARMA(q=5,p=4,form=~time|NBJX))
#anova(model_q1p1,model_p10q1)
#AIC(model_q1p1)
#AIC(model_p10q1)
####################################### Part6: Plot results ############################################
# First plot the raw data points for the Ningbo
par(mfrow=c(1,1))
plot(dataJNHZ$time[1:18],dataJNHZ$RE[1:18],
     ylim=c(-100,2000),
     ylab="Residential area (km2)",
     xlab="Year",
     pch=20,
     col="white",
     xaxt="n",
     main = "ITSA for residential area change in bridge-connected cities 
     (with control group of Hangzhou)")

# Add x-axis year labels
axis(1, at=1:18, labels=dataJNHZ$year[1:18])
# Label the policy change
abline(v=9.5,lty=2)

# # Add in the points for control and other intervention groups
# points(dataJNHZ$time[19:36],dataJNHZ$RE[19:36],
#        col="pink",
#        pch=20)
# points(dataJXHZ$time[1:18],dataJXHZ$RE[1:18],
#        col="navy",
#        pch=20)
# points(dataNBHZ$time[1:18],dataNBHZ$RE[1:18],
#        col="orange",
#        pch=20)

# Plot the first line segment for the intervention groups
lines(dataJNHZ$time[1:9], fitted(JNmodel_p6q3)[1:9], col="blue",lwd=2)
lines(dataJXHZ$time[1:9], fitted(JXmodel_p8)[1:9], col="navy",lwd=2)
lines(dataNBHZ$time[1:9], fitted(NBmodel_p1q1)[1:9], col="orange",lwd=2)

# Add the second line segment for the intervention groupS
lines(dataJNHZ$time[10:18], fitted(JNmodel_p6q3)[10:18], col="blue",lwd=2)
lines(dataJXHZ$time[10:18], fitted(JXmodel_p8)[10:18], col="navy",lwd=2)
lines(dataNBHZ$time[10:18], fitted(NBmodel_p1q1)[10:18], col="orange",lwd=2)

# Add the counterfactual for the intervention groups
segments(10, JNmodel_p6q3$coef[1] + JNmodel_p6q3$coef[2]*10 + JNmodel_p6q3$coef[3]+JNmodel_p6q3$coef[4]*10 + 
           JNmodel_p6q3$coef[5] + JNmodel_p6q3$coef[6],
         18, JNmodel_p6q3$coef[1] + JNmodel_p6q3$coef[2]*18 + JNmodel_p6q3$coef[3]+JNmodel_p6q3$coef[4]*18 + 
           JNmodel_p6q3$coef[5] + JNmodel_p6q3$coef[6]*9,
         lty=2,col='blue',lwd=2)
segments(10, JXmodel_p8$coef[1] + JXmodel_p8$coef[2]*10 + JXmodel_p8$coef[3]+JXmodel_p8$coef[4]*10 + 
           JXmodel_p8$coef[5] + JXmodel_p8$coef[6],
         18, JXmodel_p8$coef[1] + JXmodel_p8$coef[2]*18 + JXmodel_p8$coef[3]+JXmodel_p8$coef[4]*18 + 
           JXmodel_p8$coef[5] + JXmodel_p8$coef[6]*9,
         lty=2,col='navy',lwd=2)
segments(10, NBmodel_p1q1$coef[1] + NBmodel_p1q1$coef[2]*10 + NBmodel_p1q1$coef[3]+NBmodel_p1q1$coef[4]*10 + 
           NBmodel_p1q1$coef[5] + NBmodel_p1q1$coef[6],
         18, NBmodel_p1q1$coef[1] + NBmodel_p1q1$coef[2]*18 + NBmodel_p1q1$coef[3]+NBmodel_p1q1$coef[4]*18 + 
           NBmodel_p1q1$coef[5] + NBmodel_p1q1$coef[6]*9,
         lty=2,col='orange',lwd=2)

# Plot the first line segment for the control group
lines(dataJNHZ$time[19:27], fitted(JNmodel_p6q3)[19:27], col="red",lwd=2)

# Add the second line segment for the control
lines(dataJNHZ$time[28:36], fitted(JNmodel_p6q3)[28:36], col="red",lwd=2)

# Add the counterfactual for the control group
segments(1, JNmodel_p6q3$coef[1]+JNmodel_p6q3$coef[2],
         18,JNmodel_p6q3$coef[1]+JNmodel_p6q3$coef[2]*18,
         lty=2,col='red',lwd=2)

# Add in a legend
legend("topleft", legend=c("Jiaxing & Ningbo ***","Jiaxing ***","Ningbo *","Hangzhou"), col=c("blue","navy","orange","red"),lwd=2)
