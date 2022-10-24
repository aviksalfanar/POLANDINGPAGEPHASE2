sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/alfanar/polandingpage/polandingpage/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
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
                oRouter.getRoute("RouteLandingPage").attachPatternMatched(this.onPoNumberMatched, this);
                this.getView().setModel(new JSONModel({}), "appModel");
            },

            onPoNumberMatched: async function (oEvent) {
                let sPoNo, TT, WI, TI;
                if (window.location.hostname.includes("webide") === true) {
                    sPoNo = "4200136330"
                    TT = "POR"
                    WI = "000002605618"
                    TI = "TS99000076"
                } else {
                    const url = new URL(window.location.href);
                    const encodedURL = url.searchParams.get("PRM");
                    let parameter = atob(encodedURL)
                    sPoNo = parameter.split("&")[0].split("=")[1]
                    TT = parameter.split("&")[1].split("=")[1]
                    WI = parameter.split("&")[2].split("=")[1]
                    TI = parameter.split("&")[3].split("=")[1]
                }
                
                const aExpands = ["HdrToMStones", "HdrToItems", "HdrToApDec", "HdrToAnalysis", "HdrToAttach"];
                const sPath = `/POHeaderSet('${sPoNo}')`; // 4200008157 (For Milestone Data) 4200001905 (Without Mile stone Data)
                const data = await this.getData(sPath, null, aExpands);
                this.getView().getModel("appModel").setData(data)
                this.setHDRToMstones(data.HdrToMStones.results)
                this.getView().getModel("appModel").setProperty("/PoDataItems", data.HdrToItems.results);
                await this.setMaterialUom();
                await this.setBOLineAreaMap(data.VndCode, data.PurOrg);
                await this.setBoBarMap(data.VndCode, data.PurOrg);
                await this.setBoLineMap(data.Plant, data.PurOrg, data.VndCode);
                this.getView().getModel("appModel").refresh(true);
                console.log(data);

            },

            setOpenNcr: async function (sPoNo) {
                const sPath = "/POAnalysisMatsSet";
                const aFilters = [];
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, sPoNo));
                aFilters.push(new Filter("MCode", FilterOperator.EQ, "N"));
                aFilters.push(new Filter("MStatus", FilterOperator.EQ, "N"));
                const data = await this.getData(sPath, "", [], aFilters);
                let aOpenNcr = data?.results.map(oData => {
                    return {
                        MatNum: oData.MatNum,
                        MatDesc: oData.MatDesc,
                        NotificationNo: oData.MiscDat.split(";")[0],
                        NotificationDesc: oData.MiscDat.split(";")[1],
                        Plant: oData.MiscDat.split(";")[2]
                    }
                });
                this.getModel("appModel").setProperty("/OpenNcr", aOpenNcr)
            },

            onItemSelect: async function () {
                let sMatNo = this.getView().byId("idPoItemsTable").getSelectedItem().getBindingContext("appModel").getObject().MatNum;
                let sPoNum = this.getView().getModel("appModel").getData().PoNum;
                await this.setItemHistory(sPoNum, sMatNo);

            },

            setItemHistory: async function (sPoNo, sMatNo) {
                const sPath = "/ItemHistorySet";
                const aFilters = [];
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, sPoNo));
                aFilters.push(new Filter("MatNum", FilterOperator.EQ, sMatNo));
                const data = await this.getData(sPath, "", [], aFilters);
                console.log(data);

                let aItemHistory = data.results.map(oData => {
                    return {
                        Date: oData.CreDate.toLocaleDateString(),
                        Price: oData.MatPrice
                    }
                });
                this.getView().getModel("appModel").setProperty("/ItemHistorySet", data.results);
                this.getView().getModel("appModel").setProperty("/ItemHisData", aItemHistory);
            },

            setBoLineMap: async function (sPlant, sPurchaseOrg, sVCode) {
                // This chart is for Vendor Evaluation line Chart
                const sPath = `/ZPUR_V02_Q19_ODATA(ZAUTH_0PLANT_VAR_001='${sPlant}',ZAUTH_0PLANT_VAR_001To='',OS_0VENDOR_01='${sVCode}',A_0PURCH_ORG_01='${sPurchaseOrg}')/Results`;
                const sModelName = "ZPUR_V02_Q19_ODATA_SRV";
                // const data = await this.getData(sPath, sModelName, []);
                // let aLine = data.results?.map(data => {
                //     return {
                //         Year: data.A0CALQUARTER, 
                //         OrderValue: data.A00O2TO0FGB1NVGKPA8Y55BN3Z
                //     }
                // }); 

                let aLine = [
                    {
                        Year: "2019",
                        OrderValue: 100.23
                    },
                    {
                        Year: "2020",
                        OrderValue: 200.23
                    },
                    {
                        Year: "2021",
                        OrderValue: 500.23
                    },
                    {
                        Year: "2022",
                        OrderValue: 300.23
                    },
                    {
                        Year: "2022",
                        OrderValue: 800.23
                    }
                ];

                this.getView().getModel("appModel").setProperty("/BoLineMap", aLine)
            },

            setBoBarMap: async function (sVCode, sPurchaseOrg) {
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

                aBarMap = [
                    {
                        Year: "2019",
                        OrderValue: 100.23
                    },
                    {
                        Year: "2020",
                        OrderValue: 200.23
                    },
                    {
                        Year: "2021",
                        OrderValue: 500.23
                    },
                    {
                        Year: "2022",
                        OrderValue: 300.23
                    },
                    {
                        Year: "2022",
                        OrderValue: 800.23
                    }
                ];


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

                aLineArea = [
                    {
                        Month: "Jan",
                        OrderValue: 100.23
                    },
                    {
                        Month: "Feb",
                        OrderValue: 200.23
                    },
                    {
                        Month: "Mar",
                        OrderValue: 500.23
                    },
                    {
                        Month: "Apr",
                        OrderValue: 300.23
                    },
                    {
                        Month: "May",
                        OrderValue: 800.23
                    },
                    {
                        Month: "Jun",
                        OrderValue: 540.23
                    },
                    {
                        Month: "Jul",
                        OrderValue: 900.23
                    },
                    {
                        Month: "Aug",
                        OrderValue: 100.23
                    },
                ]

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
