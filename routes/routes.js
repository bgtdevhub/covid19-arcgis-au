const request = require('request');
const settings = require('../global-settings');

const deletedObjectIdStarted = 99999;
const deletedObjectIdEnded = 99999;

const statesFeatureApiApplyEdit = `${settings.statesFeatureApi}/applyEdits`;
const timeSeriesFeatureApiApplyEdit = `${settings.timeSeriesFeatureApi}/applyEdits`;
let _states = [];
const _layerFields = ['Cases', 'Deaths', 'Tests', 'Tests_Negative'];
const _layerFieldsTotal = ['Total_Cases', 'Total_Deaths', 'Total_Tests', 'Total_Tests_Negative'];
const _layerFieldsHeader = {
    ObjectId: settings.objectIdField,
    Date: 'Date'
}

const _jsonFields_LatestTotals = {
    State: 'State or territory',
    Cases: 'Confirmed cases (cumulative)',
    Tests: 'Tests conducted',
    Deaths: 'Deaths',
    TestsPermilion: "Tests per million",
    PercentPositive: "Percent positive"
}

const _jsonFields_Updates = {
    State: 'State or territory',
    Cases: 'Cumulative case count',
    Tests: 'Tests conducted (total)',
    Deaths: 'Cumulative death',
    Tests_Negative: "Tests conducted (negative)",
    Intensive_Care: "Intensive care (count)",
    Hospitalisations: "Hospitalisations (count)",
    Recovered: "Recovered (cumulative)",
    Under_60: "Under 60",
    Over_60: "Over 60",
    Community: "Community",
    Community_Known_Source: "Community - no known source",
    Travel_Related: "Travel-related",
    Under_Investigation: "Under investigation",
}

const requestToken = () =>
    // generate a token with client id and client secret
    new Promise((resolve, reject) => {
        console.log('client_id:' + settings.client_id);
        request.post(
            {
                url: settings.oauth2Url,
                json: true,
                form: {
                    f: 'json',
                    client_id: settings.client_id,
                    client_secret: settings.client_secret,
                    grant_type: 'client_credentials',
                    expiration: '1440'
                }
            },
            function (error, response, { access_token }) {
                if (error) reject(error);

                resolve(access_token);
            }
        );
    });

const getSource = () =>
    new Promise((resolve, reject) => {
        request(
            {
                url: settings.covid19SoureUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '',
                },
                method: 'GET',
                encoding: null
            },
            function (error, res, body) {
                if (res.statusCode == 200 && !error) {
                    resolve(JSON.parse(body));
                }
                reject(error);
            }
        );
    });

const getStatesFeatures = (token) =>
    new Promise((resolve, reject) => {
        request(
            {
                url: `${settings.statesFeatureApi}/query?token=${token}&where=1%3D1&f=json&outFields=OBJECTID,ISO_SUB,NAME&returnGeometry=false`,
                headers: {},
                method: 'GET',
                encoding: null
            },
            function (error, res, body) {
                if (res.statusCode == 200 && !error) {
                    resolve(JSON.parse(body));
                }
                reject(error);
            }
        );
    });

const getTimeSeriesFeatures = (token) =>
    new Promise((resolve, reject) => {
        request(
            {
                url: `${settings.timeSeriesFeatureApi}/query?token=${token}&where=1%3D1&f=json&outFields=*`,
                headers: {},
                method: 'GET',
                encoding: null
            },
            function (error, res, body) {
                if (res.statusCode == 200 && !error) {
                    resolve(JSON.parse(body));
                }
                reject(error);
            }
        );
    });

