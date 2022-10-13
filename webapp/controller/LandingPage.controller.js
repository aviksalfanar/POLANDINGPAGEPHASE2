sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/alfanar/polandingpage/polandingpage/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, formatter, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("com.alfanar.polandingpage.polandingpage.controller.LandingPage", {
            formatter: formatter,
            onInit: function () {
                const oComponent = this.getOwnerComponent();
                const oRouter = oComponent.getRouter();
                oRouter.attachRoutePatternMatched(this.onPoNumberMatched, this);
                this.getView().setModel(new JSONModel({}), "appModel");
            },

            onPoNumberMatched: async function (oEvent) {
                //TODO Need to be fixed the aExpands and sPath they are for time being Static. They need to transformed to Dynamic
                const aExpands = ["HdrToMStones", "HdrToItems", "HdrToApDec", "HdrToAnalysis", "HdrToAttach"];
                const sPath = "/POHeaderSet('4200008157')"; // 4200008157 (For Milestone Data) 4200001905 (Without Mile stone Data)
                const data = await this.getData(sPath, null, aExpands);
                this.getView().getModel("appModel").setData(data)
                this.setHDRToMstones(data.HdrToMStones.results)
                await this.setMaterialUom();
                await this.setBOLineAreaMap(data.VndCode, data.PurOrg);
                await this.setBoBarMap(data.VndCode, data.PurOrg);
                this.getView().getModel("appModel").refresh(true);
                console.log(data);

            },

            setBoBarMap: async function(sVCode, sPurchaseOrg){
                // This chart is for Three Years Bar Chart
                const sPath = `/ZPUR_M01_Q0002_ODATA(A_0PURCH_ORG_01='${sPurchaseOrg}',OS_0VENDOR_01='${sVCode}')/Results`;
                const sModelName = "ZPUR_M01_Q0002_ODATA_SRV";
                const data = await this.getData(sPath, sModelName, []);
                let aBarMap = data.results?.map(data => {
                    return {
                        Year: data.A0CALYEAR, 
                        OrderValue: data.A00O2TO0FGB1NVFLX04ATD3CFS
                    }
                });
                this.getView().getModel("appModel").setProperty("/BoBarMap", aBarMap)
            },

            setBOLineAreaMap: async function (sVCode, sPurchaseOrg) {
                // This is the chart for the Three Years Chart for Line Area Chart 
                const sPath = `/ZPUR_O02_Q01_ODATA(A_0PURCH_ORG_01='${sPurchaseOrg}',OS_0VENDOR_01='${sVCode}')/Results`;
                const sModelName = "ZPUR_O02_Q01_ODATA_SRV";
                const data = await this.getData(sPath, sModelName, []);
                let aLineArea = data.results?.map(data => {
                    return {
                        Month: data.A0CALMONTH, 
                        OrderValue: data.A00O2TO0FGB1NVG5GB16Q5X4N0
                    }
                });
                this.getView().getModel("appModel").setProperty("/BoLineAreaMap", aLineArea)

            },
            setMaterialUom: async function () {
                const sPath = "/POAnalysisMatsSet";
                const aFilters = [];
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, '4200008157'));
                aFilters.push(new Filter("MCode", FilterOperator.EQ, "U"));
                aFilters.push(new Filter("MStatus", FilterOperator.EQ, "M"));

                const data = await this.getData(sPath, null, [], aFilters);

            },

            setHDRToMstones: function (oData) {
                if (oData.length !== 0) {
                    var aPM = oData.filter(row => row.Mtyp === 'A');
                    var dPM = oData.filter(row => row.Mtyp === 'D');
                    var rPM = oData.filter(row => row.Mtyp === 'R');
                    if (aPM.length !== 0) {
                        this.getView().getModel("appModel").setProperty("/AdvnPM", aPM)
                        // this.byId("idAvPM").setVisible(true)
                        // this.byId("idAvPML").setVisible(true)

                    } else {
                        // this.byId("idAvPM").setVisible(false)
                        // this.byId("idAvPML").setVisible(false)
                    }
                    if (dPM.length !== 0) {
                        // this.byId("idDPM").setVisible(true)
                        // this.byId("idDPML").setVisible(true)
                        this.getView().getModel("appModel").setProperty("/DeliverPM", dPM)

                    } else {
                        // this.byId("idDPM").setVisible(false)
                        // this.byId("idDPML").setVisible(false)
                    }
                    if (rPM.length !== 0) {
                        // this.byId("idRM").setVisible(true)
                        // this.byId("idRML").setVisible(true)
                        this.getView().getModel("appModel").setProperty("/RetentionPM", rPM)

                    } else {
                        // this.byId("idRM").setVisible(false)
                        // this.byId("idRML").setVisible(false)
                    }
                } else {
                    // this.byId("idAvPM").setVisible(false)
                    // this.byId("idAvPML").setVisible(false)
                    // this.byId("idDPM").setVisible(false)
                    // this.byId("idDPML").setVisible(false)
                    // this.byId("idRM").setVisible(false)
                    // this.byId("idRML").setVisible(false)
                }
            },

            getData: function (sPath, sModelName, aExpands, aFilters) {
                let sExpands = aExpands.length > 0 ? aExpands.join(",") : "";
                let oModel;
                if (sModelName) {
                    oModel = this.getOwnerComponent().getModel(sModelName);
                } else {
                    oModel = this.getOwnerComponent().getModel()
                }
                return new Promise((resolve, reject) => {
                    oModel.read(sPath, {
                        urlParameters: {
                            $expand: sExpands
                        },
                        filters: aFilters,
                        success: function (oSuccessData) {
                            resolve(oSuccessData);
                        },
                        error: function (oErrorData) {
                            reject(oErrorData);
                        }
                    })
                })
            }

        });
    });
