var pubnub = new PubNub(
   {
      publishKey: 'pub-c-30632ecf-d1bd-4190-8019-06cfc29f2a31',
      subscribeKey: 'sub-c-f3801f96-c893-11e6-bbe2-02ee2ddab7fe'
   }
);

/* Get all the elements from the document and set each to a variable */
var chatBox = $('chat_box');
var chatInput = $('chat_input');

/* Set subscribe, receives the published message */
pubnub.addListener({
   message: function(m) {
      chatBox.innerHTML = ('' + m.message).replace( /[<>]/g, '' ) + '<br>' + chatBox.innerHTML
   }
});
pubnub.subscribe(
   {
      channel : ['chat-room']
   }
);

/* When the enter key(13) is pressed ... publish */
chatInput.addEventListener('keyip', function(e) {
   if ((e.KeyCode || e.charCode) === 13) {
      pubnub.publish(
         {
            channel : ['chat-room'],
            message : 
               chatInput.value
         }
      )
   }
});






