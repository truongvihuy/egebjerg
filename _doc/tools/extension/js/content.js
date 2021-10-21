document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    let eleList = document.querySelectorAll('.responsive_module_admin_menu a');
    eleList.forEach(function(item) {
      console.log(item.innerHTML)
      switch (item.outerText) {
        case 'Status':
        case 'Lager lokationer':
        case 'Tags':
        case 'Kurve':
        case 'Fakturaer':
        case 'Valutaer':
        case 'Tilbud':
        case 'Afgifter':
        case 'Fragtfirmaer':
        case 'Rabatkuponer':
        case 'Fakturatekster':
        case 'Fragt klippekort':
        case 'RMA Sager':
        case 'Chauffører':
        case 'Salgs statistikker':
        case 'Rute':
        case 'Kommunekort':
        case 'Daglig rapport':
        case 'Selvhenter':
        case 'Store produkter':
        case 'Leveringsvirksomheder':
        case 'Importer produkter fra COOP':
        case 'Opskrifter':
        case 'Kategorier af opskrifter':
        case 'Basket typer':
        case 'Badges':
        case 'Personer':
        case 'Opskrift ugeplan':
        case 'Advarsler':
        case 'Faktura til butikker':
        case 'Rabatgrupper':
        case 'Sorter tilbudsprodukter':
        case 'Statistik over vareinformation':
        case 'betalingsrapport':
        case 'Gemt betalingskort':
        case 'Daglig rapport (Packing Center)':
        case 'Fragt':
        case 'Nummerserier':
          item.style.display = 'none';
          break;
        
        case 'Betalingsmetoder':
          break;
        case 'Top 50 produkter':
        case 'Ordrer':
        case 'Opret ordre':
        case 'PBS indstillinger':
        case 'Administration tilbudsavis':
        case 'Produkter':
        case 'Varianter':
        case 'Producenter':
        case 'Indstillinger':
        case 'Katalog':
        case 'Kunder':
        case 'Brugser':
        case 'Kommuner':
        case 'Postnumre':
        case 'Slettede kunder':
        case 'Hæv Ordre':
        case 'Refunder Ordre':
            item.innerHTML = " ✅ " + item.innerHTML;
            break;
        default:
          item.setAttribute('style', 'color: #06F !important');
          break;
      }
    });
  }
};
