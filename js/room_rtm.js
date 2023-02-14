let handleMemberJoined = async (MemberId) => {
    console.log('A new member has joined the room:', MemberId);
    addMemberToDom(MemberId);

    let members = await channel.getMembers()
    updateMemberTotal(members);

    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name']);
    addBotMessageToDom(`${name} has Joined the room !`)
}


// Adding Member Joining the room

let addMemberToDom = async (MemberId) => {
    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name']);


    let membersWrapper = document.getElementById('member__list')
    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                            <span class="green__icon"></span>
                            <p class="member_name">${name}</p>
                      </div>`
    
    membersWrapper.insertAdjacentHTML('beforeend', memberItem);
}

// Updating the total Participants 
let updateMemberTotal = async (members) => {
    let total = document.getElementById('members__count');
    total.innerText = members.length
}

// Memebr Leaving the Chat

let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId);

    let members = await channel.getMembers()
    updateMemberTotal(members)
}


let removeMemberFromDom = async (MemberId) => {
    let memberWrapper = document.getElementById(`member__${MemberId}__wrapper`);
    
    let name = memberWrapper.getElementsByClassName('member_name')[0].textContent;
    addBotMessageToDom(`${name} has left the room.`)

    memberWrapper.remove();
}

let getMembers = async () => {
    let members = await channel.getMembers();

    updateMemberTotal(members)


    for(let i = 0; members.length >  i; i++){
        addMemberToDom(members[i])
    }
}

// Handling Channel Message
let handleChannelMessage = async (messageData, MemberId) => {
    console.log('A NEW MESSAGE WAS SENT OR RECIEVED');

    let data = JSON.parse(messageData.text)
    
    if(data.type === 'chat'){
        addMessageToDom(data.displayName, data.message)
    }
}


// Message Send Function
let sendMessage = async (e) => {
    e.preventDefault();

    let message = e.target.message.value;
    channel.sendMessage({text:JSON.stringify({'type':'chat', 'message': message, 'displayName': displayName})});
    
    addMessageToDom(displayName, message);
    e.target.reset()
}

// Adding Message to DOM 
let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages');

    let newMessage = `<div class="message__wrapper">
                            <div class="message__body">
                                <strong class="message__author">${name}</strong>
                                <p class="message__text">${message}</p>
                            </div>
                       </div>`
    messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child');
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}

// Adding Bot Messages to DOM

// Adding Message to DOM 
let addBotMessageToDom = (botMessage) => {
    let messagesWrapper = document.getElementById('messages');

    let newMessage = ` <div class="message__wrapper">
                            <div class="message__body__bot">
                                <strong class="message__author__bot">🤖 LinkChat Bot</strong>
                                <p class="message__text__bot">${botMessage}</p>
                            </div>
                        </div> `
    messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child');
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
    
}


let leaveChannel = async () => {
    await channel.leave();
    await  rtmClient.logout();
}

window.addEventListener('beforeunload', leaveChannel)

let messageForm = document.getElementById('message__form');
messageForm.addEventListener('submit', sendMessage);