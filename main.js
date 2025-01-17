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

// Nome/codice della “view”
var VIEW_TYPE_TODO_TABLE = "todo-table-view";
var TodoTablePlugin = /** @class */ (function (_super) {
    __extends(TodoTablePlugin, _super);
    function TodoTablePlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TodoTablePlugin.prototype.onload = function () {
        return __awaiter(this, undefined, undefined, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log("Loading TodoTablePlugin (macro-groups + progress)");
                // 1) Registriamo la “view” personalizzata
                this.registerView(VIEW_TYPE_TODO_TABLE, function (leaf) { return new TodoTableView(leaf, _this); });
                // 2) Aggiungiamo un Ribbon Button (icona) in sidebar per aprire direttamente la tabella
                this.addRibbonIcon("checkmark-circle", "Apri Tabella To-Do", function () {
                    _this.activateView();
                });
                // 3) Aggiungiamo un comando nel Command Palette
                this.addCommand({
                    id: "open-todo-table",
                    name: "Apri Tabella To-Do (macrogruppi + progress)",
                    callback: function () { return _this.activateView(); }
                });
                // 4) Registriamo un processore di codeblock per embeddare la tabella in una nota
                //    Ad esempio, usando la sintassi: 
                //    ```todo-table
                //    gruppo=Vendite
                //    ```
                //    …oppure vuoto se vogliamo mostrare tutti i gruppi.
                this.registerMarkdownCodeBlockProcessor("todo-table", function (source, el, ctx) { return __awaiter(_this, undefined, undefined, function () {
                    var lines, groupFilter, _i, lines_1, line;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                lines = source.split("\n").map(function (line) { return line.trim(); });
                                groupFilter = null;
                                for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                                    line = lines_1[_i];
                                    if (line.startsWith("gruppo=")) {
                                        groupFilter = line.substring("gruppo=".length).trim();
                                    }
                                }
                                // Creiamo la tabella “al volo”
                                return [4 /*yield*/, this.renderTodoTable(el, groupFilter)];
                            case 1:
                                // Creiamo la tabella “al volo”
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    TodoTablePlugin.prototype.onunload = function () {
        return __awaiter(this, undefined, undefined, function () {
            return __generator(this, function (_a) {
                console.log("Unloading TodoTablePlugin");
                return [2 /*return*/];
            });
        });
    };
    /**
     * Richiamata dal Ribbon Button o dal comando,
     * apre/mostra la vista personalizzata in un nuovo pannello (RightLeaf).
     */
    TodoTablePlugin.prototype.activateView = function () {
        return __awaiter(this, undefined, undefined, function () {
            var leaves, rightLeaf, newLeaf;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TODO_TABLE);
                        if (!(leaves.length > 0)) return [3 /*break*/, 1];
                        this.app.workspace.revealLeaf(leaves[0]);
                        return [3 /*break*/, 5];
                    case 1:
                        rightLeaf = this.app.workspace.getRightLeaf(false);
                        if (!rightLeaf) return [3 /*break*/, 3];
                        return [4 /*yield*/, rightLeaf.setViewState({
                                type: VIEW_TYPE_TODO_TABLE,
                                active: true
                            })];
                    case 2:
                        _a.sent();
                        this.app.workspace.revealLeaf(rightLeaf);
                        return [3 /*break*/, 5];
                    case 3:
                        newLeaf = this.app.workspace.getLeaf(false);
                        return [4 /*yield*/, newLeaf.setViewState({
                                type: VIEW_TYPE_TODO_TABLE,
                                active: true
                            })];
                    case 4:
                        _a.sent();
                        this.app.workspace.revealLeaf(newLeaf);
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Funzione di supporto usata dal codeblock processor.
     * El: container in cui iniettiamo la tabella
     * groupFilter: se presente, filtra solo un gruppo specifico.
     */
    TodoTablePlugin.prototype.renderTodoTable = function (el, groupFilter) {
        return __awaiter(this, undefined, undefined, function () {
            var dvApi, pages, grouped, _i, pages_1, page, groupName, container;
            var _this = this;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                dvApi = (_a = this.app.plugins.plugins.dataview) === null || _a === undefined ? undefined : _a.api;
                if (!dvApi) {
                    el.createEl("p", {
                        text: "Il plugin Dataview non è attivo o installato. Abilitalo per continuare."
                    });
                    return [2 /*return*/];
                }
                pages = dvApi
                    .pages()
                    .where(function (p) { var _a, _b; return p.status || ((_b = (_a = p.file) === null || _a === undefined ? undefined : _a.tags) === null || _b === undefined ? undefined : _b.includes("#todo")); });
                grouped = new Map();
                for (_i = 0, pages_1 = pages; _i < pages_1.length; _i++) {
                    page = pages_1[_i];
                    groupName = (_b = page.group) !== null && _b !== undefined ? _b : "Senza Gruppo";
                    // Se l'utente ha specificato un groupFilter, saltiamo i gruppi non corrispondenti
                    if (groupFilter && groupFilter !== groupName)
                        continue;
                    if (!grouped.has(groupName)) {
                        grouped.set(groupName, []);
                    }
                    (_c = grouped.get(groupName)) === null || _c === undefined ? undefined : _c.push(page);
                }
                container = el.createDiv({ cls: "todo-table-container" });
                // Per ogni gruppo, creiamo una mini-tabella e una progress bar
                grouped.forEach(function (groupItems, groupName) {
                    var _a;
                    // Titolo del gruppo
                    var groupTitle = container.createEl("h2", { cls: "todo-group-title" });
                    groupTitle.innerText = groupName;
                    // Creiamo la tabella
                    var table = container.createEl("table", { cls: "todo-table" });
                    // Header
                    var thead = table.createEl("thead");
                    var headerRow = thead.createEl("tr");
                    ["Elemento", "Status", "Data"].forEach(function (headerText) {
                        var th = headerRow.createEl("th");
                        th.innerText = headerText;
                    });
                    // Corpo
                    var tbody = table.createEl("tbody");
                    for (var _i = 0, groupItems_1 = groupItems; _i < groupItems_1.length; _i++) {
                        var item = groupItems_1[_i];
                        var row = tbody.createEl("tr");
                        // Elemento: link al file
                        var cellElement = row.createEl("td");
                        var link = cellElement.createEl("a", {
                            href: item.file.path
                        });
                        link.innerText = item.file.name;
                        // Status
                        var cellStatus = row.createEl("td");
                        cellStatus.innerText = (_a = item.status) !== null && _a !== undefined ? _a : "N/A";
                        // Data
                        var cellDate = row.createEl("td");
                        if (item.date) {
                            // Se date è un oggetto di tipo JS Date o Dataview DateTime
                            cellDate.innerText = dvApi.luxon
                                ? dvApi.luxon.DateTime.fromJSDate(item.date).toFormat("dd/LL/yyyy")
                                : item.date.toString();
                        }
                        else {
                            cellDate.innerText = "N/A";
                        }
                    }
                    // Calcoliamo e mostriamo la progress bar
                    _this.renderProgressBar(container, groupItems);
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Renderizza una progress bar (o più di una) in base allo stato degli items.
     * In questo esempio, consideriamo "done", "working on it", "stuck".
     */
    TodoTablePlugin.prototype.renderProgressBar = function (parent, items) {
        var _a;
        // Esempio: percentuale di “done” sul totale
        // (Puoi cambiare logica se vuoi contare diversi stati separatamente)
        var doneCount = 0;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            if (((_a = item.status) === null || _a === undefined ? undefined : _a.toLowerCase()) === "done") {
                doneCount++;
            }
        }
        var total = items.length;
        var percent = (doneCount / total) * 100;
        // Crea un container per la progress bar
        var progressContainer = parent.createDiv({ cls: "progress-container" });
        // Esempio di progress bar con <progress> element
        // Alcuni preferiscono un <div> custom con width in %.
        var progressEl = progressContainer.createEl("progress", { cls: "progress-bar" });
        progressEl.setAttribute("max", total.toString());
        progressEl.setAttribute("value", doneCount.toString());
        // Aggiungiamo un'etichetta testuale, se vogliamo
        var label = progressContainer.createEl("div", { cls: "progress-label" });
        label.innerText = "".concat(doneCount, "/").concat(total, " completate (").concat(percent.toFixed(0), "%)");
        // Per colorare la progress bar in base al “livello di completamento”
        // potresti aggiungere classi o stili custom, ad es:
        if (percent >= 100) {
            // Tutto completato
            progressEl.addClass("progress-complete");
        }
        else if (percent > 0) {
            progressEl.addClass("progress-started");
        }
        else {
            progressEl.addClass("progress-zero");
        }
    };
    return TodoTablePlugin;
}(obsidian.Plugin));
/**
 * La classe che gestisce la “vista” dedicata. Qui per semplicità
 * chiamiamo la stessa “renderTodoTable” che usiamo nel codeblock
 * (così evitiamo di duplicare il codice).
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
        return "Tabella To-Do (Macrogruppi)";
    };
    TodoTableView.prototype.onOpen = function () {
        return __awaiter(this, undefined, undefined, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.containerEl.empty();
                        // Mostriamo la “tabella” con tutti i gruppi (nessun filtro)
                        return [4 /*yield*/, this.plugin.renderTodoTable(this.containerEl, null)];
                    case 1:
                        // Mostriamo la “tabella” con tutti i gruppi (nessun filtro)
                        _a.sent();
                        return [2 /*return*/];
                }
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
