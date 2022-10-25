sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/alfanar/polandingpage/polandingpage/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, formatter, Filter, FilterOperator, MessageBox) {
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
                if (window.location.hostname.includes("applicationstudio.cloud.sap")) {
                    // This section is for Static Testing
                    sPoNo = "4200008157" // 4200008157 (For Milestone Data) 4200001905 (Without Mile stone Data)
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

                try {
                    const aExpands = ["HdrToMStones", "HdrToItems", "HdrToApDec", "HdrToAnalysis", "HdrToAttach"];
                    const sPath = `/POHeaderSet('${sPoNo}')`;
                    const data = await this.getData(sPath, null, aExpands);
                    this.getView().getModel("appModel").setData(data)
                    this.setHDRToMstones(data.HdrToMStones.results)
                    this.getView().getModel("appModel").setProperty("/PoDataItems", data.HdrToItems.results);
                    this.setPoAnalysisModels(data.HdrToAnalysis.results);
                    console.log(this.getView().getModel("appModel").getData());
                    await this.setBOHeader(data.PlantCod, data.VndCode, data.PurOrg);
                    await this.setMaterialUom();
                    await this.setBOLineAreaMap(data.VndCode, data.PurOrg);
                    await this.setBoBarMap(data.VndCode, data.PurOrg);
                    await this.setBoLineMap(data.PlantCod, data.PurOrg, data.VndCode);
                    this.getView().getModel("appModel").refresh(true);
                } catch (error) {
                    console.log(error.responseText);
                }

            },

            setBOHeader: async function (sPlant, sVCode, sPurg) {
                const sPath =  `/ZPUR_V02_Q17_ODATA(ZAUTH_0PLANT_VAR_001='${sPlant}',ZAUTH_0PLANT_VAR_001To='',OS_0VENDOR_01='${sVCode}',A_0PURCH_ORG_01='${sPurg}'/Results`;
                const oData = await this.getData(sPath, "ZPUR_V02_Q17_ODATA_SRV", [], []);
                let vGrade, vPlant, vDelivery, vQuality, vPrice, vPurchaseOrder, vPlantnumber, vSuppliedMaterials;
                if (oData.results.length > 0) {
                    vPlant = oData.results[0]['A00O2TO0FGB1NVGKOO1IXJ6K73']
                    vDelivery = oData.results[0]['A00O2TO0FGB1NVNSQDWPZ9XVIP']
                    if (vDelivery) {
                        vDelivery = parseFloat(vDelivery).toFixed(3)
                        vDelivery = Math.round(vDelivery)
                    }
                    vQuality = oData.results[0]['A00O2TO0FGB1NVNSQDWPZ9XP75']
                    if (vQuality) {
                        vQuality = parseFloat(vQuality).toFixed(3)
                        vQuality = Math.round(vQuality)
                    }
                    vPurchaseOrder = oData.results[0]['A00O2TO0FGB1NVGKOO1IXJ6DVJ']
                    vPlantnumber = oData.results[0]['A00O2TO0FGB1NVGKOO1IXJ6K73']
                    vSuppliedMaterials = oData.results[0]['A00O2TO0FGB1NVGKOO1IXJ6QIN']
                    vPrice = oData.results[0]['A00O2TO0FGB1NVNSQDWPZ9XIVL']
                    if (vPrice) {
                        vPrice = parseFloat(vPrice).toFixed(3)
                        vPrice = Math.round(vPrice)
                    }

                    if (oData.results[0]['A00O2TO0FGB1NVGKOO1IXJ5OLB'] !== "0") {
                        vGrade = "A"
                    } else if (oData.results[0]['A00O2TO0FGB1NVGKOO1IXJ5UWV'] !== "0") {
                        vGrade = "B"
                    } else if (oData.results[0]['A00O2TO0FGB1NVGKOO1IXJ618F'] !== "0") {
                        vGrade = "C"
                    } else if (oData.results[0]['A00O2TO0FGB1NVGKOO1IXJ67JZ'] !== "0") {
                        vGrade = "D"
                    } else {
                        vGrade = "-"
                    }
                }
                this.getView().getModel("appModel").setProperty("/BOGRADE", vGrade)
                this.getView().getModel("appModel").setProperty("/BOPLANT", vPlant)
                this.getView().getModel("appModel").setProperty("/BODELIVERY", vDelivery)
                this.getView().getModel("appModel").setProperty("/BOQUALITY", vQuality)
                this.getView().getModel("appModel").setProperty("/BOPURCHASEORDER", vPurchaseOrder)
                this.getView().getModel("appModel").setProperty("/BOPLANTNUMBER", vPlantnumber)
                this.getView().getModel("appModel").setProperty("/BOSUPLLIEDMATERIALS", vSuppliedMaterials)
                this.getView().getModel("appModel").setProperty("/BOPRICE", vPrice)

            },

            setPoAnalysisModels: function (oData) {
                oData.forEach(data => {
                    if (data.MCode === "P") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/MatPriceVsOldPrice", data);
                    }
                    if (data.MCode === "U") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/MaterialUom", data);
                    }
                    if (data.MCode === "C") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/OrderCurrency", data);
                    }
                    if (data.MCode === "Y") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/POType", data);
                    }
                    if (data.MCode === "T") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/PaymentTerms", data);
                    }
                    if (data.MCode === "I") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/InventoryAnalysis", data);
                    }
                    if (data.MCode === "N") {
                        let fPercentage;
                        if (parseFloat(data.YMatch) === 0) {
                            fPercentage = 0;
                        } else {
                            fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        }
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/OpenNcrVsVendor", data);
                    }
                });
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
                const data = await this.getData(sPath, sModelName, []);
                let aLine = data.results?.map(data => {
                    return {
                        Year: data.A0CALQUARTER,
                        OrderValue: data.A00O2TO0FGB1NVGKPA8Y55BN3Z
                    }
                });

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
                    }
                    if (dPM.length !== 0) {
                        this.getView().getModel("appModel").setProperty("/DeliverPM", dPM)
                    }
                    if (rPM.length !== 0) {
                        this.getView().getModel("appModel").setProperty("/RetentionPM", rPM)
                    }
                } else {
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
