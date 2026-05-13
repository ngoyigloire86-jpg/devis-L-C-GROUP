

let produits = [];

function ajouterProduit(){

    const produit = document.getElementById("produit").value;
    const description = document.getElementById("description").value;
    const quantite = parseFloat(document.getElementById("quantite").value);
    const prix = parseFloat(document.getElementById("prix").value);

    if(!produit || !description || !quantite || !prix){
        alert("Veuillez remplir tous les champs produit.");
        return;
    }

    const total = quantite * prix;

    produits.push({
        produit,
        description,
        quantite,
        prix,
        total
    });

    afficherProduits();

    document.getElementById("produit").value = "";
    document.getElementById("description").value = "";
    document.getElementById("quantite").value = "";
    document.getElementById("prix").value = "";
}

function afficherProduits(){

    const tbody = document.querySelector("#tableProduits tbody");

    tbody.innerHTML = "";

    produits.forEach(item => {

        tbody.innerHTML += `
            <tr>
                <td>${item.produit}</td>
                <td>${item.description}</td>
                <td>${item.quantite}</td>
                <td>${format(item.prix)} F</td>
                <td>${format(item.total)} F</td>
            </tr>
        `;
    });
}

function genererFacture(){

    if(produits.length === 0){
        alert("Ajoutez au moins un produit.");
        return;
    }

    const projet = document.getElementById("projet").value;
    const client = document.getElementById("client").value;
    const num_client = document.getElementById("num_client").value;
    const agent = document.getElementById("agent").value;
    const num_agent = document.getElementById("num_agent").value;

    const commissionPourcent =
        parseFloat(document.getElementById("commission").value);

    const inspection =
        parseFloat(document.getElementById("inspection").value);

    const kilos =
        parseFloat(document.getElementById("kilos").value);

    const prixKilo =
        parseFloat(document.getElementById("prixKilo").value);

    // TOTAL PRODUITS
    const achat =
        produits.reduce((sum, p) => sum + p.total, 0);

    // COMMISSION
    const commission =
        achat * (commissionPourcent / 100);

    // TOTAL PREMIERE PARTIE
    const premierePartie =
        achat + commission + inspection;

    // TRANSPORT
    const transport =
        kilos * prixKilo;

    // INFOS
    document.getElementById("vProjet").innerText = projet;
    document.getElementById("vClient").innerText = client;
    document.getElementById("vnum_Client").innerText = num_client;
    document.getElementById("vAgent").innerText = agent;
    document.getElementById("vnum_Agent").innerText = num_agent;
    document.getElementById("invoiceNumber").innerText = "DEV" + String(Date.now()).slice(-6);
    document.getElementById("invoiceDate").innerText = new Date().toLocaleDateString("fr-FR");

    // TABLE PRODUITS
    const factureProduits =
        document.getElementById("factureProduits");

    factureProduits.innerHTML = "";

    produits.forEach(item => {

        factureProduits.innerHTML += `
            <tr>
                <td>${item.produit}</td>
                <td>${item.description}</td>
                <td>${item.quantite}</td>
                <td>${format(item.prix)} F</td>
                <td>${format(item.total)} F</td>
            </tr>
        `;
    });

    // TOTAUX
    document.getElementById("achatTotal").innerText =
        format(achat) + " F";

    document.getElementById("commissionTotal").innerText =
        format(commission) + " F";

    document.getElementById("inspectionTotal").innerText =
        format(inspection) + " F";

    document.getElementById("premierePartie").innerText =
        format(premierePartie) + " F";

    document.getElementById("kgTotal").innerText =
        kilos + " kg";

    document.getElementById("prixKgTotal").innerText =
        format(prixKilo) + " F";

    document.getElementById("transportTotal").innerText =
        format(transport) + " F";

    document.getElementById("facture").classList.remove("hidden");
}

function telechargerPDF(){
    const facture = document.getElementById("facture");
    const clone = facture.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.display = "block";
    clone.style.width = facture.getBoundingClientRect().width + "px";

    clone.querySelectorAll("button").forEach(button => {
        button.style.display = "none";
    });

    document.body.appendChild(clone);

    html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        scrollY: -window.scrollY
    }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let position = 20;

        if (imgHeight <= pageHeight - 40) {
            pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
        } else {
            let remainingHeight = imgHeight;
            let sourceY = 0;
            const ratio = canvas.width / imgWidth;
            while (remainingHeight > 0) {
                const pageCanvas = document.createElement("canvas");
                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.min((pageHeight - 40) * ratio, canvas.height - sourceY);
                const ctx = pageCanvas.getContext("2d");
                ctx.drawImage(canvas, 0, sourceY, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
                const pageData = pageCanvas.toDataURL("image/png");
                pdf.addImage(pageData, "PNG", 20, 20, imgWidth, (pageCanvas.height / canvas.width) * imgWidth);
                remainingHeight -= pageCanvas.height;
                sourceY += pageCanvas.height;
                if (remainingHeight > 0) {
                    pdf.addPage();
                }
            }
        }

        pdf.save("devis-lc-group.pdf");
        document.body.removeChild(clone);
    }).catch(error => {
        document.body.removeChild(clone);
        alert("Erreur lors de la génération du PDF : " + (error.message || error));
    });
}

function format(nombre){

    return Number(nombre).toLocaleString("fr-FR");
}

