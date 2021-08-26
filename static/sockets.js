// set to host IP
var socket = io("ws://192.168.1.112:5000");
var _clients = [];

socket.on("connect", function() {
    console.log("Connected to socket");
});

socket.on("client_connect", function(ip){
    console.log("Client Connected");
    if (!_clients.includes(ip)){
        var list = document.getElementById("list");
        var item = document.createElement("li");
        item.id = ip;
        item.textContent = ip;
        list.appendChild(item);
        _clients.push(ip);
    };
});

socket.on("client_disconnect", function(ip){
    var client = document.getElementById(ip);
    client.remove();
    _clients.splice(_clients.indexOf(ip), 1);
});

socket.on("load_clients", function(clients){
    var list = document.getElementById("list");
    clients.forEach(function(client){
        if (!_clients.includes(client)){
            console.log("here");
            var item = document.createElement("li");
            item.id = client;
            item.textContent = client;
            list.appendChild(item);
            _clients.push(client);
        };
    });
});

socket.on("message_received", function(text){
    var msg_container = document.getElementById("msgs");
    var msg = document.createElement("p");
    msg.textContent = text
    msg_container.appendChild(msg);
});


socket.on("file_received", function(data){
    var bytes = data["url"];
    var blob = new Blob([bytes]);
    var name = "download." + data["ext"];
    var url = window.URL.createObjectURL(blob);
    var sender = data["sender"];
    "File sent from " + sender
    var download = document.createElement("a");
    var text = document.createTextNode("File sent from " + sender);
    download.appendChild(text);
    download.title = "File sent from " + sender;
    download.href = url;
    download.setAttribute("download", name);
    download.setAttribute("target", "_blank");
    download.appendChild(document.createElement("br"));
    var msgs = document.getElementById("msgs");
    msgs.appendChild(download);

});

function sendMessage(){
    var msg_box = document.getElementById("msg_box");
    var msg = msg_box.value;
    msg_box.value = null;
    if (msg) {
        socket.emit("message_sent", msg);
    };
};

function sendFile(){
    var popup = document.getElementById("popup");
    var file = document.getElementById("file");
    var client_box = Array.from(document.getElementsByClassName("client_box"));
    var clients = [];
    if (file.files[0]){
        console.log(file.files[0].name);
        client_box.forEach(function(elem){
            if (elem.checked){
                clients.push(elem.value);
            };
            elem.remove();
        });
        // bytes must be sent directly and distributed to each client so each client can get their own blob link
        var reader = new FileReader();
        reader.onload = function(evt){
            var arrayBuffer = evt.target.result,
                array = new Uint8Array(arrayBuffer);
            var ext = file.files[0].name.split(".").pop();
            socket.emit("file_sent", {"clients": clients, "bytes": arrayBuffer, "ext": ext});
        };
        reader.readAsArrayBuffer(file.files[0]);
        popup.style.display = "none";
    };
    
    
};

function filePopup(){
    var popup = document.getElementById("popup");
    var client_list = document.getElementById("clients");
    var submit = document.getElementById("file");
    _clients.forEach(function(ip){
        var _input = document.createElement("input");
        var _label = document.createElement("label");
        _input.type = "checkbox";
        _input.name = ip;
        _input.value = ip;
        _input.className = "client_box";
        _label.setAttribute("for", ip);
        _label.textContent = ip;
        _label.className = "client_box";
        _label.appendChild(document.createElement("br"))
        client_list.insertBefore(_input, submit);
        client_list.insertBefore(_label, submit);
    });
    popup.style.display = "block";
};

function closeFilePopup(){
    var popup = document.getElementById("popup");
    var client_box = Array.from(document.getElementsByClassName("client_box"));
    popup.style.display = "none";
    client_box.forEach(elem => elem.remove());
};