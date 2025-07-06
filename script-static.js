// JavaScript para funcionalidades interativas com responsividade móvel
console.log('Script mobile carregado!');

// Estado global da aplicação
let currentSection = 'home';
let currentCategory = 'geral';
let currentRoom = 'geral';
let socket = null;
let username = 'Usuário' + Math.floor(Math.random() * 1000);

// Dados locais
let categories = ['geral', 'projetos', 'ideias'];
let infoData = {
    geral: [
        { id: 1, title: 'Exemplo de Informação', content: 'Esta é uma informação de exemplo.' }
    ],
    projetos: [],
    ideias: []
};
let agents = [
    { 
        id: 1, 
        name: 'Agente de Conteúdo', 
        description: 'Responsável por criar e organizar conteúdo do site',
        status: 'active',
        tasks: 5,
        lastActive: 'Ativo há 2h'
    },
    { 
        id: 2, 
        name: 'Agente de Design', 
        description: 'Cuida do design visual e experiência do usuário',
        status: 'inactive',
        tasks: 2,
        lastActive: 'Inativo'
    }
];
let slides = [
    {
        id: 1,
        name: 'Apresentação Exemplo',
        type: 'pptx',
        description: 'Exemplo de slide criado pelo Manus'
    }
];
let wordDocuments = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupMobileMenu();
    connectSocket();
    loadStoredData();
});

function initializeApp() {
    showSection('home');
    updateCategoriesList();
    updateAgentsList();
    updateSlidesList();
    updateComoList();
}

// Mobile Menu
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navContainer = document.getElementById('nav-container');
    const mobileOverlay = document.getElementById('mobile-overlay');

    mobileMenuBtn.addEventListener('click', function() {
        navContainer.classList.toggle('mobile-open');
        mobileOverlay.classList.toggle('active');
    });

    mobileOverlay.addEventListener('click', function() {
        navContainer.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
    });

    // Close mobile menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navContainer.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
        });
    });
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // Info section
    document.getElementById('add-category')?.addEventListener('click', addCategory);
    document.getElementById('add-info')?.addEventListener('click', addInfo);

    // Chat section
    document.getElementById('add-room')?.addEventListener('click', addRoom);
    document.getElementById('send-message')?.addEventListener('click', sendMessage);
    document.getElementById('message-input')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Slides section
    document.getElementById('upload-slides')?.addEventListener('click', function() {
        document.getElementById('slides-file-input').click();
    });
    
    document.getElementById('upload-word')?.addEventListener('click', function() {
        document.getElementById('word-file-input').click();
    });

    document.getElementById('slides-file-input')?.addEventListener('change', handleSlidesUpload);
    document.getElementById('word-file-input')?.addEventListener('change', handleWordUpload);

    // Como section
    document.getElementById('add-como-item')?.addEventListener('click', addComoItem);

    // Agents section
    document.getElementById('add-agent')?.addEventListener('click', addAgent);
    document.getElementById('filter-agents')?.addEventListener('change', filterAgents);
}

// Navigation
function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    currentSection = sectionName;

    // Load section-specific data
    if (sectionName === 'info') {
        updateInfoContent();
    } else if (sectionName === 'chat') {
        loadChatMessages();
    }
}

// Info Management
function updateCategoriesList() {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;

    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-category="${category}" ${category === currentCategory ? 'class="active"' : ''}>${category}</a>`;
        categoriesList.appendChild(li);
    });

    // Add event listeners
    categoriesList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            selectCategory(this.getAttribute('data-category'));
        });
    });
}

function selectCategory(category) {
    currentCategory = category;
    updateCategoriesList();
    updateInfoContent();
}

function updateInfoContent() {
    const infoContent = document.getElementById('info-content');
    if (!infoContent) return;

    const categoryData = infoData[currentCategory] || [];
    
    if (categoryData.length === 0) {
        infoContent.innerHTML = '<p>Nenhuma informação encontrada nesta categoria.</p>';
        return;
    }

    infoContent.innerHTML = '';
    categoryData.forEach(info => {
        const infoItem = document.createElement('div');
        infoItem.className = 'info-item';
        infoItem.innerHTML = `
            <h4>${info.title}</h4>
            <p>${info.content}</p>
            <div class="info-actions">
                <button class="btn-edit" onclick="editInfo(${info.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteInfo(${info.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        infoContent.appendChild(infoItem);
    });
}

function addCategory() {
    const name = prompt('Nome da nova categoria:');
    if (name && !categories.includes(name)) {
        categories.push(name);
        infoData[name] = [];
        updateCategoriesList();
        saveData();
    }
}

