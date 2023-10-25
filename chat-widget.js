(function() {
  const REQUEST_PAYLOAD = {
    "messages": [
      {
        "role": "system",
        "content": "你是一個智慧助手"
      }
    ]
  };
  const MESSAGE_IDS = [];

  const PROMPT_TEMPLATE = {
    "intro": `你是一位的<${window.chatCourseName}>老師，現在我要寫一份課程介紹。請直接幫我寫出500字的課程簡介，以及500字的教學目標。`,
    "outline": `你是一位<${window.chatCourseName}>老師，現在我要寫一份課程大綱。請你依序問我以下2個問題，然後直接幫我撰寫章節主題、教學目標，以及教學內容。1. 周數。2. 每周幾節課。`,
    "quiz": `你是一位<${window.chatCourseName}>老師，現在我要出考題。請你依序問我以下4個問題，然後直接幫我寫出考題。1. 考試主題。2. 題目數量。3.難易度。4.題型：是非題、單選題、複選題、簡答題。`,
    "homework": `你是一位的<${window.chatCourseName}>老師，現在我要出作業。請直接幫我出3份作業主題，內容包含作業主題、作業描述。`
  };

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
  .function {
    width: 100px; 
    height: 20px; 
    line-height: 18px; 
    border: 1px solid #20bec8; 
    border-radius: 4px; 
    margin: 10px 10px; 
    font-size: 13px;
    text-align: center;
  }
  .function:hover {
    color: white;
    background: #20bec8;
    cursor: pointer; 
  }
  .blink {
    width: 5px;
    height: 20px;
    margin: 8px -13px;
    background-color: black;
    animation: blink 0.5s linear infinite;
  }

  @keyframes blink {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  #chat-widget-container {
    position: fixed;
    bottom: 70px;
    right: 20px;
    flex-direction: column;
    font-family: ui-sans-serif, system-ui;
  }
  #chat-popup {
    height: 80vh;
    max-height: 80vh;
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
    <div id="chat-popup" style="height: 70vh; max-height: 70vh; transition: all 0.3s; overflow: hidden; font-size: .875rem;
        line-height: 1.25rem; background-color: white; border-radius: 0.375rem; flex-direction: column; width: 24rem;
         bottom: 5rem; right: 0; position: absolute;"
        class="chat_hidden chat_shadow chat_flex">
      <div id="chat-header" class="chat_flex" 
        style="background: #20bec8; color: white; padding: 1rem; border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem;
        justify-content: space-between; align-items: center;">
        <h3 style="color: white; font-size: 1.125rem; line-height: 1.75rem; margin: 0;">課程助理</h3>
        <button id="close-popup" style="color: white; background-color: transparent; border-style: none; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" style="width: 1.5rem; height: 1.5rem; display: block; vertical-align: middle;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div style="height: 10vh; border-bottom: 1px solid rgba(128, 128, 128, .3); margin: 0 10px;">
        <div style="color: grey; font-size: 12px; padding-top: 10px;">請選擇助理服務，當前課程《<i id="gptCourseName"></i>》</div>
        <div style="display: flex; justify-content: center; ">
            <div class="function" id="intro-func">課程介紹</div>
            <div class="function" id="outline-func">課程大綱</div>
            <div class="function" id="quiz-func">出考題</div>
            <div class="function" id="homework-func">出作業</div>
        </div>
      </div>
      <div id="chat-messages" style="padding: 1rem; overflow-y: auto; flex: 1 1 0%;"></div>
      <div id="chat-input-container" style="padding: 1rem; border-top: 1px solid rgba(229,231,235,1);">
        <div style="align-items: center;" 
            class="chat_flex space-x-4">
          <input type="text" id="chat-input" style="outline: 1px solid transparent; border-color: grey; ;
          padding: 0.5rem 1rem 0.5rem 1rem; border-width: 1px; border-radius: 0.375rem; flex: 1 1 0%; width: 75%; margin-right: 2rem;"
            placeholder="Type your message...">
          <button id="chat-submit" style="font-size: 13px; width:4rem; height: 2.1rem; background: #20bec8; color: white; 
          text-align: center; border-radius: 0.375rem; cursor: pointer; border: none; padding: 0;">
            <i id="button-text" style="font-style: normal">Send</i>
            <i id="loading"  style="display: none; ">···</i>
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
  const introFunc = document.getElementById('intro-func');
  const outlineFunc = document.getElementById('outline-func');
  const quizFunc = document.getElementById('quiz-func');
  const homeworkFunc = document.getElementById('homework-func');
  const buttonText = document.getElementById('button-text');
  const gptCourseName = document.getElementById("gptCourseName");
  const loadingIcon = document.getElementById('loading');
  let loading = false;

  gptCourseName.innerHTML = window.chatCourseName || "";
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

  introFunc.addEventListener('click', function() {
    send(PROMPT_TEMPLATE["intro"]);
  });
  outlineFunc.addEventListener('click', function() {
    send(PROMPT_TEMPLATE["outline"]);
  });
  quizFunc.addEventListener('click', function() {
    send(PROMPT_TEMPLATE["quiz"]);
  });
  homeworkFunc.addEventListener('click', function() {
    send(PROMPT_TEMPLATE["homework"]);
  });


  function onUserRequest(message) {
    // Handle user request here
    console.log('User request:', message);
  
    // Display user message
    const messageElement = document.createElement('div');
    messageElement.className = 'chat_flex chat_msg';
    messageElement.innerHTML = `
      <div style="background: #20bec8; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; text-align: start;">
        ${message}
      </div>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  
    chatInput.value = '';
  
    send(message);
  }

  
  function reply(message, id) {
    message = message.replaceAll("\n", "<br/>");
    
    if (MESSAGE_IDS.indexOf(id) == -1) {
      const chatMessages = document.getElementById('chat-messages');
      const replyElement = document.createElement('div');
      replyElement.id = id;
      replyElement.className = 'chat_flex res_msg';
      const innerHTML = `<div style="color: black; padding: 0.5rem 1rem; background-color: rgba(229,231,235,1); border-radius: 0.5rem; text-align: start; display: block;">${message}</div><div class="blink"></div>`;
      replyElement.innerHTML = innerHTML;
      chatMessages.appendChild(replyElement);
      MESSAGE_IDS.push(id);
    } else {
      const replyElement = document.getElementById(id);
      const innerMsg = replyElement.firstChild;
      innerMsg.innerHTML = innerMsg.innerHTML + message;
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function send(message) {
    const userMsg = {
      role: "user",
      content: message
    };
    REQUEST_PAYLOAD.messages.push(userMsg);

    const msgId = `msg_${Date.now()}`;
    reply("", msgId);
    try {
      const response = await fetch(window.chatServer || "https://next-chat-server-ten.vercel.app/api/chat", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(REQUEST_PAYLOAD),
      });
      buttonSwitch(true);
      async function streamToString(body) {
          const reader = body?.pipeThrough(new TextDecoderStream()).getReader();
          
          let chatMessage = "";
          while (reader) {
              let stream = await reader.read();
              if (stream.done) {
                REQUEST_PAYLOAD.messages.push({
                  "role": "assistant",
                  "content": chatMessage
                });
                buttonSwitch(false);
                break;
              }
              chatMessage += stream.value;
              reply(stream.value, msgId);
          }
      }
      streamToString(response.body);
  } catch (err) {
    reply("Error. Retry later.", msgId)
    buttonSwitch(false)
  }
}


  function buttonSwitch(status) {
    loading = status
    
    if (loading) {
      buttonText.style.display = "none";
      loadingIcon.style.display = "inline";
      chatSubmit.style.background = "#a9a9a9";
    } else {
      const blinks = document.getElementsByClassName('blink');
      blinks[blinks.length - 1].style.display = "none";
      buttonText.style.display = "inline-block";
      loadingIcon.style.display = "none";
      chatSubmit.style.background = "#20bec8";
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
