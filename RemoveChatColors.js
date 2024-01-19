const appendChat = blacket.appendChat;

function newAppendChat(data, mentioned) {
    data.author.color = "#ffffff";
    if(data.author.permissions.includes("use_chat_colors")){
        data.author.permissions.splice(data.author.permissions.indexOf("use_chat_colors"), 1);
    }
    appendChat(data, mentioned);
}

blacket.appendChat = newAppendChat;