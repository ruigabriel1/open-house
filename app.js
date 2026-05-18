/**
 * OPEN HOUSE — App Logic
 * Cronômetro, senha, formulário RSVP, integração Google Sheets.
 */

// ============================================
// CONFIGURAÇÃO DO EVENTO
// ============================================
const CONFIG = {
    EVENT_NAME: 'OPEN HOUSE',
    PASSWORD: '06/08',
    EVENT_DATE: null,           // Formato: '2026-08-06T19:00:00' (null = a definir)
    EVENT_LOCATION: 'A DEFINIR',
    SHEETS_API_URL: 'https://script.google.com/macros/s/AKfycbz1uGwk4by4AX2pFleX9wnAvcZxApquP_PgeBmgRyotubmZGgMl-lfIeqlKYeFOjifC-g/exec',
};

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================
const state = {
    accessGranted: false,
    guestCount: 0,
    submitting: false,
    confirmed: [],
};

// ============================================
// ELEMENTOS DO DOM
// ============================================
const DOM = {
    // Countdown
    days: document.getElementById('countdown-days'),
    hours: document.getElementById('countdown-hours'),
    minutes: document.getElementById('countdown-minutes'),
    seconds: document.getElementById('countdown-seconds'),
    eventInfo: document.getElementById('event-info'),
    // Password
    passwordGate: document.getElementById('password-gate'),
    passwordInput: document.getElementById('password-input'),
    passwordError: document.getElementById('password-error'),
    enterBtn: document.getElementById('enter-btn'),
    // Access
    accessGranted: document.getElementById('access-granted'),
    // RSVP
    rsvpSection: document.getElementById('rsvp'),
    rsvpForm: document.getElementById('rsvp-form'),
    rsvpSuccess: document.getElementById('rsvp-success'),
    addGuestBtn: document.getElementById('add-guest-btn'),
    submitBtn: document.getElementById('submit-btn'),
    guestsContainer: document.getElementById('guests-container'),
    // Confirmed
    confirmedSection: document.getElementById('confirmed'),
    confirmedList: document.getElementById('confirmed-list'),
    confirmedCount: document.getElementById('confirmed-count'),
};

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initEventInfo();
    initPasswordGate();
    initRSVPForm();
    loadConfirmedList();
});

// ============================================
// CRONÔMETRO REGRESSIVO
// ============================================
function initCountdown() {
    if (!CONFIG.EVENT_DATE) {
        DOM.days.textContent = '??';
        DOM.hours.textContent = '??';
        DOM.minutes.textContent = '??';
        DOM.seconds.textContent = '??';
        return;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const target = new Date(CONFIG.EVENT_DATE).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
        DOM.days.textContent = '00';
        DOM.hours.textContent = '00';
        DOM.minutes.textContent = '00';
        DOM.seconds.textContent = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    DOM.days.textContent = String(days).padStart(2, '0');
    DOM.hours.textContent = String(hours).padStart(2, '0');
    DOM.minutes.textContent = String(minutes).padStart(2, '0');
    DOM.seconds.textContent = String(seconds).padStart(2, '0');
}

function initEventInfo() {
    const parts = [];
    if (CONFIG.EVENT_DATE) {
        const date = new Date(CONFIG.EVENT_DATE);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        parts.push(date.toLocaleDateString('pt-BR', options).toUpperCase());
    } else {
        parts.push('DATA A DEFINIR');
    }
    if (CONFIG.EVENT_LOCATION && CONFIG.EVENT_LOCATION !== 'A DEFINIR') {
        parts.push(CONFIG.EVENT_LOCATION.toUpperCase());
    }
    DOM.eventInfo.textContent = parts.join(' — ');
}

// ============================================
// SISTEMA DE SENHA
// ============================================
function initPasswordGate() {
    DOM.enterBtn.addEventListener('click', checkPassword);
    DOM.passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkPassword();
        }
    });
    // Limpar estado de erro ao digitar
    DOM.passwordInput.addEventListener('input', () => {
        DOM.passwordInput.classList.remove('error', 'shake');
        DOM.passwordError.classList.add('hidden');
    });
    // Toggle visibilidade da senha
    const toggleBtn = document.getElementById('toggle-password');
    toggleBtn.addEventListener('click', togglePasswordVisibility);
}

function togglePasswordVisibility() {
    const input = DOM.passwordInput;
    const iconEye = document.getElementById('icon-eye');
    const iconEyeOff = document.getElementById('icon-eye-off');

    if (input.type === 'password') {
        input.type = 'text';
        iconEye.classList.add('hidden');
        iconEyeOff.classList.remove('hidden');
    } else {
        input.type = 'password';
        iconEye.classList.remove('hidden');
        iconEyeOff.classList.add('hidden');
    }
}