const updateTimeSeriesFeature = (updatedTimesSeries, token) =>
    new Promise((resolve, reject) => {
        //console.log('updatedTimesSeries ==> ' + JSON.stringify(updatedTimesSeries));
        let updates = [];
        for (const updated of updatedTimesSeries) {
            let attributes = {};
            let newUpdate = {};
            newUpdate[_layerFieldsHeader.ObjectId] = updated[_layerFieldsHeader.ObjectId]
            for (const state of _states) {
                for (const field of _layerFields) {
                    let fieldName = state + '_' + field;
                    if (field === 'Cases') {
                        newUpdate[state] = updated[fieldName];
                    }
                    else {
                        newUpdate[fieldName] = updated[fieldName];
                    }
                }
            }
            attributes['attributes'] = newUpdate;
            updates.push(attributes);
        }

        request.post(
            {
                url: timeSeriesFeatureApiApplyEdit,
                json: true,
                formData: {
                    updates: JSON.stringify(updates),
                    f: 'json',
                    token: token
                }
            },
            function (error, response, body) {
                if (response.statusCode == 200 && !error) {
                    resolve(`all states have been updated successfuly.`);
                }
                reject(error);
            }
        );
    });

const updateTimeSeriesTotalFeature = (updatedTimeSeriesTotals, token) =>
    new Promise((resolve, reject) => {
        let updates = [];
        for (const updatedTotal of updatedTimeSeriesTotals) {
            let attributes = {};
            let newUpdate = {};
            newUpdate[settings.objectIdField] = updatedTotal[settings.objectIdField];
            for (const totalField of _layerFieldsTotal) {
                newUpdate[totalField] = updatedTotal[totalField];
            }
            attributes['attributes'] = newUpdate;
            updates.push(attributes);
        }

        request.post(
            {
                url: timeSeriesFeatureApiApplyEdit,
                json: true,
                formData: {
                    updates: JSON.stringify(updates),
                    f: 'json',
                    token: token
                }
            },
            function (error, response, body) {
                if (response.statusCode == 200 && !error) {
                    resolve(`all total have been updated successfuly.`);
                }
                reject(error);
            }
        );
    });

const updateStatesFeature = (updatedSites, token) =>
    new Promise((resolve, reject) => {
        const updates = updatedSites.map(data => {
            return {
                attributes: {
                    OBJECTID: data.objectId,
                    Deaths: data.deaths,
                    Cases: data.confirmedCases,
                    Tests: data.testsConducted,
                    Last_Updated: data.lastUpdated,
                    Source: data.source
                }
            };
        });

        request.post(
            {
                url: statesFeatureApiApplyEdit,
                json: true,
                formData: {
                    updates: JSON.stringify(updates),
                    f: 'json',
                    token: token
                }
            },
            function (error, response, body) {
                if (response.statusCode == 200 && !error) {
                    resolve(`all states have been updated successfuly.`);
                }
                reject(error);
            }
        );
    });

const addTimeSeriesFeature = (addedTimesSeries, token) =>
    new Promise((resolve, reject) => {
        let adds = [];
        for (const added of addedTimesSeries) {
            let attributes = {};
            let newAdd = {};
            newAdd[_layerFieldsHeader.ObjectId] = added[_layerFieldsHeader.ObjectId];
            newAdd[_layerFieldsHeader.Date] = added[_layerFieldsHeader.Date];
            for (const state of _states) {
                for (const field of _layerFields) {
                    let fieldName = state + '_' + field;
                    if (field === 'Cases') {
                        newAdd[state] = added[fieldName];
                    }
                    else {
                        newAdd[fieldName] = added[fieldName];
                    }
                }
            }
            attributes['attributes'] = newAdd;
            adds.push(attributes);
        }

        request.post(
            {
                url: timeSeriesFeatureApiApplyEdit,
                json: true,
                formData: {
                    adds: JSON.stringify(adds),
                    f: 'json',
                    token: token
                }
            },
            function (error, response, body) {
                if (response.statusCode == 200 && !error) {
                    resolve(`new sites has been added successfully.`);
                }
                reject(error);
            }
        );
    });

//sometimes has to deduct, sometime no need
function getDayMonthYear(monthDayYear) {
    let dateString = monthDayYear.split('/');
    if (dateString.length < 1) {
        dateString = monthDayYear.split('-');
    }
    var day = dateString[0];
    var month = dateString[1];
    var year = dateString[2];

    return new Date(year, month - 1, day);
}

