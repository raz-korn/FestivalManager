import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { IconColor } from "sap/ui/core/library";

enum Threshold {
    Moderate = 50,
    Expensive = 150
}

/**
 * @namespace keepdancing.festivalmanager.controller
 */
export default class Festivals extends Controller {

    public onInit(): void {
        const ownerComp = this.getOwnerComponent();
        if (this.getFestivalModel().isA("sap.ui.model.json.JSONModel")) {
            this.getFestivalModel().dataLoaded().then(function() {
                const resourceModel = (ownerComp?.getModel("i18n") as ResourceModel);
                const resourceBundle = (resourceModel.getResourceBundle() as ResourceBundle);
                const message = resourceBundle.getText("msgFestivalDataLoaded") as string;
                MessageToast.show(message, { closeOnBrowserNavigation: false });
            }.bind(this)).catch(function(oErr: Error){
                MessageToast.show(oErr.message, { closeOnBrowserNavigation: false });
            });
        }
    }

    public getFestivalModel(): JSONModel {
        const ownerComp = this.getOwnerComponent();
        const oModel = (ownerComp?.getModel("festivalModel") as JSONModel);
        return oModel;
    }

    formatIconColor(price: number): IconColor|string {
        if (price < Threshold.Moderate) {
            return IconColor.Positive;;
        } else if (price >= Threshold.Moderate && price < Threshold.Expensive) {
            return "#0984e3";
        } else {
            return IconColor.Critical;
        }
    }

}