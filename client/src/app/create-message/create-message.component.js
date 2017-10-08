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
var CreateMessage = (function () {
    function CreateMessage(chatService) {
        this.chatService = chatService;
        this.message = {
            author: 'peter',
            message: ''
        };
    }
    CreateMessage.prototype.sendMsg = function () {
        // console.log('new message from client: ', this.message);
        this.chatService.messages.next(this.message);
        this.message.message = '';
    };
    CreateMessage = __decorate([
        core_1.Component({
            selector: 'create-message',
            template: "\n\t<h2>New message:</h2>\t\n\t\t  <div class=\"input-group col-xs-8\">\t\t   \n                <input\n                    [(ngModel)]=\"message.message\"\n                    name=\"msg\"                    \n                    type=\"text\"\n                    class=\"form-control\"\n                    placeholder=\"message...\">\n                <span class=\"input-group-btn\">\n                    <button                       \n                        class=\"btn btn-secondary\"\n                        (click)=\"sendMsg()\">send</button>\n                </span>\n            </div>\n\t\n\t",
        }), 
        __metadata('design:paramtypes', [chat_service_1.ChatService])
    ], CreateMessage);
    return CreateMessage;
}());
exports.CreateMessage = CreateMessage;
//# sourceMappingURL=create-message.component.js.map