//sometimes has to deduct, sometime no need
function getDayMonthYearHourMinute(monthDayYear, hourMin) {
    const dateString = monthDayYear.split('/');
    if (dateString.length < 1) {
        dateString = monthDayYear.split('-');
    }
    const day = dateString[0];
    const month = dateString[1];
    const year = dateString[2];

    if (hourMin && hourMin.length > 2) {
        const time = hourMin.split(':');
        const hour = time[0];
        const min = time[1];
        return new Date(year, month - 1, day, hour, min);
    }
    return new Date(year, month - 1, day);
}

function getFormattedDate(anydate) {
    return (anydate.getFullYear()) + '-' + (anydate.getMonth() + 1) + '-' + (anydate.getDate());
}

function getFormattedNumber(anyvalue) {
    if (typeof anyvalue == 'number') {
        return anyvalue
    }

    if (anyvalue == null) {
        return null;
    }
    if (anyvalue == '') {
        return '';
    }

    var cleaned = anyvalue.replace(",", "");
    return Number(cleaned);

}

const deleteFeatureByObjectId = (token, apiUrlApplyEdit) => {
    let deleteObjectIds = [];
    for (let index = deletedObjectIdStarted; index <= deletedObjectIdEnded; index++) {
        deleteObjectIds.push(index);
    }
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: apiUrlApplyEdit,
                json: true,
                formData: {
                    deletes: JSON.stringify(deleteObjectIds),
                    f: 'json',
                    token: token
                }
            },
            function (error, response, body) {
                if (response.statusCode == 200 && !error) {
                    resolve(`${deleteObjectIds.length} feature(s) has been deleted successfully`);
                }
                reject(error);
            }
        );
    });
}

const getDailyHistoricalUpdates = (historicalUpdates) => {
    let dailyUpdates = [];
    for (const record of historicalUpdates) {
        let datetime = getDayMonthYearHourMinute(record["Date"], record["Time"]);
        const newRecord = {
            State: record.State,
            Date: getDayMonthYearHourMinute(record["Date"], '00:00'),
            Time: record["Time"],
            DateTimeUTC: datetime,
            DateTimestamp: new Date(getDayMonthYearHourMinute(record["Date"], '00:00').toString()).getTime(),
            DateTimeUTCString: datetime.toUTCString(),
            DateTimeLocaleString: datetime.toLocaleString(),
        }

        for (const field of _layerFields) {
            newRecord[field] = record[_jsonFields_Updates[field]];
        }

        let similarDateRecord = dailyUpdates.find(x => x.Date.toDateString() === newRecord.Date.toDateString() && x.State === newRecord.State);
        if (similarDateRecord != null) {
            if (newRecord.DateTimeUTC > similarDateRecord.DateTimeUTC) {
                let removeIndex = dailyUpdates.map(record => record.Date).indexOf(similarDateRecord.Date);
                dailyUpdates.splice(removeIndex, 1);
            } else {
                continue;
            }
        }
        dailyUpdates.push(newRecord)
    }
    return dailyUpdates;
}

const getUpdatedValue = (feature, currentUpdatesRecord, todayRecord, classField) => {
    let value = null;
    if (currentUpdatesRecord[classField]) {
        value = currentUpdatesRecord[classField];
    } else if (feature.attributes[classField] && classField.indexOf('Tests_Negative') > -1) {
        //for Tests_Negative, if there is value, keep the value as it is
        value = feature.attributes[classField];
    } else if (todayRecord) {
        if (todayRecord[classField]) {
            value = todayRecord[classField];
        } else {
            value = feature.attributes[classField];
        }
    }
    else {
        value = feature.attributes[classField];
    }
    return value;
}

const getUpdatedValueForNewRecord = (currentUpdatesRecord, todayRecord, classField) => {
    let value = null;
    if (currentUpdatesRecord[classField]) {
        value = currentUpdatesRecord[classField];
    } else if (todayRecord) {
        value = todayRecord[classField];
    }
    return value;
}

