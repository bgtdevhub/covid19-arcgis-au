const request = require('request');

// please specify your own credential
const client_id = '';
const client_secret = '';

const statesFeatureApi = '';
const timeSeriesFeatureApi = '';

// Fix Url
const covid19SoureUrl = `https://interactive.guim.co.uk/docsdata/1q5gdePANXci8enuiS4oHUJxcxC13d6bjMRSicakychE.json`;
const oauth2Url = 'https://www.arcgis.com/sharing/rest/oauth2/token/';
const statesFeatureApiApplyEdit = `${statesFeatureApi}/applyEdits`;
const timeSeriesFeatureApiApplyEdit = `${timeSeriesFeatureApi}/applyEdits`;

const requestToken = () =>
    // generate a token with client id and client secret
    new Promise((resolve, reject) => {
        request.post(
            {
                url: oauth2Url,
                json: true,
                form: {
                    f: 'json',
                    client_id,
                    client_secret,
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
                url: covid19SoureUrl,
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
                url: `${statesFeatureApi}/query?token=${token}&where=1%3D1&f=json&outFields=OBJECTID,ISO_SUB,NAME&returnGeometry=false`,
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
                url: `${timeSeriesFeatureApi}/query?token=${token}&where=1%3D1&f=json&outFields=*`,
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

function getDayMonthYear(monthDayYear) {
    let dateString = monthDayYear.split('/');
    var day = dateString[0];
    var month = dateString[1];
    var year = dateString[2];

    return new Date(year, month - 1, day);
}

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
                console.log(newRecord.State + '->new.DateTime->' + newRecord.DateTimeUTC + '(taken)');
                console.log(similarDateRecord.State + '->old.DateTime->' + similarDateRecord.DateTimeUTC);
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

const appRouter1 = app => {
    app.get('/', async (req, res) => {
        const historicalUpdatesByDatetime = await getHistoricalUpdatesByDatetime();
        const historicalUpdates = historicalUpdatesByDatetime.sheets["updates"];
        const historicalUpdatesDaily = dailyHistoricalUpdates(historicalUpdates);
        console.log(JSON.stringify(historicalUpdatesDaily));
    });
};

const appRouter = app => {
    app.get('/', async (req, res) => {
        console.log("Synchronization started.")
        try {
            let updatedFeatures = [];

            //1. Request tokens from ArcGIS online
            const token = await requestToken();
            console.log(`token: ${token}`);

            const historicalUpdatesByDatetime = await getHistoricalUpdatesByDatetime();
            const statesFeatures = await getStatesFeatures(token);
            const timeSeriesFeatures = await getTimeSeriesFeatures(token)
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
                        nsw_cases: (nsw_cases != null) ? parseInt(nsw_cases) : feature.attributes.NSW,
                        vic_cases: (vic_cases != null) ? parseInt(vic_cases) : feature.attributes.VIC,
                        qld_cases: (qld_cases != null) ? parseInt(qld_cases) : feature.attributes.QLD,
                        sa_cases: (sa_cases != null) ? parseInt(sa_cases) : feature.attributes.SA,
                        wa_cases: (wa_cases != null) ? parseInt(wa_cases) : feature.attributes.WA,
                        tas_cases: (tas_cases != null) ? parseInt(tas_cases) : feature.attributes.TAS,
                        nt_cases: (nt_cases != null) ? parseInt(nt_cases) : feature.attributes.NT,
                        act_cases: (act_cases != null) ? parseInt(act_cases) : feature.attributes.ACT,
                        total_cases: parseInt(total_cases),
                        nsw_deaths: (nsw_deaths != null) ? parseInt(nsw_deaths) : feature.attributes.NSW_Deaths,
                        vic_deaths: (vic_deaths != null) ? parseInt(vic_deaths) : feature.attributes.VIC_Deaths,
                        qld_deaths: (qld_deaths != null) ? parseInt(qld_deaths) : feature.attributes.QLD_Deaths,
                        sa_deaths: (sa_deaths != null) ? parseInt(sa_deaths) : feature.attributes.SA_Deaths,
                        wa_deaths: (wa_deaths != null) ? parseInt(wa_deaths) : feature.attributes.WA_Deaths,
                        tas_deaths: (tas_deaths != null) ? parseInt(tas_deaths) : feature.attributes.TAS_Deaths,
                        nt_deaths: (nt_deaths != null) ? parseInt(nt_deaths) : feature.attributes.NT_Deaths,
                        act_deaths: (act_deaths != null) ? parseInt(act_deaths) : feature.attributes.ACT_Deaths,
                        total_deaths: parseInt(total_deaths),
                        nsw_tests: (nsw_tests != null) ? parseInt(nsw_tests) : feature.attributes.NSW_Tests,
                        vic_tests: (vic_tests != null) ? parseInt(vic_tests) : feature.attributes.VIC_Tests,
                        qld_tests: (qld_tests != null) ? parseInt(qld_tests) : feature.attributes.QLD_Tests,
                        sa_tests: (sa_tests != null) ? parseInt(sa_tests) : feature.attributes.QLD_Tests,
                        wa_tests: (wa_tests != null) ? parseInt(wa_tests) : feature.attributes.WA_Tests,
                        tas_tests: (tas_tests != null) ? parseInt(tas_tests) : feature.attributes.TAS_Tests,
                        nt_tests: (nt_tests != null) ? parseInt(nt_tests) : feature.attributes.NT_Tests,
                        act_tests: (act_tests != null) ? parseInt(act_tests) : feature.attributes.ACT_Tests,
                        total_tests: parseInt(total_tests),
                        nsw_tests_negative: (nsw_tests_negative != null) ? parseInt(nsw_tests_negative) : feature.attributes.NSW_Tests_Negative,
                        vic_tests_negative: (vic_tests_negative != null) ? parseInt(vic_tests_negative) : feature.attributes.VIC_Tests_Negative,
                        qld_tests_negative: (qld_tests_negative != null) ? parseInt(qld_tests_negative) : feature.attributes.QLD_Tests_Negative,
                        sa_tests_negative: (sa_tests_negative != null) ? parseInt(sa_tests_negative) : feature.attributes.SA_Tests_Negative,
                        wa_tests_negative: (wa_tests_negative != null) ? parseInt(wa_tests_negative) : feature.attributes.WA_Tests_Negative,
                        tas_tests_negative: (tas_tests_negative != null) ? parseInt(tas_tests_negative) : feature.attributes.TAS_Tests_Negative,
                        nt_tests_negative: (nt_tests_negative != null) ? parseInt(nt_tests_negative) : feature.attributes.NT_Tests_Negative,
                        act_tests_negative: (act_tests_negative != null) ? parseInt(act_tests_negative) : feature.attributes.ACT_Tests_Negative,
                        total_tests_negative: parseInt(total_tests_negative)
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
                        break;
                    }
                }

                let filtered = historicalUpdatesDaily.filter(x => getFormattedDate(x.Date) === getFormattedDate(getDayMonthYear(uniqueDate)));
                if (!dateAdded && filtered && filtered.length > 0){
                    console.log('added');
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
                        objectId: 0,
                        date: getDayMonthYear(uniqueDate),
                        nsw_cases: parseInt(nsw_cases),
                        vic_cases: parseInt(vic_cases),
                        qld_cases: parseInt(qld_cases),
                        sa_cases: parseInt(sa_cases),
                        wa_cases: parseInt(wa_cases),
                        tas_cases: parseInt(tas_cases),
                        nt_cases: parseInt(nt_cases),
                        act_cases: parseInt(act_cases),
                        total_cases: parseInt(total_cases),
                        nsw_deaths: parseInt(nsw_deaths),
                        vic_deaths: parseInt(vic_deaths),
                        qld_deaths: parseInt(qld_deaths),
                        sa_deaths: parseInt(sa_deaths),
                        wa_deaths: parseInt(wa_deaths),
                        tas_deaths: parseInt(tas_deaths),
                        nt_deaths: parseInt(nt_deaths),
                        act_deaths: parseInt(act_deaths),
                        total_deaths: parseInt(total_deaths),
                        nsw_tests: parseInt(parseInt(nsw_tests)),
                        vic_tests: parseInt(vic_tests),
                        qld_tests: parseInt(qld_tests),
                        sa_tests: parseInt(sa_tests),
                        wa_tests: parseInt(wa_tests),
                        tas_tests: parseInt(tas_tests),
                        nt_tests: parseInt(nt_tests),
                        act_tests: parseInt(act_tests),
                        total_tests: parseInt(total_tests),
                        nsw_tests_negative: parseInt(nsw_tests_negative),
                        vic_tests_negative: parseInt(vic_tests_negative),
                        qld_tests_negative: parseInt(qld_tests_negative),
                        sa_tests_negative: parseInt(sa_tests_negative),
                        wa_tests_negative: parseInt(wa_tests_negative),
                        tas_tests_negative: parseInt(tas_tests_negative),
                        nt_tests_negative: parseInt(nt_tests_negative),
                        act_tests_negative: parseInt(act_tests_negative),
                        total_tests_negative: parseInt(total_tests_negative)
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
                let total_cases = nsw_cases + vic_cases + qld_cases + sa_cases + wa_cases + tas_cases + nt_cases + act_cases;

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

                if (objectId == 85) {
                    console.log(`${nsw_deaths} + ${vic_deaths} + ${qld_deaths} + ${sa_deaths} + ${wa_deaths} + ${tas_deaths} + ${nt_deaths} + ${act_deaths} = ${total_deaths}`);
                    console.log('totalizing total deaths:' + total_deaths);
                }

                let nsw_tests = (feature.attributes.NSW_Tests) ? feature.attributes.NSW_Tests : 0;
                let vic_tests = (feature.attributes.VIC_Tests) ? feature.attributes.VIC_Tests : 0;
                let qld_tests = (feature.attributes.QLD_Tests) ? feature.attributes.QLD_Tests : 0;
                let sa_tests = (feature.attributes.SA_Tests) ? feature.attributes.SA_Tests : 0;
                let wa_tests = (feature.attributes.WA_Tests) ? feature.attributes.WA_Tests : 0;
                let tas_tests = (feature.attributes.TAS_Tests) ? feature.attributes.TAS_Tests : 0;
                let nt_tests = (feature.attributes.NT_Tests) ? feature.attributes.NT_Tests : 0;
                let act_tests = (feature.attributes.ACT_Tests) ? feature.attributes.ACT_Tests : 0;
                let total_tests = nsw_tests + vic_tests + qld_tests + sa_tests + wa_tests + tas_tests + nt_tests + act_tests;

                let nsw_tests_negative = (feature.attributes.NSW_Tests_Negative) ? feature.attributes.NSW_Tests_Negative : 0;
                let vic_tests_negative = (feature.attributes.VIC_Tests_Negative) ? feature.attributes.VIC_Tests_Negative : 0;
                let qld_tests_negative = (feature.attributes.QLD_Tests_Negative) ? feature.attributes.QLD_Tests_Negative : 0;
                let sa_tests_negative = (feature.attributes.SA_Tests_Negative) ? feature.attributes.SA_Tests_Negative : 0;
                let wa_tests_negative = (feature.attributes.WA_Tests_Negative) ? feature.attributes.WA_Tests_Negative : 0;
                let tas_tests_negative = (feature.attributes.TAS_Tests_Negative) ? feature.attributes.TAS_Tests_Negative : 0;
                let nt_tests_negative = (feature.attributes.NT_Tests_Negative) ? feature.attributes.NT_Tests_Negative : 0;
                let act_tests_negative = (feature.attributes.ACT_Tests_Negative) ? feature.attributes.ACT_Tests_Negative : 0;
                let total_tests_negative = nsw_tests_negative + vic_tests_negative + qld_tests_negative + sa_tests_negative + wa_tests_negative
                    + tas_tests_negative + nt_tests_negative + act_tests_negative;

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

                    let deaths = (stateTotal == '' || stateTotal["Deaths"] == '') ? null : stateTotal["Deaths"];
                    let confirmedCases = (stateTotal == '' || stateTotal["Confirmed cases (cumulative)"] == '') ? null : stateTotal["Confirmed cases (cumulative)"];
                    let testsConducted = (stateTotal == '' || stateTotal["Tests conducted"] == '') ? null : stateTotal["Tests conducted"];

                    const featureData = {
                        objectId: feature.attributes.OBJECTID,
                        stateName: feature.attributes.NAME,
                        deaths: deaths,
                        confirmedCases: confirmedCases,
                        testsConducted: testsConducted,
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

