sap.ui.define([
], function () {
    'use strict';
    return {
        getDateFormatted: function (sDate) {
            let sCalculatedDate;
            const oDate = new Date(sDate);
            const oDates = {
                0: "01",
                1: "02",
                2: "03",
                3: "04",
                4: "05",
                5: "06",
                6: "07",
                7: "08",
                8: "09",
                9: "10",
                10: "11",
                11: "12"
            }
            const sMonth = oDates[oDate.getMonth()];
            const sRetrDate = oDate.getUTCDate().toLocaleString().length === 1 ? `0${oDate.getUTCDate()}` : oDate.getUTCDate();
            const sYear = oDate.getFullYear().toString().substring(2);
            sCalculatedDate = `${sRetrDate}.${sMonth}.${sYear}`

            return sCalculatedDate;

        },

        getMicroChartValueColor: function (sPercentage) {
            const fPercentage = parseFloat(sPercentage);
            let sValueColor;
            if (fPercentage > 99) {
                sValueColor = "Good";
            } else {
                sValueColor = "Error"
            }

            return sValueColor;
        },
        getPercentageForMicroChart: function (sPercentage) {
            const fPercentage = parseFloat(sPercentage);
            return fPercentage;
        },
        getGradeFormatted: (sGrade) => {
            let sFormattedGrade;
            if (sGrade) {
                sFormattedGrade = sGrade
            } else {
                sFormattedGrade = "NA"
            }
            return sFormattedGrade;
        }
    }
});