const getTodayRecord = (latestTotals, timeSeriesFeatures) => {
    let yesterdayTimestamp = getYesterdayTimestamp();
    let yesterdayUpdates = timeSeriesFeatures.features.filter(x => x.attributes.Date === yesterdayTimestamp);
    let todayRecord = {};
    for (const state of _states) {
        for (const field of _layerFields) {
            let fieldName = state + '_' + field;
            let previousExistingRecord = 0;
            let latestTotalsRecord = latestTotals.find(latest => latest["State or territory"] === state)[_jsonFields_LatestTotals[field]];
            if (yesterdayUpdates) {
                if (field === 'Cases') {
                    previousExistingRecord = (!yesterdayUpdates[0].attributes[fieldName]) ? null : yesterdayUpdates[0].attributes[state];
                } else {
                    previousExistingRecord = (!yesterdayUpdates[0].attributes[fieldName]) ? null : yesterdayUpdates[0].attributes[fieldName];
                }
            }

            if (latestTotalsRecord) {
                todayRecord[fieldName] = latestTotalsRecord;
            } else {
                todayRecord[fieldName] = previousExistingRecord
            }
        }
    }

    return todayRecord;
}

const getUpdatedTimeSeries = (timeSeriesFeatures, historicalUpdatesDaily, latestTotals) => {
    let updatedRecords = [];

    for (const feature of timeSeriesFeatures.features) {
        let featureDate = new Date(feature.attributes.Date);
        let currentUpdatesRecord = {};
        let updatedRecord = {};
        let todayRecord = null;
        let todayTimestamp = getTodayTimestamp();

        //filter by timestamp
        let filtered = historicalUpdatesDaily.filter(x => x.DateTimestamp === feature.attributes.Date);

        if (feature.attributes.Date === todayTimestamp) {
            todayRecord = getTodayRecord(latestTotals, timeSeriesFeatures);
            console.log('[getUpdatedTimeSeries] todayRecord:' + todayRecord);
        }

        if (filtered != null && filtered.length > 0) {
            updatedRecord[_layerFieldsHeader.ObjectId] = feature.attributes[settings.objectIdField];
            updatedRecord[_layerFieldsHeader.Date] = featureDate;
            updatedRecord['Date_Timestamp'] = feature.attributes.Date;
            for (const state of _states) {
                _layerFields.forEach(field => {
                    let columnField = state + '_' + field;
                    let stateRecord = filtered.filter(x => x.State === state);
                    if (stateRecord.length > 0) currentUpdatesRecord[columnField] = stateRecord[0][columnField];
                });

                for (const field of _layerFields) {
                    let classField = state + '_' + field;

                    let updatedValue = getUpdatedValue(feature, currentUpdatesRecord, todayRecord, classField);
                    updatedRecord[classField] = updatedValue;
                }
            }
        } else if (todayRecord) {
            updatedRecord[_layerFieldsHeader.ObjectId] = feature.attributes[settings.objectIdField];
            updatedRecord[_layerFieldsHeader.Date] = featureDate;
            updatedRecord['Date_Timestamp'] = feature.attributes.Date;
            for (const state of _states) {
                for (const field of _layerFields) {
                    let classField = state + '_' + field;
                    if (field != 'Cases' && field != 'Deaths' && field != 'Tests') {
                        if (feature.attributes[classField]) {
                            updatedRecord[classField] = feature.attributes[classField];
                        } else {
                            updatedRecord[classField] = todayRecord[classField];
                        }
                    } else {
                        updatedRecord[classField] = todayRecord[classField];
                    }

                }
            }
        }

        if (updatedRecord != null && updatedRecord.ObjectId != null) {
            updatedRecords.push(updatedRecord);
        }

    }
    return updatedRecords;
}

const IsAlreadyAdded = (uniqueDateTimestamp, timeSeriesFeatures) => {
    for (const feature of timeSeriesFeatures.features) {
        if (uniqueDateTimestamp === feature.attributes.Date) {
            dateAdded = true;
            return true;
        }
    }
    return false;
}

const getYesterdayTimestamp = () => {
    let newTodayDate = getTodayDateString();
    let todayDate = getFormattedDate(getDayMonthYear(newTodayDate)) + ' 00:00 GMT';
    let yesterdayTimestamp = new Date(todayDate).setDate(new Date(todayDate).getDate() - 1);
    return yesterdayTimestamp;
}

