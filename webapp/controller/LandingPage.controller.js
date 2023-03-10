sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/alfanar/polandingpage/polandingpage/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/core/Icon",
    'sap/viz/ui5/format/ChartFormatter',
    'sap/viz/ui5/api/env/Format',
    "sap/viz/ui5/controls/Popover"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, formatter, Filter, FilterOperator, MessageBox, Fragment, Icon, ChartFormatter, Format, Popover) {
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

            setChartPopOver: function (objVizframe) {
                Format.numericFormatter(ChartFormatter.getInstance());
                const oVizFrame = objVizframe;
                const oPopOver = new Popover();
                oPopOver.connect(oVizFrame.getVizUid());
                oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
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

            onPOItemTableMore: async function (oEvent) {
                let oPoItemTableMoreDialog;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.POItemTableMore";
                const aTableData = oEvent.getSource().getBindingContext("appModel").getObject();
                this.getView().getModel("appModel").setProperty("/PoDataItemsMore", [aTableData]);
                this.getView().getModel("appModel").refresh(true);
                if (!oPoItemTableMoreDialog) {
                    oPoItemTableMoreDialog = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oPoItemTableMoreDialog.open();

            },

            onPOItemHistoryTableMore: async function (oEvent) {
                let oPOItemHistoryMoreDialog;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.POItemHistoryMoreDialog";
                const aTableData = oEvent.getSource().getBindingContext("appModel").getObject();
                this.getView().getModel("appModel").setProperty("/POItemHistoryMore", [aTableData]);
                this.getView().getModel("appModel").refresh(true);
                if (!oPOItemHistoryMoreDialog) {
                    oPOItemHistoryMoreDialog = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oPOItemHistoryMoreDialog.open();

            },

            onChartTypeChanePOItemHistory: function (oEvent) {
                const sSelectedChartType = oEvent.getSource().getSelectedItem().getKey();
                const oChart = oEvent.getSource().getParent().getParent().getContent()[0].getContent();
                oChart.setVizType(sSelectedChartType);

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
                oEvent.getSource().getParent().destroy(true);
            },

            onMatPriceVsOldPrice: async function (oEvent) {
                let oMaterialPriceVsOldFragment;
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

                if (!oMaterialPriceVsOldFragment) {
                    oMaterialPriceVsOldFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oMaterialPriceVsOldFragment.open();
                this.setChartPopOver(oMaterialPriceVsOldFragment.getContent()[0].getItems()[2].getFlexContent());
                const oComboBox = oMaterialPriceVsOldFragment.getContent()[0].getItems()[1].getItems()[0];
                this.setFilterFirstTime(sSelectedMaterial, oComboBox);

            },

            setFilterFirstTime: async function (sSelectedMaterial, oComboBox) {
                // Set Selected Key for the first Time
                oComboBox.setSelectedKey(sSelectedMaterial);
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
                oMaterialUOMFragment;
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

                if (!oMaterialUOMFragment) {
                    oMaterialUOMFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oMaterialUOMFragment.open();

            },

            onOrderCurrency: async function () {
                let oOrderCurrencyFragment;
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
                        LastCurrency: order.MiscDat.split(";")[1],
                        LastPoNumber: order.MiscDat.split(";")[2]

                    }
                });
                this.getView().getModel("appModel").setProperty("/Currency", aOrderCurrencyValue);
                this.getView().getModel("appModel").refresh(true);

                if (!oOrderCurrencyFragment) {
                    oOrderCurrencyFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oOrderCurrencyFragment.open();

            },

            onPOType: async function () {
                let oPOTypeFragment;
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

                if (!oPOTypeFragment) {
                    oPOTypeFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oPOTypeFragment.open();
            },


            onPaymentTerms: async function () {
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.PaymentTermDialog";
                let oPaymentTermsFragment;
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

                if (!oPaymentTermsFragment) {
                    oPaymentTermsFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oPaymentTermsFragment.open();

            },

            onInventoryAnalysis: async function () {
                let oInventoryAnalysisFragment;
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

                if (!oInventoryAnalysisFragment) {
                    oInventoryAnalysisFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oInventoryAnalysisFragment.open();

            },


            onOpenNcrVsVendor: async function () {
                let oOpenNcrVsVendorFragment;
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
                        Plant: `${onvv.MiscDat.split(";")[2]}-${onvv.MiscDat.split(";")[3]}`
                    }
                });
                this.getView().getModel("appModel").setProperty("/OpenNcr", aOpenNCrVsVendorData);
                this.getView().getModel("appModel").refresh(true);

                if (!oOpenNcrVsVendorFragment) {
                    oOpenNcrVsVendorFragment = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oOpenNcrVsVendorFragment.open();

            },


            onPoNumberMatched: async function (oEvent) {
                let sPoNo, TT, WI, TI;
                // Checking if the HostName has applicationstudio.cloud.sap that means it is running from BAS So that
                if (window.location.hostname.includes("applicationstudio.cloud.sap")) {
                    // This section is for Static Testing
                    sPoNo = "4200001905" // 4200008157 (For Milestone Data) 4200001905 (Without Mile stone Data) 4300007660
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

                    // Payment Term Segrigation
                    if (data.PmtTerm) {
                        let aPmtTerm = data.PmtTerm.split(";");
                        aPmtTerm.forEach(data => {
                            if (data.includes("Advance")) {
                                this.getView().getModel("appModel").setProperty("/PmtTermAdvance", data);
                            } else if (data.includes("Delivery")) {
                                this.getView().getModel("appModel").setProperty("/PmtTermDelivery", data);
                            } else if (data.includes("Retention")) {
                                this.getView().getModel("appModel").setProperty("/PmtTermRetention", data);
                            }
                        })
                    }

                    // Getting the Mile Stone Data processed
                    this.setHDRToMstones(data.HdrToMStones.results)
                    // Setting the PO Items Data
                    this.getView().getModel("appModel").setProperty("/PoDataItems", data.HdrToItems.results);
                    // Add the 20 character in comments and ...
                    data.HdrToApDec.results.forEach((approval, index) => {
                        if (approval.Comments) {
                            if (approval.Comments.length <= 20) {
                                approval.smallComment = `${approval.Comments}`;
                                approval.linkVisible = false;
                                approval.textVisible = true;
                            } else {
                                approval.smallComment = `${approval.Comments.substring(0, 20)}...`;
                                approval.linkVisible = true;
                                approval.textVisible = false;
                            }
                        } else {
                            approval.smallComment = "No Comments"
                            approval.linkVisible = false;
                            approval.textVisible = true;
                        }
                    })

                    this.getView().getModel("appModel").setProperty("/ApprovalLevels", data.HdrToApDec.results);
                    // Set the property for attachments
                    this.getView().getModel("appModel").setProperty("/POAttach", data.HdrToAttach.results)
                    this.addVendorAttachmentsIcons(data.HdrToAttach.results);
                    this.setPoAnalysisModels(data.HdrToAnalysis.results);
                    this.VndCode = data.VndCode;
                    this.PurOrg = data.PurOrg;

                    this.setChartPopOver(this.getView().byId("idThreeBoAreaViz"));
                    this.setChartPopOver(this.getView().byId("idThreeBoLineViz"));

                    await this.setBOHeader(data.PlantCod, data.VndCode, data.PurOrg);
                    await this.setMaterialUom();
                    await this.setBOLineAreaMap(data.VndCode, data.PurOrg);
                    await this.setBoLineMap(data.PlantCod, data.PurOrg, data.VndCode);
                    this.getView().getModel("appModel").refresh(true);
                    if(this.WI){
                        await this.setReadStatus(this.WI);
                    }


                } catch (error) {
                    console.log(error.responseText);
                }

            },
            approvalArrangement: function (sId, oContext) {
                let oLinkTextControl;
                let sActionDate = null;
                if(oContext.getProperty("ActDate")){
                    sActionDate = oContext.getProperty("ActDate");
                    sActionDate = formatter.getDateFormatted(sActionDate);
                }
                if (oContext.getProperty("textVisible")) {
                    oLinkTextControl = new sap.m.Text({ text: "{appModel>smallComment}" });
                } else {
                    oLinkTextControl = new sap.m.Link({ text: "{appModel>smallComment}" }).attachPress(this.onApprovalTableMoreClick, this);
                }

                return new sap.m.ColumnListItem({
                    cells:[
                        new sap.m.Text({text: "{appModel>ApLevel}"}),
                        new sap.m.Text({text: "{appModel>EmpName}"}),
                        new sap.m.Text({text: "{appModel>EmpPostn}"}),
                        new sap.m.Text({text: sActionDate}),
                        new sap.m.Text({text: "{appModel>Status}"}),
                        oLinkTextControl,

                    ]
                })

            },
            setReadStatus: function (WI) {
                var that = this
                var sPath = "/WFStatusSet('" + WI + "')";
                const oModel = this.getView().getModel();
                oModel.read(sPath, {
                    success: function (oData) {
                        if (oData.WiStat === "COMPLETED") {
                            MessageBox.information("This Purchase order task was already completed");
                            that.getView().byId("idApprovButton").setEnabled(false)
                            that.getView().byId("idRejectButton").setEnabled(false)
                        } else if (oData.WiStat === "READY" || oData.WiStat === "STARTED") {
                            that.getView().byId("idApprovButton").setEnabled(true)
                            that.getView().byId("idRejectButton").setEnabled(true)
                        }
                        else {
                            that.getView().byId("idApprovButton").setEnabled(false)
                            that.getView().byId("idRejectButton").setEnabled(false)
                        }
                    },
                    error: function (oError) {
                        console.log(oError);
                    }
                });
            },

            addVendorAttachmentsIcons: function (aData) {
                const oHBox = this.getView().byId("idHBoxAttach");
                if (aData.length) {
                    aData.forEach((data, index) => {
                        const oIcon = new Icon(`icon${index}`, {
                            src: "sap-icon://attachment",
                            useIconTooltip: true,
                            press: [this.onVendorAttchmentIconPress, this],
                            customData: {
                                Type: "sap.ui.core.CustomData",
                                key: this.getView().getModel("appModel").getData().POAttach[index].LogDoc
                            },
                            tooltip: data.FilName
                        });
                        oIcon.addStyleClass("margin");
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
            },

            _fnHandleErrorFileRead: function (oError) {
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

            addCssClassDynamically: function (aId, sClass) {
                aId.forEach(id => {
                    this.getView().byId(id).addStyleClass(sClass);
                })
            },

            calculateThePercentage: function (NMatch, yMatch) {
                const nonMatch = parseFloat(NMatch);
                const iMatch = parseFloat(yMatch);
                let fPercentage = 0;

                if (nonMatch === 0 && iMatch > 0) {
                    fPercentage = 100;
                } else if (iMatch > 0 && nonMatch > 0) {
                    fPercentage = ((nonMatch / (iMatch + nonMatch)) * 100).toFixed(1);
                } else if (iMatch === 0 && nonMatch > 0) {
                    fPercentage = 0;
                }

                return fPercentage;
            },

            setPoAnalysisModels: function (oData) {
                //TODO To be handle the dynamic CSS for Red and Green Color
                oData.forEach(data => {
                    if (data.MCode === "P") {
                        const fPercentage = this.calculateThePercentage(data.NMatch, data.YMatch);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/MatPriceVsOldPriceMicro", data);
                        if (fPercentage > 99) {
                            this.addCssClassDynamically(["idMatVsOldCard", "idMatVsOldCardHeader"], "backGroundGreen")
                        } else {
                            this.addCssClassDynamically(["idMatVsOldCard", "idMatVsOldCardHeader"], "backGroundRed")
                        }
                    }
                    if (data.MCode === "U") {
                        const fPercentage = this.calculateThePercentage(data.NMatch, data.YMatch);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/MaterialUomMicro", data);
                        if (fPercentage > 99) {
                            this.addCssClassDynamically(["idMatUomCard", "idMatUomCardHeader"], "backGroundGreen")
                        } else {
                            this.addCssClassDynamically(["idMatUomCard", "idMatUomCardHeader"], "backGroundRed")
                        }

                    }
                    if (data.MCode === "C") {
                        const fPercentage = this.calculateThePercentage(data.NMatch, data.YMatch);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/OrderCurrencyMicro", data);
                        if (fPercentage > 99) {
                            this.addCssClassDynamically(["idOrderCurrCard", "idOrderCurrCardHeader"], "backGroundGreen")
                        } else {
                            this.addCssClassDynamically(["idOrderCurrCard", "idOrderCurrCardHeader"], "backGroundRed")
                        }

                    }
                    if (data.MCode === "Y") {
                        const fPercentage = this.calculateThePercentage(data.NMatch, data.YMatch);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/POTypeMicro", data);
                        if (fPercentage > 99) {
                            this.addCssClassDynamically(["idPoTypeCard", "idPoTypeCardHeader"], "backGroundGreen")
                        } else {
                            this.addCssClassDynamically(["idPoTypeCard", "idPoTypeCardHeader"], "backGroundRed")
                        }

                    }
                    if (data.MCode === "T") {
                        const fPercentage = this.calculateThePercentage(data.NMatch, data.YMatch);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/PaymentTermsMicro", data);
                        if (fPercentage > 99) {
                            this.addCssClassDynamically(["idPymntTermCard", "idPymntTermCardHeader"], "backGroundGreen")
                        } else {
                            this.addCssClassDynamically(["idPymntTermCard", "idPymntTermCardHeader"], "backGroundRed")
                        }

                    }
                    if (data.MCode === "I") {
                        const fPercentage = this.calculateThePercentage(data.NMatch, data.YMatch);
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/InventoryAnalysisMicro", data);
                        if (fPercentage > 99) {
                            this.addCssClassDynamically(["idInvntAnlCard", "idInvntAnlCardHeader"], "backGroundGreen")
                        } else {
                            this.addCssClassDynamically(["idInvntAnlCard", "idInvntAnlCardHeader"], "backGroundRed")
                        }
                    }
                    if (data.MCode === "N") {
                        let fPercentage;
                        if (parseFloat(data.YMatch) === 0) {
                            fPercentage = 0;
                        } else {
                            fPercentage = this.calculateThePercentage(data.NMatch, data.YMatch);
                        }
                        data.Percentage = fPercentage;
                        this.getView().getModel("appModel").setProperty("/OpenNcrVsVendor", data);
                        if (fPercentage > 99) {
                            this.addCssClassDynamically(["idOpnVndrCard", "idOpnVndrCardHeader"], "backGroundGreen")
                        } else {
                            this.addCssClassDynamically(["idOpnVndrCard", "idOpnVndrCardHeader"], "backGroundRed")
                        }

                    }
                });
            },

            onPOItemSelect: async function () {
                let oPoitemHistoryDialog;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.POItemHistoryDialog";
                const oSelectedData = this.getView().byId("idPoItemsTable").getSelectedItem().getBindingContext("appModel").getObject();
                this.getView().getModel("appModel").setProperty("/SelectedPoItem", oSelectedData);
                let sMatNo = oSelectedData.MatNum;
                let sPoNum = this.getView().getModel("appModel").getData().PoNum;
                await this.setItemHistory(sPoNum, sMatNo);

                if (!oPoitemHistoryDialog) {
                    oPoitemHistoryDialog = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oPoitemHistoryDialog.open();
                const oVizFrame = oPoitemHistoryDialog.getContent()[0].getContentAreas()[1].getContent()[0].getContentAreas()[0].getContent()[0].getContent();
                this.setChartPopOver(oVizFrame);

            },

            setItemHistory: async function (sPoNo, sMatNo) {
                const sPath = "/ItemHistorySet";
                const aFilters = [];
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, sPoNo));
                aFilters.push(new Filter("MatNum", FilterOperator.EQ, sMatNo));
                const data = await this.getData(sPath, "", [], aFilters);

                let aItemHistory = data.results.map(oData => {
                    return {
                        Date: oData.CreDate.toLocaleDateString(),
                        Price: oData.MatPriceLcl
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
                        Date: data.A0CALYEAR,
                        OrderValue: data.A00O2TO0FGB1NVFLX04ATD3CFS
                    }
                });

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
                    var oRemarks = this.getView().byId("idGetText").getValue();
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
                    this.getView().getModel("INBOX").create("/ApprovalHeaderSet", oApprovepayload, {
                        success: jQuery.proxy(this._fnHandleSuccessApprove, this),
                        error: jQuery.proxy(this._fnHandleErrorApprove, this)
                    });
                }

            },

            _fnHandleSuccessApprove: function (oData, oResponce) {
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
                    var oRemarks = this.getView().byId("idGetText").getValue();
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
                        this.getView().getModel("INBOX").create("/ApprovalHeaderSet", oApprovepayload, {
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
            onChartTypeChaneLineMap: function (oEvent) {
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

            onFormulaCalculation: async function (oEvent) {
                const oBtn = oEvent.getSource();
                let oPopOverInventoryAnalysis;
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.InventoryAnalysisPopOver";
                if (!oPopOverInventoryAnalysis) {
                    oPopOverInventoryAnalysis = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oPopOverInventoryAnalysis.openBy(oBtn);

            },
            onHeaderClick: async function (oEvent) {
                const oSourceObj = oEvent.getSource();
                const sFragmentName = "com.alfanar.polandingpage.polandingpage.fragments.HeaderPopOver";
                let sFilterCriteria, sHeaderTitle;
                let bHeaderText = false;
                let oHeaderDetailsPopOver;
                if (oSourceObj.getText().includes("Header Text")) {
                    sFilterCriteria = "F01";
                    bHeaderText = true;
                    sHeaderTitle = "Header Text"
                } else {
                    sFilterCriteria = "F02"
                    sHeaderTitle = "Header Note"
                }
                let aFilters = [];
                aFilters.push(new Filter("PoNum", FilterOperator.EQ, this.PONumber));
                aFilters.push(new Filter("TxtId", FilterOperator.EQ, sFilterCriteria));
                const finalFilter = new Filter({
                    filters: aFilters,
                    and: true
                })
                const data = await this.getData("/POHeaderTextSet", "", [], finalFilter);
                let sHeaderDetails = data.results.map(headerNote => headerNote.TxtLine).join("\n");
                if (bHeaderText && !sHeaderDetails) {
                    sHeaderDetails = "No header text found";
                } else if (!bHeaderText && !sHeaderDetails) {
                    sHeaderDetails = "No header note found";
                }

                this.getView().getModel("appModel").setProperty("/HeaderDetails", "");
                this.getView().getModel("appModel").setProperty("/HeaderTitle", "");
                this.getView().getModel("appModel").refresh(true);
                this.getView().getModel("appModel").setProperty("/HeaderDetails", sHeaderDetails);
                this.getView().getModel("appModel").setProperty("/HeaderTitle", sHeaderTitle);

                if (!oHeaderDetailsPopOver) {
                    oHeaderDetailsPopOver = await this.loadFragment(sFragmentName, this.getView(), this);
                }
                oHeaderDetailsPopOver.openBy(oSourceObj);

            }

        });
    });
