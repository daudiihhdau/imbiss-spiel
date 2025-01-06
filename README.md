ws --spa index.html

# Next Goals (12.01)

Vermögen, Tageszeit, Datum - oben im weißen Menü
Ziel setzen - Abfrage (x€ Gewinn)
Luftballons, wenn Ziel erreicht
in der Nacht dunkel
Möglichkeit: Imbiss schließen\Tag beenden
Loop:
    Großhandel - man kann nur so viel kaufen, wie man vermögen hat
    Preise setzen
    Verkaufsstatistiken: Top-Produkte, Uhrzeit

# Big Goal (27.01)

Veröffentlichung im Internet
Szene: Über-uns
Knopf oben: Spende und Kaffee
Knopf oben: Instagram, Twitter, Twitch
Datum DD.MM.YYYY
Anzeige - Wochentag
Menü: Location mieten
Menü: Imbiss kaufen
Hunden klauen Wurst
mehr Essen\Getränke-Items

# Ideen

jedes Lebensmittel: uiid, Haltbarkeit, Zubereitungsart (zeit, Gerät)
Zeitungsansicht vor Tagesbeginn (Wetter, Spaßergnisse, Demo, Ferienbeginn ...)
Jahreszeiten 
Wetter (wenn heiß ist: mehr Eis verkaufen)
Wochenende\Wochentag
Location: kostet Miete
Location: alter Imbiss schreckt Kunden ab (sie gehen vorbei oder reduzieren Bestellung)
Kundenzufriedenheit messen
Kunden: haben immer Emoji-Kopf
verschiedene Welt:Quatschwelt, Weltraumwelt
Welteditor für Konrad
Hunde\Katzen\Papagei\Frösche laufen vorbei
Leute beschweren sich
Brief von den Kunden (gut\schlecht)
Internetbewertungen
Pappteller und Pappbecher kaufen
Saucen kaufen
jeder Imbiss hat Kühlschrank, Friteusen
neue Locationideen: Weihnachtsmarkt, Bahnhof, U-Bahn
Kindergarten\Schulgruppen
jeder Kunde:
    hat einen Namen, Alter, Wohnort, UIId, Zufriedenheit, Temparement (unentschlossen, zuverlässig ...)
    erscheint immer wieder
    merkt sich jedes Essen\Erfahrung
manuelle Location-Auswahl
Bons-Ansicht nach Tagesablauf
Rechnungen per Post


# Warenwirtschaft

//   // Beispielnutzung
//   const imbiss = new ImbissSoftware();
//   imbiss.dispatcher.subscribe('lowStock', (data) => {
//     console.log(`Warnung: Niedriger Bestand bei ${data.name}. Verbleibend: ${data.stock}`);
//   });
  
//   // Verkäufe und Einkäufe
//   imbiss.addSale('Pommes', 2, 2.8); // 2 Pommes verkauft zu je 2.8 Euro
//   imbiss.addSale('Hamburger', 1, 4.2); // 1 Hamburger verkauft zu je 4.2 Euro
//   imbiss.addPurchase('Kaffee', 5, 0.9); // 5 Kaffee eingekauft zu je 0.9 Euro
//   imbiss.addPurchase('Bonbon', 10, 0.25); // 10 Bonbons eingekauft zu je 0.25 Euro
  
//   // Aktueller Bestand
//   const currentStock = imbiss.getCurrentStock();
//   console.log("Aktueller Bestand:", currentStock);
  
//   // Top-Produkte
//   const topProducts = imbiss.getTopProducts();
//   console.log("Top-Produkte:", topProducts);
  
//   // Zeitbasierte Analyse
//   const timeAnalysis = imbiss.getTimeBasedAnalysis();
//   console.log("Zeitbasierte Analyse:", timeAnalysis);
  
//   // Kostenkontrolle
//   const costControl = imbiss.getCostControl();
//   console.log("Kostenkontrolle:", costControl);
  
//   // Statistiken abrufen
//   const stats = imbiss.getStatistics();
//   console.log("Statistiken:", stats);
  
//   // Gewinn berechnen
//   const profit = imbiss.calculateProfit();
//   console.log("Gewinn:", profit);
  
//   // Preislog analysieren
//   const priceLog = imbiss.getPriceLogAnalysis();
//   console.log("Preislogbuch:", priceLog);
  