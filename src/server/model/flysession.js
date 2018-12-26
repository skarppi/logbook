const moment = require('moment')
const Segment = require('./segment')

class FlySession {
    
    constructor(name, logStart) {
        this.name = name
        this.logStart = logStart
        this.flightTime = 0
        this.airTime = 0
        this.segment = undefined
    }

    startTimer(now, flying) {
        if (this.segment) {
            this.segment.update(now)
        } else if(flying) {
            this.segment = new Segment(now)
        }
    }

    stopTimer(now) {
        if (this.segment) {
            this.segment.update(now)

            this.flightTime += this.segment.duration()

            console.log(`${this.segment}`)

            this.logEnd = this.segment.end
            this.segment = undefined
        }
    }

    endSession() {
        this.stopTimer()

        console.log(this.toString())

        return this
    }

    toString() {
        const duration = this.logEnd.diff(this.logStart)
        
        return `fly session ${this.name} [
        log start ${this.logStart}
        log end ${this.logEnd}
        log duration ${this.formatDuration(duration)}
        flight duration ${this.formatDuration(this.flightTime)}
]`
    }

    formatDuration(duration) {
        return moment(duration).format("mm[m] ss[s] SS[ms]")
    }


}

module.exports = FlySession