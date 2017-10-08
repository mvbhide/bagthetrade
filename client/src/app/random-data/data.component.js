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
var chat_service_1 = require('../shared/services/chat.service');
var DataComponent = (function () {
    function DataComponent(chatService) {
        this.chatService = chatService;
        this.randomData = [];
    }
    DataComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.chatService.randomData.subscribe(function (num) {
            _this.randomData.push(num);
            // reset if there are 20 numbers in the array
            if (_this.randomData.length > 20) {
                _this.randomData = [];
            }
        });
    };
    DataComponent = __decorate([
        core_1.Component({
            selector: 'data-component',
            template: "\n\t\t<div class=\"data\">\n\t\t\t<h2>Received data ({{randomData.length}}, reset after 20): </h2>\n\t\t\t<p *ngFor=\"let data of randomData\">{{ data }}</p>\n\t\t</div>\n\t"
        }), 
        __metadata('design:paramtypes', [chat_service_1.ChatService])
    ], DataComponent);
    return DataComponent;
}());
exports.DataComponent = DataComponent;
//# sourceMappingURL=data.component.js.map