const chatForm=document.getElementById('chat-form'); 
const chatMessages=document.querySelector('.chat-messages');  //now creating a Event Listener for that submit button
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');

//now, take the UserName and Room from the URl ..First Inlcude the QS CDN script 
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});


const socket=io();
socket.emit('joinRoom',{ username, room });

//get room and user list 
socket.on('roomUsers', ({room, users}) =>{
  outputRoomName(room); 
  outputUsers(users);
  //both the fumction are created below last 
})

socket.on('message', message => {
     console.log(message);
     outputMessage(message);
     chatMessages.scrollTop =chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();


  //get mesg text from DOM
  const msg=e.target.elements.msg.value;

  //after getting messages from DOM , emit it to the server
  socket.emit('chatMessage',msg);
  //now clear the chat message field 
  e.target.elements.msg.value='';
  e.target.elements.msg.focus();



});

//output message ot the screen 
function outputMessage(message)
{
  const div=document.createElement('div');
  div.classList.add('message');
  div.innerHTML=`<p class="meta">${message.username}<span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

//add room name to DOM
function outputRoomName(room){
  roomName.innerHTML=room;
}

function outputUsers(users){
  userList.innerHTML=` 
  ${users.map(user=>`<li>${user.username}</li>`).join('')}
  `;
}