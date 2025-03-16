var xhr = new XMLHttpRequest();
xhr.open("GET", "/count");
xhr.responseType = "json";
xhr.onload = function() {
    document.getElementById('visits').innerHTML = `<b>${xhr.response.total_requests}</b>`;
    document.getElementById('last').innerHTML = `${this.response.updatedAt}`;

  document.getElementById('lastt').innerHTML = `${this.response.updatedAtt}`;

}
xhr.send();
function Feat() {
    var startTime = performance.now();
    $.ajax({
        url: "/alz",
        method: "GET",
        dataType: "json",
        success: function(response) {
        	document.getElementById("loadingdulu").style.display = "none";
            var endTime = performance.now();
            var fetchTimeInSeconds = (endTime - startTime) / 1000;
            var hir = $("#count")
            var updated = $("#updatedAt")
          
            let hit = `${response.hit.today} / ${response.hit.total}`
            let att = `${response.hit.updatedAt}`
	        hir.text(hit)
	        updated.text(att)
          var updatedd = $("#updatedAtt")

            
            let attt = `${response.hit.updatedAtt}`
          
          updatedd.text(attt)
          
            $(".loading").text('');         
            if (Array.isArray(response.endpoint)) {
                var dataContainer = $("#list");          
                for (var i = 0; i < response.endpoint.length; i++) {
                    var c = response.endpoint[i];
                    var dataHTML = `
 <tr>
    <td><div class="circle pulse color-on"></div></td>
    <td class="ellipsis">${c.name}</td>
    <td align="center">

       <a href="https://dark-shan-yt.koyeb.app/${c.endpoint}"><button>Get</button></a></a>
    </td>
 </tr>
                    `;
                    dataContainer.append(dataHTML);
                }
            }
        },
        error: function(xhr, status, error) {
            console.error("Error fetching data: " + error);
        }
    });
}

$('#testF').on("submit", function(event){
	    var button = document.getElementById("cload");
	    var buttonText = document.getElementById("buttonText");
        var loader = document.getElementById("loader");
        event.preventDefault(); // prevents form submission
        let endpoint = $('#url').val();
        if(!endpoint) return alert("Endpoint URL is required");
        button.disabled = true;
        buttonText.style.display = "none";
        loader.style.display = "inline";
        $.ajax({
            url: endpoint,
            type: "GET",
            success: function(data){
            $('.fetchCingainer').css('display','block');
            buttonText.style.display = "inline";
            document.getElementById("copyButton").style.display = "inline";
            document.getElementById("FetchResponse").style.display = "inline";
            button.disabled = false;
            loader.style.display = "none";
                var daz = $("#FetchResponse");
                function replaceHttpWithLink(value) {
                    if (typeof value === "string" && (value.includes("http://") || value.includes("https://"))) {
                        return `<a href="/docs/${value}" style="color: crimson !important">${value}</a>`;
                    }
                    return value;
                }
                
                function replaceHttpValues(obj) {
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (typeof obj[key] === "string") {
                                obj[key] = replaceHttpWithLink(obj[key]);
                            } else if (typeof obj[key] === "object") {
                                obj[key] = replaceHttpValues(obj[key]);
                            }
                        }
                    }
                    return obj;
                }
                
                var jsonData = replaceHttpValues(data);          
                daz.html(`<pre>${JSON.stringify(jsonData, null, 2)}</pre>`);
            }
        }); 
    });
    function copyText() {
        var textToCopy = document.querySelector("#FetchResponse pre").textContent;
        var tempInput = document.createElement("textarea");
        document.body.appendChild(tempInput);
        tempInput.value = textToCopy;
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        alert("copy chipnoard !");
    }
function openFullscreen(){let e=document.documentElement;e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.msRequestFullscreen&&e.msRequestFullscreen()}	