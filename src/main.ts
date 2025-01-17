import {
  App,
  Plugin,
  WorkspaceLeaf,
  ItemView,
  TFile,
  MarkdownRenderer
} from "obsidian";

// Nome/codice della “view”
const VIEW_TYPE_TODO_TABLE = "todo-table-view";

// Interfaccia di comodo per tipizzare un po' i campi che usiamo
interface TaskPage {
  file: {
    name: string;
    path: string;
    tags: string[];
  };
  status?: string;      // Esempio: "done" | "working" | "stuck" ...
  date?: Date;          // Oppure un DateTime di Dataview
  group?: string;       // Nome del macro-gruppo (X, Y, etc.)
  // Altri campi a tua scelta...
}

export default class TodoTablePlugin extends Plugin {
  async onload(): Promise<void> {
    console.log("Loading TodoTablePlugin (macro-groups + progress)");

    // 1) Registriamo la “view” personalizzata
    this.registerView(
      VIEW_TYPE_TODO_TABLE,
      (leaf) => new TodoTableView(leaf, this)
    );

    // 2) Aggiungiamo un Ribbon Button (icona) in sidebar per aprire direttamente la tabella
    this.addRibbonIcon("checkmark-circle", "Apri Tabella To-Do", () => {
      this.activateView();
    });

    // 3) Aggiungiamo un comando nel Command Palette
    this.addCommand({
      id: "open-todo-table",
      name: "Apri Tabella To-Do (macrogruppi + progress)",
      callback: () => this.activateView()
    });

    // 4) Registriamo un processore di codeblock per embeddare la tabella in una nota
    //    Ad esempio, usando la sintassi: 
    //    ```todo-table
    //    gruppo=Vendite
    //    ```
    //    …oppure vuoto se vogliamo mostrare tutti i gruppi.
    this.registerMarkdownCodeBlockProcessor("todo-table", async (source, el, ctx) => {
      // `source` è il testo dentro il code block
      // Possiamo leggere parametri (es. filtri).
      // Esempio banale: estrai `group=xyz` per filtrare su un singolo gruppo.
      const lines = source.split("\n").map(line => line.trim());
      let groupFilter: string | null = null;
      for (const line of lines) {
        if (line.startsWith("gruppo=")) {
          groupFilter = line.substring("gruppo=".length).trim();
        }
      }
      // Creiamo la tabella “al volo”
      await this.renderTodoTable(el, groupFilter);
    });
  }

  async onunload(): Promise<void> {
    console.log("Unloading TodoTablePlugin");
  }