const getTodayTimestamp = () => {
    let newTodayDate = getTodayDateString();
    let todayDate = getFormattedDate(getDayMonthYear(newTodayDate)) + ' 00:00 GMT';//getFormattedDate(new Date()) + ' 00:00 GMT';
    let todayTimestamp = new Date(todayDate).setHours(new Date(todayDate).getHours());
    return todayTimestamp;
}

const getTodayDateString = () => {
    let newTodayDateTime = getTodayDateTime();
    let newTodayDate = getCustomFormattedDate(newTodayDateTime, 'dd/MM/yyyy');
    return newTodayDate;
}

const getTodayDateTime = () => {
    let newTodayDateTime = new Date(new Date().setHours(new Date().getHours() + settings.UTCdifferentHours));
    return newTodayDateTime;
}

const getAddedTimeSeries = (historicalUpdates, historicalUpdatesDaily, timeSeriesFeatures, latestTotals) => {
    let newRecords = [];
    let uniqueDates = [...new Set(historicalUpdates.map(item => item.Date))];

    //add new today date
    let newTodayDate = getTodayDateString();
    console.log('[getAddedTimeSeries] Today date: ' + newTodayDate);
    if (uniqueDates.indexOf(newTodayDate) < 0) {
        uniqueDates.push(newTodayDate);
    }
    console.log(uniqueDates);

    for (const uniqueDate of uniqueDates) {
        let newRecord = {};
        if (uniqueDate) {

            let newUniqueDate = getFormattedDate(getDayMonthYear(uniqueDate)) + ' 00:00 GMT';
            let uniqueDateTimestamp = new Date(newUniqueDate).setHours(new Date(newUniqueDate).getHours());

            if (IsAlreadyAdded(uniqueDateTimestamp, timeSeriesFeatures)) continue;
            let filtered = historicalUpdatesDaily.filter(x => x.DateTimestamp === uniqueDateTimestamp);

            let todayRecord = null;
            let todayTimestamp = getTodayTimestamp();
            console.log('[getAddedTimeSeries] uniqueDateTimestamp => ' + uniqueDateTimestamp);
            console.log('[getAddedTimeSeries] todayTimestamp => ' + todayTimestamp);
            if (uniqueDateTimestamp === todayTimestamp) {
                todayRecord = getTodayRecord(latestTotals, timeSeriesFeatures);
                console.log('[getAddedTimeSeries] todayRecord -> ' + JSON.stringify(todayRecord));
            }

            if (filtered && filtered.length > 0) {
                currentUpdatesRecord = {};
                for (const state of _states) {
                    _layerFields.forEach(field => {
                        let stateRecord = filtered.filter(x => x.State === state);
                        let classField = state + '_' + field;
                        if (stateRecord.length > 0) {
                            currentUpdatesRecord[classField] = stateRecord[0][field];
                        }
                    });
                }
                console.log(`building new record ...`);
                newRecord[_layerFieldsHeader.ObjectId] = 0;
                newRecord[_layerFieldsHeader.Date] = uniqueDateTimestamp;
                for (const state of _states) {
                    for (const field of _layerFields) {
                        let classField = state + '_' + field;
                        let updatedValue = getUpdatedValueForNewRecord(currentUpdatesRecord, todayRecord, classField);
                        newRecord[classField] = updatedValue;
                    }
                }
                newRecords.push(newRecord);
            } else if (todayRecord) {
                newRecord[_layerFieldsHeader.ObjectId] = 0;
                newRecord[_layerFieldsHeader.Date] = uniqueDateTimestamp;
                for (const state of _states) {
                    for (const field of _layerFields) {
                        let classField = state + '_' + field;
                        newRecord[classField] = todayRecord[classField];
                    }
                }
                newRecords.push(newRecord);
            }
        }
    }
    return newRecords;
}

