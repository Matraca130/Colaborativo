// JavaScript para funcionalidades interativas do site colaborativo

// Configuração do SocketIO
let socket;
let currentRoom = 'geral';
let currentUsername = 'Usuário' + Math.floor(Math.random() * 1000);

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar SocketIO
    initSocketIO();
    
    // Navegação entre seções
    initNavigation();
    
    // Funcionalidades da seção de informações
    initInfoSection();
    
    // Funcionalidades do chat
    initChatSection();
    
    // Funcionalidades dos slides
    initSlidesSection();
    
    // Funcionalidades dos agentes
    initAgentsSection();
    
    console.log('Site Colaborativo carregado com sucesso!');
});

// Inicializar SocketIO
function initSocketIO() {
    socket = io();
    
    socket.on('connect', function() {
        console.log('Conectado ao servidor');
        socket.emit('join', {username: currentUsername, room: currentRoom});
    });
    
    socket.on('message', function(data) {
        addMessageToChat(data);
    });
    
    socket.on('status', function(data) {
        addStatusMessage(data.msg);
    });
}

// Navegação entre seções
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetSection = document.getElementById(this.dataset.section);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Funcionalidades da seção de informações
function initInfoSection() {
    const categoryLinks = document.querySelectorAll('.category-link');
    const addCategoryBtn = document.getElementById('add-category');
    const addInfoBtn = document.getElementById('add-info');
    const currentCategoryTitle = document.getElementById('current-category');
    
    // Navegação entre categorias
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all category links
            categoryLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Update category title
            const categoryName = this.textContent;
            currentCategoryTitle.textContent = `Informações - ${categoryName}`;
            
            // Here you would load category-specific information
            loadCategoryInfo(this.dataset.category);
        });
    });
    
    // Adicionar nova categoria
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            const categoryName = prompt('Nome da nova categoria:');
            if (categoryName && categoryName.trim()) {
                addNewCategory(categoryName.trim());
            }
        });
    }
    
    // Adicionar nova informação
    if (addInfoBtn) {
        addInfoBtn.addEventListener('click', function() {
            addNewInfo();
        });
    }
    
    // Event delegation para botões de ação das informações
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-edit')) {
            editInfo(e.target);
        } else if (e.target.classList.contains('btn-delete')) {
            deleteInfo(e.target);
        }
    });
}

function loadCategoryInfo(category) {
    const infoItems = document.getElementById('info-items');
    
    // Carregar informações do localStorage
    const savedInfo = loadFromLocalStorage(`category_${category}`) || [];
    
    infoItems.innerHTML = '';
    savedInfo.forEach(item => {
        const infoItem = createInfoItem(item.title, item.content);
        infoItems.appendChild(infoItem);
    });
    
    if (savedInfo.length === 0) {
        infoItems.innerHTML = '<p style="text-align: center; color: #718096; padding: 2rem;">Nenhuma informação encontrada nesta categoria.</p>';
    }
}

function createInfoItem(title, content) {
    const div = document.createElement('div');
    div.className = 'info-item';
    div.innerHTML = `
        <h4>${title}</h4>
        <p>${content}</p>
        <div class="info-actions">
            <button class="btn-edit"><i class="fas fa-edit"></i></button>
            <button class="btn-delete"><i class="fas fa-trash"></i></button>
        </div>
    `;
    return div;
}

function addNewCategory(name) {
    const categoryList = document.querySelector('.category-list');
    const li = document.createElement('li');
    const categoryId = name.toLowerCase().replace(/\s+/g, '-');
    
    li.innerHTML = `<a href="#" class="category-link" data-category="${categoryId}">${name}</a>`;
    categoryList.appendChild(li);
    
    // Reattach event listeners
    const newLink = li.querySelector('.category-link');
    newLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('current-category').textContent = `Informações - ${name}`;
        loadCategoryInfo(categoryId);
    });
    
    // Salvar categorias no localStorage
    const categories = loadFromLocalStorage('categories') || [];
    categories.push({id: categoryId, name: name});
    saveToLocalStorage('categories', categories);
}

function addNewInfo() {
    const title = prompt('Título da informação:');
    if (!title || !title.trim()) return;
    
    const content = prompt('Conteúdo da informação:');
    if (!content || !content.trim()) return;
    
    const activeCategory = document.querySelector('.category-link.active');
    const categoryId = activeCategory ? activeCategory.dataset.category : 'geral';
    
    // Salvar no localStorage
    const categoryInfo = loadFromLocalStorage(`category_${categoryId}`) || [];
    categoryInfo.push({title: title.trim(), content: content.trim()});
    saveToLocalStorage(`category_${categoryId}`, categoryInfo);
    
    // Atualizar interface
    const infoItems = document.getElementById('info-items');
    const newItem = createInfoItem(title.trim(), content.trim());
    infoItems.appendChild(newItem);
}

