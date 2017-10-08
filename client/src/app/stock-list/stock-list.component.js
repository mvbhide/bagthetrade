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
var core_1 = require('@angular/core');
var communicator_service_1 = require('../shared/communicator/communicator.service');
var StockListComponent = (function () {
    function StockListComponent(cs) {
        this.cs = cs;
        this.stocks = [{ "tradingsymbol": 'TCS', ltp: 2200 }, { "tradingsymbol": 'INFY', ltp: 951 }];
    }
    StockListComponent.prototype.takethistrade = function (stock) {
        console.log(stock);
        this.cs.sendData(stock);
    };
    StockListComponent = __decorate([
        core_1.Component({
            selector: 'stock-list',
            template: "\n\t<div class=\"stock-list\">\n\t\t<ul class=\"list-group\">\n\t\t\t<li *ngFor=\"let stock of stocks\" class=\"list-group-item\">\n\t\t\t\t<div class=\"stock-list-item\">\n\t\t\t\t\t<ul>\n\t\t\t\t\t\t<li>{{stock.name}}</li>\n\t\t\t\t\t\t<li>{{stock.ltp}}</li>\n\t\t\t\t\t\t<li><a class=\"btn btn-default\" (click)=\"takethistrade(stock)\">Take this trade</a></li>\n\t\t\t\t\t</ul>\n\t\t\t\t</div>\n\t\t\t</li>\n\t\t</ul>\n\t</div>\n\t\n\t",
        }), 
        __metadata('design:paramtypes', [communicator_service_1.CommunicatorService])
    ], StockListComponent);
    return StockListComponent;
}());
exports.StockListComponent = StockListComponent;
//# sourceMappingURL=stock-list.component.js.map