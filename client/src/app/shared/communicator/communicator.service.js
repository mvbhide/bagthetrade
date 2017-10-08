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
var Subject_1 = require('rxjs/Subject');
var websocket_service_1 = require('../services/websocket.service');
require('rxjs/add/operator/map');
require('rxjs/add/operator/filter');
var DATA_URL = 'ws://localhost:3006';
var CommunicatorService = (function () {
    function CommunicatorService(wsService) {
        this.wsService = wsService;
        this.instream = new Subject_1.Subject();
        this.comm = wsService.connectData(DATA_URL);
        this.instream = this.comm.map(function (response) {
            return response.data;
        });
        this.instream.subscribe(function (data) {
            // Client side Incoming data
            // Possible values
            /*  1. Potential trades
                2. Currently traded ltp and bid/ asks
                3. Trade confirmations along with child trade ids */
            try {
                var objData = JSON.parse(data);
                console.log("parsed data from server ", objData);
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    CommunicatorService.prototype.sendData = function (payload) {
        this.comm.next(payload);
    };
    CommunicatorService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [websocket_service_1.WebSocketService])
    ], CommunicatorService);
    return CommunicatorService;
}());
exports.CommunicatorService = CommunicatorService; // end class ChatService
//# sourceMappingURL=communicator.service.js.map