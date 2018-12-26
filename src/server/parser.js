const csv = require('./csv')
const FlySession = require('./model/flysession')
const moment = require('moment')

// flight timer stops when you disarm, and continues when you arm and apply at least 5% throttle
const ARMED_SWITCH = 'SB'
const ARMED_VALUE = '1'

const THR_TRESHOLD = 0.05
const THR_MIN = -1024
const THR_MAX = 1024

const timestamp = (row) => moment(`${row['Date']} ${row['Time']}`)

const armed = (row) => row[ARMED_SWITCH] === ARMED_VALUE

const flying = (row) => parseInt(row['Thr']) >= (THR_MIN+(THR_MAX-THR_MIN)*THR_TRESHOLD)

const formatDuration = (duration) => moment(duration).format("mm[m] ss[s]")

const logDuration = (startDate, endDate) => {
    const duration = endDate.diff(startDate)

    console.log(`Log start ${startDate}`)
    console.log(`Log end ${endDate}`)

    console.log(`Log log duration ${formatDuration(duration)}`)
}

csv('/Users/jkar/Documents/Model airplanes/Taranis/LOGS/Reverb-2018-11-01-flight 1.csv').then((results) => {
    const first = results[0]
    const last = results[results.length - 1]

    console.log(first)
    console.log(last)

    logDuration(timestamp(first), timestamp(last))

    const summary = results.reduce((state, row) => {
        const now = timestamp(row)

        if (armed(row)) {
            if(!state.session) {
                state.session = new FlySession(state.sessions.length, now)
            }
            
            state.session.startTimer(now, flying(row))
        } else {
            if(state.session) {
                state.session.stopTimer(now)
            }
        }

        if (now.diff(state.last) > 30000) {
            // no data past 30 seconds, split session

            if (state.session) {
                console.log('Paused but still fly session open')
                state.sessions.push(state.session.endSession())
                state.session = undefined
            }
        }

        state.last = now
        return state
    }, {session: undefined, sessions: []})

    if (summary.session) {
        console.log('Finished but still fly session open')
        summary.sessions.push(summary.session.endSession())
    }

    console.log(String(summary.sessions))
    delete summary.sessions
    console.log(summary)
})

// var waitTill = new Date(new Date().getTime() + 100);
// while(waitTill > new Date()){}