# 🧪 Testing Checklist - Admin Users Refactoring

## 📋 Pre-Test Setup

- [x] Codice compila senza errori TypeScript
- [x] Nessun errore di linting
- [x] Tutti i componenti shadcn/ui installati (alert-dialog, table, sonner)
- [x] Hook personalizzati creati
- [ ] Server di sviluppo avviato
- [ ] Super admin configurato in .env

---

## 🔐 Test 1: Accesso alla Pagina Admin Users

### Obiettivo
Verificare che solo gli admin possano accedere alla pagina

### Steps
1. [ ] Accedi come utente normale → Dovrebbe mostrare "Unauthorized"
2. [ ] Accedi come admin → Dovrebbe mostrare la pagina
3. [ ] Accedi come super admin → Dovrebbe mostrare la pagina

### Risultato Atteso
- ✅ AdminGuard blocca utenti normali
- ✅ Admin/Super Admin possono vedere la pagina

---

## 📊 Test 2: Visualizzazione Stats Cards

### Obiettivo
Verificare che le card statistiche vengano renderizzate correttamente

### Steps
1. [ ] Aprire `/admin/users`
2. [ ] Verificare la presenza di 4 card:
   - Total Users
   - Active Users
   - Disabled Users
   - Admins

### Risultato Atteso
- ✅ Tutte le card sono visibili
- ✅ I numeri sono corretti
- ✅ Le icone sono visualizzate
- ✅ Le card sono responsive

### Component
`UserStatsCards` (`src/components/admin/users/user-stats-cards.tsx`)

---

## 🔍 Test 3: Filtri e Ricerca

### Obiettivo
Verificare che i filtri funzionino correttamente

### Steps
1. [ ] **Ricerca per email**:
   - Digitare un'email nella barra di ricerca
   - Verificare che la lista venga filtrata
   - Verificare che la paginazione si resetti a pagina 1

2. [ ] **Filtro per ruolo**:
   - Selezionare "Admin" dal dropdown
   - Verificare che vengano mostrati solo gli admin
   - Verificare reset paginazione

3. [ ] **Filtro per status**:
   - Selezionare "Disabled"
   - Verificare che vengano mostrati solo utenti disabilitati

4. [ ] **Clear Filters**:
   - Applicare alcuni filtri
   - Cliccare "Clear Filters"
   - Verificare che tutti i filtri vengano resettati

5. [ ] **Combinazione filtri**:
   - Applicare ricerca + filtro ruolo + filtro status
   - Verificare che funzionino insieme

### Risultato Atteso
- ✅ Ricerca filtra per email in tempo reale
- ✅ Filtri dropdown funzionano
- ✅ Clear filters resetta tutto
- ✅ Paginazione si resetta su cambio filtri

### Components/Hooks
- `UserFilters` (`src/components/admin/users/user-filters.tsx`)
- `useUserFilters` (`src/hooks/use-user-filters.ts`)

---

## 📋 Test 4: Tabella Utenti

### Obiettivo
Verificare che la tabella mostri correttamente tutti i dati

### Steps
1. [ ] Verificare colonne visualizzate:
   - Email
   - Display Name
   - Role (con badge colorato)
   - Status (con badge colorato)
   - Registered At
   - Stats (Tutors, Docs, Conversations)
   - Cost
   - Actions (dropdown)

2. [ ] Verificare formattazione:
   - Date in formato locale
   - Costi in formato valuta
   - Badge con colori appropriati

3. [ ] Verificare stati:
   - Loading spinner durante caricamento
   - Messaggio di errore se fetch fallisce
   - Messaggio "No users" se lista vuota

### Risultato Atteso
- ✅ Tutte le colonne sono visibili e ben formattate
- ✅ Stati loading/error gestiti correttamente
- ✅ Dati visualizzati correttamente

### Components
- `UsersTable` (`src/components/admin/users/users-table.tsx`)
- `UsersTableCard` (`src/components/admin/users/users-table-card.tsx`)

---

## 🔄 Test 5: Paginazione

### Obiettivo
Verificare che la paginazione funzioni correttamente

### Steps
1. [ ] Verificare info paginazione (es: "Page 1 of 3")
2. [ ] Cliccare "Next" → Deve andare alla pagina successiva
3. [ ] Cliccare "Previous" → Deve tornare indietro
4. [ ] Verificare che "Previous" sia disabilitato su pagina 1
5. [ ] Verificare che "Next" sia disabilitato sull'ultima pagina
6. [ ] Applicare un filtro → Verificare reset a pagina 1

