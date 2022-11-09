sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/alfanar/polandingpage/polandingpage/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, formatter, Filter, FilterOperator, MessageBox, Fragment) {
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

            onAdvPayMilestoneTableMore: async function (oEvent) {
                let oAdvancePaymentMilstoneDialog;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.AdvPayMilestonesMore";
                const aTableData = oEvent.getSource().getBindingContext("appModel").getObject();
                this.getView().getModel("appModel").setProperty("/AdvnPMMore", [aTableData]);
                this.getView().getModel("appModel").refresh(true);
                if (!oAdvancePaymentMilstoneDialog) {
                    oAdvancePaymentMilstoneDialog = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oAdvancePaymentMilstoneDialog.open();
            },

            onDeliveryPayMilestoneTableMore: async function (oEvent) {
                let oDeliveryPaymentMilstoneDialog;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.AgainstDelvPaymMileStonesMore";
                const aTableData = oEvent.getSource().getBindingContext("appModel").getObject();
                this.getView().getModel("appModel").setProperty("/DeliverPMMore", [aTableData]);
                this.getView().getModel("appModel").refresh(true);
                if (!oDeliveryPaymentMilstoneDialog) {
                    oDeliveryPaymentMilstoneDialog = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oDeliveryPaymentMilstoneDialog.open();
            },

            onRetentionPayMilestoneTableMore: async function (oEvent) {
                let oRetentionPaymentMilstoneDialog;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.AgRetentioPayMilesMore";
                const aTableData = oEvent.getSource().getBindingContext("appModel").getObject();
                this.getView().getModel("appModel").setProperty("/RetentionPMMore", [aTableData]);
                this.getView().getModel("appModel").refresh(true);
                if (!oRetentionPaymentMilstoneDialog) {
                    oRetentionPaymentMilstoneDialog = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oRetentionPaymentMilstoneDialog.open();

            },

            onApprovalTableMoreClick: async function (oEvent) {
                let oApprovalMoreDialog;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.ApprovalMore";
                const aTableData = oEvent.getSource().getBindingContext("appModel").getObject();
                this.getView().getModel("appModel").setProperty("/ApprovalLevelsMore", [aTableData]);
                this.getView().getModel("appModel").refresh(true);
                if (!oApprovalMoreDialog) {
                    oApprovalMoreDialog = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oApprovalMoreDialog.open();

            },

            onDialogClose: function (oEvent) {
                oEvent.getSource().getParent().close();
            },

            onMatPriceVsOldPrice: async function (oEvent) {
                this.oMaterialUOMFragment;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.MatPriceVsOldPriceDialog";
                const aFilters = [];
                const sPath = "/POAnalysisMatsSet";
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, this.PONumber));
                aFilters.push(new Filter("MCode", FilterOperator.EQ, "P"));
                aFilters.push(new Filter("MStatus", FilterOperator.EQ, "M"));
                const finalFilter = new Filter({
                    filters: aFilters,
                    and: true
                })

                const data = await this.getData(sPath, "", [], finalFilter);
                this.getView().getModel("appModel").setProperty("/MatchMaterials", data.results);
                this.getView().getModel("appModel").refresh(true);
                let sSelectedMaterial = data.results[0].MatNum;

                if (!this.oMaterialUOMFragment) {
                    this.oMaterialUOMFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                this.oMaterialUOMFragment.open();
                this.setFilterFirstTime(sSelectedMaterial);

            },

            setFilterFirstTime: async function (sSelectedMaterial) {
                // Set Selected Key for the first Time
                this.getView().byId("idMatpriceVsOldPriceComboBox").setSelectedKey(sSelectedMaterial);
                const aFilters = [];
                const sPath = "/MatPriceTrendSet";
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, this.PONumber));
                aFilters.push(new Filter("MatNum", FilterOperator.EQ, sSelectedMaterial));
                const finalFilter = new Filter({
                    filters: aFilters,
                    and: true
                });
                const data = await this.getData(sPath, "", [], finalFilter);
                const aMatPriceChartData = data.results.map(matPrice => {
                    const sConvertedDate = new Date(matPrice.CreDate);
                    return {
                        Date: `${sConvertedDate.getDate()}-${sConvertedDate.getMonth() + 1}-${sConvertedDate.getFullYear()}`,
                        Price: matPrice.MatPrice
                    }
                });
                this.getView().getModel("appModel").setProperty("/MatPriceVendorChart", aMatPriceChartData);
                this.getView().getModel("appModel").refresh(true);

            },

            onMicroChartUrlClick: function (oEvent) {
                window.open("https://app.powerbi.com/groups/me/reports/70146951-ade9-4740-9dba-c62a3a3d4cf3/ReportSection9dec9b9a6583b816e546", "_blank")
            },

            onMaterialPriceVendorDialogClose: function () {
                if (this.oMaterialUOMFragment.isOpen()) {
                    this.oMaterialUOMFragment.close();
                }
            },

            onMatNumberSelect: async function (oEvent) {
                const sSelectedMaterial = oEvent.getParameter("value");
                const aFilters = [];
                const sPath = "/MatPriceTrendSet";
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, this.PONumber));
                aFilters.push(new Filter("MatNum", FilterOperator.EQ, sSelectedMaterial));
                const finalFilter = new Filter({
                    filters: aFilters,
                    and: true
                });
                const data = await this.getData(sPath, "", [], finalFilter);
                const aMatPriceChartData = data.results.map(matPrice => {
                    const sConvertedDate = new Date(matPrice.CreDate);
                    return {
                        Date: `${sConvertedDate.getDate()}-${sConvertedDate.getMonth() + 1}-${sConvertedDate.getFullYear()}`,
                        Price: matPrice.MatPrice
                    }
                });
                this.getView().getModel("appModel").setProperty("/MatPriceVendorChart", aMatPriceChartData);
                this.getView().getModel("appModel").refresh(true);
            },

            onMaterialUom: async function () {
                this.oMaterialUOMFragment;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.MaterialPriceUOMDialog";
                const aFilters = [];
                const sPath = "/POAnalysisMatsSet";
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, this.PONumber));
                aFilters.push(new Filter("MCode", FilterOperator.EQ, "U"));
                aFilters.push(new Filter("MStatus", FilterOperator.EQ, "M"));
                const finalFilter = new Filter({
                    filters: aFilters,
                    and: true
                })

                const data = await this.getData(sPath, "", [], finalFilter);
                const aMaterialUOM = data.results.map(materialUom => {
                    return {
                        MatNum: materialUom.MatNum,
                        MatDesc: materialUom.MatDesc,
                        CurrentUOM: materialUom.MiscDat.split(";")[0],
                        LastUoM: materialUom.MiscDat.split(";")[1]

                    }
                });
                this.getView().getModel("appModel").setProperty("/UoM", aMaterialUOM);
                this.getView().getModel("appModel").refresh(true);

                if (!this.oMaterialUOMFragment) {
                    this.oMaterialUOMFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                this.oMaterialUOMFragment.open();

            },
            onMaterialUOMDialogClose: function () {
                if (this.oMaterialUOMFragment.isOpen()) {
                    this.oMaterialUOMFragment.close();
                }
            },

            onOrderCurrency: async function () {
                this.oOrderCurrencyFragment;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.OrderCurrencyDialog";
                const aFilters = [];
                const sPath = "/POAnalysisMatsSet";
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, this.PONumber));
                aFilters.push(new Filter("MCode", FilterOperator.EQ, "C"));
                aFilters.push(new Filter("MStatus", FilterOperator.EQ, "N"));
                const finalFilter = new Filter({
                    filters: aFilters,
                    and: true
                })

                const data = await this.getData(sPath, "", [], finalFilter);
                const aOrderCurrencyValue = data.results.map(order => {
                    return {
                        MatNum: order.MatNum,
                        MatDesc: order.MatDesc,
                        CurrentCurrency: order.MiscDat.split(";")[0],
                        LastCurrency: order.MiscDat.split(";")[1]

                    }
                });
                this.getView().getModel("appModel").setProperty("/Currency", aOrderCurrencyValue);
                this.getView().getModel("appModel").refresh(true);

                if (!this.oOrderCurrencyFragment) {
                    this.oOrderCurrencyFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                this.oOrderCurrencyFragment.open();

            },

            onCurrencyDialogClose: function () {
                if (this.oOrderCurrencyFragment.isOpen()) {
                    this.oOrderCurrencyFragment.close();
                }
            },

            onPOType: async function () {
                this.oPOTypeFragment;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.POTypeDialog"
                const aFilters = [];
                const sPath = "/POAnalysisMatsSet";
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, this.PONumber));
                aFilters.push(new Filter("MCode", FilterOperator.EQ, "Y"));
                aFilters.push(new Filter("MStatus", FilterOperator.EQ, "N"));
                const finalFilter = new Filter({
                    filters: aFilters,
                    and: true
                })

                const data = await this.getData(sPath, "", [], finalFilter);
                const aPoType = data.results.map(poType => {
                    return {
                        PoType: poType.MiscDat.split(";")[0],
                        VendorCountry: poType.MiscDat.split(";")[1],

                    }
                });
                this.getView().getModel("appModel").setProperty("/PoTypeAnalysis", aPoType);
                this.getView().getModel("appModel").refresh(true);

                if (!this.oPOTypeFragment) {
                    this.oPOTypeFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                this.oPOTypeFragment.open();
            },

            onPOTypeDialogClose: function () {
                if (this.oPOTypeFragment.isOpen()) {
                    this.oPOTypeFragment.close();
                }
            },

            onPaymentTerms: async function () {
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.PaymentTermDialog";
                this.oPaymentTermsFragment;
                const aFilters = [];
                const sPath = "/POAnalysisMatsSet";
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, this.PONumber));
                aFilters.push(new Filter("MCode", FilterOperator.EQ, "T"));
                aFilters.push(new Filter("MStatus", FilterOperator.EQ, "N"));
                const finalFilter = new Filter({
                    filters: aFilters,
                    and: true
                })

                const data = await this.getData(sPath, "", [], finalFilter);

                const aPaymentTerms = data.results.map(paymentTerm => {
                    return {
                        CurrentPaymentTerm: paymentTerm.MiscDat.split(";")[0].replace(/\t/g, ''),
                        PreviousPaymentTerm: paymentTerm.MiscDat.split(";")[1],
                        PaymentMethod: paymentTerm.MiscDat.split(";")[2]

                    }
                });
                this.getView().getModel("appModel").setProperty("/PaymentTerms", aPaymentTerms);
                this.getView().getModel("appModel").refresh(true);

                if (!this.oPaymentTermsFragment) {
                    this.oPaymentTermsFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                this.oPaymentTermsFragment.open();

            },
            onPaymentTermDialogClose: function () {
                if (this.oPaymentTermsFragment.isOpen()) {
                    this.oPaymentTermsFragment.close();
                }
            },

            onInventoryAnalysis: async function () {
                this.oInventoryAnalysisFragment;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.InventoryAnalysisDialog";
                const aFilters = [];
                const sPath = "/POAnalysisMatsSet";
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, this.PONumber));
                aFilters.push(new Filter("MCode", FilterOperator.EQ, "I"));
                aFilters.push(new Filter("MStatus", FilterOperator.EQ, "N"));
                const finalFilter = new Filter({
                    filters: [
                        ...aFilters
                    ],
                    and: true
                })
                const data = await this.getData(sPath, "", [], finalFilter);
                let aInventoryData = data.results.map(sData => {
                    return {
                        Material: sData.MatNum,
                        MaterialDescription: sData.MatDesc,
                        AvailableStock: sData.MiscDat.split(";")[0],
                        OpenPurchaseorders: sData.MiscDat.split(";")[1],
                        CurrentPOQty: sData.MiscDat.split(";")[2],
                        OpenDemand: sData.MiscDat.split(";")[3],
                        Last6MonthsConsumption: sData.MiscDat.split(";")[4]
                    }
                });
                this.getView().getModel("appModel").setProperty("/InventoryAnalysis", aInventoryData);
                this.getView().getModel("appModel").refresh(true);

                console.log(aInventoryData);
                if (!this.oInventoryAnalysisFragment) {
                    this.oInventoryAnalysisFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                this.oInventoryAnalysisFragment.open();

            },

            onInventoryDialogClose: function () {
                if (this.oInventoryAnalysisFragment.isOpen()) {
                    this.oInventoryAnalysisFragment.close();
                }
            },

            onOpenNcrVsVendor: async function () {
                this.oOpenNcrVsVendorFragment;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.OpenNcrVsVendorDialog"
                const aFilters = [];
                const sPath = "/POAnalysisMatsSet";
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, this.PONumber));
                aFilters.push(new Filter("MCode", FilterOperator.EQ, "N"));
                aFilters.push(new Filter("MStatus", FilterOperator.EQ, "N"));
                const finalFilter = new Filter({
                    filters: aFilters,
                    and: true
                })

                const data = await this.getData(sPath, "", [], finalFilter);
                let aOpenNCrVsVendorData = data.results.map(onvv => {
                    return {
                        MatNum: onvv.MatNum,
                        MatDesc: onvv.MatDesc,
                        NotificationNo: onvv.MiscDat.split(";")[0],
                        NotificationDesc: onvv.MiscDat.split(";")[1],
                        Plant: onvv.MiscDat.split(";")[2]
                    }
                });
                this.getView().getModel("appModel").setProperty("/OpenNcr", aOpenNCrVsVendorData);
                this.getView().getModel("appModel").refresh(true);

                if (!this.oOpenNcrVsVendorFragment) {
                    this.oOpenNcrVsVendorFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                this.oOpenNcrVsVendorFragment.open();

            },

            onOpenNcrDialogClose: function () {
                if (this.oOpenNcrVsVendorFragment.isOpen()) {
                    this.oOpenNcrVsVendorFragment.close();
                }
            },

            onPoNumberMatched: async function (oEvent) {
                let sPoNo, TT, WI, TI;
                // Checking if the HostName has applicationstudio.cloud.sap that means it is running from BAS So that
                if (window.location.hostname.includes("applicationstudio.cloud.sap")) {
                    // This section is for Static Testing
                    sPoNo = "4200008157" // 4200008157 (For Milestone Data) 4200001905 (Without Mile stone Data) 4300007660
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
                    this.VndCode = data.VndCode;
                    this.PurOrg = data.PurOrg;

                    await this.setBOHeader(data.PlantCod, data.VndCode, data.PurOrg);
                    await this.setMaterialUom();
                    await this.setBOLineAreaMap(data.VndCode, data.PurOrg);
                    await this.setBoLineMap(data.PlantCod, data.PurOrg, data.VndCode);
                    this.getView().getModel("appModel").refresh(true);
                    await this.setReadStatus();

                } catch (error) {
                    console.log(error.responseText);
                }

            },
            setReadStatus: function (WI) {
                var that = this
                var sPath = "/WFStatusSet('" + WI + "')";
                this.getModel().read(sPath, {
                    success: function (oData, oResponce) {
                        if (oData.WiStat === "COMPLETED") {
                            MessageBox.information("This Purchase order task was already completed");
                            that.byId("idApprovButton").setEnabled(false)
                            that.byId("idRejectButton").setEnabled(false)
                        } else if (oData.WiStat === "READY" || oData.WiStat === "STARTED") {
                            that.byId("idApprovButton").setEnabled(true)
                            that.byId("idRejectButton").setEnabled(true)
                        }
                        else {
                            that.byId("idApprovButton").setEnabled(false)
                            that.byId("idRejectButton").setEnabled(false)
                        }
                    },
                    error: function (oError) {
                    }
                });
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
                        this.getView().getModel("appModel").setProperty("/MatPriceVsOldPriceMicro", data);
                    }
                    if (data.MCode === "U") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/MaterialUomMicro", data);
                    }
                    if (data.MCode === "C") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/OrderCurrencyMicro", data);
                    }
                    if (data.MCode === "Y") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/POTypeMicro", data);
                    }
                    if (data.MCode === "T") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/PaymentTermsMicro", data);
                    }
                    if (data.MCode === "I") {
                        const fPercentage = (data.NMatch / data.YMatch).toFixed(1);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/InventoryAnalysisMicro", data);
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

                // let aLine = [
                //     {
                //         Year: "2019",
                //         OrderValue: 100.23
                //     },
                //     {
                //         Year: "2020",
                //         OrderValue: 200.23
                //     },
                //     {
                //         Year: "2021",
                //         OrderValue: 500.23
                //     },
                //     {
                //         Year: "2022",
                //         OrderValue: 300.23
                //     },
                //     {
                //         Year: "2022",
                //         OrderValue: 800.23
                //     }

                // ];

                this.getView().getModel("appModel").setProperty("/BoLineMap", aLine)
            },

            setBoBarMap: async function (sVCode, sPurchaseOrg) {
                // This chart is for Three Years Bar Chart
                const sPath = `/ZPUR_M01_Q0002_ODATA(A_0PURCH_ORG_01='${sPurchaseOrg}',OS_0VENDOR_01='${sVCode}')/Results`;
                const sModelName = "ZPUR_M01_Q0002_ODATA_SRV";
                const data = await this.getData(sPath, sModelName, []);
                let aBarMap = data.results?.map(data => {
                    return {
                        Date: data.A0CALYEAR,
                        OrderValue: data.A00O2TO0FGB1NVFLX04ATD3CFS
                    }
                });

                // let aBarMap = [
                //     {
                //         Date: "2019",
                //         OrderValue: 100.23
                //     },
                //     {
                //         Date: "2020",
                //         OrderValue: 200.23
                //     },
                //     {
                //         Date: "2021",
                //         OrderValue: 500.23
                //     },
                //     {
                //         Date: "2022",
                //         OrderValue: 300.23
                //     },
                //     {
                //         Date: "2022",
                //         OrderValue: 800.23
                //     }
                // ];

                this.getView().getModel("appModel").setProperty("/BoLineAreaMap", aBarMap)
            },

            setBOLineAreaMap: async function (sVCode, sPurchaseOrg) {
                // This is the chart for the Three Years Chart for Line Area Chart 
                const sPath = `/ZPUR_O02_Q01_ODATA(A_0PURCH_ORG_01='${sPurchaseOrg}',OS_0VENDOR_01='${sVCode}')/Results`;
                const sModelName = "ZPUR_O02_Q01_ODATA_SRV";
                const data = await this.getData(sPath, sModelName, []);
                let aLineArea = data.results?.map(data => {
                    return {
                        Date: data.A0CALMONTH,
                        OrderValue: data.A00O2TO0FGB1NVG5GB16Q5X4N0
                    }
                });

                // let aLineArea = [
                //     {
                //         Date: "Jan",
                //         OrderValue: 100.23
                //     },
                //     {
                //         Date: "Feb",
                //         OrderValue: 200.23
                //     },
                //     {
                //         Date: "Mar",
                //         OrderValue: 500.23
                //     },
                //     {
                //         Date: "Apr",
                //         OrderValue: 300.23
                //     },
                //     {
                //         Date: "May",
                //         OrderValue: 800.23
                //     },
                //     {
                //         Date: "Jun",
                //         OrderValue: 540.23
                //     },
                //     {
                //         Date: "Jul",
                //         OrderValue: 900.23
                //     },
                //     {
                //         Date: "Aug",
                //         OrderValue: 100.23
                //     },
                // ]

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
                        filters: [aFilters],
                        success: function (oSuccessData) {
                            resolve(oSuccessData);
                        },
                        error: function (oErrorData) {
                            reject(oErrorData);
                        }
                    })
                })
            },

            /**
             * Loading the Fragment Generic Function
             * @param {*} sFragmentName : Fragment Location
             * @param {*} oView : This.getView()
             * @param {*} oController And the controller object
             */
            loadFragment: async function (sFragmentName, oView, oController) {
                const oFragment = await Fragment.load({
                    id: oView.getId(),
                    name: sFragmentName,
                    controller: oController
                });
                oView.addDependent(oFragment);
                return oFragment;
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
            onChartTypeChaneOrderByValue: function (oEvent) {
                const sSelectedChartType = oEvent.getSource().getSelectedItem().getKey();
                this.getView().byId("idThreeBoAreaViz").setVizType(sSelectedChartType);
            },
            onChartTypeChaneLineMap: function(oEvent){
                const sSelectedChartType = oEvent.getSource().getSelectedItem().getKey();
                this.getView().byId("idThreeBoLineViz").setVizType(sSelectedChartType);
            },
            onChartDataChangeOrderByValue: async function (oEvent) {
                const sSelectedChartType = oEvent.getSource().getSelectedItem().getKey();
                if (sSelectedChartType === "month") {
                    await this.setBOLineAreaMap(this.VndCode, this.PurOrg);
                } else {
                    await this.setBoBarMap(this.VndCode, this.PurOrg);
                }
            },

        });
    });
