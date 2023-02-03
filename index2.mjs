import fs from 'fs';
// import https from 'https';
import path from 'path';
import axios from 'axios';
// const fs = require('fs');
// const https = require('https');
// const path = require('path');

// File URL
const date = new Date();
const nowYear = date.getFullYear();
const nowMonth = date.getMonth();

const year = nowMonth === 0 ? nowYear - 1 : nowYear;
const month = nowMonth === 0 ? '12' : (nowMonth <= 9 ? '0' + nowMonth : nowMonth);

const folderName = `results/${year}${month}`;

const dataParams = [
  {
    title: 'China PC',
    url: `https://gs.statcounter.com/browser-version-partially-combined-market-share/desktop/china/chart.php?bar=1&device=Desktop&device_hidden=desktop&statType_hidden=browser_version_partially_combined&region_hidden=CN&granularity=monthly&statType=Combine%20%27Chrome%2FFirefox%2FOpera%2FEdge%20versions%27&region=China&fromInt=${year}${month}&toInt=${year}${month}&fromMonthYear=${year}-${month}&toMonthYear=${year}-${month}&csv=1`,
    fileName: `China-PC-${year}${month}`,
    type: 'pc'
  },
  {
    title: 'WorldWide PC',
    url: `https://gs.statcounter.com/browser-version-market-share/desktop/worldwide/chart.php?bar=1&device=Desktop&device_hidden=desktop&statType_hidden=browser_version_partially_combined&region_hidden=ww&granularity=monthly&statType=Combine%20%27Chrome%2FFirefox%2FOpera%2FEdge%20versions%27&region=Worldwide&fromInt=${year}${month}&toInt=${year}${month}&fromMonthYear=${year}-${month}&toMonthYear=${year}-${month}&csv=1`,
    fileName: `WorldWide-PC-${year}${month}`,
    type: 'pc'
  },
  {
    title: 'Japan PC',
    url: `https://gs.statcounter.com/browser-version-partially-combined-market-share/desktop/japan/chart.php?bar=1&device=Desktop&device_hidden=desktop&statType_hidden=browser_version_partially_combined&region_hidden=JP&granularity=monthly&statType=Combine%20%27Chrome%2FFirefox%2FOpera%2FEdge%20versions%27&region=Japan&fromInt=${year}${month}&toInt=${year}${month}&fromMonthYear=${year}-${month}&toMonthYear=${year}-${month}&csv=1`,
    fileName: `Japan-PC-${year}${month}`,
    type: 'pc'
  },
  {
    title: 'China Mobile',
    url: `https://gs.statcounter.com/browser-market-share/mobile-tablet/china/chart.php?bar=1&device=Mobile%20%26%20Tablet&device_hidden=mobile%2Btablet&multi-device=true&statType_hidden=browser&region_hidden=CN&granularity=monthly&statType=Browser&region=China&fromInt=${year}${month}&toInt=${year}${month}&fromMonthYear=${year}-${month}&toMonthYear=${year}-${month}&csv=1`,
    fileName: `China-PC-${year}${month}`,
    type: 'mobile'
  },
  {
    title: 'WorldWide Mobile',
    url: `https://gs.statcounter.com/browser-market-share/mobile-tablet/worldwide/chart.php?bar=1&device=Mobile%20%26%20Tablet&device_hidden=mobile%2Btablet&multi-device=true&statType_hidden=browser&region_hidden=ww&granularity=monthly&statType=Browser&region=Worldwide&fromInt=${year}${month}&toInt=${year}${month}&fromMonthYear=${year}-${month}&toMonthYear=${year}-${month}&csv=1`,
    fileName: `WorldWide-Mobile-${year}${month}`,
    type: 'mobile'
  },
  {
    title: 'Japan Mobile',
    url: `https://gs.statcounter.com/browser-market-share/mobile-tablet/japan/chart.php?bar=1&device=Mobile%20%26%20Tablet&device_hidden=mobile%2Btablet&multi-device=true&statType_hidden=browser&region_hidden=JP&granularity=monthly&statType=Browser&region=Japan&fromInt=${year}${month}&toInt=${year}${month}&fromMonthYear=${year}-${month}&toMonthYear=${year}-${month}&csv=1`,
    fileName: `Japan-Mobile-${year}${month}`,
    type: 'mobile'
  }
]

