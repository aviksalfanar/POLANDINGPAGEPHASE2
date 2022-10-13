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

        }
    }
});