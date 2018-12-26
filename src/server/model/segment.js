const moment = require('moment')

class Segment {

    constructor(start) {
        this.start = start
        this.end = undefined
    }

    update(now) {
        this.end = now
    }

    duration() {
        return this.end ? this.end.diff(this.start) : 0
    }

    toString() {
        return `Segment duration ${this.formatDuration(this.duration())}`
    }

    formatDuration(duration) {
        return moment(duration).format("mm[m] ss[s] SS[ms]")
    }
}

module.exports = Segment