function editInfo(button) {
    const infoItem = button.closest('.info-item');
    const title = infoItem.querySelector('h4').textContent;
    const content = infoItem.querySelector('p').textContent;
    
    const newTitle = prompt('Novo título:', title);
    if (!newTitle || !newTitle.trim()) return;
    
    const newContent = prompt('Novo conteúdo:', content);
    if (!newContent || !newContent.trim()) return;
    
    infoItem.querySelector('h4').textContent = newTitle.trim();
    infoItem.querySelector('p').textContent = newContent.trim();
    
    // Atualizar localStorage
    const activeCategory = document.querySelector('.category-link.active');
    const categoryId = activeCategory ? activeCategory.dataset.category : 'geral';
    const categoryInfo = loadFromLocalStorage(`category_${categoryId}`) || [];
    
    // Encontrar e atualizar o item
    const itemIndex = Array.from(infoItem.parentNode.children).indexOf(infoItem);
    if (categoryInfo[itemIndex]) {
        categoryInfo[itemIndex] = {title: newTitle.trim(), content: newContent.trim()};
        saveToLocalStorage(`category_${categoryId}`, categoryInfo);
    }
}

function deleteInfo(button) {
    if (confirm('Tem certeza que deseja excluir esta informação?')) {
        const infoItem = button.closest('.info-item');
        const itemIndex = Array.from(infoItem.parentNode.children).indexOf(infoItem);
        
        // Remover do localStorage
        const activeCategory = document.querySelector('.category-link.active');
        const categoryId = activeCategory ? activeCategory.dataset.category : 'geral';
        const categoryInfo = loadFromLocalStorage(`category_${categoryId}`) || [];
        
        categoryInfo.splice(itemIndex, 1);
        saveToLocalStorage(`category_${categoryId}`, categoryInfo);
        
        infoItem.remove();
    }
}

// Funcionalidades do chat
function initChatSection() {
    const roomLinks = document.querySelectorAll('.room-link');
    const createRoomBtn = document.getElementById('create-room');
    const sendMessageBtn = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');
    const currentRoomTitle = document.getElementById('current-room');
    
    // Carregar salas do servidor
    loadRoomsFromServer();
    
    // Navegação entre salas
    roomLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            switchRoom(this.dataset.room, this.textContent);
        });
    });
    
    // Criar nova sala
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', function() {
            const roomName = prompt('Nome da nova sala:');
            if (roomName && roomName.trim()) {
                createNewRoom(roomName.trim());
            }
        });
    }
    
    // Enviar mensagem
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function loadRoomsFromServer() {
    fetch('/api/chat/rooms')
        .then(response => response.json())
        .then(rooms => {
            const roomList = document.querySelector('.room-list');
            roomList.innerHTML = '';
            
            rooms.forEach(room => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" class="room-link ${room.name === currentRoom ? 'active' : ''}" data-room="${room.name}">${room.name}</a>`;
                roomList.appendChild(li);
                
                const link = li.querySelector('.room-link');
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    switchRoom(room.name, room.name);
                });
            });
        })
        .catch(error => console.error('Erro ao carregar salas:', error));
}