const getTimeSeriesDailyTotals = (newTimeSeriesFeatures) => {
    let timeSeriesTotals = [];
    for (const feature of newTimeSeriesFeatures.features) {
        let timeSeriesTotal = {};
        timeSeriesTotal[settings.objectIdField] = feature.attributes[settings.objectIdField];
        for (const field of _layerFields) {
            let sumField = 0;
            for (const state of _states) {
                let classField = (field === 'Cases') ? state : `${state}_${field}`;
                sumField += (feature.attributes[classField]) ? (feature.attributes[classField]) : 0;
            }
            let totalClassField = `Total_${field}`;
            if (_layerFieldsTotal.indexOf(totalClassField) > -1) timeSeriesTotal[totalClassField] = sumField;
        }
        timeSeriesTotals.push(timeSeriesTotal);
    }
    return timeSeriesTotals;
}

const getUpdatedStates = (latestTotals, statesFeatures) => {
    let updatedStates = [];
    for (const feature of statesFeatures.features) {
        let stateTotal = latestTotals.find(latest => latest[_jsonFields_LatestTotals.State] === feature.attributes.ISO_SUB);
        if (stateTotal) {
            let deaths = (stateTotal[_jsonFields_LatestTotals.Deaths]) ? stateTotal[_jsonFields_LatestTotals.Deaths] : 0;
            let confirmedCases = (stateTotal[_jsonFields_LatestTotals.Cases]) ? stateTotal[_jsonFields_LatestTotals.Cases] : null;
            let testsConducted = (stateTotal[_jsonFields_LatestTotals.Tests]) ? stateTotal[_jsonFields_LatestTotals.Tests] : null;
            const featureData = {
                objectId: feature.attributes.OBJECTID,
                deaths: getFormattedNumber(deaths),
                confirmedCases: getFormattedNumber(confirmedCases),
                testsConducted: getFormattedNumber(testsConducted),
                lastUpdated: stateTotal["Last updated"],
                source: stateTotal["Source"]
            };
            updatedStates.push(featureData);
        }
    }
    return updatedStates;
}

const getCustomFormattedDate = (customizeThisDate, customFormat) => {
    let day = customizeThisDate.getDate();
    let month = customizeThisDate.getMonth() + 1;
    var year = customizeThisDate.getFullYear();

    day = (day < 10) ? '0' + day : day;
    month = (month < 10) ? '0' + month : month;

    let dateAfterCustomized = null;
    let splitter = '/';
    if (customFormat.indexOf('-') > -1) {
        splitter = '-';
    }

    switch (customFormat) {
        case `dd${splitter}MM${splitter}yyyy`:
            dateAfterCustomized = `${day}${splitter}${month}${splitter}${year}`;
            break;
        case `MM${splitter}dd${splitter}yyyy`:
            dateAfterCustomized = `${day}${splitter}${month}${splitter}${year}`;
            break;
        default:
            dateAfterCustomized = customizeThisDate;
            break;
    }

    return dateAfterCustomized;
}