### Risultato Atteso
- ✅ Paginazione funziona correttamente
- ✅ Bottoni disabilitati ai limiti
- ✅ Info pagina corrette

### Component
`UsersTableCard` (contiene logica paginazione)

---

## ⚙️ Test 6: Azioni Utente (Super Admin Only)

### Obiettivo
Verificare che tutte le azioni funzionino correttamente

**NOTA**: Questi test sono disponibili SOLO per super admin

### 6.1 Reset Password
1. [ ] Cliccare dropdown azioni su un utente
2. [ ] Selezionare "Reset Password"
3. [ ] Verificare apertura dialog di conferma
4. [ ] Verificare testo dialog (contiene email utente)
5. [ ] Cliccare "Confirm"
6. [ ] Verificare toast di successo
7. [ ] Verificare che il dialog si chiuda

### 6.2 Disable User
1. [ ] Selezionare "Disable User"
2. [ ] Verificare dialog di conferma
3. [ ] Confermare
4. [ ] Verificare toast di successo
5. [ ] Verificare che lo status badge diventi "Disabled"
6. [ ] Verificare aggiornamento stats card

### 6.3 Enable User
1. [ ] Su un utente disabled, selezionare "Enable User"
2. [ ] Confermare nel dialog
3. [ ] Verificare toast di successo
4. [ ] Verificare cambio status a "Active"

### 6.4 Promote to Admin
1. [ ] Su un utente normale, selezionare "Promote to Admin"
2. [ ] Confermare
3. [ ] Verificare toast di successo
4. [ ] Verificare badge role cambia in "Admin"
5. [ ] Verificare aggiornamento stats card (admins count)

### 6.5 Demote to User
1. [ ] Su un admin (non super admin!), selezionare "Demote to User"
2. [ ] Confermare
3. [ ] Verificare toast di successo
4. [ ] Verificare badge role torna a "User"

### 6.6 Delete User
1. [ ] Selezionare "Delete User"
2. [ ] Verificare dialog con avviso importante
3. [ ] Confermare
4. [ ] Verificare toast di successo
5. [ ] Verificare che l'utente sparisca dalla lista
6. [ ] Verificare aggiornamento stats

### 6.7 Cancel Dialog
1. [ ] Aprire qualsiasi azione
2. [ ] Cliccare "Cancel" nel dialog
3. [ ] Verificare che nulla succeda
4. [ ] Verificare che il dialog si chiuda

### Risultato Atteso
- ✅ Tutte le azioni aprono il dialog di conferma
- ✅ Dialog mostra informazioni corrette
- ✅ Conferma esegue l'azione e mostra toast
- ✅ Cancel chiude il dialog senza eseguire
- ✅ Lista si aggiorna dopo ogni azione
- ✅ Stats si aggiornano correttamente

### Components/Hooks
- `useUserActions` (`src/hooks/use-user-actions.ts`)
- `ConfirmationDialog` (`src/components/admin/users/confirmation-dialog.tsx`)
- `useToast` (`src/hooks/use-toast.ts`)

---

## 🔒 Test 7: Permessi (Admin Non-Super)

### Obiettivo
Verificare che un admin normale NON possa fare azioni super admin

### Steps
1. [ ] Accedere come admin normale (non super admin)
2. [ ] Aprire dropdown azioni
3. [ ] Verificare che le seguenti azioni NON siano visibili:
   - Disable User
   - Enable User
   - Delete User
   - Promote to Admin
   - Demote to User
4. [ ] Verificare che "Reset Password" sia visibile

### Risultato Atteso
- ✅ Admin normale vede solo "Reset Password"
- ✅ Super Admin vede tutte le azioni

---

## 🎨 Test 8: Responsive Design

### Obiettivo
Verificare che la UI sia responsive

### Steps
1. [ ] **Desktop (> 1024px)**:
   - Stats cards in griglia 2x2
   - Tabella con tutte le colonne
   - Filtri in riga

2. [ ] **Tablet (768px - 1024px)**:
   - Stats cards in griglia 2x2
   - Tabella scrollabile orizzontalmente
   - Filtri in colonna

3. [ ] **Mobile (< 768px)**:
   - Stats cards in colonna
   - Tabella compatta/scrollabile
   - Filtri in colonna

