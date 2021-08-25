function convertToMinutes(millis) {
    var minutes = Math.floor(millis / 60000);
    return minutes;
}

module.exports = convertToMinutes;