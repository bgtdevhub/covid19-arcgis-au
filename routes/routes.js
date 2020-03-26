const request = require('request');
const settings = require('../global-settings.js');

const statesFeatureApiApplyEdit = `${settings.statesFeatureApi}/applyEdits`;
const timeSeriesFeatureApiApplyEdit = `${settings.timeSeriesFeatureApi}/applyEdits`;

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

const getHistoricalUpdatesByDatetime = () =>
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

const updateTimeSeriesFeature = (updatedSites, token) =>
    new Promise((resolve, reject) => {
        const updates = updatedSites.map(data => {
            return {
                attributes: {
                    ObjectId: data.objectId, 
                    NSW: data.nsw_cases,
                    VIC: data.vic_cases,
                    QLD: data.qld_cases,
                    SA: data.sa_cases,
                    WA: data.wa_cases,
                    TAS: data.tas_cases,
                    NT: data.nt_cases,
                    ACT: data.act_cases,
                    Total_Cases: data.total_cases,
                    NSW_Deaths: data.nsw_deaths,
                    VIC_Deaths: data.vic_deaths,
                    QLD_Deaths: data.qld_deaths,
                    SA_Deaths: data.sa_deaths,
                    WA_Deaths: data.wa_deaths,
                    TAS_Deaths: data.tas_deaths,
                    NT_Deaths: data.nt_deaths,
                    ACT_deaths: data.act_deaths,
                    Total_Deaths: data.total_deaths,
                    NSW_Tests: data.nsw_tests,
                    VIC_Tests: data.vic_tests,
                    QLD_Tests: data.qld_tests,
                    SA_Tests: data.sa_tests,
                    WA_Tests: data.wa_tests,
                    TAS_Tests: data.tas_tests,
                    NT_Tests: data.nt_tests,
                    ACT_Tests: data.act_tests,
                    Total_Tests: data.total_tests,
                    NSW_Tests_Negative: data.nsw_tests_negative,
                    VIC_Tests_Negative: data.vic_tests_negative,
                    QLD_Tests_Negative: data.qld_tests_negative,
                    SA_Tests_Negative: data.sa_tests_negative,
                    WA_Tests_Negative: data.wa_tests_negative,
                    TAS_Tests_Negative: data.tas_tests_negative,
                    NT_Tests_Negative: data.nt_tests_negative,
                    ACT_Tests_Negative: data.act_tests_negative,
                    Total_Tests_Negative: data.total_tests_negative
                }
            };
        });

        
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

const updateTimeSeriesTotalFeature = (updatedSites, token) =>
    new Promise((resolve, reject) => {
        const updates = updatedSites.map(data => {
            return {
                attributes: {
                    ObjectId: data.objectId, 
                    Total_Cases: data.total_cases,
                    Total_Deaths: data.total_deaths,
                    Total_Tests: data.total_tests,
                    Total_Tests_Negative: data.total_tests_negative
                }
            };
        });
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

const addTimeSeriesFeature = (newSites, token) =>
    new Promise((resolve, reject) => {
        const adds = newSites.map(data => {
            return {
                attributes: {
                    Date: data.date.getTime(),
                    NSW: data.nsw_cases,
                    VIC: data.vic_cases,
                    QLD: data.qld_cases,
                    SA: data.sa_cases,
                    WA: data.wa_cases,
                    TAS: data.tas_cases,
                    NT: data.nt_cases,
                    ACT: data.act_cases,
                    Total_Cases: data.total_cases,
                    NSW_Deaths: data.nsw_deaths,
                    VIC_Deaths: data.vic_deaths,
                    QLD_Deaths: data.qld_deaths,
                    SA_Deaths: data.sa_deaths,
                    WA_Deaths: data.wa_deaths,
                    TAS_Deaths: data.tas_deaths,
                    NT_Deaths: data.nt_deaths,
                    ACT_deaths: data.act_deaths,
                    Total_Deaths: data.total_deaths,
                    NSW_Tests: data.nsw_tests,
                    VIC_Tests: data.vic_tests,
                    QLD_Tests: data.qld_tests,
                    SA_Tests: data.sa_tests,
                    WA_Tests: data.wa_tests,
                    TAS_Tests: data.tas_tests,
                    NT_Tests: data.nt_tests,
                    ACT_Tests: data.act_tests,
                    Total_Tests: data.total_tests,
                    NSW_Tests_Negative: data.nsw_tests_negative,
                    VIC_Tests_Negative: data.vic_tests_negative,
                    QLD_Tests_Negative: data.qld_tests_negative,
                    SA_Tests_Negative: data.sa_tests_negative,
                    WA_Tests_Negative: data.wa_tests_negative,
                    TAS_Tests_Negative: data.tas_tests_negative,
                    NT_Tests_Negative: data.nt_tests_negative,
                    ACT_Tests_Negative: data.act_tests_negative,
                    Total_Tests_Negative: data.total_tests_negative
                }
            };
        });

        //console.log('****adds:' + JSON.stringify(adds))

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
    var day = dateString[0];
    var month = dateString[1];
    var year = dateString[2];

    return new Date(year, month - 1, day);
}

//sometimes has to deduct, sometime no need
function getDayMonthYearHourMinute(monthDayYear, hourMin) {
    const dateString = monthDayYear.split('/');
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

const deleteFeatureByObjectId = (objectIds, token, apiUrlApplyEdit) => {
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: apiUrlApplyEdit,
                json: true,
                formData: {
                    deletes: JSON.stringify(objectIds),
                    f: 'json',
                    token: token
                }
            },
            function (error, response, body) {
                if (response.statusCode == 200 && !error) {
                    resolve(`feature has been deleted successfully`);
                }
                reject(error);
            }
        );
    });
}

const dailyHistoricalUpdates = (historicalUpdates) => {
    let dailyUpdates = [];
    for (const record of historicalUpdates) {
        let datetime = getDayMonthYearHourMinute(record["Date"], record["Time"]);
        const newRecord = {
            State: record.State,
            Date: getDayMonthYearHourMinute(record["Date"], '00:00'),
            Time: record["Time"],
            DateTimeUTC: datetime,
            DateTimeUTCString: datetime.toUTCString(),
            DateTimeLocaleString: datetime.toLocaleString(),
            Cases: record["Cumulative case count"],
            Deaths: record["Cumulative deaths"],
            Tests: record["Tests conducted (total)"],
            TestsNegative: record["Tests conducted (negative)"]
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

const appRouter = app => {
    app.get('/', async (req, res) => {
        console.log("Synchronization started.")
        try {
            let updatedFeatures = [];

            //1. Request tokens from ArcGIS online
            const token = await requestToken();
            console.log(`token: ${token}`);

            //2- get all station data (siteId and the values)
            const historicalUpdatesByDatetime = await getHistoricalUpdatesByDatetime();
            const statesFeatures = await getStatesFeatures(token);
            const timeSeriesFeatures = await getTimeSeriesFeatures(token);
            const latestTotals = historicalUpdatesByDatetime.sheets["latest totals"];
            const historicalUpdates = historicalUpdatesByDatetime.sheets["updates"];
            const historicalUpdatesDaily = dailyHistoricalUpdates(historicalUpdates);

            //update time series
            let existingFeatures = [];
            let newTimeSeries = [];

            for (const feature of timeSeriesFeatures.features) {
                let ts = feature.attributes.Date;
                ts = Number(ts);
                let readableDate = new Date(ts);
                let filtered = historicalUpdatesDaily.filter(x => getFormattedDate(x.Date) === getFormattedDate(new Date(ts)));

                let latestTotal_NSW_Cases = 0;
                let latestTotal_VIC_Cases = 0;
                let latestTotal_QLD_Cases = 0;
                let latestTotal_SA_Cases = 0;
                let latestTotal_WA_Cases = 0;
                let latestTotal_TAS_Cases = 0;
                let latestTotal_NT_Cases = 0;
                let latestTotal_ACT_Cases = 0;
                let latestTotal_NSW_Tests = 0;
                let latestTotal_VIC_Tests = 0;
                let latestTotal_QLD_Tests = 0;
                let latestTotal_SA_Tests = 0;
                let latestTotal_WA_Tests = 0;
                let latestTotal_TAS_Tests = 0;
                let latestTotal_NT_Tests = 0;
                let latestTotal_ACT_Tests = 0;
                let latestTotal_NSW_Deaths = 0;
                let latestTotal_VIC_Deaths = 0;
                let latestTotal_QLD_Deaths = 0;
                let latestTotal_SA_Deaths = 0;
                let latestTotal_WA_Deaths = 0;
                let latestTotal_TAS_Deaths = 0;
                let latestTotal_NT_Deaths = 0;
                let latestTotal_ACT_Deaths = 0;
                let nsw_tests_negative_yesterday = 0;
                let vic_tests_negative_yesterday = 0;
                let qld_tests_negative_yesterday = 0;
                let sa_tests_negative_yesterday = 0;
                let wa_tests_negative_yesterday = 0;
                let tas_tests_negative_yesterday = 0;
                let nt_tests_negative_yesterday = 0;
                let act_tests_negative_yesterday = 0;


                let isToday = false;
                let todayDate = new Date(); 
                if (getFormattedDate(readableDate) === getFormattedDate(todayDate)) {
                    isToday = true;
                    latestTotal_NSW_Cases = latestTotals.find(latest => latest["State or territory"] === 'NSW')["Confirmed cases (cumulative)"];
                    latestTotal_NSW_Tests = latestTotals.find(latest => latest["State or territory"] === 'NSW')["Tests conducted"];
                    latestTotal_NSW_Deaths = latestTotals.find(latest => latest["State or territory"] === 'NSW')["Deaths"];

                    latestTotal_VIC_Cases = latestTotals.find(latest => latest["State or territory"] === 'VIC')["Confirmed cases (cumulative)"];
                    latestTotal_VIC_Tests = latestTotals.find(latest => latest["State or territory"] === 'VIC')["Tests conducted"];
                    latestTotal_VIC_Deaths = latestTotals.find(latest => latest["State or territory"] === 'VIC')["Deaths"];

                    latestTotal_QLD_Cases = latestTotals.find(latest => latest["State or territory"] === 'QLD')["Confirmed cases (cumulative)"];
                    latestTotal_QLD_Tests = latestTotals.find(latest => latest["State or territory"] === 'QLD')["Tests conducted"];
                    latestTotal_QLD_Deaths = latestTotals.find(latest => latest["State or territory"] === 'QLD')["Deaths"];

                    latestTotal_SA_Cases = latestTotals.find(latest => latest["State or territory"] === 'SA')["Confirmed cases (cumulative)"];
                    latestTotal_SA_Tests = latestTotals.find(latest => latest["State or territory"] === 'SA')["Tests conducted"];
                    latestTotal_SA_Deaths = latestTotals.find(latest => latest["State or territory"] === 'SA')["Deaths"];

                    latestTotal_WA_Cases = latestTotals.find(latest => latest["State or territory"] === 'WA')["Confirmed cases (cumulative)"];
                    latestTotal_WA_Tests = latestTotals.find(latest => latest["State or territory"] === 'WA')["Tests conducted"];
                    latestTotal_WA_Deaths = latestTotals.find(latest => latest["State or territory"] === 'WA')["Deaths"];

                    latestTotal_TAS_Cases = latestTotals.find(latest => latest["State or territory"] === 'TAS')["Confirmed cases (cumulative)"];
                    latestTotal_TAS_Tests = latestTotals.find(latest => latest["State or territory"] === 'TAS')["Tests conducted"];
                    latestTotal_TAS_Deaths = latestTotals.find(latest => latest["State or territory"] === 'TAS')["Deaths"];

                    latestTotal_NT_Cases = latestTotals.find(latest => latest["State or territory"] === 'NT')["Confirmed cases (cumulative)"];
                    latestTotal_NT_Tests = latestTotals.find(latest => latest["State or territory"] === 'NT')["Tests conducted"];
                    latestTotal_NT_Deaths = latestTotals.find(latest => latest["State or territory"] === 'NT')["Deaths"];

                    latestTotal_ACT_Cases = latestTotals.find(latest => latest["State or territory"] === 'ACT')["Confirmed cases (cumulative)"];
                    latestTotal_ACT_Tests = latestTotals.find(latest => latest["State or territory"] === 'ACT')["Tests conducted"];
                    latestTotal_ACT_Deaths = latestTotals.find(latest => latest["State or territory"] === 'ACT')["Deaths"];

                    let previousDate = todayDate.setDate(todayDate.getDate() - 1);
                    previousUpdates = timeSeriesFeatures.features.filter(x => getFormattedDate(new Date(new Date(x.attributes.Date))) === getFormattedDate(new Date(previousDate)));
                    if (previousUpdates) {
                        nsw_tests_negative_yesterday = (!previousUpdates[0].attributes.NSW_Tests_Negative) ? null : previousUpdates[0].attributes.NSW_Tests_Negative;
                        vic_tests_negative_yesterday =  (!previousUpdates[0].attributes.VIC_Tests_Negative) ? null :previousUpdates[0].attributes.VIC_Tests_Negative;
                        qld_tests_negative_yesterday = (!previousUpdates[0].attributes.QLD_Tests_Negative) ? null :previousUpdates[0].attributes.QLD_Tests_Negative;
                        sa_tests_negative_yesterday =  (!previousUpdates[0].attributes.SA_Tests_Negative) ? null :previousUpdates[0].attributes.SA_Tests_Negative;
                        wa_tests_negative_yesterday =  (!previousUpdates[0].attributes.WA_Tests_Negative) ? null :previousUpdates[0].attributes.WA_Tests_Negative;
                        tas_tests_negative_yesterday =  (!previousUpdates[0].attributes.TAS_Tests_Negative) ? null :previousUpdates[0].attributes.TAS_Tests_Negative;
                        nt_tests_negative_yesterday =  (!previousUpdates[0].attributes.NT_Tests_Negative) ? null :previousUpdates[0].attributes.NT_Tests_Negative;
                        act_tests_negative_yesterday =  (!previousUpdates[0].attributes.ACT_Tests_Negative) ? null :previousUpdates[0].attributes.ACT_Tests_Negative;   
                    }
                }


                if (filtered != null && filtered.length > 0) {
                    let nswData = filtered.filter(x => x.State === 'NSW');
                    let vicData = filtered.filter(x => x.State === 'VIC');
                    let qldData = filtered.filter(x => x.State === 'QLD');
                    let saData = filtered.filter(x => x.State === 'SA');
                    let waData = filtered.filter(x => x.State === 'WA');
                    let tasData = filtered.filter(x => x.State === 'TAS');
                    let ntData = filtered.filter(x => x.State === 'NT');
                    let actData = filtered.filter(x => x.State === 'ACT');

                    let nsw_cases = (nswData == '') ? null : nswData[0].Cases;
                    let vic_cases = (vicData == '') ? null : vicData[0].Cases;
                    let qld_cases = (qldData == '') ? null : qldData[0].Cases;
                    let sa_cases = (saData == '') ? null : saData[0].Cases;
                    let wa_cases = (waData == '') ? null : waData[0].Cases;
                    let tas_cases = (tasData == '') ? null : tasData[0].Cases;
                    let nt_cases = (ntData == '') ? null : ntData[0].Cases;
                    let act_cases = (actData == '') ? null : actData[0].Cases;
                    let total_cases = parseInt(nsw_cases) + parseInt(vic_cases) + parseInt(qld_cases)
                        + parseInt(sa_cases) + parseInt(wa_cases) + parseInt(tas_cases) + parseInt(nt_cases) + parseInt(act_cases);

                    let nsw_deaths = (nswData == '') ? null : nswData[0].Deaths;
                    let vic_deaths = (vicData == '') ? null : vicData[0].Deaths;
                    let qld_deaths = (qldData == '') ? null : qldData[0].Deaths;
                    let sa_deaths = (saData == '') ? null : saData[0].Deaths;
                    let wa_deaths = (waData == '') ? null : waData[0].Deaths;
                    let tas_deaths = (tasData == '') ? null : tasData[0].Deaths;
                    let nt_deaths = (ntData == '') ? null : ntData[0].Deaths;
                    let act_deaths = (actData == '') ? null : actData[0].Deaths;
                    let total_deaths = parseInt(nsw_deaths) + parseInt(vic_deaths) + parseInt(qld_deaths)
                        + parseInt(sa_deaths) + parseInt(wa_deaths) + parseInt(tas_deaths) + parseInt(nt_deaths) + parseInt(act_deaths);

                    let nsw_tests = (nswData == '') ? null : nswData[0].Tests;
                    let vic_tests = (vicData == '') ? null : vicData[0].Tests;
                    let qld_tests = (qldData == '') ? null : qldData[0].Tests;
                    let sa_tests = (saData == '') ? null : saData[0].Tests;
                    let wa_tests = (waData == '') ? null : waData[0].Tests;
                    let tas_tests = (tasData == '') ? null : tasData[0].Tests;
                    let nt_tests = (ntData == '') ? null : ntData[0].Tests;
                    let act_tests = (actData == '') ? null : actData[0].Tests;
                    let total_tests = parseInt(nsw_tests) + parseInt(vic_tests) + parseInt(qld_tests)
                        + parseInt(sa_tests) + parseInt(wa_tests) + parseInt(tas_tests) + parseInt(nt_tests) + parseInt(act_tests);

                    let nsw_tests_negative = (nswData == '') ? null : nswData[0].TestsNegative;
                    let vic_tests_negative = (vicData == '') ? null : vicData[0].TestsNegative;
                    let qld_tests_negative = (qldData == '') ? null : qldData[0].TestsNegative;
                    let sa_tests_negative = (saData == '') ? null : saData[0].TestsNegative;
                    let wa_tests_negative = (waData == '') ? null : waData[0].TestsNegative;
                    let tas_tests_negative = (tasData == '') ? null : tasData[0].TestsNegative;
                    let nt_tests_negative = (ntData == '') ? null : ntData[0].TestsNegative;
                    let act_tests_negative = (actData == '') ? null : actData[0].TestsNegative;
                    let total_tests_negative = parseInt(nsw_tests_negative) + parseInt(vic_tests_negative) + parseInt(qld_tests_negative)
                        + parseInt(sa_tests_negative) + parseInt(wa_tests_negative) + parseInt(tas_tests_negative) + parseInt(nt_tests_negative) + parseInt(act_tests_negative);

                    let featureData = {
                        objectId: feature.attributes.ObjectId,  
                        date: readableDate.toDateString(),
                        nsw_cases: (nsw_cases) ? getFormattedNumber(nsw_cases) : ((isToday) ? latestTotal_NSW_Cases : feature.attributes.NSW),
                        vic_cases: (vic_cases) ? getFormattedNumber(vic_cases) : ((isToday) ? latestTotal_VIC_Cases : feature.attributes.VIC),
                        qld_cases: (qld_cases) ? getFormattedNumber(qld_cases) : ((isToday) ? latestTotal_QLD_Cases : feature.attributes.QLD),
                        sa_cases: (sa_cases) ? getFormattedNumber(sa_cases) : ((isToday) ? latestTotal_SA_Cases : feature.attributes.SA),
                        wa_cases: (wa_cases) ? getFormattedNumber(wa_cases) : ((isToday) ? latestTotal_WA_Cases : feature.attributes.WA),
                        tas_cases: (tas_cases) ? getFormattedNumber(tas_cases) : ((isToday) ? latestTotal_TAS_Cases : feature.attributes.TAS),
                        nt_cases: (nt_cases) ? getFormattedNumber(nt_cases) : ((isToday) ? latestTotal_NT_Cases : feature.attributes.NT),
                        act_cases: (act_cases) ? getFormattedNumber(act_cases) : ((isToday) ? latestTotal_ACT_Cases : feature.attributes.ACT),
                        total_cases: total_cases,
                        nsw_deaths: (nsw_deaths) ? getFormattedNumber(nsw_deaths) : ((isToday) ? latestTotal_NSW_Deaths : feature.attributes.NSW_Deaths),
                        vic_deaths: (vic_deaths) ? getFormattedNumber(vic_deaths) : ((isToday) ? latestTotal_VIC_Deaths : feature.attributes.VIC_Deaths),
                        qld_deaths: (qld_deaths) ? getFormattedNumber(qld_deaths) : ((isToday) ? latestTotal_QLD_Deaths : feature.attributes.QLD_Deaths),
                        sa_deaths: (sa_deaths) ? getFormattedNumber(sa_deaths) : ((isToday) ? latestTotal_SA_Deaths : feature.attributes.SA_Deaths),
                        wa_deaths: (wa_deaths) ? getFormattedNumber(wa_deaths) : ((isToday) ? latestTotal_WA_Deaths : feature.attributes.WA_Deaths),
                        tas_deaths: (tas_deaths) ? getFormattedNumber(tas_deaths) : ((isToday) ? latestTotal_TAS_Deaths : feature.attributes.TAS_Deaths),
                        nt_deaths: (nt_deaths) ? getFormattedNumber(nt_deaths) : ((isToday) ? latestTotal_NT_Deaths : feature.attributes.NT_Deaths),
                        act_deaths: (act_deaths) ? getFormattedNumber(act_deaths) : ((isToday) ? latestTotal_ACT_Deaths : feature.attributes.ACT_Deaths),
                        total_deaths: total_deaths,
                        nsw_tests: (nsw_tests) ? getFormattedNumber(nsw_tests) : ((isToday) ? latestTotal_NSW_Tests : feature.attributes.NSW_Tests),
                        vic_tests: (vic_tests) ? getFormattedNumber(vic_tests) : ((isToday) ? latestTotal_VIC_Tests : feature.attributes.VIC_Tests),
                        qld_tests: (qld_tests) ? getFormattedNumber(qld_tests) : ((isToday) ? latestTotal_QLD_Tests : feature.attributes.QLD_Tests),
                        sa_tests: (sa_tests) ? getFormattedNumber(sa_tests) : ((isToday) ? latestTotal_SA_Tests : feature.attributes.SA_Tests),
                        wa_tests: (wa_tests) ? getFormattedNumber(wa_tests) : ((isToday) ? latestTotal_WA_Tests : feature.attributes.WA_Tests),
                        tas_tests: (tas_tests) ? getFormattedNumber(tas_tests) : ((isToday) ? latestTotal_TAS_Tests : feature.attributes.TAS_Tests),
                        nt_tests: (nt_tests) ? getFormattedNumber(nt_tests) : ((isToday) ? latestTotal_NT_Tests : feature.attributes.NT_Tests),
                        act_tests: (act_tests) ? getFormattedNumber(act_tests) : ((isToday) ? latestTotal_ACT_Tests : feature.attributes.ACT_Tests),
                        total_tests: total_tests,
                        nsw_tests_negative: (nsw_tests_negative) ? getFormattedNumber(nsw_tests_negative) : ((isToday) ? nsw_tests_negative_yesterday : feature.attributes.NSW_Tests_Negative),
                        vic_tests_negative: (vic_tests_negative) ? getFormattedNumber(vic_tests_negative) : ((isToday) ? vic_tests_negative_yesterday : feature.attributes.VIC_Tests_Negative),
                        qld_tests_negative: (qld_tests_negative) ? getFormattedNumber(qld_tests_negative) : ((isToday) ? qld_tests_negative_yesterday : feature.attributes.QLD_Tests_Negative),
                        sa_tests_negative: (sa_tests_negative) ? getFormattedNumber(sa_tests_negative) : ((isToday) ? sa_tests_negative_yesterday : feature.attributes.SA_Tests_Negative),
                        wa_tests_negative: (wa_tests_negative) ? getFormattedNumber(wa_tests_negative) : ((isToday) ? wa_tests_negative_yesterday : feature.attributes.WA_Tests_Negative),
                        tas_tests_negative: (tas_tests_negative) ? getFormattedNumber(tas_tests_negative) : ((isToday) ? tas_tests_negative_yesterday : feature.attributes.TAS_Tests_Negative),
                        nt_tests_negative: (nt_tests_negative) ? getFormattedNumber(nt_tests_negative) : ((isToday) ? nt_tests_negative_yesterday : feature.attributes.NT_Tests_Negative),
                        act_tests_negative: (act_tests_negative) ? getFormattedNumber(act_tests_negative) : ((isToday) ? act_tests_negative_yesterday : feature.attributes.ACT_Tests_Negative),
                        total_tests_negative: total_tests_negative
                    }
                    existingFeatures.push(featureData);
                }
            }

            //add new time series
            let uniqueDates = [...new Set(historicalUpdates.map(item => item.Date))];
            console.log(uniqueDates);

            for (const uniqueDate of uniqueDates) {
                let dateAdded = false;
                for (const feature of timeSeriesFeatures.features) {
                    if (getFormattedDate(new Date(feature.attributes.Date)) === getFormattedDate(getDayMonthYear(uniqueDate))) {
                        dateAdded = true;
                        todayTimestamp = 0;
                        break;
                    }
                }

                //skip if the record is already addded
                if (dateAdded) continue;

                let filtered = historicalUpdatesDaily.filter(x => getFormattedDate(x.DateTimeUTC) === getFormattedDate(getDayMonthYear(uniqueDate)));

                let latestTotal_NSW_Cases = null;
                let latestTotal_VIC_Cases = null;
                let latestTotal_QLD_Cases = null;
                let latestTotal_SA_Cases = null;
                let latestTotal_WA_Cases = null;
                let latestTotal_TAS_Cases = null;
                let latestTotal_NT_Cases = null;
                let latestTotal_ACT_Cases = null;
                let latestTotal_NSW_Tests = null;
                let latestTotal_VIC_Tests = null;
                let latestTotal_QLD_Tests = null;
                let latestTotal_SA_Tests = null;
                let latestTotal_WA_Tests = null;
                let latestTotal_TAS_Tests = null;
                let latestTotal_NT_Tests = null;
                let latestTotal_ACT_Tests = null;
                let latestTotal_NSW_Deaths = null;
                let latestTotal_VIC_Deaths = null;
                let latestTotal_QLD_Deaths = null;
                let latestTotal_SA_Deaths = null;
                let latestTotal_WA_Deaths = null;
                let latestTotal_TAS_Deaths = null;
                let latestTotal_NT_Deaths = null;
                let latestTotal_ACT_Deaths = null;
                let nsw_tests_negative_yesterday = null;
                let vic_tests_negative_yesterday = null;
                let qld_tests_negative_yesterday = null;
                let sa_tests_negative_yesterday = null;
                let wa_tests_negative_yesterday = null;
                let tas_tests_negative_yesterday = null;
                let nt_tests_negative_yesterday = null;
                let act_tests_negative_yesterday = null;

                let isToday = false;
                let todayDate = new Date(); 
                console.log('Comparing date :->' + getFormattedDate(getDayMonthYear(uniqueDate)) + '===' + getFormattedDate(todayDate));
                if (getFormattedDate(getDayMonthYear(uniqueDate)) === getFormattedDate(todayDate)) {
                    isToday = true;
                    console.log("[addNew] today is " + (getFormattedDate(getDayMonthYear(uniqueDate))));
                    latestTotal_NSW_Cases = latestTotals.find(latest => latest["State or territory"] === 'NSW')["Confirmed cases (cumulative)"];
                    latestTotal_NSW_Tests = latestTotals.find(latest => latest["State or territory"] === 'NSW')["Tests conducted"];
                    latestTotal_NSW_Deaths = latestTotals.find(latest => latest["State or territory"] === 'NSW')["Deaths"];

                    latestTotal_VIC_Cases = latestTotals.find(latest => latest["State or territory"] === 'VIC')["Confirmed cases (cumulative)"];
                    latestTotal_VIC_Tests = latestTotals.find(latest => latest["State or territory"] === 'VIC')["Tests conducted"];
                    latestTotal_VIC_Deaths = latestTotals.find(latest => latest["State or territory"] === 'VIC')["Deaths"];

                    latestTotal_QLD_Cases = latestTotals.find(latest => latest["State or territory"] === 'QLD')["Confirmed cases (cumulative)"];
                    latestTotal_QLD_Tests = latestTotals.find(latest => latest["State or territory"] === 'QLD')["Tests conducted"];
                    latestTotal_QLD_Deaths = latestTotals.find(latest => latest["State or territory"] === 'QLD')["Deaths"];

                    latestTotal_SA_Cases = latestTotals.find(latest => latest["State or territory"] === 'SA')["Confirmed cases (cumulative)"];
                    latestTotal_SA_Tests = latestTotals.find(latest => latest["State or territory"] === 'SA')["Tests conducted"];
                    latestTotal_SA_Deaths = latestTotals.find(latest => latest["State or territory"] === 'SA')["Deaths"];

                    latestTotal_WA_Cases = latestTotals.find(latest => latest["State or territory"] === 'WA')["Confirmed cases (cumulative)"];
                    latestTotal_WA_Tests = latestTotals.find(latest => latest["State or territory"] === 'WA')["Tests conducted"];
                    latestTotal_WA_Deaths = latestTotals.find(latest => latest["State or territory"] === 'WA')["Deaths"];

                    latestTotal_TAS_Cases = latestTotals.find(latest => latest["State or territory"] === 'TAS')["Confirmed cases (cumulative)"];
                    latestTotal_TAS_Tests = latestTotals.find(latest => latest["State or territory"] === 'TAS')["Tests conducted"];
                    latestTotal_TAS_Deaths = latestTotals.find(latest => latest["State or territory"] === 'TAS')["Deaths"];

                    latestTotal_NT_Cases = latestTotals.find(latest => latest["State or territory"] === 'NT')["Confirmed cases (cumulative)"];
                    latestTotal_NT_Tests = latestTotals.find(latest => latest["State or territory"] === 'NT')["Tests conducted"];
                    latestTotal_NT_Deaths = latestTotals.find(latest => latest["State or territory"] === 'NT')["Deaths"];

                    latestTotal_ACT_Cases = latestTotals.find(latest => latest["State or territory"] === 'ACT')["Confirmed cases (cumulative)"];
                    latestTotal_ACT_Tests = latestTotals.find(latest => latest["State or territory"] === 'ACT')["Tests conducted"];
                    latestTotal_ACT_Deaths = latestTotals.find(latest => latest["State or territory"] === 'ACT')["Deaths"];

                    let previousDate = todayDate.setDate(todayDate.getDate() - 1);
                    previousUpdates = timeSeriesFeatures.features.filter(x => getFormattedDate(new Date(new Date(x.attributes.Date))) === getFormattedDate(new Date(previousDate)));
                    if (previousUpdates) {
                        nsw_tests_negative_yesterday = (!previousUpdates[0].attributes.NSW_Tests_Negative) ? null : previousUpdates[0].attributes.NSW_Tests_Negative;
                        vic_tests_negative_yesterday =  (!previousUpdates[0].attributes.VIC_Tests_Negative) ? null :previousUpdates[0].attributes.VIC_Tests_Negative;
                        qld_tests_negative_yesterday = (!previousUpdates[0].attributes.QLD_Tests_Negative) ? null :previousUpdates[0].attributes.QLD_Tests_Negative;
                        sa_tests_negative_yesterday =  (!previousUpdates[0].attributes.SA_Tests_Negative) ? null :previousUpdates[0].attributes.SA_Tests_Negative;
                        wa_tests_negative_yesterday =  (!previousUpdates[0].attributes.WA_Tests_Negative) ? null :previousUpdates[0].attributes.WA_Tests_Negative;
                        tas_tests_negative_yesterday =  (!previousUpdates[0].attributes.TAS_Tests_Negative) ? null :previousUpdates[0].attributes.TAS_Tests_Negative;
                        nt_tests_negative_yesterday =  (!previousUpdates[0].attributes.NT_Tests_Negative) ? null :previousUpdates[0].attributes.NT_Tests_Negative;
                        act_tests_negative_yesterday =  (!previousUpdates[0].attributes.ACT_Tests_Negative) ? null :previousUpdates[0].attributes.ACT_Tests_Negative;   
                    }
                }

                if (!dateAdded && filtered && filtered.length > 0) {
                    let nswData = filtered.filter(x => x.State === 'NSW');
                    let vicData = filtered.filter(x => x.State === 'VIC');
                    let qldData = filtered.filter(x => x.State === 'QLD');
                    let saData = filtered.filter(x => x.State === 'SA');
                    let waData = filtered.filter(x => x.State === 'WA');
                    let tasData = filtered.filter(x => x.State === 'TAS');
                    let ntData = filtered.filter(x => x.State === 'NT');
                    let actData = filtered.filter(x => x.State === 'ACT');

                    //get the latest from nswData
                    let nsw_cases = (nswData) ? null : nswData[0].Cases;
                    let vic_cases = (vicData == '') ? null : vicData[0].Cases;
                    let qld_cases = (qldData == '') ? null : qldData[0].Cases;
                    let sa_cases = (saData == '') ? null : saData[0].Cases;
                    let wa_cases = (waData == '') ? null : waData[0].Cases;
                    let tas_cases = (tasData == '') ? null : tasData[0].Cases;
                    let nt_cases = (ntData == '') ? null : ntData[0].Cases;
                    let act_cases = (actData == '') ? null : actData[0].Cases;
                    let total_cases = parseInt(nsw_cases) + parseInt(vic_cases) + parseInt(qld_cases)
                        + parseInt(sa_cases) + parseInt(wa_cases) + parseInt(tas_cases) + parseInt(nt_cases) + parseInt(act_cases);

                    let nsw_deaths = (nswData == '') ? null : nswData[0].Deaths;
                    let vic_deaths = (vicData == '') ? null : vicData[0].Deaths;
                    let qld_deaths = (qldData == '') ? null : qldData[0].Deaths;
                    let sa_deaths = (saData == '') ? null : saData[0].Deaths;
                    let wa_deaths = (waData == '') ? null : waData[0].Deaths;
                    let tas_deaths = (tasData == '') ? null : tasData[0].Deaths;
                    let nt_deaths = (ntData == '') ? null : ntData[0].Deaths;
                    let act_deaths = (actData == '') ? null : actData[0].Deaths;
                    let total_deaths = parseInt(nsw_deaths) + parseInt(vic_deaths) + parseInt(qld_deaths)
                        + parseInt(sa_deaths) + parseInt(wa_deaths) + parseInt(tas_deaths) + parseInt(nt_deaths) + parseInt(act_deaths);

                    let nsw_tests = (nswData == '') ? null : nswData[0].Tests;
                    let vic_tests = (vicData == '') ? null : vicData[0].Tests;
                    let qld_tests = (qldData == '') ? null : qldData[0].Tests;
                    let sa_tests = (saData == '') ? null : saData[0].Tests;
                    let wa_tests = (waData == '') ? null : waData[0].Tests;
                    let tas_tests = (tasData == '') ? null : tasData[0].Tests;
                    let nt_tests = (ntData == '') ? null : ntData[0].Tests;
                    let act_tests = (actData == '') ? null : actData[0].Tests;
                    let total_tests = parseInt(nsw_tests) + parseInt(vic_tests) + parseInt(qld_tests)
                        + parseInt(sa_tests) + parseInt(wa_tests) + parseInt(tas_tests) + parseInt(nt_tests) + parseInt(act_tests);

                    let nsw_tests_negative = (nswData == '') ? null : nswData[0].TestsNegative;
                    let vic_tests_negative = (vicData == '') ? null : vicData[0].TestsNegative;
                    let qld_tests_negative = (qldData == '') ? null : qldData[0].TestsNegative;
                    let sa_tests_negative = (saData == '') ? null : saData[0].TestsNegative;
                    let wa_tests_negative = (waData == '') ? null : waData[0].TestsNegative;
                    let tas_tests_negative = (tasData == '') ? null : tasData[0].TestsNegative;
                    let nt_tests_negative = (ntData == '') ? null : ntData[0].TestsNegative;
                    let act_tests_negative = (actData == '') ? null : actData[0].TestsNegative;
                    let total_tests_negative = parseInt(nsw_tests_negative) + parseInt(vic_tests_negative) + parseInt(qld_tests_negative)
                        + parseInt(sa_tests_negative) + parseInt(wa_tests_negative) + parseInt(tas_tests_negative) + parseInt(nt_tests_negative) + parseInt(act_tests_negative);

                    let featureData = {
                        objectId: 0,
                        date: getDayMonthYear(uniqueDate),
                        nsw_cases: (nsw_cases) ? getFormattedNumber(nsw_cases) : getFormattedNumber(latestTotal_NSW_Cases),
                        vic_cases: (vic_cases) ? getFormattedNumber(vic_cases) : getFormattedNumber(latestTotal_VIC_Cases),
                        qld_cases: (qld_cases) ? getFormattedNumber(qld_cases) : getFormattedNumber(latestTotal_QLD_Cases),
                        sa_cases: (sa_cases) ? getFormattedNumber(sa_cases) : getFormattedNumber(latestTotal_SA_Cases),
                        wa_cases: (wa_cases) ? getFormattedNumber(sa_cases) : getFormattedNumber(latestTotal_WA_Cases),
                        tas_cases: (tas_cases) ? getFormattedNumber(tas_cases) : getFormattedNumber(latestTotal_TAS_Cases),
                        nt_cases: (nt_cases) ? getFormattedNumber(nt_cases) : getFormattedNumber(latestTotal_NT_Cases),
                        act_cases: (act_cases) ? getFormattedNumber(act_cases) : getFormattedNumber(latestTotal_ACT_Cases),
                        total_cases: total_cases,
                        nsw_deaths: (nsw_deaths) ? getFormattedNumber(nsw_deaths) : getFormattedNumber(latestTotal_NSW_Deaths),
                        vic_deaths: (vic_deaths) ? getFormattedNumber(vic_deaths) : getFormattedNumber(latestTotal_VIC_Deaths),
                        qld_deaths: (qld_deaths) ? getFormattedNumber(qld_deaths) : getFormattedNumber(latestTotal_QLD_Deaths),
                        sa_deaths: (sa_deaths) ? getFormattedNumber(sa_deaths) : getFormattedNumber(latestTotal_SA_Deaths),
                        wa_deaths: (wa_deaths) ? getFormattedNumber(wa_deaths) : getFormattedNumber(latestTotal_WA_Deaths),
                        tas_deaths: (tas_deaths) ? getFormattedNumber(tas_deaths) : getFormattedNumber(latestTotal_TAS_Deaths),
                        nt_deaths: (nt_deaths) ? getFormattedNumber(nt_deaths) : getFormattedNumber(latestTotal_NT_Deaths),
                        act_deaths: (act_deaths) ? getFormattedNumber(act_deaths) : getFormattedNumber(latestTotal_ACT_Deaths),
                        total_deaths: total_deaths,
                        nsw_tests: (nsw_tests) ? getFormattedNumber(nsw_tests) : getFormattedNumber(latestTotal_NSW_Tests),
                        vic_tests: (vic_tests) ? getFormattedNumber(vic_tests) : getFormattedNumber(latestTotal_VIC_Tests),
                        qld_tests: (qld_tests) ? getFormattedNumber(qld_tests) : getFormattedNumber(latestTotal_QLD_Tests),
                        sa_tests: (sa_tests) ? getFormattedNumber(sa_tests) : getFormattedNumber(latestTotal_SA_Tests),
                        wa_tests: (wa_tests) ? getFormattedNumber(wa_tests) : getFormattedNumber(latestTotal_WA_Tests),
                        tas_tests: (wa_tests) ? getFormattedNumber(tas_tests) : getFormattedNumber(latestTotal_TAS_Tests),
                        nt_tests: (nt_tests) ? getFormattedNumber(nt_tests) : getFormattedNumber(latestTotal_NT_Tests),
                        act_tests: (nt_tests) ? getFormattedNumber(act_tests) : getFormattedNumber(latestTotal_ACT_Tests),
                        total_tests: total_tests,
                        nsw_tests_negative: (nsw_tests_negative) ? getFormattedNumber(nsw_tests_negative) : nsw_tests_negative_yesterday,
                        vic_tests_negative: (vic_tests_negative) ? getFormattedNumber(vic_tests_negative) : vic_tests_negative_yesterday,
                        qld_tests_negative: (qld_tests_negative) ? getFormattedNumber(qld_tests_negative) : qld_tests_negative_yesterday,
                        sa_tests_negative: (sa_tests_negative) ? getFormattedNumber(sa_tests_negative) : sa_tests_negative_yesterday,
                        wa_tests_negative: (wa_tests_negative) ? getFormattedNumber(wa_tests_negative) : wa_tests_negative_yesterday,
                        tas_tests_negative: (tas_tests_negative) ? getFormattedNumber(tas_tests_negative) : tas_tests_negative_yesterday,
                        nt_tests_negative: (nt_tests_negative) ? getFormattedNumber(nt_tests_negative) : nt_tests_negative_yesterday,
                        act_tests_negative: (act_tests_negative) ? getFormattedNumber(act_tests_negative) : act_tests_negative_yesterday,
                        total_tests_negative: total_tests_negative
                    }
                    newTimeSeries.push(featureData);
                }
            }

            const updateTimeSeriesResult = await updateTimeSeriesFeature(existingFeatures, token);
            console.log(`${existingFeatures.length} ${updateTimeSeriesResult}`);

            if (newTimeSeries.length > 0) {
                const addResult = await addTimeSeriesFeature(newTimeSeries, token);
                console.log(`${newTimeSeries.length} ${addResult}`);
            }

            //calculate total
            const timeSeriesFeaturesForTotal = await getTimeSeriesFeatures(token);
            let timeSeriesTotals = [];
            for (const feature of timeSeriesFeaturesForTotal.features) {
                let objectId = feature.attributes.ObjectId; 
                let nsw_cases = (feature.attributes.NSW) ? feature.attributes.NSW : 0;
                let vic_cases = (feature.attributes.VIC) ? feature.attributes.VIC : 0;
                let qld_cases = (feature.attributes.QLD) ? feature.attributes.QLD : 0;
                let sa_cases = (feature.attributes.SA) ? feature.attributes.SA : 0;
                let wa_cases = (feature.attributes.WA) ? feature.attributes.WA : 0;
                let tas_cases = (feature.attributes.TAS) ? feature.attributes.TAS : 0;
                let nt_cases = (feature.attributes.NT) ? feature.attributes.NT : 0;
                let act_cases = (feature.attributes.ACT) ? feature.attributes.ACT : 0;
                let total_cases = parseInt(nsw_cases) + parseInt(vic_cases) + parseInt(qld_cases) + parseInt(sa_cases) + parseInt(wa_cases) + parseInt(tas_cases) + parseInt(nt_cases) + parseInt(act_cases);

                let nsw_deaths = (feature.attributes.NSW_Deaths) ? feature.attributes.NSW_Deaths : 0;
                let vic_deaths = (feature.attributes.VIC_Deaths) ? feature.attributes.VIC_Deaths : 0;
                let qld_deaths = (feature.attributes.QLD_Deaths) ? feature.attributes.QLD_Deaths : 0;
                let sa_deaths = (feature.attributes.SA_Deaths) ? feature.attributes.SA_Deaths : 0;
                let wa_deaths = (feature.attributes.WA_Deaths) ? feature.attributes.WA_Deaths : 0;
                let tas_deaths = (feature.attributes.TAS_Deaths) ? feature.attributes.TAS_Deaths : 0;
                let nt_deaths = (feature.attributes.NT_Deaths) ? feature.attributes.NT_Deaths : 0;
                let act_deaths = (feature.attributes.ACT_Deaths) ? feature.attributes.ACT_Deaths : 0;
                let total_deaths = parseInt(nsw_deaths) + parseInt(vic_deaths) + parseInt(qld_deaths) +
                    parseInt(sa_deaths) + parseInt(wa_deaths) + parseInt(tas_deaths) + parseInt(nt_deaths) + parseInt(act_deaths);

                let nsw_tests = (feature.attributes.NSW_Tests) ? feature.attributes.NSW_Tests : 0;
                let vic_tests = (feature.attributes.VIC_Tests) ? feature.attributes.VIC_Tests : 0;
                let qld_tests = (feature.attributes.QLD_Tests) ? feature.attributes.QLD_Tests : 0;
                let sa_tests = (feature.attributes.SA_Tests) ? feature.attributes.SA_Tests : 0;
                let wa_tests = (feature.attributes.WA_Tests) ? feature.attributes.WA_Tests : 0;
                let tas_tests = (feature.attributes.TAS_Tests) ? feature.attributes.TAS_Tests : 0;
                let nt_tests = (feature.attributes.NT_Tests) ? feature.attributes.NT_Tests : 0;
                let act_tests = (feature.attributes.ACT_Tests) ? feature.attributes.ACT_Tests : 0;
                let total_tests = parseInt(nsw_tests) +
                    parseInt(vic_tests) +
                    parseInt(qld_tests) +
                    parseInt(sa_tests) +
                    parseInt(wa_tests) +
                    parseInt(tas_tests) +
                    parseInt(nt_tests) +
                    parseInt(act_tests);

                let nsw_tests_negative = (feature.attributes.NSW_Tests_Negative) ? feature.attributes.NSW_Tests_Negative : 0;
                let vic_tests_negative = (feature.attributes.VIC_Tests_Negative) ? feature.attributes.VIC_Tests_Negative : 0;
                let qld_tests_negative = (feature.attributes.QLD_Tests_Negative) ? feature.attributes.QLD_Tests_Negative : 0;
                let sa_tests_negative = (feature.attributes.SA_Tests_Negative) ? feature.attributes.SA_Tests_Negative : 0;
                let wa_tests_negative = (feature.attributes.WA_Tests_Negative) ? feature.attributes.WA_Tests_Negative : 0;
                let tas_tests_negative = (feature.attributes.TAS_Tests_Negative) ? feature.attributes.TAS_Tests_Negative : 0;
                let nt_tests_negative = (feature.attributes.NT_Tests_Negative) ? feature.attributes.NT_Tests_Negative : 0;
                let act_tests_negative = (feature.attributes.ACT_Tests_Negative) ? feature.attributes.ACT_Tests_Negative : 0;
                let total_tests_negative = parseInt(nsw_tests_negative) + parseInt(vic_tests_negative) + parseInt(qld_tests_negative) + parseInt(sa_tests_negative) + parseInt(wa_tests_negative)
                    + parseInt(tas_tests_negative) + parseInt(nt_tests_negative) + parseInt(act_tests_negative);

                let featureData = {
                    objectId: objectId,
                    total_cases: total_cases,
                    total_deaths: total_deaths,
                    total_tests: total_tests,
                    total_tests_negative: total_tests_negative
                }

                timeSeriesTotals.push(featureData);
            }

            const updateTotal = await updateTimeSeriesTotalFeature(timeSeriesTotals, token);
            console.log(`totals updated: ${timeSeriesTotals.length} ${updateTotal}`);

            //update states 
            for (const feature of statesFeatures.features) {

                let stateTotal = latestTotals.find(latest => latest["State or territory"] === feature.attributes.ISO_SUB);

                if (feature.attributes.NAME === 'Other Territories') {
                    stateTotal = latestTotals.find(latest => latest["State or territory"] === feature.attributes.ISO_SUB);
                }
                if (stateTotal != null) {

                    let deaths = (stateTotal == '' || stateTotal["Deaths"] == '') ? 0 : stateTotal["Deaths"];
                    let confirmedCases = (stateTotal == '' || stateTotal["Confirmed cases (cumulative)"] == '') ? null : stateTotal["Confirmed cases (cumulative)"];
                    let testsConducted = (stateTotal == '' || stateTotal["Tests conducted"] == '') ? null : stateTotal["Tests conducted"];

                    const featureData = {
                        objectId: feature.attributes.OBJECTID,
                        stateName: feature.attributes.NAME,
                        deaths: getFormattedNumber(deaths),
                        confirmedCases: getFormattedNumber(confirmedCases),
                        testsConducted: getFormattedNumber(testsConducted),
                        lastUpdated: stateTotal["Last updated"],
                        source: stateTotal["Source"]
                    };
                    updatedFeatures.push(featureData);
                }

            }

            const updateLatestResult = await updateStatesFeature(updatedFeatures, token);
            console.log(`features updated: ${updatedFeatures.length} ${updateLatestResult}`);

            res.status(200).send('Synchronization completed.');

            return;

        } catch (error) {
            console.log(error);
        }
    });
};

module.exports = appRouter;