function switchRoom(roomName, displayName) {
    // Sair da sala atual
    socket.emit('leave', {username: currentUsername, room: currentRoom});
    
    // Entrar na nova sala
    currentRoom = roomName;
    socket.emit('join', {username: currentUsername, room: currentRoom});
    
    // Atualizar interface
    document.querySelectorAll('.room-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-room="${roomName}"]`).classList.add('active');
    document.getElementById('current-room').textContent = `Sala ${displayName}`;
    
    // Carregar mensagens da sala
    loadRoomMessages(roomName);
}

function loadRoomMessages(roomName) {
    fetch(`/api/chat/rooms/${roomName}/messages`)
        .then(response => response.json())
        .then(messages => {
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = '';
            
            messages.forEach(msg => {
                addMessageToChat(msg);
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => console.error('Erro ao carregar mensagens:', error));
}

function addMessageToChat(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = createMessageElement(message.username, message.content, message.timestamp);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addStatusMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const statusDiv = document.createElement('div');
    statusDiv.className = 'message status-message';
    statusDiv.innerHTML = `<div class="message-content" style="font-style: italic; color: #a0aec0;">${message}</div>`;
    chatMessages.appendChild(statusDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createMessageElement(username, content, timestamp) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
        <div class="message-header">
            <span class="username">${username}</span>
            <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-content">${content}</div>
    `;
    return div;
}

function createNewRoom(name) {
    fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({name: name})
    })
    .then(response => response.json())
    .then(room => {
        if (room.error) {
            alert(room.error);
        } else {
            loadRoomsFromServer();
        }
    })
    .catch(error => {
        console.error('Erro ao criar sala:', error);
        alert('Erro ao criar sala');
    });
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Enviar via SocketIO
    socket.emit('message', {
        username: currentUsername,
        content: message,
        room: currentRoom
    });
    
    messageInput.value = '';
}

// Funcionalidades dos slides
function initSlidesSection() {
    const uploadSlidesBtn = document.getElementById('upload-slides');
    const createPresentationBtn = document.getElementById('create-presentation');
    
    if (uploadSlidesBtn) {
        uploadSlidesBtn.addEventListener('click', function() {
            createFileUploadDialog();
        });
    }
    
    if (createPresentationBtn) {
        createPresentationBtn.addEventListener('click', function() {
            alert('Funcionalidade de criação de apresentação será implementada em breve!');
        });
    }
    
    // Carregar slides salvos
    loadSavedSlides();
    
    // Event delegation para ações dos slides
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-view')) {
            viewSlide(e.target);
        } else if (e.target.classList.contains('btn-share')) {
            shareSlide(e.target);
        } else if (e.target.classList.contains('btn-delete-slide')) {
            deleteSlide(e.target);
        }
    });
}

function createFileUploadDialog() {
    // Criar input de arquivo
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.ppt,.pptx,.odp';
    fileInput.multiple = true;
    
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            uploadSlideFile(file);
        });
    });
    
    fileInput.click();
}

function uploadSlideFile(file) {
    // Simular upload (em uma implementação real, você enviaria para o servidor)
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const slideData = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString(),
            data: e.target.result // Em produção, isso seria uma URL do servidor
        };
        
        // Salvar no localStorage
        const savedSlides = loadFromLocalStorage('slides') || [];
        savedSlides.push(slideData);
        saveToLocalStorage('slides', savedSlides);
        
        // Atualizar interface
        addSlideToGrid(slideData);
        
        alert(`Slide "${file.name}" carregado com sucesso!`);
    };
    
    reader.readAsDataURL(file);
}

function loadSavedSlides() {
    const savedSlides = loadFromLocalStorage('slides') || [];
    const slidesGrid = document.getElementById('slides-grid');
    
    // Limpar slides existentes (exceto o exemplo)
    const existingSlides = slidesGrid.querySelectorAll('.slide-card[data-slide-id]');
    existingSlides.forEach(slide => slide.remove());
    
    // Adicionar slides salvos
    savedSlides.forEach(slide => {
        addSlideToGrid(slide);
    });
}

function addSlideToGrid(slideData) {
    const slidesGrid = document.getElementById('slides-grid');
    const slideCard = document.createElement('div');
    slideCard.className = 'slide-card';
    slideCard.setAttribute('data-slide-id', slideData.id);
    
    const fileIcon = getFileIcon(slideData.name);
    const fileSize = formatFileSize(slideData.size);
    const uploadDate = new Date(slideData.uploadDate).toLocaleDateString();
    
    slideCard.innerHTML = `
        <div class="slide-preview">
            <i class="${fileIcon}"></i>
        </div>
        <div class="slide-info">
            <h4>${slideData.name}</h4>
            <p>Tamanho: ${fileSize} | Carregado em: ${uploadDate}</p>
            <div class="slide-actions">
                <button class="btn-view"><i class="fas fa-eye"></i> Visualizar</button>
                <button class="btn-share"><i class="fas fa-share"></i> Compartilhar</button>
                <button class="btn-delete-slide"><i class="fas fa-trash"></i> Excluir</button>
            </div>
        </div>
    `;
    
    slidesGrid.appendChild(slideCard);
}

function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'fas fa-file-pdf';
        case 'ppt':
        case 'pptx':
            return 'fas fa-file-powerpoint';
        case 'odp':
            return 'fas fa-file-presentation';
        default:
            return 'fas fa-file';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function viewSlide(button) {
    const slideCard = button.closest('.slide-card');
    const slideId = slideCard.getAttribute('data-slide-id');
    
    if (slideId) {
        const savedSlides = loadFromLocalStorage('slides') || [];
        const slide = savedSlides.find(s => s.id == slideId);
        
        if (slide) {
            // Abrir slide em nova janela
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <html>
                    <head>
                        <title>${slide.name}</title>
                        <style>
                            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                            .slide-viewer { text-align: center; }
                            embed, iframe { width: 100%; height: 80vh; }
                        </style>
                    </head>
                    <body>
                        <div class="slide-viewer">
                            <h2>${slide.name}</h2>
                            <embed src="${slide.data}" type="${slide.type}" />
                        </div>
                    </body>
                </html>
            `);
        }
    } else {
        alert('Visualizando slide de exemplo');
    }
}

function shareSlide(button) {
    const slideCard = button.closest('.slide-card');
    const slideTitle = slideCard.querySelector('h4').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: slideTitle,
            text: 'Confira este slide criado no Site Colaborativo',
            url: window.location.href
        });
    } else {
        // Fallback para navegadores que não suportam Web Share API
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copiado para a área de transferência!');
        });
    }
}

