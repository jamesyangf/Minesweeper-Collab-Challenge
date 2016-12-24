var pubnub = new PubNub(
   {
      publishKey: 'pub-c-30632ecf-d1bd-4190-8019-06cfc29f2a31',
      subscribeKey: 'sub-c-f3801f96-c893-11e6-bbe2-02ee2ddab7fe'
   }
);

var user = prompt("Please enter your name to start!");

/* Get all the elements from the document and set each to a variable */
var chatBox = document.getElementById('chat_box'); // JQuery way
var chatInput = document.getElementById('chat_input'); // Normal Javascript way

/* Set subscribe, receives the published message */
pubnub.addListener({
   message: function(m) {
      var date = new Date();
      chatBox.innerHTML = chatBox.innerHTML + '<br>' + ('(' + date.toLocaleTimeString('en-US', { hour: "numeric", minute: 'numeric'}) + 
         ') ' + m.message.user + ': ' +
         m.message.val).replace( '', '' ); //+ '<br>' + chatBox.innerHTML
      // When the text is overflown, scroll follows
      chatBox.scrollTop = chatBox.scrollHeight;

   }
});
pubnub.subscribe(
   {
      channels : ['chat-room']
   }
);

/* When the enter key(13) is pressed ... publish */
chatInput.addEventListener('keyup', function(e) {
   if ((e.keyCode || e.charCode) === 13) {
      pubnub.publish(
         {
            channel : ['chat-room'],
            message : {
               val: chatInput.value,
               user : user
            },
            x : (chatInput.value='') // What happens to the input when published
         }
      );
   }
});