function addInfo() {
    const title = prompt('Título da informação:');
    if (!title) return;
    
    const content = prompt('Conteúdo da informação:');
    if (!content) return;

    const newInfo = {
        id: Date.now(),
        title: title,
        content: content
    };

    if (!infoData[currentCategory]) {
        infoData[currentCategory] = [];
    }
    
    infoData[currentCategory].push(newInfo);
    updateInfoContent();
    saveData();
}

function editInfo(id) {
    const info = infoData[currentCategory].find(item => item.id === id);
    if (!info) return;

    const newTitle = prompt('Novo título:', info.title);
    if (newTitle !== null) info.title = newTitle;

    const newContent = prompt('Novo conteúdo:', info.content);
    if (newContent !== null) info.content = newContent;

    updateInfoContent();
    saveData();
}

function deleteInfo(id) {
    if (confirm('Tem certeza que deseja excluir esta informação?')) {
        infoData[currentCategory] = infoData[currentCategory].filter(item => item.id !== id);
        updateInfoContent();
        saveData();
    }
}

// Chat Management
function connectSocket() {
    try {
        socket = io();
        
        socket.on('connect', function() {
            console.log('Conectado ao servidor');
            socket.emit('join_room', currentRoom);
        });

        socket.on('message', function(data) {
            displayMessage(data);
        });

        socket.on('user_joined', function(data) {
            displaySystemMessage(`${data.username} entrou na sala ${data.room}.`);
        });

        socket.on('user_left', function(data) {
            displaySystemMessage(`${data.username} saiu da sala ${data.room}.`);
        });
    } catch (error) {
        console.log('Modo offline - usando chat local');
        displaySystemMessage('Bem-vindo à sala geral! Esta é uma versão estática do chat.');
    }
}

function loadChatMessages() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    // Load stored messages for current room
    const storedMessages = JSON.parse(localStorage.getItem(`chat_${currentRoom}`) || '[]');
    chatMessages.innerHTML = '';
    
    storedMessages.forEach(message => {
        displayMessage(message, false);
    });

    if (storedMessages.length === 0) {
        displaySystemMessage(`Bem-vindo à sala ${currentRoom}! Esta é uma versão estática do chat.`);
    }
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;

    const messageData = {
        username: username,
        message: message,
        room: currentRoom,
        timestamp: new Date().toLocaleTimeString()
    };

    if (socket && socket.connected) {
        socket.emit('message', messageData);
    } else {
        // Offline mode
        displayMessage(messageData);
        saveMessage(messageData);
    }

    messageInput.value = '';
}

function displayMessage(data, save = true) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="username">${data.username}</span>
            <span class="timestamp">${data.timestamp}</span>
        </div>
        <div class="message-content">${data.message}</div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (save) {
        saveMessage(data);
    }
}

function displaySystemMessage(message) {
    displayMessage({
        username: 'Sistema',
        message: message,
        timestamp: new Date().toLocaleTimeString()
    });
}

function saveMessage(messageData) {
    const roomMessages = JSON.parse(localStorage.getItem(`chat_${currentRoom}`) || '[]');
    roomMessages.push(messageData);
    
    // Keep only last 50 messages
    if (roomMessages.length > 50) {
        roomMessages.splice(0, roomMessages.length - 50);
    }
    
    localStorage.setItem(`chat_${currentRoom}`, JSON.stringify(roomMessages));
}

function addRoom() {
    const roomName = prompt('Nome da nova sala:');
    if (roomName && roomName.trim()) {
        const chatRooms = document.getElementById('chat-rooms');
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-room="${roomName}">${roomName}</a>`;
        chatRooms.appendChild(li);
        
        li.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            selectRoom(roomName);
        });
    }
}

function selectRoom(room) {
    currentRoom = room;
    
    // Update room selection
    document.querySelectorAll('#chat-rooms a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-room="${room}"]`).classList.add('active');
    
    // Load messages for new room
    loadChatMessages();
    
    if (socket && socket.connected) {
        socket.emit('join_room', room);
    }
}

// Slides Management
function handleSlidesUpload(event) {
    const files = event.target.files;
    for (let file of files) {
        const slide = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.name.split('.').pop().toLowerCase(),
            description: `Slide importado: ${file.name}`,
            file: file
        };
        slides.push(slide);
    }
    updateSlidesList();
    saveData();
}

function handleWordUpload(event) {
    const files = event.target.files;
    for (let file of files) {
        const doc = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.name.split('.').pop().toLowerCase(),
            description: `Documento Word: ${file.name}`,
            file: file
        };
        wordDocuments.push(doc);
        
        // Add to slides grid with Word icon
        const wordSlide = {
            id: doc.id,
            name: doc.name,
            type: 'word',
            description: doc.description,
            isWordDoc: true
        };
        slides.push(wordSlide);
    }
    updateSlidesList();
    saveData();
}

