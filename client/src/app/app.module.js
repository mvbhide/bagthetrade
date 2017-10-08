"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// modules
var core_1 = require('@angular/core');
var platform_browser_1 = require('@angular/platform-browser');
var forms_1 = require('@angular/forms');
// services
var chat_service_1 = require('./shared/services/chat.service');
var websocket_service_1 = require('./shared/services/websocket.service');
var communicator_service_1 = require('./shared/communicator/communicator.service');
// components
var app_component_1 = require('./app.component');
var create_message_component_1 = require('./create-message/create-message.component');
var chat_component_1 = require('./chat/chat.component');
var data_component_1 = require("./random-data/data.component");
var stock_list_component_1 = require("./stock-list/stock-list.component");
var order_form_component_1 = require("./order/order-form.component");
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [platform_browser_1.BrowserModule, forms_1.FormsModule],
            declarations: [
                app_component_1.AppComponent,
                chat_component_1.ChatComponent,
                create_message_component_1.CreateMessage,
                data_component_1.DataComponent,
                stock_list_component_1.StockListComponent,
                order_form_component_1.OrderFormComponent
            ],
            providers: [chat_service_1.ChatService, websocket_service_1.WebSocketService, communicator_service_1.CommunicatorService],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map