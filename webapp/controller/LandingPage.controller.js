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
                // Getting the Component Object
                const oComponent = this.getOwnerComponent();
                // Fetching the Routing Object from the Component Object
                const oRouter = oComponent.getRouter();
                // Creating the appModel which is the central Model we would be using it
                this.getView().setModel(new JSONModel({}), "appModel");
                // Taking the Screesn width of the Browser or App for future
                this.screenWidth = oComponent.getModel("device").getData().resize.width;
                // Attaching the PatternMatched Event to get called after each URL Load
                oRouter.getRoute("RouteLandingPage").attachPatternMatched(this.onPoNumberMatched, this);
            },

            onMatPriceVsOldPrice: function(oEvent){
                
            },

            onPoNumberMatched: async function (oEvent) {
                let sPoNo, TT, WI, TI;
                // Checking if the HostName has applicationstudio.cloud.sap that means it is running from BAS So that
                if (window.location.hostname.includes("applicationstudio.cloud.sap")) {
                    // This section is for Static Testing
                    sPoNo = "4200008157" // 4200008157 (For Milestone Data) 4200001905 (Without Mile stone Data)
                    TT = "POR"
                    WI = "000002605618"
                    TI = "TS99000076"
                } else { // Else it is running from the BTP
                    const url = new URL(window.location.href);
                    let encodedURL;

                    encodedURL = url.searchParams.get("PRM");

                    if (encodedURL) {
                        let parameter = atob(encodedURL)
                        sPoNo = parameter.split("&")[0].split("=")[1]
                        TT = parameter.split("&")[1].split("=")[1]
                        WI = parameter.split("&")[2].split("=")[1]
                        TI = parameter.split("&")[3].split("=")[1]
                    } else {
                        sPoNo = url.searchParams.get("PONO");
                        TT = url.searchParams.get("TT");
                        WI = url.searchParams.get("WI");
                        TI = url.searchParams.get("TI");
                    }

                }
                // Setting up the WI, TI, TT PONumber Globally
                this.WI = WI;
                this.TI = TI;
                this.TT = TT;
                this.PONumber = sPoNo;

                try {
                    // Getting the Expands so that we can get the data.
                    const aExpands = ["HdrToMStones", "HdrToItems", "HdrToApDec", "HdrToAnalysis", "HdrToAttach"];
                    // Setting up the URL.
                    const sPath = `/POHeaderSet('${sPoNo}')`;
                    // Get the Data for PO Read .
                    const data = await this.getData(sPath, null, aExpands);
                    // Setting the Data in the APPModel 
                    this.getView().getModel("appModel").setData(data)
                    // Getting the Mile Stone Data processed
                    this.setHDRToMstones(data.HdrToMStones.results)
                    // Setting the PO Items Data
                    this.getView().getModel("appModel").setProperty("/PoDataItems", data.HdrToItems.results);
                    this.getView().getModel("appModel").setProperty("/ApprovalLevels", data.HdrToApDec.results);
                    // Set the property for attachments
                    this.getView().getModel("appModel").setProperty("/POAttach", data.HdrToAttach.results)
                    this.addVendorAttachmentsIcons(data.HdrToAttach.results);
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

            addVendorAttachmentsIcons: function (aData) {
                const oHBox = this.getView().byId("idHBoxAttach");
                if (aData.length) {
                    aData.forEach((data, index) => {
                        const oIcon = new sap.ui.core.Icon("icon" + index, {
                            src: "sap-icon://attachment",
                            press: [this.onVendorAttchmentIconPress, this],
                            customData: {
                                Type: "sap.ui.core.CustomData",
                                key: this.getView().getModel("appModel").getData().POAttach[index].LogDoc
                            }

                        });
                        oHBox.addItem(oIcon);
                    })
                }
            },

            onVendorAttchmentIconPress: function (oEvent) {
                // this._getBusyDialog().open();
                const oData = this.getView().getModel("appModel").getData().POAttach.filter(row => row.LogDoc === oEvent.getSource().getAggregation(
                    "customData")[0].getKey())[0];
                this.downloadTheFile(oData.DocNum, oData.DocPrt, oData.DocType, oData.DocVer, oData.LogDoc);
            },

            downloadTheFile: function (DocNum, DocPrt, DocType, DocVer, LogDoc) {
                var sPath = "/DMSFileSet(DocType='" + DocType + "',DocNum='" + DocNum + "',DocVer='" + DocVer + "',DocPrt='" + DocPrt +
                    "',LogDoc='" + LogDoc + "')";
                this.getView().getModel().read(sPath, {
                    success: jQuery.proxy(this._fnHandleSuccessFileRead, this),
                    error: jQuery.proxy(this._fnHandleErrorFileRead, this)
                });

            },

            _fnHandleSuccessFileRead: function (oData, oResponce) {
                var contentType
                var formate = oData.FilName.split(".")[oData.FilName.split(".").length - 1]
                if (formate === "XLSX" || formate === "xls" || formate === "xlsx") {
                    contentType = 'application/vnd.ms-excel';
                }
                if (formate === "MSG" || formate === "msg") {
                    contentType = 'application/vnd.ms-outlook';
                }
                if (formate === "PDF" || formate === "pdf") {
                    contentType = 'application/pdf';
                }
                if (formate === "TXT" || formate === "txt") {
                    contentType = 'text/plain';
                }
                if (formate === "PPT" || formate === "ppt") {
                    contentType = 'application/vnd.ms-powerpoint';
                }
                if (formate === "JPEG" || formate === "jpeg") {
                    contentType = 'image/jpeg';
                }
                if (formate === "JPG" || formate === "jpg") {
                    contentType = 'image/jpeg';
                }
                if (formate === "DOC" || formate === "doc") {
                    contentType = 'application/msword';
                }
                if (formate === "HTML" || formate === "html") {
                    contentType = 'text/html';
                }
                if (formate === "DWG" || formate === "dwg") {
                    contentType = 'application/dwg';
                }
                if (formate === "MHT" || formate === "mht") {
                    contentType = 'message/rfc822';
                }
                if (formate === "MHTML" || formate === "mhtml") {
                    contentType = 'message/rfc822';
                }
                var blob = this._fnb64toBlob(oData.FilCont, contentType);
                var a = document.createElement("a")
                var blobURL = URL.createObjectURL(blob)
                a.download = oData.FilName
                a.href = blobURL
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                // this._getBusyDialog().close();
            },

            _fnHandleErrorFileRead: function (oError) {
                // this._getBusyDialog().close();
            },

            _fnb64toBlob: function (b64Data, contentType, sliceSize) {

                contentType = contentType || '';
                sliceSize = sliceSize || 512;

                var byteCharacters = atob(b64Data);
                var byteArrays = [];

                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);

                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    var byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

                var blob = new Blob(byteArrays, {
                    type: contentType
                });
                return blob;

            },

            setBOHeader: async function (sPlant, sVCode, sPurg) {
                const sPath = `/ZPUR_V02_Q17_ODATA(ZAUTH_0PLANT_VAR_001='${sPlant}',ZAUTH_0PLANT_VAR_001To='',OS_0VENDOR_01='${sVCode}',A_0PURCH_ORG_01='${sPurg}')/Results`;
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
            },

            onApprove: function (oEvent) {
                MessageBox.show("Are you sure you want to Approve this PO?", {
                    icon: MessageBox.Icon.WARNING,
                    title: this.getView().getModel("i18n").getProperty("APPROVE"),
                    actions: ["OK", "CANCEL"],
                    onClose: jQuery.proxy(this._fnHandleApproveTask, this)
                });
            },

            _fnHandleApproveTask: function (sAction) {
                if (sAction === "OK") {
                    var oRemarks = this.byId("idGetText").getValue();
                    var oApprovepayload = {
                        "Decision": "0",
                        "ApprovalSet": [{
                            "DecisionKey": "0001",
                            "WiId": this.WI,
                            "TaskID": this.TI,
                            "AppType": this.TT,
                            "Remarks": oRemarks
                        }]
                    }
                    // this._getBusyDialog().setText("Purchase Order is Approved ");
                    // this._getBusyDialog().open();
                    this.getView().getModel("INBOX").create("/ApprovalHeaderSet", oApprovepayload, {
                        success: jQuery.proxy(this._fnHandleSuccessApprove, this),
                        error: jQuery.proxy(this._fnHandleErrorApprove, this)
                    });
                }

            },

            _fnHandleSuccessApprove: function (oData, oResponce) {
                // this._getBusyDialog().close();
                if (oResponce.statusCode <= "200" || oResponce.statusCode.statusCode >= "299") {
                    MessageBox.error("Purchase Order :" + "" + this.PONumber + " " + "is Not Approved, Please contact Admin");
                } else {
                    MessageBox.success("Purchase Order :" + "" + this.PONumber + " " + "is Approved");
                    this.getView().byId("idApprovButton").setEnabled(false)
                    this.getView().byId("idRejectButton").setEnabled(false)
                    this.getView().byId("idGetText").setEnabled(false)
                    window.close()
                }
            },

            _fnHandleErrorApprove: function (oError) {

            },

            onReject: function (oEvent) {
                MessageBox.show("Are you sure you want  to Reject this PO?", {
                    icon: MessageBox.Icon.WARNING,
                    title: this.getView().getModel("i18n").getProperty("REJECT"),
                    actions: ["OK", "CANCEL"],
                    onClose: jQuery.proxy(this._fnHandleRejectTask, this)
                });
            },

            _fnHandleRejectTask: function (sAction) {
                if (sAction === "OK") {
                    var oRemarks = this.byId("idGetText").getValue();
                    if (oRemarks !== "") {
                        this.getView().byId("idGetText").setValueState("None")
                        var oApprovepayload = {
                            "Decision": "0",
                            "ApprovalSet": [{
                                "DecisionKey": "0002",
                                "WiId": this.WI,
                                "TaskID": this.TI,
                                "AppType": this.TT,
                                "Remarks": oRemarks
                            }]
                        }
                        // this._getBusyDialog().setText("Purchase Order is Rejected");
                        // this._getBusyDialog().open();
                        this.getModel("INBOX").create("/ApprovalHeaderSet", oApprovepayload, {
                            success: jQuery.proxy(this._fnHandleSuccessReject, this),
                            error: jQuery.proxy(this._fnHandleErrorReject, this)
                        });
                    } else {
                        this.getView().byId("idGetText").setValueStateText("Please enter comments")
                        this.getView().byId("idGetText").setValueState("Error")

                    }
                }

            },

            _fnHandleSuccessReject: function (oData, oResponce) {
                // this._getBusyDialog().close();
                if (oResponce.statusCode <= "200" || oResponce.statusCode.statusCode >= "299") {
                    MessageBox.error("Purchase Order :" + "" + this.PONumber + " " + "is Not Rejected, Please contact Admin");
                } else {
                    MessageBox.success("Purchase Order :" + "" + this.PONumber + " " + "is Rejected");
                    this.getView().byId("idApprovButton").setEnabled(false)
                    this.getView().byId("idRejectButton").setEnabled(false)
                    this.getView().byId("idGetText").setEnabled(false)
                    window.close()
                }

            },

            _fnHandleErrorReject: function (oError) {

            },

        });
    });