function updateSlidesList() {
    const slidesGrid = document.getElementById('slides-grid');
    if (!slidesGrid) return;

    slidesGrid.innerHTML = '';
    
    slides.forEach(slide => {
        const slideCard = document.createElement('div');
        slideCard.className = 'slide-card';
        
        let icon = 'fas fa-file-powerpoint';
        if (slide.type === 'pdf') icon = 'fas fa-file-pdf';
        else if (slide.type === 'word' || slide.isWordDoc) icon = 'fas fa-file-word';
        else if (slide.type === 'odp') icon = 'fas fa-file-alt';
        
        slideCard.innerHTML = `
            <div class="slide-preview">
                <i class="${icon}"></i>
            </div>
            <div class="slide-info">
                <h4>${slide.name}</h4>
                <p>${slide.description}</p>
                <div class="slide-actions">
                    <button class="btn-view" onclick="viewSlide(${slide.id})"><i class="fas fa-eye"></i> Visualizar</button>
                    <button class="btn-share" onclick="shareSlide(${slide.id})"><i class="fas fa-share"></i> Compartilhar</button>
                    <button class="btn-delete" onclick="deleteSlide(${slide.id})"><i class="fas fa-trash"></i> Excluir</button>
                </div>
            </div>
        `;
        slidesGrid.appendChild(slideCard);
    });
}

function viewSlide(id) {
    const slide = slides.find(s => s.id === id);
    if (slide) {
        if (slide.isWordDoc) {
            alert(`Visualizando documento Word: ${slide.name}\n\nEm uma implementação completa, este documento seria aberto em um visualizador de Word.`);
        } else {
            alert(`Visualizando slide: ${slide.name}\n\nEm uma implementação completa, este slide seria aberto em uma nova janela.`);
        }
    }
}

