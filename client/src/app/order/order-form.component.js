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
var OrderFormComponent = (function () {
    function OrderFormComponent() {
        this.transactionType = 'BUY';
    }
    OrderFormComponent.prototype.toggleTransactionType = function () {
        this.transactionType = this.transactionType == 'BUY' ? 'SELL' : 'BUY';
    };
    OrderFormComponent = __decorate([
        core_1.Component({
            selector: 'order-form',
            template: "\n\t<div class=\"order-form-container\">\n\t\t<div class='order-form' [ngClass]=\"{'buy-colored': transactionType == 'BUY', 'sell-colored' : transactionType == 'SELL'}\">\n\t\t\t<form>\n\t\t\t\t<div class=\"change-transaction-type\" (click)=\"toggleTransactionType();\"></div>\n\t\t\t\t<ul class=\"order-category form-group\" >\n\t\t\t\t\t<li><input class=\"form-control\" type='radio' name=\"order-type\" id=\"orderTypeBO\" value=\"BO\" checked><label for=\"orderTypeBO\">BO</label></li>\n\t\t\t\t\t<li><input class=\"form-control\" type='radio' name=\"order-type\" id=\"orderTypeCO\" value=\"CO\"><label for=\"orderTypeCO\">CO</label></li>\n\t\t\t\t\t<li><input class=\"form-control\" type='radio' name=\"order-type\" id=\"orderTypeCNC\" value=\"CNC\"><label for=\"orderTypeCNC\">CNC</label></li>\n\t\t\t\t</ul>\n\t\t\t\t<div class=\"form-group\">\n\t\t\t\t\t<input class=\"form-control\" type=\"text\" value=\"\" id=\"triggerPrice\" />\n\t\t\t\t\t<label for=\"triggerPrice\"> Stop Loss</label>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"form-group\">\n\t\t\t\t\t<input class=\"form-control\" type=\"text\" value=\"\" />\n\t\t\t\t\t<label for=\"orderPrice\"> Order Price</label>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"form-group\">\n\t\t\t\t\t<input class=\"form-control\" type=\"text\" value=\"\" id=\"targetPrice\"/>\n\t\t\t\t\t<label for=\"targetPrice\"> Target</label>\n\t\t\t\t</div>\n\n\t\t\t</form>\n\t\t</div>\n\t</div>\n\t",
            styles: ["\n\t\t.order-form {\n\t\t\tpadding: 15px;\n\t\t\tbox-shadow: 2px 2px 4px 4px #DDD;\n\t\t}\n\n\t\t.order-form ul li {\n\t\t\tlist-style: none;\n\t\t}\n\n\t\t.order-form label {\n\t\t\tcolor: #FFF;\n\t\t}\n\t\t.change-transaction-type {\n\n\t\t}\n\t"]
        }), 
        __metadata('design:paramtypes', [])
    ], OrderFormComponent);
    return OrderFormComponent;
}());
exports.OrderFormComponent = OrderFormComponent;
//# sourceMappingURL=order-form.component.js.map