function deleteSlide(button) {
    if (confirm('Tem certeza que deseja excluir este slide?')) {
        const slideCard = button.closest('.slide-card');
        const slideId = slideCard.getAttribute('data-slide-id');
        
        if (slideId) {
            // Remover do localStorage
            const savedSlides = loadFromLocalStorage('slides') || [];
            const updatedSlides = savedSlides.filter(s => s.id != slideId);
            saveToLocalStorage('slides', updatedSlides);
        }
        
        // Remover da interface
        slideCard.remove();
    }
}

// Funcionalidades dos agentes
function initAgentsSection() {
    const addAgentBtn = document.getElementById('add-agent');
    const agentFilter = document.getElementById('agent-filter');
    
    if (addAgentBtn) {
        addAgentBtn.addEventListener('click', function() {
            addNewAgent();
        });
    }
    
    if (agentFilter) {
        agentFilter.addEventListener('change', function() {
            filterAgents(this.value);
        });
    }
    
    // Event delegation para ações dos agentes
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-pause')) {
            pauseAgent(e.target);
        } else if (e.target.classList.contains('btn-play')) {
            playAgent(e.target);
        }
    });
}

function addNewAgent() {
    const name = prompt('Nome do novo agente:');
    if (!name || !name.trim()) return;
    
    const description = prompt('Descrição do agente:');
    if (!description || !description.trim()) return;
    
    const agentsGrid = document.getElementById('agents-grid');
    const agentCard = createAgentCard(name.trim(), description.trim(), 'active');
    agentsGrid.appendChild(agentCard);
}

function createAgentCard(name, description, status) {
    const div = document.createElement('div');
    div.className = 'agent-card';
    div.innerHTML = `
        <div class="agent-status ${status}"></div>
        <div class="agent-info">
            <h4>${name}</h4>
            <p>${description}</p>
            <div class="agent-stats">
                <span class="stat"><i class="fas fa-tasks"></i> 0 tarefas</span>
                <span class="stat"><i class="fas fa-clock"></i> ${status === 'active' ? 'Ativo agora' : 'Inativo'}</span>
            </div>
        </div>
        <div class="agent-actions">
            <button class="btn-view"><i class="fas fa-eye"></i></button>
            <button class="btn-edit"><i class="fas fa-edit"></i></button>
            <button class="${status === 'active' ? 'btn-pause' : 'btn-play'}">
                <i class="fas fa-${status === 'active' ? 'pause' : 'play'}"></i>
            </button>
        </div>
    `;
    return div;
}

function filterAgents(filter) {
    const agentCards = document.querySelectorAll('.agent-card');
    
    agentCards.forEach(card => {
        const status = card.querySelector('.agent-status');
        const isActive = status.classList.contains('active');
        
        switch (filter) {
            case 'active':
                card.style.display = isActive ? 'block' : 'none';
                break;
            case 'inactive':
                card.style.display = !isActive ? 'block' : 'none';
                break;
            default:
                card.style.display = 'block';
        }
    });
}

function pauseAgent(button) {
    const agentCard = button.closest('.agent-card');
    const status = agentCard.querySelector('.agent-status');
    const statusText = agentCard.querySelector('.stat:last-child');
    
    status.classList.remove('active');
    status.classList.add('inactive');
    statusText.innerHTML = '<i class="fas fa-clock"></i> Inativo';
    
    button.className = 'btn-play';
    button.innerHTML = '<i class="fas fa-play"></i>';
}

function playAgent(button) {
    const agentCard = button.closest('.agent-card');
    const status = agentCard.querySelector('.agent-status');
    const statusText = agentCard.querySelector('.stat:last-child');
    
    status.classList.remove('inactive');
    status.classList.add('active');
    statusText.innerHTML = '<i class="fas fa-clock"></i> Ativo agora';
    
    button.className = 'btn-pause';
    button.innerHTML = '<i class="fas fa-pause"></i>';
}

// Função utilitária para salvar dados localmente
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn('Não foi possível salvar no localStorage:', e);
    }
}

// Função utilitária para carregar dados localmente
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.warn('Não foi possível carregar do localStorage:', e);
        return null;
    }
}

