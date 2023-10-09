(function() {
  // Inject basic style framework
  document.head.insertAdjacentHTML('beforeend', '<link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css" rel="stylesheet">');

  // GPT config
  const API_KEY = "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";
  const APU_URL = "https://api.openai.com/v1/completions";

  const REQUEST_HEADER = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`
  };

  const REQUEST_PAYLOAD = {
    "model": "gpt-3.5-turbo-instruct",
    "prompt": "",
    "max_tokens": 4000,
    "temperature": 0
  };

  // Inject Script
  const script = document.createElement('script');
  script.src = "https://cdn.bootcdn.net/ajax/libs/axios/1.5.0/axios.js";
  document.head.appendChild(script);

  // Inject the CSS
  const style = document.createElement('style');
  style.innerHTML = `
  .hidden {
    display: none;
  }
  #chat-widget-container {
    position: fixed;
    bottom: 70px;
    right: 20px;
    flex-direction: column;
  }
  #chat-popup {
    height: 70vh;
    max-height: 70vh;
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
    <div id="chat-bubble" class="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer text-3xl" style="background: #20bec8">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </div>
    <div id="chat-popup" class="hidden absolute bottom-20 right-0 w-96 bg-white rounded-md shadow-md flex flex-col transition-all text-sm">
      <div id="chat-header" class="flex justify-between items-center p-4 text-white rounded-t-md" style="background: #20bec8">
        <h3 class="m-0 text-lg" style="color: white">Wisdom Assistant</h3>
        <button id="close-popup" class="bg-transparent border-none text-white cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div id="chat-messages" class="flex-1 p-4 overflow-y-auto"></div>
      <div id="chat-input-container" class="p-4 border-t border-gray-200">
        <div class="flex space-x-4 items-center">
          <input type="text" id="chat-input" class="flex-1 border border-gray-300 rounded-md px-4 py-2 outline-none w-3/4" placeholder="Type your message...">
          <button id="chat-submit" class="text-white rounded-md px-4 py-2 cursor-pointer" style="background: #20bec8">
            <i id="button-text" style="font-style: normal">Send</i>
            <i id="loading"  style="display: none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </i>
          </button>
        </div>
        <div class="flex text-center text-xs pt-4">
          <span class="flex-1">Supported by <a href="https://openai.com" target="_blank" class="text-indigo-600">@OpenAI</a></span>
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

  chatSubmit.addEventListener('click', function() {
    
    const message = chatInput.value.trim();
    if (!message) return;
    
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
    messageElement.className = 'flex justify-end mb-3';
    messageElement.innerHTML = `
      <div class="bg-gray-800 text-white rounded-lg py-2 px-4 max-w-[70%]">
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
    replyElement.className = 'flex mb-3';
    replyElement.innerHTML = `
      <div class="bg-gray-200 text-black rounded-lg py-2 px-4 max-w-[70%]">
        ${message}
      </div>
    `;
    chatMessages.appendChild(replyElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function send(message) {
    buttonSwitch(true);
    REQUEST_PAYLOAD["prompt"] = message;
    axios({
      method: 'post',
      url: APU_URL,
      data: REQUEST_PAYLOAD,
      headers: REQUEST_HEADER
    }).then(function(response) {
      reply(response.data.choices[0].text)
    }).catch(function() {
      reply("Error. Retry later.")
    })
    .finally(function() { buttonSwitch(false) });
  }


  function buttonSwitch(loading) {
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
    chatPopup.classList.toggle('hidden');
    if (!chatPopup.classList.contains('hidden')) {
      document.getElementById('chat-input').focus();
    }
  }  
  
})();
