# Code_And_Data_used_for_Hangzhou_Bay_Analysis

This repository includes all of data and code used in the paper:
Assessing the impact of bridge construction on the land use/cover and socio-economic indicator time series: A case study of Hangzhou Bay Bridge

Description for each folder:
1. Study_Area_Shapefile:
  - This folder includes the shapefile of study area and the Hangzhou Bay Bridge

2. Training_Data_Collection
  - This folder contains R code used for statified sampling
  - This folder contains the spatial distribution of sample data 
  - This folder contains the Land use/cover survey (Created from Collect) for visual interpretation in Google Earth Pro
  
3. Classification
  - This folder contains the javascript for Random Forest classification in Google Earth Engine
  - This folder contains the javascript for the calculation of harmonic features in Google Earth Engine
  
4. Accuracy_Assessment
  - This folder contains the javascript for 5-fold cross-validation in Google Earth Engine
  
5. Area_Change_Matrix_Calculation
  - This folder contains the javascript for the calculation of LULC change matrix as well as the calculation of Land use/cover area for each city in Google Earth Engine
  
6. Area_Change_Rate
  - This folder contains the R code for the calculation of Land use/cover change rate 
  
7. ITSA_LULC
  - This folder contains the input and the R code for Interrupted Time Series Analysis (ITSA) applied on impervious land in the bridge connected cities 
  
8. ITSA_SocialEconomicFactors
  - This folder contains the R code for Interrupted Time Series Analysis (ITSA) applied on social-economic data in the bridge connected cities

Additional information:
1. For the social-economic data used in this paper can be found in this website:
https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3077/site/flash/tjj/Reports1/2017%E7%BB%9F%E8%AE%A1%E5%B9%B4%E9%89%B4%E5%85%89%E7%9B%98%E6%94%B9%E5%90%8E20190415/indexeh.htm 

2. For the reference map of LULC can be found in following website:
GLC30: http://www.globallandcover.com/GLC30Download/index.aspx 
FROM-GLC30: http://data.ess.tsinghua.edu.cn/ 