function checkPassword() {
    const input = DOM.passwordInput.value.trim();

    if (input === CONFIG.PASSWORD) {
        grantAccess();
    } else {
        // Feedback de erro
        DOM.passwordInput.classList.add('error', 'shake');
        DOM.passwordError.classList.remove('hidden');
        DOM.passwordInput.value = '';
        DOM.passwordInput.focus();

        // Remover shake após animação
        setTimeout(() => {
            DOM.passwordInput.classList.remove('shake');
        }, 500);
    }
}

function grantAccess() {
    state.accessGranted = true;

    // Fade out password gate
    DOM.passwordGate.classList.add('fade-out');

    setTimeout(() => {
        DOM.passwordGate.classList.add('hidden');

        // Show access granted message
        DOM.accessGranted.classList.remove('hidden');
        requestAnimationFrame(() => {
            DOM.accessGranted.classList.add('visible');
        });

        // Reveal RSVP and Confirmed sections
        DOM.rsvpSection.classList.remove('hidden');
        DOM.confirmedSection.classList.remove('hidden');

        // Smooth scroll to RSVP after a delay
        setTimeout(() => {
            DOM.rsvpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1500);
    }, 500);
}

// ============================================
// FORMULÁRIO RSVP
// ============================================
function initRSVPForm() {
    DOM.addGuestBtn.addEventListener('click', addGuestBlock);
    DOM.rsvpForm.addEventListener('submit', handleSubmit);
}

function addGuestBlock() {
    state.guestCount++;
    const index = state.guestCount;

    const block = document.createElement('div');
    block.classList.add('guest-block');
    block.setAttribute('data-guest-index', index);
    block.innerHTML = `
        <div class="guest-block__header">
            <span class="guest-block__title">CONVIDADO ${index}</span>
            <button type="button" class="guest-block__remove" data-remove="${index}" aria-label="Remover convidado">&times;</button>
        </div>
        <div class="form-group">
            <input type="text" name="guest_nome_${index}" class="form-input" placeholder="Nome do convidado *" required minlength="2">
        </div>
        <div class="form-group">
            <input type="email" name="guest_email_${index}" class="form-input" placeholder="E-mail do convidado *" required>
        </div>
        <div class="form-group">
            <input type="number" name="guest_idade_${index}" class="form-input" placeholder="Idade do convidado *" required min="1" max="120">
        </div>
        <div class="form-group">
            <input type="text" name="guest_instagram_${index}" class="form-input" placeholder="@instagram">
        </div>
    `;

    DOM.guestsContainer.appendChild(block);

    // Botão remover
    block.querySelector(`[data-remove="${index}"]`).addEventListener('click', () => {
        block.remove();
    });

    // Scroll to new block
    block.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function handleSubmit(e) {
    e.preventDefault();

    if (state.submitting) return;

    // Validar campos obrigatórios
    if (!validateForm()) return;

    state.submitting = true;
    DOM.submitBtn.classList.add('loading');
    DOM.submitBtn.textContent = 'ENVIANDO...';

    // Coletar dados
    const formData = collectFormData();

    try {
        await submitData(formData);

        // Sucesso
        DOM.rsvpForm.classList.add('hidden');
        DOM.rsvpSuccess.classList.remove('hidden');

        // Recarregar lista
        await loadConfirmedList();

        // Após 4 segundos, permitir nova inscrição
        setTimeout(() => {
            DOM.rsvpForm.classList.remove('hidden');
            DOM.rsvpSuccess.classList.add('hidden');
            DOM.rsvpForm.reset();
            DOM.guestsContainer.innerHTML = '';
            state.guestCount = 0;
            DOM.submitBtn.textContent = 'CONFIRMAR';
            DOM.submitBtn.classList.remove('loading');
            state.submitting = false;
        }, 4000);

    } catch (error) {
        console.error('Erro ao enviar:', error);
        DOM.submitBtn.textContent = 'ERRO — TENTE NOVAMENTE';
        DOM.submitBtn.classList.remove('loading');
        state.submitting = false;

        setTimeout(() => {
            DOM.submitBtn.textContent = 'CONFIRMAR';
        }, 3000);
    }
}

function validateForm() {
    const inputs = DOM.rsvpForm.querySelectorAll('[required]');
    let valid = true;

    inputs.forEach(input => {
        input.classList.remove('invalid');

        if (!input.value.trim()) {
            input.classList.add('invalid');
            valid = false;
        }

        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                input.classList.add('invalid');
                valid = false;
            }
        }

        if (input.type === 'number' && input.value.trim()) {
            const age = parseInt(input.value);
            if (age < 1 || age > 120) {
                input.classList.add('invalid');
                valid = false;
            }
        }
    });

    if (!valid) {
        const firstInvalid = DOM.rsvpForm.querySelector('.invalid');
        if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus();
        }
    }

    return valid;
}

