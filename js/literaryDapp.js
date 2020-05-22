// Documentation
// https://github.com/ethereum/wiki/wiki/JavaScript-API

//1. Caricare web3 e lanciare la funzione startApp (che lavora come una main)
window.addEventListener('load', function () {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3 = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    // Now you can start your app & access web3 freely:
    window.ethereum.enable(startApp())

});

//creo una variabile globale per l'address del contratto
var cAddress;
var myaddress = web3.eth.accounts[0];
var numberOfCompositions = 0;
var aComposition = {title: "", text: "", id: 0, published: false, votes: 0};


//2. definisco la funzione startApp

var startApp = function () {

    //quando il documento è pronto
    $(document).ready(function () {


        $("#buttonSub").click(function () {
            cAddress = document.getElementById("cAddress").value;

            //Verifico che sia un address valido (è sincrono e non serve callback)
            if (web3.isAddress(cAddress)) {

                loadContractInfo(cAddress, showNumberOfComposition);

            } else {
                alert('There was an error fetching your accounts.');

            }
            showSelector();
            //getNumberOfCompositions

        });
    });
}


//Esercizio 4
var loadContractInfo = function (address, callback) {
   callback("TODO");

}


var showNumberOfComposition = function (noc) {
    var contentRow = $('#numberOfcontentRow');
    contentRow.find(".numberOfworks").text(noc);
    showSelector(noc)
}


//popola il selettore verticale
var showSelector = function (noc) {
    selectorHtml = "";
    for (i = 1; i <= noc; i++) {
        selectorHtml += "<option " + "id=comp value=" + i + ">" + "composition" + i + "</option>";
    }
    $("#sel1").html(selectorHtml);
}


//Pulsante per leggere l'elemento selezionato e per lanciare il caricaricamento dati.
$(document).ready(function () {
    $("#buttonLoad").click(function () {
        var selected = $("#sel1").val();
        loadComposition(selected, showComposition);
    });

});

//caricamento dalla blockchain dei dati dell'elemento scelto
var loadComposition = function (id, callback) {
    numberOfCompositions = 0;
    aComposition.id = id;
    $.getJSON("solidity/LiteraryWorks.abi.json", function (cABI) {

        const LWContract = web3.eth.contract(cABI).at(cAddress);
        LWContract.getTitle.call(id,
            (err, res) => {
                if (err != null) {
                    console.log(err);
                } else {
                    aComposition.title = res;
                    LWContract.getText.call(id,
                        (err, res) => {
                            if (err != null) {
                                console.log(err);
                            } else {
                                aComposition.text = res;
                                LWContract.getVotes.call(id,
                                    (err, res) => {
                                        if (err != null) {
                                            console.log(err);
                                        } else {
                                            aComposition.votes = res;
                                            LWContract.getIsPublished.call(id,
                                                (err, res) => {
                                                    if (err != null) {
                                                        console.log(err);
                                                    } else {
                                                        aComposition.published = res;
                                                        callback(aComposition);
                                                    }
                                                });
                                        }
                                    });

                            }

                        });
                }
            });
    });
}


//visualizzazione dati dell'elemento scelto
var showComposition = function (aComposition) {
    var compositionTemplate = $('#compositionTemplate');
    var compositionRow = $('#compositionRow');
    compositionTemplate.find(".panel-title").text(aComposition.title);
    compositionTemplate.find(".composition-text").text(aComposition.text);
    compositionTemplate.find(".composition-ID").text(aComposition.id);

    //Controllo se è pubblicata. Se non lo è disattivo il pulsante
    if (aComposition.published) {
        compositionTemplate.find('.btn-vote').val(aComposition.id);
    } else {
        compositionTemplate.find('.btn-vote').toggleClass("active disabled");
    }

    compositionTemplate.find(".composition-votes").text(aComposition.votes);
    compositionTemplate.find('.composition-votes').attr("id", "composition-votes-" + aComposition.id);
    compositionRow.html(compositionTemplate.html());
    // Se voglio vederle aggiunte devo usare la class row e usare append
    // compositionRow.append(compositionTemplate.html());
}


//VOTO

//pulsante di voto
$(document).ready(function () {
    $('#compositionRow').on('click', '.btn-vote', function () {
        console.log(this.value);
        var id = this.value;
        voteComposition(id, refreshVotes);
    });
});


//chiamata al contratto per votare
var voteComposition = function (id, callback) {

    $.getJSON("solidity/LiteraryWorks.abi.json", function (cABI) {
        console.log(cAddress);
        const LWContract = web3.eth.contract(cABI).at(cAddress);
        LWContract.vote(id, {from: myaddress},
            (err, res) => {
                if (err != null) {
                    console.log(err);
                } else {
                    console.log(res);
                    LWContract.getVotes.call(id,
                        (err, res) => {
                            if (err != null) {
                                console.log(err);
                            } else {
                                callback(id, res)
                            }
                        });
                }
            });
    });
}

//aggiorna l'elemento del voto
var refreshVotes = function (id, votes) {
    $("#composition-votes-" + id).text(votes);
}






//     $("#sel1").val('comp').change( function(){
//     console.log($(this).val());
//     console.log($(this));
