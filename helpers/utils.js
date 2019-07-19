"use strict";

const START_HOUR = 8;
const START_MINUTE = 40;

const PERIOD_PER_DURATION_M = 20;
const PERIOD_PER_DURATION_S = PERIOD_PER_DURATION_M * 60;
const PERIOD_PER_DURATION_MS = PERIOD_PER_DURATION_S * 1000;

function splitPeriodId(periodId) {
    periodId = periodId ? periodId.trim() : "";
    const result = /^(\d{4})(\d{2})(\d{2})(\d{3})$/g.exec(periodId);
    if (result == null) {
        return null;
    }
    const [_, year, month, day, times] = result;
    return { year, month, day, times };
}

function getStartSlot(periodId) {
    const splitResult = splitPeriodId(periodId);
    if (splitResult == null) return null;

    let year = Number(splitResult.year);
    let month = Number(splitResult.month);
    let date = Number(splitResult.day);
    let times = Number(splitResult.times);
    if (!Number.isSafeInteger(year) ||
        !Number.isSafeInteger(month) ||
        !Number.isSafeInteger(date) ||
        !Number.isSafeInteger(times)) {
        return null;
    }

    const startTime = new Date(year, month - 1, date, START_HOUR, START_MINUTE);
    const resultTime = startTime.getTime() + times * PERIOD_PER_DURATION_MS;
    return resultTime;
}

function parseOffsetAndLimit(offset, limit, defaultOffset, defaultLimit) {
    let nOffset = defaultOffset;
    if (offset && Number.isSafeInteger(Number(offset))) {
        nOffset = Number(offset);
    }
    let nLimit = defaultLimit;
    if (limit && Number.isSafeInteger(Number(limit))) {
        nLimit = Number(limit);
    }

    return [nOffset, nLimit];
}

module.exports = {
    splitPeriodId,
    getStartSlot,
    parseOffsetAndLimit
};