function collectFormData() {
    const data = {
        titular: {
            nome: document.getElementById('field-nome').value.trim(),
            email: document.getElementById('field-email').value.trim(),
            idade: parseInt(document.getElementById('field-idade').value),
            instagram: document.getElementById('field-instagram').value.trim(),
        },
        convidados: [],
    };

    // Coletar convidados
    const guestBlocks = DOM.guestsContainer.querySelectorAll('.guest-block');
    guestBlocks.forEach(block => {
        const index = block.getAttribute('data-guest-index');
        const nome = block.querySelector(`[name="guest_nome_${index}"]`).value.trim();
        const email = block.querySelector(`[name="guest_email_${index}"]`).value.trim();
        const idade = parseInt(block.querySelector(`[name="guest_idade_${index}"]`).value);
        const instagram = block.querySelector(`[name="guest_instagram_${index}"]`).value.trim();

        if (nome && email && idade) {
            data.convidados.push({ nome, email, idade, instagram });
        }
    });

    return data;
}

// ============================================
// INTEGRAÇÃO COM GOOGLE SHEETS
// ============================================
async function submitData(data) {
    if (!CONFIG.SHEETS_API_URL) {
        // Modo local (fallback quando API não configurada)
        return submitLocal(data);
    }

    const url = `${CONFIG.SHEETS_API_URL}?action=submit&data=${encodeURIComponent(JSON.stringify(data))}`;
    
    const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
    });

    // Google Apps Script retorna texto mesmo após redirect
    const text = await response.text();
    
    try {
        return JSON.parse(text);
    } catch (e) {
        // Se o redirect retornou HTML ou texto, tenta verificar se teve sucesso
        console.warn('Resposta não-JSON do Apps Script:', text);
        // Se chegou aqui sem erro de rede, provavelmente foi sucesso
        return { success: true, message: 'Dados enviados' };
    }
}

async function loadConfirmedList() {
    try {
        let confirmed;

        if (!CONFIG.SHEETS_API_URL) {
            // Modo local
            confirmed = loadLocal();
        } else {
            const url = `${CONFIG.SHEETS_API_URL}?action=list`;
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow',
            });
            const text = await response.text();
            
            try {
                const result = JSON.parse(text);
                confirmed = result.confirmed || [];
            } catch (e) {
                console.warn('Erro ao parsear lista:', text);
                confirmed = loadLocal(); // Fallback para local
            }
        }

        state.confirmed = confirmed;
        renderConfirmedList(confirmed);

    } catch (error) {
        console.error('Erro ao carregar confirmados:', error);
        // Fallback para localStorage em caso de erro de rede
        const local = loadLocal();
        state.confirmed = local;
        renderConfirmedList(local);
    }
}

function renderConfirmedList(confirmed) {
    DOM.confirmedList.innerHTML = '';

    if (confirmed.length === 0) {
        DOM.confirmedCount.textContent = 'Nenhum confirmado ainda';
        return;
    }

    DOM.confirmedCount.textContent = `${confirmed.length} pessoa${confirmed.length > 1 ? 's' : ''}`;

    confirmed.forEach((person, i) => {
        const item = document.createElement('div');
        item.classList.add('confirmed__item');
        item.style.animationDelay = `${i * 0.03}s`;

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('confirmed__name');
        nameSpan.textContent = person.nome;

        const igSpan = document.createElement('span');
        igSpan.classList.add('confirmed__instagram');
        igSpan.textContent = person.instagram || '';

        item.appendChild(nameSpan);
        item.appendChild(igSpan);
        DOM.confirmedList.appendChild(item);
    });
}

// ============================================
// MODO LOCAL (localStorage fallback)
// ============================================
function submitLocal(data) {
    const stored = JSON.parse(localStorage.getItem('openhouse_confirmed') || '[]');

    // Adicionar titular
    stored.push({
        nome: data.titular.nome,
        instagram: data.titular.instagram,
    });

    // Adicionar convidados
    data.convidados.forEach(g => {
        stored.push({
            nome: g.nome,
            instagram: g.instagram,
        });
    });

    localStorage.setItem('openhouse_confirmed', JSON.stringify(stored));
    return { success: true };
}

function loadLocal() {
    return JSON.parse(localStorage.getItem('openhouse_confirmed') || '[]');
}
