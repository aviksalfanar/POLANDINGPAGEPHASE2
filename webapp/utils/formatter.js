sap.ui.define([
], function () {
    'use strict';
    return {
        getDateFormatted: function (sDate) {
            let sCalculatedDate;
            if(sDate && typeof sDate === 'string' && sDate.includes("-")){
                const sSplittedDate = sDate.split("-");
                sDate = `${sSplittedDate[1]}.${sSplittedDate[0]}.${sSplittedDate[2]}`;
            }
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
            const sRetrDate = oDate.getDate().toString().length === 1 ? `0${oDate.getDate()}` : oDate.getDate();
            const sYear = oDate.getFullYear(); // oDate.getFullYear().toString().substring(2)
            sCalculatedDate = `${sRetrDate}.${sMonth}.${sYear}`

            return sCalculatedDate;

        },

        getMonthYearFormatter: function (sDate) {
            if (sDate && sDate.length === 6) {
                return `${sDate.substring(4)}.${sDate.substring(0, 4)}`;
            }else if(sDate && sDate.length === 5){
                return `0${sDate.substring(4)}.${sDate.substring(0, 4)}`;
            }else{
                return sDate;
            }
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