const appRouterTEST = app => {
    app.get('/', async (req, res) => {
        console.log("Scanning started...")
        try {

            _states = [];

            settings.UTCdifferentHours = 0;

            //get token
            const token = await requestToken();
            console.log('token: ' + token);

            //**** TO DELETE UNEXPECTED RESULT */cd 

            //temp call to delete duplicate records
            const removeResult = await deleteFeatureByObjectId(token, timeSeriesFeatureApiApplyEdit);

            //get JSON source
            const source = await getSource();

            //get states features
            const statesFeatures = await getStatesFeatures(token);

            //get time series features
            const timeSeriesFeatures = await getTimeSeriesFeatures(token);

            //get 'latest totals' from JSON source
            const latestTotals = source.sheets["latest totals"];

            //get 'updates' from JSON source
            const historicalUpdates = source.sheets["updates"];

            //transform 'updates' to limit one record per day
            const historicalUpdatesDaily = getDailyHistoricalUpdates(historicalUpdates);

            //get states from states feature
            for (let feature of statesFeatures.features) {
                if (feature.attributes.ISO_SUB != 'OT') {
                    _states.push(feature.attributes.ISO_SUB);
                }
            }

            let stateTotal = latestTotals.find(latest => latest[_jsonFields_LatestTotals.State] === 'National');
            let confirmedCases, death, testsConducted = null;
            if (stateTotal) {
                deaths = (stateTotal[_jsonFields_LatestTotals.Deaths]) ? stateTotal[_jsonFields_LatestTotals.Deaths] : 0;
                confirmedCases = (stateTotal[_jsonFields_LatestTotals.Cases]) ? stateTotal[_jsonFields_LatestTotals.Cases] : null;
                testsConducted = (stateTotal[_jsonFields_LatestTotals.Tests]) ? stateTotal[_jsonFields_LatestTotals.Tests] : null;
            }


            let todayRecord = timeSeriesFeatures.features.find(x => x.attributes.Date == getTodayTimestamp())
            console.log('todayRecord:' + JSON.stringify(todayRecord));
            let todayCases, todayDeaths, todayTests = null;
            if (todayRecord) {
                todayCases = todayRecord.attributes.Total_Cases;
                todayDeaths = todayRecord.attributes.Total_Deaths;
                todayTests = todayRecord.attributes.Total_Tests;
            }

            let casesLine, deathsLine, testLine = '';
            let notMacthes = [];
            if (getFormattedNumber(confirmedCases) === todayCases) {
                casesLine = '<font color = green>Cases: [Source] ' + confirmedCases + ' vs [Target] ' + todayCases + '</font>';
                console.log(casesLine);
            }
            else {
                casesLine = '<font color = red>Cases: [Source] ' + confirmedCases + ' vs [Target] ' + todayCases + '</font>';
                console.log(casesLine);
                notMacthes.push('Total Cases');
            }

            if (getFormattedNumber(deaths) === todayDeaths) {
                deathsLine = '<font color = green>Deaths: [Source] ' + deaths + ' vs [Target] ' + todayDeaths + '</font>';
                console.log(deathsLine);
            }
            else {
                deathsLine = '<font color = read>Deaths: [Source] ' + deaths + ' vs [Target] ' + todayDeaths + '</font>';
                console.log(deathsLine);
                notMacthes.push('Total Deaths');
            }

            if (getFormattedNumber(testsConducted) === todayTests) {
                testsLine = '<font color = green>Tests: [Source] ' + testsConducted + ' vs [Target] ' + todayTests + '</font>';
                console.log(testsLine);
            }
            else {
                testsLine = '<font color = red>Tests: [Source] ' + testsConducted + ' vs [Target] ' + todayTests + '</font>';
                console.log(testsLine);
                notMacthes.push('Total Tests');
            }

            let notMatchText = '';
            for (const notMatch of notMacthes) {
                notMatchText += notMatch + ',';
            }

            if (notMacthes.length == 0) {
                notMatchText = '<font color = green><strong>Errmmm....so far looks good!</strong></font>';
            } else {
                notMatchText += ' currently not matched!';
            }

            let detailText = '';
            for (const state of _states) {
                let stateTotal = latestTotals.find(latest => latest[_jsonFields_LatestTotals.State] === state);
                detailText += '<br/><br/>LATEST STAT FOR -> <strong>' + state + '</strong> ...';
                for (const field of _layerFields) {
                    if (field === 'Tests_Negative') continue;
                    let fieldName = (field === 'Cases') ? state : state + '_' + field;
                    
                    let sourceValue = (stateTotal[_jsonFields_LatestTotals[field]]) ? getFormattedNumber(stateTotal[_jsonFields_LatestTotals[field]]) : 0;
                    let targetValue =  (todayRecord.attributes[fieldName]) ? todayRecord.attributes[fieldName] : 0;
                    if (sourceValue === targetValue) {
                        detailText += '<br/><font color=green>' + fieldName + ': Source: ' + sourceValue + ' | Target: ' + targetValue;
                        detailText += '</font>';
                    }else{
                        detailText += '<br/><font color=red>' + fieldName + ': Source: ' + sourceValue + ' | Target: ' + targetValue;
                        detailText += '</font>';
                    }
                }
            }

            let totalRecords = '<strong>No of records: ' + timeSeriesFeatures.features.length + '</strong>';
            let summaryText = "<br/><strong><u>SUMMARY TOTAL</u></strong></br>";
            summaryText += '<strong><br/>' + totalRecords + '<br/>' + casesLine + '<br/>' + deathsLine + '<br/>' + testsLine + '</strong><br/><br/>' + notMatchText;

            res.status(200).send(`<html><h2>COVID19 VERIFICATION PAGE</h2><body style='font-family: sans-serif;'><head>
            <strong>(LAST SCANNED: ${new Date()})</strong><br/><br/> ${summaryText}${detailText}</body></html>`);


        } catch (error) {
            console.log(error);
        }
    });
};

