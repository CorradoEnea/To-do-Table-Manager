// main.ts

import { 
    Plugin, 
    WorkspaceLeaf, 
    ItemView, 
    TFile 
  } from 'obsidian';
  
  // Se hai bisogno di definire un'interfaccia per Dataview, puoi farlo così (facoltativo)
  /* 
  interface DataviewApi {
    pages(query?: string): any; 
    // ... e altre proprietà/metodi usati da Dataview
    luxon: any; // qui potresti definire le tipizzazioni di Luxon
  }
  */
  
  // Identificatore univoco della view
  const VIEW_TYPE_TODO_TABLE = 'todo-table-view';
  
  export default class TodoTablePlugin extends Plugin {
    async onload(): Promise<void> {
      console.log('Loading TodoTablePlugin');
  
      // Registriamo la nuova view
      this.registerView(
        VIEW_TYPE_TODO_TABLE,
        (leaf: WorkspaceLeaf) => new TodoTableView(leaf, this)
      );
  
      // Aggiunge un'icona a sinistra (Ribbon) per aprire la tabella
      this.addRibbonIcon('checkmark-circle', 'Apri Tabella To-Do', () => {
        this.activateView();
      });
  
      // Oppure aggiungi un comando al Command Palette
      this.addCommand({
        id: 'open-todo-table',
        name: 'Apri Tabella To-Do',
        callback: () => this.activateView()
      });
    }
  
    async onunload(): Promise<void> {
      console.log('Unloading TodoTablePlugin');
    }
  
    /**
     * Apre (o crea, se necessario) un pannello dedicato alla tabella to-do
     */
    private async activateView(): Promise<void> {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TODO_TABLE);
        if (leaves.length > 0) {
          // Se la view esiste già, la mostriamo
          this.app.workspace.revealLeaf(leaves[0]);
        } else {
          // getRightLeaf(false) *potrebbe* restituire null
          const rightLeaf = this.app.workspace.getRightLeaf(false);
      
          if (!rightLeaf) {
            // Qui decidi cosa fare se non esiste nessun leaf a destra:
            // ad esempio, potresti crearne uno nuovo
            const newLeaf = this.app.workspace.getLeaf(false);
            await newLeaf.setViewState({
              type: VIEW_TYPE_TODO_TABLE,
              active: true
            });
          } else {
            // Se il leaf è valido, lo usiamo
            await rightLeaf.setViewState({
              type: VIEW_TYPE_TODO_TABLE,
              active: true
            });
          }
      
          // Riveliamo la nuova view
          const newLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TODO_TABLE);
          if (newLeaves.length > 0) {
            this.app.workspace.revealLeaf(newLeaves[0]);
          }
        }
      }
      
  }
  
  /**
   * Classe che gestisce la View personalizzata.
   * Qui dentro costruiamo la tabella tramite le API di Dataview.
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
      return 'Tabella To-Do';
    }
  
    async onOpen(): Promise<void> {
      // Svuotiamo il contenuto precedente (se esiste)
      this.containerEl.empty();
  
      // Controlliamo se Dataview è disponibile
      // (per semplificare, lo tipizziamo come 'any'; in un progetto più complesso, definisci un'interfaccia)
      const dvApi = (this.app as any).plugins.plugins.dataview?.api;
      if (!dvApi) {
        this.containerEl.createEl('p', {
          text: 'Il plugin Dataview non è attivo o installato. Abilitalo per continuare.'
        });
        return;
      }
  
      // Esempio di query: tutte le note che hanno una proprietà "status" o un tag #todo
      const pages = dvApi.pages().where((p: any) => p.status || p.file.tags?.includes("#todo"));
  
      // Creiamo un container per la tabella
      const table = this.containerEl.createEl('table', { cls: 'todo-table' });
  
      // Creiamo l'header
      const thead = table.createEl('thead');
      const headerRow = thead.createEl('tr');
      ['Elemento', 'Status', 'Data'].forEach((headerText: string) => {
        const th = headerRow.createEl('th');
        th.innerText = headerText;
      });
  
      // Corpo tabella
      const tbody = table.createEl('tbody');
  
      for (const page of pages) {
        const row = tbody.createEl('tr');
        
        // Colonna: Elemento (nome del file con link)
        const cellElement = row.createEl('td');
        const link = cellElement.createEl('a', {
          href: page.file.path
        });
        // Usare il titolo del file (oppure page.file.name) come testo
        link.innerText = page.file.name;
  
        // Colonna: Status (se definito)
        const cellStatus = row.createEl('td');
        cellStatus.innerText = page.status ? page.status : 'N/A';
  
        // Colonna: Data (se esiste un campo "date")
        const cellDate = row.createEl('td');
        if (page.date) {
          // Se "date" è un oggetto di tipo DateTime di Dataview, possiamo formattarlo con Luxon
          cellDate.innerText = dvApi.luxon.DateTime.fromJSDate(page.date)
            .toFormat('dd/LL/yyyy');
        } else {
          cellDate.innerText = 'N/A';
        }
      }
    }
  
    async onClose(): Promise<void> {
      // Azioni opzionali da eseguire alla chiusura della view
    }
  }
  