  /**
   * Richiamata dal Ribbon Button o dal comando,
   * apre/mostra la vista personalizzata in un nuovo pannello (RightLeaf).
   */
  private async activateView(): Promise<void> {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TODO_TABLE);
    if (leaves.length > 0) {
      this.app.workspace.revealLeaf(leaves[0]);
    } else {
      // getRightLeaf(false) potrebbe restituire null -> controlliamo
      const rightLeaf = this.app.workspace.getRightLeaf(false);
      if (rightLeaf) {
        await rightLeaf.setViewState({
          type: VIEW_TYPE_TODO_TABLE,
          active: true
        });
        this.app.workspace.revealLeaf(rightLeaf);
      } else {
        // Se non esiste, creiamone uno generico
        const newLeaf = this.app.workspace.getLeaf(false);
        await newLeaf.setViewState({
          type: VIEW_TYPE_TODO_TABLE,
          active: true
        });
        this.app.workspace.revealLeaf(newLeaf);
      }
    }
  }

  /**
   * Funzione di supporto usata dal codeblock processor.
   * El: container in cui iniettiamo la tabella
   * groupFilter: se presente, filtra solo un gruppo specifico.
   */
  public async renderTodoTable(el: HTMLElement, groupFilter?: string | null) {
    // Verifichiamo che Dataview esista
    const dvApi = (this.app as any).plugins.plugins.dataview?.api;
    if (!dvApi) {
      el.createEl("p", {
        text: "Il plugin Dataview non è attivo o installato. Abilitalo per continuare."
      });
      return;
    }

    // Otteniamo tutte le pagine che hanno "status" e un eventuale "group"
    // (o con tag #todo, se vuoi)
    const pages = dvApi
      .pages()
      .where((p: TaskPage) => p.status || p.file?.tags?.includes("#todo"));

    // Filtriamo per group, se specificato
    let grouped: Map<string, TaskPage[]> = new Map();
    for (const page of pages) {
      // Se p.group è definito, la usiamo come chiave; altrimenti "Senza Gruppo"
      const groupName = page.group ?? "Senza Gruppo";
      // Se l'utente ha specificato un groupFilter, saltiamo i gruppi non corrispondenti
      if (groupFilter && groupFilter !== groupName) continue;

      if (!grouped.has(groupName)) {
        grouped.set(groupName, []);
      }
      grouped.get(groupName)?.push(page);
    }

    // Creiamo un container principale
    const container = el.createDiv({ cls: "todo-table-container" });

    // Per ogni gruppo, creiamo una mini-tabella e una progress bar
    grouped.forEach((groupItems, groupName) => {
      // Titolo del gruppo
      const groupTitle = container.createEl("h2", { cls: "todo-group-title" });
      groupTitle.innerText = groupName;

      // Creiamo la tabella
      const table = container.createEl("table", { cls: "todo-table" });

      // Header
      const thead = table.createEl("thead");
      const headerRow = thead.createEl("tr");
      ["Elemento", "Status", "Data"].forEach((headerText: string) => {
        const th = headerRow.createEl("th");
        th.innerText = headerText;
      });

      // Corpo
      const tbody = table.createEl("tbody");
      for (const item of groupItems) {
        const row = tbody.createEl("tr");

        // Elemento: link al file
        const cellElement = row.createEl("td");
        const link = cellElement.createEl("a", {
          href: item.file.path
        });
        link.innerText = item.file.name;

        // Status
        const cellStatus = row.createEl("td");
        cellStatus.innerText = item.status ?? "N/A";

        // Data
        const cellDate = row.createEl("td");
        if (item.date) {
          // Se date è un oggetto di tipo JS Date o Dataview DateTime
          cellDate.innerText = dvApi.luxon
            ? dvApi.luxon.DateTime.fromJSDate(item.date).toFormat("dd/LL/yyyy")
            : item.date.toString();
        } else {
          cellDate.innerText = "N/A";
        }
      }

      // Calcoliamo e mostriamo la progress bar
      this.renderProgressBar(container, groupItems);
    });

    // Fine “renderTodoTable”
  }

  /**
   * Renderizza una progress bar (o più di una) in base allo stato degli items.
   * In questo esempio, consideriamo "done", "working on it", "stuck".
   */
  private renderProgressBar(parent: HTMLElement, items: TaskPage[]) {
    // Esempio: percentuale di “done” sul totale
    // (Puoi cambiare logica se vuoi contare diversi stati separatamente)
    let doneCount = 0;
    for (const item of items) {
      if (item.status?.toLowerCase() === "done") {
        doneCount++;
      }
    }
    const total = items.length;
    const percent = (doneCount / total) * 100;

    // Crea un container per la progress bar
    const progressContainer = parent.createDiv({ cls: "progress-container" });

    // Esempio di progress bar con <progress> element
    // Alcuni preferiscono un <div> custom con width in %.
    const progressEl = progressContainer.createEl("progress", { cls: "progress-bar" });
    progressEl.setAttribute("max", total.toString());
    progressEl.setAttribute("value", doneCount.toString());

    // Aggiungiamo un'etichetta testuale, se vogliamo
    const label = progressContainer.createEl("div", { cls: "progress-label" });
    label.innerText = `${doneCount}/${total} completate (${percent.toFixed(0)}%)`;

    // Per colorare la progress bar in base al “livello di completamento”
    // potresti aggiungere classi o stili custom, ad es:
    if (percent >= 100) {
      // Tutto completato
      progressEl.addClass("progress-complete");
    } else if (percent > 0) {
      progressEl.addClass("progress-started");
    } else {
      progressEl.addClass("progress-zero");
    }
  }
}

/**
 * La classe che gestisce la “vista” dedicata. Qui per semplicità
 * chiamiamo la stessa “renderTodoTable” che usiamo nel codeblock
 * (così evitiamo di duplicare il codice).
 */
class TodoTableView extends ItemView {
  private plugin: TodoTablePlugin;

  constructor(leaf: WorkspaceLeaf, plugin: TodoTablePlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_TODO_TABLE;
  }

  getDisplayText(): string {
    return "Tabella To-Do (Macrogruppi)";
  }

  async onOpen(): Promise<void> {
    this.containerEl.empty();
    // Mostriamo la “tabella” con tutti i gruppi (nessun filtro)
    await this.plugin.renderTodoTable(this.containerEl, null);
  }

  async onClose(): Promise<void> {
    // Eventuali azioni alla chiusura
  }
}
