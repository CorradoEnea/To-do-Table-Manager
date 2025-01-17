'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : undefined, done: true };
    }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

// main.ts
// Se hai bisogno di definire un'interfaccia per Dataview, puoi farlo così (facoltativo)
/*
interface DataviewApi {
  pages(query?: string): any;
  // ... e altre proprietà/metodi usati da Dataview
  luxon: any; // qui potresti definire le tipizzazioni di Luxon
}
*/
// Identificatore univoco della view
var VIEW_TYPE_TODO_TABLE = 'todo-table-view';
var TodoTablePlugin = /** @class */ (function (_super) {
    __extends(TodoTablePlugin, _super);
    function TodoTablePlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TodoTablePlugin.prototype.onload = function () {
        return __awaiter(this, undefined, undefined, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log('Loading TodoTablePlugin');
                // Registriamo la nuova view
                this.registerView(VIEW_TYPE_TODO_TABLE, function (leaf) { return new TodoTableView(leaf, _this); });
                // Aggiunge un'icona a sinistra (Ribbon) per aprire la tabella
                this.addRibbonIcon('checkmark-circle', 'Apri Tabella To-Do', function () {
                    _this.activateView();
                });
                // Oppure aggiungi un comando al Command Palette
                this.addCommand({
                    id: 'open-todo-table',
                    name: 'Apri Tabella To-Do',
                    callback: function () { return _this.activateView(); }
                });
                return [2 /*return*/];
            });
        });
    };
    TodoTablePlugin.prototype.onunload = function () {
        return __awaiter(this, undefined, undefined, function () {
            return __generator(this, function (_a) {
                console.log('Unloading TodoTablePlugin');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Apre (o crea, se necessario) un pannello dedicato alla tabella to-do
     */
    TodoTablePlugin.prototype.activateView = function () {
        return __awaiter(this, undefined, undefined, function () {
            var leaves, rightLeaf, newLeaf, newLeaves;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TODO_TABLE);
                        if (!(leaves.length > 0)) return [3 /*break*/, 1];
                        // Se la view esiste già, la mostriamo
                        this.app.workspace.revealLeaf(leaves[0]);
                        return [3 /*break*/, 6];
                    case 1:
                        rightLeaf = this.app.workspace.getRightLeaf(false);
                        if (!!rightLeaf) return [3 /*break*/, 3];
                        newLeaf = this.app.workspace.getLeaf(false);
                        return [4 /*yield*/, newLeaf.setViewState({
                                type: VIEW_TYPE_TODO_TABLE,
                                active: true
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: 
                    // Se il leaf è valido, lo usiamo
                    return [4 /*yield*/, rightLeaf.setViewState({
                            type: VIEW_TYPE_TODO_TABLE,
                            active: true
                        })];
                    case 4:
                        // Se il leaf è valido, lo usiamo
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        newLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TODO_TABLE);
                        if (newLeaves.length > 0) {
                            this.app.workspace.revealLeaf(newLeaves[0]);
                        }
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return TodoTablePlugin;
}(obsidian.Plugin));
/**
 * Classe che gestisce la View personalizzata.
 * Qui dentro costruiamo la tabella tramite le API di Dataview.
 */
var TodoTableView = /** @class */ (function (_super) {
    __extends(TodoTableView, _super);
    function TodoTableView(leaf, plugin) {
        var _this = _super.call(this, leaf) || this;
        _this.plugin = plugin;
        return _this;
    }
    TodoTableView.prototype.getViewType = function () {
        return VIEW_TYPE_TODO_TABLE;
    };
    TodoTableView.prototype.getDisplayText = function () {
        return 'Tabella To-Do';
    };
    TodoTableView.prototype.onOpen = function () {
        return __awaiter(this, undefined, undefined, function () {
            var dvApi, pages, table, thead, headerRow, tbody, _i, pages_1, page, row, cellElement, link, cellStatus, cellDate;
            var _a;
            return __generator(this, function (_b) {
                // Svuotiamo il contenuto precedente (se esiste)
                this.containerEl.empty();
                dvApi = (_a = this.app.plugins.plugins.dataview) === null || _a === undefined ? undefined : _a.api;
                if (!dvApi) {
                    this.containerEl.createEl('p', {
                        text: 'Il plugin Dataview non è attivo o installato. Abilitalo per continuare.'
                    });
                    return [2 /*return*/];
                }
                pages = dvApi.pages().where(function (p) { var _a; return p.status || ((_a = p.file.tags) === null || _a === undefined ? undefined : _a.includes("#todo")); });
                table = this.containerEl.createEl('table', { cls: 'todo-table' });
                thead = table.createEl('thead');
                headerRow = thead.createEl('tr');
                ['Elemento', 'Status', 'Data'].forEach(function (headerText) {
                    var th = headerRow.createEl('th');
                    th.innerText = headerText;
                });
                tbody = table.createEl('tbody');
                for (_i = 0, pages_1 = pages; _i < pages_1.length; _i++) {
                    page = pages_1[_i];
                    row = tbody.createEl('tr');
                    cellElement = row.createEl('td');
                    link = cellElement.createEl('a', {
                        href: page.file.path
                    });
                    // Usare il titolo del file (oppure page.file.name) come testo
                    link.innerText = page.file.name;
                    cellStatus = row.createEl('td');
                    cellStatus.innerText = page.status ? page.status : 'N/A';
                    cellDate = row.createEl('td');
                    if (page.date) {
                        // Se "date" è un oggetto di tipo DateTime di Dataview, possiamo formattarlo con Luxon
                        cellDate.innerText = dvApi.luxon.DateTime.fromJSDate(page.date)
                            .toFormat('dd/LL/yyyy');
                    }
                    else {
                        cellDate.innerText = 'N/A';
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    TodoTableView.prototype.onClose = function () {
        return __awaiter(this, undefined, undefined, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return TodoTableView;
}(obsidian.ItemView));

module.exports = TodoTablePlugin;
