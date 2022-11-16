sap.ui.define([
], function () {
    'use strict';
    return {
        getDateFormatted: function (sDate) {
            let sCalculatedDate;
            const oDate = new Date(sDate);
            const oDates = {
                0: "Jan",
                1: "Feb",
                2: "Mar",
                3: "Apr",
                4: "May",
                5: "Jun",
                6: "Jul",
                7: "Aug",
                8: "Sep",
                9: "Oct",
                10: "Nov",
                11: "Dec"
            }
            const sMonth = oDates[oDate.getMonth()];
            const sRetrDate = oDate.getUTCDate().toLocaleString().length === 1 ? `0${oDate.getUTCDate()}` : oDate.getUTCDate();
            const sYear = oDate.getFullYear();
            sCalculatedDate = `${sMonth} ${sRetrDate}, ${sYear}`

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