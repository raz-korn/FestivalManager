import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { IconColor } from "sap/ui/core/library";
import ListBinding from "sap/ui/model/ListBinding";
import Filter from "sap/ui/model/Filter";
import Event from "sap/ui/base/Event";
import SelectDialog from "sap/m/SelectDialog";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import StandardListItem from "sap/m/StandardListItem";

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

    private customFilters: Filter[] = [];
    private statusFilters: Filter[] = [];

    onFestivalSelect(event: Event): void {

        const listBinding = this.getView()?.byId("festivalsList")?.getBinding("items") as ListBinding;
        const key = (event.getParameter("key") as string);

        if (key === "Cheap") {
            this.statusFilters = [new Filter("price", "LT", Threshold.Moderate, false)];
        } else if (key === "Moderate") {
            this.statusFilters = [new Filter("price", "BT", Threshold.Moderate, Threshold.Expensive)];
        } else if (key === "Expensive") {
            this.statusFilters = [new Filter("price", "GT", Threshold.Expensive, false)];
        } else {
            this.statusFilters = [];
        }

        listBinding.filter(this.statusFilters.concat(this.customFilters));
    }

    private dialog: Promise<SelectDialog>;

    onCategorySelect(): void{
        if(!(this.dialog instanceof Promise)) {

            const festivalModel = this.getFestivalModel();
            const resourceModel = this.getView()?.getModel("i18n") as ResourceModel;

            this.dialog = Fragment.load({
                type: "XML",
                name: "keepdancing.festivalmanager.view.CategorySelectDialog",
                controller: this
            }).then(function(control: Control|Control[]){
                const dialog = (control instanceof Array ? control[0] : control) as SelectDialog;
                dialog.setModel(festivalModel, "festivalModel");
                dialog.setModel(resourceModel, "i18n");
                dialog.setMultiSelect(true);
                return dialog;
            });
        }

        this.dialog.then(function(dialog){
            dialog.open("");
        }).catch(function(err: Error){
            MessageToast.show(err.message);
        });
    }
    
    onCategorySelectChange(event: Event): void {
        const value = (event.getParameter("value") as string);
        const filter = new Filter("name", "Contains", value);
        const listBinding = (event.getSource() as Control).getBinding("items") as ListBinding;
        listBinding.filter([filter]);
    }

    onCategorySelectConfirm(event: Event): void {
        const selectedItems = (event.getParameter("selectedItems") as StandardListItem[]);
        const listBinding = this.getView()?.byId("festivalsList")?.getBinding("items") as ListBinding;
        this.customFilters = selectedItems.map(function(item: StandardListItem) {
            return new Filter("category", "EQ", item.getTitle());
        });
        listBinding.filter(this.customFilters.concat(this.statusFilters));
    }
    
}