function handleData(originDataStr, dataParam) {
  const originDataArr = originDataStr.split('\n').filter((item, index) => item && index > 0)
  const tmpArr1 = originDataArr.map(item => {
    const tmpArr11 = item.split(',');
    const tmpStr11 = tmpArr11[0].replace(/\"/g, '');
    const tmpArr12 = tmpStr11.split(' ')
    const versionStrTmp = tmpArr12[tmpArr12.length - 1]
    const version = /\d+\.*/.test(versionStrTmp) ? versionStrTmp : '';
    const percent = Number(tmpArr11[1]);
    return {
      browser: tmpStr11,
      browserName: tmpStr11.substring(0, tmpStr11.length - version.length),
      browserVersion: version,
      percent: percent
    }
  })
  const tmpArr2 = [];
  tmpArr1.forEach(item => {
    let browserName = item.browserName.replace(/\s$/g, '')
    if (dataParam.type === 'pc') {
      if (/^Edge/.test(item.browserName)) {
        if (item.browserVersion === '79+') {
          browserName = 'Edge 79+'
        } else {
          browserName = 'Edge 79-'
        }
      } else if (/^IE/.test(item.browserName)) {
        browserName = item.browser
      }
    }
    let compareItem = tmpArr2.find(ele => ele.browser === browserName)
    if (compareItem) {
      compareItem.percent = compareItem.percent + item.percent;
    } else {
      compareItem = {
        browser: browserName,
        percent: item.percent
      }
      tmpArr2.push(compareItem);
    }
  })
  const tmpArr3 = tmpArr2.filter(item => {
    if (dataParam.type === 'pc') {
      if (/^Edge/.test(item.browser) || /^IE/.test(item.browser)) {
        return true
      } else if (item.browser === 'Other') {
        return false
      } else {
        return true
        // return item.percent >= 1
      }
    } else {
      if (item.browser === 'Other') {
        return false
      } else {
        return true
        // return item.percent >= 1
      }
    }
  })
  const other = tmpArr2.filter(item => item.browser === 'Other') || [];
  tmpArr3.sort((a, b) => b.percent - a.percent)
  const tmpArr4 = tmpArr3.concat(other);
  const result = tmpArr4.map(item => {
    return item.browser + ' ' + (item.percent).toFixed(2) + '%'
  }).join(', ')
  // console.log('\n\n\n-----------log:', dataParam, originDataStr, originDataArr, tmpArr1, '\n\n\n')
  return {
    result: 'success',
    data: {
      ...dataParam,
      result
    }
  }
}

function getSingleData(dataParam) {
  return new Promise((resolve) => {
    axios({
      url: dataParam.url,
      responseType: 'blob'
    }).then(resp => {
      // console.log('resp:', resp.data)
      resolve(handleData(resp.data, dataParam))
    })
  });
}

try {
  if (!fs.existsSync('results')) {
    fs.mkdirSync('results');
  }
} catch (err) {
  console.error(err);
}
try {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
} catch (err) {
  console.error(err);
}
Promise.all(dataParams.map(item => getSingleData(item))).then(resps => {
  let logs = `Browser Market Share ${year}-${month}`;
  console.log(`\n\nBrowser Market Share ${year}-${month}`);
  resps.forEach(resp => {
    if (resp.result === 'success') {
      logs += '\n\n' + resp.data.title + ': \n' + resp.data.result;
      console.log('\n\n' + resp.data.title + ': \n' + resp.data.result)
    } else {
      console.log(resp)
    }
  })
  const logName = `${year}${month}-result.txt`
  const logFilePath = path.resolve(folderName, logName)
  fs.writeFile(logFilePath, logs, function(err) {
    if (!err) {
      console.log('\n\n\nlog success: ', logName)
    } else {
      console.log('\n\n\nlog error: ', logName, err)
    }
  })
})