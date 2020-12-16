function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

const msInHour = 1000 * 60 * 60;

class Measurement {
    constructor(date, pressure, pulse) {
        this.date = date;
        this.pressure = pressure;
        this.pulse = pulse;
    }

    static randomPulse() {
        return randomInteger(50, 130);
    }

    static randomPressure() {
        return randomInteger(80, 140);
    }

    static randomMeasurement(date) {
        return new Measurement(date, this.randomPulse(), this.randomPressure());
    }
}

class MeasurementStore {
    constructor() {
        this.measurements = [];
    }

    generateMeausrments(numOfMessurments = 1000) {
        let prevDate = new Date();
        for (var i = 0; i < numOfMessurments; i++) {
            this.measurements.unshift(Measurement.randomMeasurement(prevDate));
            let hoursToAdd = randomInteger(8, 2 * 24);
            prevDate = new Date(prevDate.getTime() - msInHour * hoursToAdd);
        }
    }

    lastYearMeasurments() {
        let now = new Date();
        return this.measurements.filter(
            (item) => now.getTime() - item.date.getTime() < msInHour * 24 * 365
        );
    }
}

class MeasurementController {
    constructor() {
        this.store = new MeasurementStore();
        this.store.generateMeausrments();

    }

    pulseChartData() {
        return this.store
            .lastYearMeasurments()
            .map((item) => [item.date.getTime(), item.pulse]);
    }

    pressureChartData() {
        return this.store
            .lastYearMeasurments()
            .map((item) => [item.date.getTime(), item.pressure]);
    }

    updateViews() {

        this.pressureChart.setItems(this.pressureChartData());
        this.pulseChart.setItems(this.pulseChartData());
    }
}

let controller = new MeasurementController();

export const data = controller.pulseChartData();