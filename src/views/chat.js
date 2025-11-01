import { API_KEY,AI_ROLE } from '../config.js';

let currentInfo={};

// 他确实就得这样导出才能在 typescript 中用
export function _init() {
  // 小工具：安全设置文本到元素（避免直接 innerHTML）
  function appendTextToNode(node, text) {
    node.textContent = node.textContent + text;
  }

  function createMessageElement(type, sender, initialText = "") {
    const wrap = document.createElement("div");
    wrap.className = `message ${type}`;
    const header = document.createElement("div");
    header.className = "message-header";
    const senderEl = document.createElement("div");
    senderEl.className = "message-sender";
    senderEl.textContent = sender || (type === "user" ? "我" : AI_ROLE);
    header.appendChild(senderEl);

    const content = document.createElement("div");
    content.className = "message-content";
    content.textContent = initialText;

    wrap.appendChild(header);
    wrap.appendChild(content);

    return { wrap, content };
  }

  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }

  // 流式读取函数：支持 SSE (data: ...) 格式与普通分块文本，按片段回调 onChunk(chunk)
  async function fetchStream(url, options, onChunk, signal) {
    const res = await fetch(url, Object.assign({}, options, { signal }));
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    // 如果不是流直接一次性读完（兼容性）
    if (!res.body) {
      const txt = await res.text();
      if (txt) onChunk(txt);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += decoder.decode(value, { stream: true });

          // 如果是 SSE 风格（包含 data:），就按 SSE 事件解析
          if (buffer.indexOf("data:") !== -1) {
            let idx;
            while ((idx = buffer.indexOf("\n\n")) !== -1) {
              const event = buffer.slice(0, idx).trim();
              buffer = buffer.slice(idx + 2);
              // 每个 event 可能包含多行 data:
              const lines = event.split(/\r?\n/);
              for (const line of lines) {
                if (line.startsWith("data:")) {
                  const data = line.slice(5).trim();
                  if (data === "[DONE]") {
                    // 流结束信号，直接返回
                    return;
                  }
                  try {
                    const parsed = JSON.parse(data);
                    // OpenAI style: parsed.choices[0].delta.content 或 parsed.choices[0].text
                    let text = "";
                    if (parsed.choices && parsed.choices.length > 0) {
                      const ch = parsed.choices[0];
                      if (ch.delta && ch.delta.content) text = ch.delta.content;
                      else if (ch.text) text = ch.text;
                    }
                    if (text) onChunk(text);
                  } catch (e) {
                    // 不是 JSON，也可能直接是纯文本，直接回调
                    if (data) onChunk(data);
                  }
                }
              }
            }
          } else {
            // 非 SSE：直接按到达的分块回调（保持兼容性）
            onChunk(buffer);
            buffer = "";
          }
        }
      }

      // flush any remaining (非 SSE 情况)
      if (buffer) {
        onChunk(buffer);
        buffer = "";
      }
    } finally {
      reader.releaseLock && reader.releaseLock();
    }
  }

  // 内存历史
  const messages = []; // { type: 'user'|'bot'|'error', sender, text }

  function addMessageToHistory(msg) {
    messages.push(msg);
  }
  function getHistory() {
    // 返回浅拷贝，避免外部直接修改内部数组
    return messages.map((m) => ({ ...m }));
  }
  function clearHistory() {
    messages.length = 0;
  }

  // 创建并插入消息节点，并不重复记录（记录由调用者控制）
  function renderMessageNode(container, msg) {
    const { wrap, content } = createMessageElement(
      msg.type,
      msg.sender,
      msg.text || ""
    );
    container.appendChild(wrap);
    scrollToBottom(container);
    return { wrap, content };
  }

  // 主入口：window.initChat(info)
  window.initChat = function (info = {}) {
    currentInfo=info;
    const container = document.getElementById("chat-messages");
    const input = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-button");
    const newChatBtn = document.getElementById("new-chat-button");

    if (!container || !input || !sendBtn || !newChatBtn) {
      // DOM 可能尚未挂载，稍后再试
      setTimeout(() => window.initChat(info), 200);
      return;
    }

    let currentAbortController = null;
    let streaming = false;
    let currentBotContentNode = null; // 当前正在接收的 bot 内容 DOM 节点

    messages.push({
      type: "bot",
      sender: AI_ROLE,
      notforapi: true,
      text: `这里是${currentInfo.name || '嘉祥外国语学校'}。${currentInfo.detail || ''}`,
    });

    function setSendingState(isSending) {
      streaming = isSending;
      // 更新按钮/输入状态，但不要替换整个按钮内容（保留图标 span）
      newChatBtn.disabled = isSending;
      input.disabled = isSending;

      // 按钮内部结构： .btn-icon, .btn-text；图标 svg 存在于 dataset 中
      const sendIconEl = sendBtn.querySelector('.btn-icon');
      const sendTextEl = sendBtn.querySelector('.btn-text');
      const sendSvg = sendBtn.dataset.sendIcon || '';
      const stopSvg = sendBtn.dataset.stopIcon || '';

      if (isSending) {
        // 切换为停止图标，隐藏文本
        if (sendIconEl) sendIconEl.innerHTML = stopSvg || '✖';
        sendBtn.title = '停止';
      } else {
        // 恢复为发送图标，保持无文字（按需求发送按钮不显示文字）
        if (sendIconEl) sendIconEl.innerHTML = sendSvg || '发送';
        sendBtn.title = '发送';
      }
    }

    function rebuildFromHistory() {
      container.innerHTML = "";
      for (const m of messages) {
        renderMessageNode(container, m);
      }
    }

    async function sendMessage(prompt) {
      if (!prompt || streaming) return;
      // 用户消息记录与渲染
      const userMsg = {
        type: "user",
        sender: "我",
        text: prompt,
      };
      addMessageToHistory(userMsg);
      renderMessageNode(container, userMsg);

      // Bot 占位记录与渲染（空文本，接收流时补全）
      const botMsg = {
        type: "bot",
        sender: AI_ROLE,
        text: "",
      };
      addMessageToHistory(botMsg);
      const botNode = renderMessageNode(container, botMsg);
      currentBotContentNode = botNode.content;

      setSendingState(true);
      currentAbortController = new AbortController();
      const signal = currentAbortController.signal;

      // 标准 messages
      const messagesForApi = [];

      // system 信息
      const context = `你的名字叫${AI_ROLE}，你将为来到成都市锦江区嘉祥外国语学校的来宾介绍学校。
      现在用户正在${currentInfo.name || '学校大门'}。
      有一些关于${currentInfo.name || '学校大门'}的相关信息：
      简介：${currentInfo.brief || '暂无'}
      详细：${currentInfo.detail || '暂无'}
      若果没有相关信息，请据实回答不要编造。若果用户询问无关的问题，请礼貌拒绝回答。`;
      console.log('Context for AI:', context);
      if (context)
          messagesForApi.push({ role: "system", content: context });


      // 将内存历史映射为 role: user/assistant/system（不包含正在追加的空 bot）
      for (const m of messages) {
        if (!m.text) continue;
        if (m.notforapi) continue;
        if (m.type === "user")
          messagesForApi.push({ role: "user", content: m.text });
        else if (m.type === "bot")
          messagesForApi.push({ role: "assistant", content: m.text });
      }

      const body = {
        model: "openai/gpt-4.1-nano", // 可按需替换为后端支持的模型名
        messages: messagesForApi,
        stream: true,
        temperature: 0.2,
      };

      try {
        await fetchStream(
          "https://models.github.ai/inference/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer "+API_KEY,
            },
            body: JSON.stringify(body),
          },
          (chunk) => {
            // chunk 是每次解析出的增量文本（来自 delta.content 或纯文本分块）
            appendTextToNode(currentBotContentNode, chunk);
            // 更新内存最后一条 bot 文本
            const lastIdx = messages.length - 1;
            if (lastIdx >= 0 && messages[lastIdx].type === "bot") {
              messages[lastIdx].text += chunk;
            }
            scrollToBottom(container);
          },
          signal
        );
      } catch (err) {
        if (err && err.name === "AbortError") {
          appendTextToNode(currentBotContentNode, "\n\n[已取消]");
          const lastIdx = messages.length - 1;
          if (lastIdx >= 0 && messages[lastIdx].type === "bot") {
            messages[lastIdx].text += "\n\n[已取消]";
          }
        } else {
          const errMsg = err && err.message ? err.message : "流读取出错";
          const errWrap = {
            type: "error",
            sender: "系统",
            text: errMsg,
          };
          addMessageToHistory(errWrap);
          renderMessageNode(container, errWrap);
        }
      } finally {
        setSendingState(false);
        currentAbortController = null;
        currentBotContentNode = null;
        scrollToBottom(container);
      }
    }

    // 事件绑定
    sendBtn.addEventListener("click", () => {
      if (streaming && currentAbortController) {
        // 如果正在流式接收，则当作停止操作
        currentAbortController.abort();
        return;
      }
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      sendMessage(text);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });

    newChatBtn.addEventListener("click", () => {
      if (streaming && currentAbortController) {
        currentAbortController.abort();
      }
      clearHistory();
      container.innerHTML = "";
    });

    // 暴露 API：外部可以访问历史并触发停止
    window.chatAPI = {
      getHistory,
      clearHistory: () => {
        clearHistory();
        if (container) container.innerHTML = "";
      },
    };

    window.stopChatStream = function () {
      if (currentAbortController) currentAbortController.abort();
    };

    // 如果页面已经有历史（例如被其他模块设置），可以重建
    rebuildFromHistory();

    // 初始化：确保按钮图标/文本正确（从 data-* 读取或保持当前）
    (function initButtonIcons() {
      try {
        const initSendIcon = sendBtn.dataset.sendIcon || sendBtn.querySelector('.btn-icon')?.innerHTML || '';
        const initClearIcon = newChatBtn.dataset.clearIcon || newChatBtn.querySelector('.btn-icon')?.innerHTML || '';
        if (sendBtn.querySelector('.btn-icon')) sendBtn.querySelector('.btn-icon').innerHTML = initSendIcon;
        if (newChatBtn.querySelector('.btn-icon')) newChatBtn.querySelector('.btn-icon').innerHTML = initClearIcon;
        // newChatBtn 文本保持 "清空"（由模板提供）
      } catch (e) {}
    })();
  };
}