const appRouter = app => {
    app.get('/', async (req, res) => {
        console.log("Synchronization started.")
        try {
            _states = [];

            //get token
            const token = await requestToken();
            console.log('token: ' + token);

            //**** TO DELETE UNEXPECTED RESULT */cd 

            //temp call to delete duplicate records
            const removeResult = await deleteFeatureByObjectId(token, timeSeriesFeatureApiApplyEdit);

            //get JSON source
            const source = await getSource();

            //get states features
            const statesFeatures = await getStatesFeatures(token);

            //get time series features
            const timeSeriesFeatures = await getTimeSeriesFeatures(token);

            //get 'latest totals' from JSON source
            const latestTotals = source.sheets["latest totals"];

            //get 'updates' from JSON source
            const historicalUpdates = source.sheets["updates"];

            //transform 'updates' to limit one record per day
            const historicalUpdatesDaily = getDailyHistoricalUpdates(historicalUpdates);

            //get states from states feature
            for (let feature of statesFeatures.features) {
                if (feature.attributes.ISO_SUB != 'OT') {
                    _states.push(feature.attributes.ISO_SUB);
                }
            }

            // update time series feature
            let updatedTimeSeriesRecords = getUpdatedTimeSeries(timeSeriesFeatures, historicalUpdatesDaily, latestTotals);
            let updateTimeSeriesResult = await updateTimeSeriesFeature(updatedTimeSeriesRecords, token);
            console.log(`1st update: ${updatedTimeSeriesRecords.length} ${updateTimeSeriesResult}`);

            //add new feature to time series feature
            let newTimeSeriesRecords = getAddedTimeSeries(historicalUpdates, historicalUpdatesDaily, timeSeriesFeatures, latestTotals);
            if (newTimeSeriesRecords.length > 0) {
                const addTimeSeriesResult = await addTimeSeriesFeature(newTimeSeriesRecords, token);
                console.log(`${newTimeSeriesRecords.length} ${addTimeSeriesResult}`);
            }

            //get updated time series with new features 
            const newTimeSeriesFeatures = await getTimeSeriesFeatures(token);

            //update time series one more time
            updatedTimeSeriesRecords = getUpdatedTimeSeries(newTimeSeriesFeatures, historicalUpdatesDaily, latestTotals);
            updateTimeSeriesResult = await updateTimeSeriesFeature(updatedTimeSeriesRecords, token);
            console.log(`2nd update: ${updatedTimeSeriesRecords.length} ${updateTimeSeriesResult}`);

            //update daily total
            const updatedTimeSeriesDailyTotal = getTimeSeriesDailyTotals(newTimeSeriesFeatures);
            const updateTotalResult = await updateTimeSeriesTotalFeature(updatedTimeSeriesDailyTotal, token);
            console.log(`totals updated: ${updatedTimeSeriesDailyTotal.length} ${updateTotalResult}`);

            //update states cases
            let updatedStates = getUpdatedStates(latestTotals, statesFeatures);
            const updateStatesFeatureResult = await updateStatesFeature(updatedStates, token);
            console.log(`features updated: ${updatedStates.length} ${updateStatesFeatureResult}`);
            res.status(200).send('Synchronization completed.');

        } catch (error) {
            console.log(error);
        }
    });
};

module.exports = appRouter;