### Risultato Atteso
- ✅ Layout adattabile a tutte le dimensioni
- ✅ Nessun overflow orizzontale
- ✅ Touch-friendly su mobile

---

## 🧪 Test 9: Error Handling

### Obiettivo
Verificare gestione errori

### Steps
1. [ ] **Network Error**:
   - Disattivare internet
   - Ricaricare pagina
   - Verificare messaggio di errore

2. [ ] **Action Error**:
   - Simulare un errore (es: modificare API per restituire 500)
   - Eseguire un'azione
   - Verificare toast di errore con messaggio

3. [ ] **Empty State**:
   - Applicare filtri che non danno risultati
   - Verificare messaggio "No users found"

### Risultato Atteso
- ✅ Errori mostrati con messaggi chiari
- ✅ UI non crasha
- ✅ Utente può riprovare

---

## 🔄 Test 10: State Management

### Obiettivo
Verificare che lo stato sia gestito correttamente

### Steps
1. [ ] Applicare filtri
2. [ ] Navigare ad altra pagina admin
3. [ ] Tornare a Users page
4. [ ] Verificare che i filtri siano stati resettati (comportamento corretto)

5. [ ] Eseguire un'azione (es: disable user)
6. [ ] Verificare che la lista si aggiorni automaticamente
7. [ ] Verificare che le stats si aggiornino

### Risultato Atteso
- ✅ Stato locale resettato su navigazione
- ✅ Lista si ricarica dopo azioni
- ✅ Nessun dato stale

---

## 📱 Test 11: Toast Notifications

### Obiettivo
Verificare che i toast vengano mostrati correttamente

### Steps
1. [ ] Eseguire un'azione di successo → Toast verde con checkmark
2. [ ] Eseguire un'azione che fallisce → Toast rosso con errore
3. [ ] Eseguire più azioni rapide → Verificare che i toast si stackino
4. [ ] Verificare che i toast scompaiano dopo qualche secondo

### Risultato Atteso
- ✅ Toast di successo sono verdi
- ✅ Toast di errore sono rossi
- ✅ Toast auto-dismiss dopo 3-5 secondi
- ✅ Toast contengono messaggi chiari

### Hook
`useToast` (basato su sonner)

---

## 🎯 Test 12: Performance

### Obiettivo
Verificare che l'app sia performante

### Steps
1. [ ] Aprire DevTools → Performance tab
2. [ ] Ricaricare pagina
3. [ ] Verificare tempi di caricamento
4. [ ] Applicare filtri → Verificare re-render
5. [ ] Eseguire azioni → Verificare update

### Risultato Atteso
- ✅ Caricamento iniziale < 2s
- ✅ Filtri rispondono istantaneamente
- ✅ Nessun re-render inutile
- ✅ Smooth animations

---

## 🔍 Test 13: Accessibility (a11y)

### Obiettivo
Verificare accessibilità

### Steps
1. [ ] Navigare con TAB → Tutti gli elementi focusabili
2. [ ] Premere ENTER su bottoni → Devono funzionare
3. [ ] Usare screen reader → Verificare labels
4. [ ] Verificare contrasto colori (WCAG AA)

### Risultato Atteso
- ✅ Navigazione completa con tastiera
- ✅ Focus visibile su tutti gli elementi
- ✅ Screen reader legge correttamente
- ✅ Contrasto adeguato

---

## 📝 Test 14: Console Errors

### Obiettivo
Verificare assenza di errori/warning in console

### Steps
1. [ ] Aprire DevTools → Console
2. [ ] Navigare pagina admin
3. [ ] Eseguire tutte le azioni
4. [ ] Verificare console pulita

### Risultato Atteso
- ✅ Nessun errore in console
- ✅ Nessun warning React
- ✅ Nessun warning TypeScript

---

## ✅ Checklist Finale

### Pre-Commit
- [ ] Tutti i test passati
- [ ] Nessun errore in console
- [ ] Codice formattato
- [ ] Linting pulito
- [ ] TypeScript compila
- [ ] Build production passa

### Documentation
- [ ] README aggiornato
- [ ] SRP_REFACTORING.md aggiornato
- [ ] Commenti nel codice chiari

### Git
- [ ] Commit con messaggio descrittivo
- [ ] Branch up to date con main

---

## 🎉 Test Completati

**Data**: __________

**Tester**: __________

**Risultato**: ☐ PASS | ☐ FAIL

**Note**:

