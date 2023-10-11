(function() {
  const REQUEST_PAYLOAD = {
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      }
    ]
  };

  // Inject Script
  const script = document.createElement('script');
  script.src = "https://cdn.bootcdn.net/ajax/libs/axios/1.5.0/axios.js";
  document.head.appendChild(script);

  // Inject the CSS
  const style = document.createElement('style');
  style.innerHTML = `
  .chat_flex {
    display: flex;
  }
  .chat_hidden {
    display: none;
  }
  .chat_shadow {
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
  }
  .chat_msg {
    justify-content: flex-end;
    margin-bottom: 0.75rem;
  }
  .res_msg {
    margin-bottom: 0.75rem;
  }
  #chat-widget-container {
    position: fixed;
    bottom: 70px;
    right: 20px;
    flex-direction: column;
    font-family: ui-sans-serif, system-ui;
  }
  #chat-popup {
    height: 60vh;
    max-height: 60vh;
    transition: all 0.3s;
    overflow: hidden;
  }
  @media (max-width: 768px) {
    #chat-popup {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      max-height: 100%;
      border-radius: 0;
    }
  }
  `;

  document.head.appendChild(style);

  // Create chat widget container
  const chatWidgetContainer = document.createElement('div');
  chatWidgetContainer.id = 'chat-widget-container';
  document.body.appendChild(chatWidgetContainer);
  
  // Inject the HTML
  chatWidgetContainer.innerHTML = `
    <div id="chat-bubble" style="background: #20bec8; font-size: 1.875rem; line-height: 2.25rem; border-radius: 9999px; 
        justify-content: center; align-items: center; cursor: pointer; width: 3rem; height: 3rem; display: flex;">
      <svg xmlns="http://www.w3.org/2000/svg" style="width: 1.5rem; height: 1.5rem; display: block; vertical-align: middle; color: white;"  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </div>
    <div id="chat-popup" style="height: 60vh; max-height: 60vh; transition: all 0.3s; overflow: hidden; font-size: .875rem;
        line-height: 1.25rem; background-color: white; border-radius: 0.375rem; flex-direction: column; width: 24rem;
         bottom: 5rem; right: 0; position: absolute;"
        class="chat_hidden chat_shadow chat_flex">
      <div id="chat-header" class="chat_flex" 
        style="background: #20bec8; color: white; padding: 1rem; border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem;
        justify-content: space-between; align-items: center;">
        <h3 style="color: white; font-size: 1.125rem; line-height: 1.75rem; margin: 0;">Wisdom Assistant</h3>
        <button id="close-popup" style="color: white; background-color: transparent; border-style: none; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" style="width: 1.5rem; height: 1.5rem; display: block; vertical-align: middle;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div id="chat-messages" style="padding: 1rem; overflow-y: auto; flex: 1 1 0%;"></div>
      <div id="chat-input-container" style="padding: 1rem; border-top: 1px solid rgba(229,231,235,1);">
        <div style="align-items: center;" 
            class="chat_flex space-x-4">
          <input type="text" id="chat-input" style="outline: 1px solid transparent; border-color: grey; ;
          padding: 0.5rem 1rem 0.5rem 1rem; border-width: 1px; border-radius: 0.375rem; flex: 1 1 0%; width: 75%; margin-right: 2rem;"
            placeholder="Type your message...">
          <button id="chat-submit" style="font-size: 13px; width:4rem; height: 2.1rem; background: #20bec8; color: white; text-align: center; border-radius: 0.375rem; cursor: pointer; border: none;">
            <i id="button-text" style="font-style: normal">Send</i>
            <i id="loading"  style="display: none; ">Sending</i>
          </button>
        </div>
        <div style="font-size: .75rem;line-height: 1rem;text-align: center;padding-top: 1rem;" class="chat_flex">
          <span style="flex: 1 1 0%;">Supported by <a href="https://openai.com" target="_blank" class="text-indigo-600">@OpenAI</a></span>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const chatInput = document.getElementById('chat-input');
  const chatSubmit = document.getElementById('chat-submit');
  const chatMessages = document.getElementById('chat-messages');
  const chatBubble = document.getElementById('chat-bubble');
  const chatPopup = document.getElementById('chat-popup');
  const closePopup = document.getElementById('close-popup');
  const buttonText = document.getElementById('button-text');
  const loadingIcon = document.getElementById('loading');
  let loading = false;


  chatSubmit.addEventListener('click', function() {
    
    const message = chatInput.value.trim();
    if (!message || loading) return;
    
    chatMessages.scrollTop = chatMessages.scrollHeight;

    chatInput.value = '';

    onUserRequest(message);

  });

  chatInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      chatSubmit.click();
    }
  });

  chatBubble.addEventListener('click', function() {
    togglePopup();
  });

  closePopup.addEventListener('click', function() {
    togglePopup();
  });


  function onUserRequest(message) {
    // Handle user request here
    console.log('User request:', message);
  
    // Display user message
    const messageElement = document.createElement('div');
    messageElement.className = 'chat_flex chat_msg';
    messageElement.innerHTML = `
      <div style="background: #20bec8; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem;">
        ${message}
      </div>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  
    chatInput.value = '';
  
    send(message);
  }

  
  function reply(message) {
    const chatMessages = document.getElementById('chat-messages');
    const replyElement = document.createElement('div');
    replyElement.className = 'chat_flex res_msg';
    replyElement.innerHTML = `
      <div style="color: black; padding: 0.5rem 1rem; background-color: rgba(229,231,235,1); border-radius: 0.5rem; text-align: start;">
        ${message}
      </div>
    `;
    chatMessages.appendChild(replyElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function send(message) {
    buttonSwitch(true);

    const userMsg = {
      role: "user",
      content: message
    };
    REQUEST_PAYLOAD.messages.push(userMsg);

    axios({
      method: 'post',
      url: window.chatServer || "https://chat-server-kjvx11h1h-lu-dis-projects.vercel.app/api/completion",
      data: REQUEST_PAYLOAD,
    }).then(function(response) {
      REQUEST_PAYLOAD.messages.push(response.data.choices[0].message);
      reply(response.data.choices[0].message.content);
    }).catch(function() {
      reply("Error. Retry later.")
    })
    .finally(function() { buttonSwitch(false) });
  }


  function buttonSwitch(status) {
    loading = status
    if (loading) {
      buttonText.style.display = "none";
      loadingIcon.style.display = "inline";
    } else {
      buttonText.style.display = "inline-block";
      loadingIcon.style.display = "none";
    }
  }


  function togglePopup() {
    const chatPopup = document.getElementById('chat-popup');
    chatPopup.classList.toggle('chat_hidden');
    if (!chatPopup.classList.contains('chat_hidden')) {
      document.getElementById('chat-input').focus();
    }
  }  
  
})();