function shareSlide(id) {
    const slide = slides.find(s => s.id === id);
    if (slide) {
        const shareUrl = `${window.location.origin}/slides/${id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert(`Link copiado para a área de transferência:\n${shareUrl}`);
        }).catch(() => {
            prompt('Copie este link:', shareUrl);
        });
    }
}

function deleteSlide(id) {
    if (confirm('Tem certeza que deseja excluir este slide?')) {
        slides = slides.filter(s => s.id !== id);
        wordDocuments = wordDocuments.filter(d => d.id !== id);
        updateSlidesList();
        saveData();
    }
}

// Agents Management
function updateAgentsList() {
    const agentsGrid = document.getElementById('agents-grid');
    if (!agentsGrid) return;

    agentsGrid.innerHTML = '';
    
    agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        agentCard.innerHTML = `
            <div class="agent-status ${agent.status}"></div>
            <div class="agent-info">
                <h4>${agent.name}</h4>
                <p>${agent.description}</p>
                <div class="agent-stats">
                    <div class="stat">
                        <i class="fas fa-tasks"></i>
                        <span>${agent.tasks} tarefas</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-clock"></i>
                        <span>${agent.lastActive}</span>
                    </div>
                </div>
                <div class="agent-actions">
                    <button class="btn-${agent.status === 'active' ? 'pause' : 'play'}" onclick="toggleAgent(${agent.id})">
                        <i class="fas fa-${agent.status === 'active' ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="btn-edit" onclick="editAgent(${agent.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteAgent(${agent.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        agentsGrid.appendChild(agentCard);
    });
}

function addAgent() {
    const name = prompt('Nome do agente:');
    if (!name) return;
    
    const description = prompt('Descrição do agente:');
    if (!description) return;

    const newAgent = {
        id: Date.now(),
        name: name,
        description: description,
        status: 'inactive',
        tasks: 0,
        lastActive: 'Criado agora'
    };

    agents.push(newAgent);
    updateAgentsList();
    saveData();
}

function editAgent(id) {
    const agent = agents.find(a => a.id === id);
    if (!agent) return;

    const newName = prompt('Novo nome:', agent.name);
    if (newName !== null) agent.name = newName;

    const newDescription = prompt('Nova descrição:', agent.description);
    if (newDescription !== null) agent.description = newDescription;

    updateAgentsList();
    saveData();
}

function deleteAgent(id) {
    if (confirm('Tem certeza que deseja excluir este agente?')) {
        agents = agents.filter(a => a.id !== id);
        updateAgentsList();
        saveData();
    }
}

function toggleAgent(id) {
    const agent = agents.find(a => a.id === id);
    if (!agent) return;

    agent.status = agent.status === 'active' ? 'inactive' : 'active';
    agent.lastActive = agent.status === 'active' ? 'Ativo agora' : 'Pausado agora';
    
    updateAgentsList();
    saveData();
}

function filterAgents() {
    const filter = document.getElementById('filter-agents').value;
    const agentCards = document.querySelectorAll('.agent-card');
    
    agentCards.forEach((card, index) => {
        const agent = agents[index];
        if (filter === 'all' || agent.status === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Como Management
function updateComoList() {
    const comoList = document.getElementById('como-list');
    if (!comoList) return;

    comoList.innerHTML = '';
    
    comoItems.forEach(item => {
        const comoItem = document.createElement('div');
        comoItem.className = 'como-item';
        comoItem.innerHTML = `
            <div class="como-header" onclick="toggleComoItem(${item.id})">
                <h4>${item.title}</h4>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="como-content" id="como-content-${item.id}">
                <p>${item.content.split('\n')[0]}</p>
                <ol>
                    ${item.content.split('\n').slice(1).map(line => 
                        line.trim() ? `<li>${line.replace(/^\d+\.\s*/, '')}</li>` : ''
                    ).join('')}
                </ol>
            </div>
            <div class="como-actions">
                <button class="btn-edit" onclick="editComoItem(${item.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteComoItem(${item.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        comoList.appendChild(comoItem);
    });
}

function toggleComoItem(id) {
    const comoItem = document.querySelector(`#como-content-${id}`).parentElement;
    comoItem.classList.toggle('expanded');
}

function addComoItem() {
    const title = prompt('Título do item:');
    if (!title) return;
    
    const content = prompt('Conteúdo do item (use quebras de linha para criar uma lista):');
    if (!content) return;

    const newItem = {
        id: Date.now(),
        title: title,
        content: content
    };

    comoItems.push(newItem);
    updateComoList();
    saveData();
}

function editComoItem(id) {
    const item = comoItems.find(i => i.id === id);
    if (!item) return;

    const newTitle = prompt('Novo título:', item.title);
    if (newTitle !== null) item.title = newTitle;

    const newContent = prompt('Novo conteúdo:', item.content);
    if (newContent !== null) item.content = newContent;

    updateComoList();
    saveData();
}

function deleteComoItem(id) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        comoItems = comoItems.filter(i => i.id !== id);
        updateComoList();
        saveData();
    }
}

// Data Persistence
function saveData() {
    localStorage.setItem('collaborative_site_data', JSON.stringify({
        categories: categories,
        infoData: infoData,
        agents: agents,
        slides: slides.filter(s => !s.file), // Don't save file objects
        wordDocuments: wordDocuments.filter(d => !d.file),
        comoItems: comoItems
    }));
}

function loadStoredData() {
    const stored = localStorage.getItem('collaborative_site_data');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            categories = data.categories || categories;
            infoData = data.infoData || infoData;
            agents = data.agents || agents;
            slides = [...(data.slides || []), ...slides.filter(s => s.file)];
            wordDocuments = [...(data.wordDocuments || []), ...wordDocuments.filter(d => d.file)];
            comoItems = data.comoItems || comoItems;
            
            updateCategoriesList();
            updateAgentsList();
            updateSlidesList();
            updateComoList();
        } catch (error) {
            console.error('Erro ao carregar dados salvos:', error);
        }
    }
}

// Utility Functions
function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Mobile-specific optimizations
function isMobile() {
    return window.innerWidth <= 768;
}

// Responsive adjustments
window.addEventListener('resize', function() {
    if (!isMobile()) {
        // Close mobile menu on desktop
        document.getElementById('nav-container').classList.remove('mobile-open');
        document.getElementById('mobile-overlay').classList.remove('active');
    }
});

// Touch events for mobile
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function() {}, { passive: true });
}

let comoItems = [
    {
        id: 1,
        title: 'Como adicionar informações',
        content: `Para adicionar informações ao site:
1. Vá para a seção "Informações"
2. Selecione uma categoria na barra lateral
3. Clique em "Adicionar Informação"
4. Preencha o título e conteúdo
5. Clique em "Salvar"`
    },
    {
        id: 2,
        title: 'Como usar o chat',
        content: `Para participar do chat colaborativo:
1. Acesse a seção "Chat"
2. Escolha uma sala na barra lateral
3. Digite sua mensagem na caixa de texto
4. Pressione Enter ou clique no botão enviar
5. Suas mensagens aparecerão em tempo real`
    },
    {
        id: 3,
        title: 'Como gerenciar agentes',
        content: `Para gerenciar seus agentes de IA:
1. Vá para a seção "Meus Agentes"
2. Clique em "Adicionar Agente" para criar um novo
3. Use os botões play/pause para controlar o status
4. Filtre agentes por status usando o dropdown
5. Edite ou exclua agentes conforme necessário`
    }
];

console.log('Site colaborativo inicializado com sucesso!');

