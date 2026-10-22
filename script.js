/* =========================================================
   HERO — INTERAÇÃO 3D + ORBIT CARDS
========================================================= */

const heroVisual = document.getElementById("heroVisual");

const cards = [...document.querySelectorAll(".orbit-card")];

let mouseX = 0;
let mouseY = 0;

let targetMouseX = 0;
let targetMouseY = 0;

let orbitTime = 0;


/* =========================================================
   CONFIGURAÇÃO DO MOVIMENTO
========================================================= */

const orbitConfig = {
    mouseInfluence: 38,
    orbitSpeed: 0.00045,
    floatAmount: 8,
    floatSpeed: 0.0012,
    depth: 35
};


/* =========================================================
   POSIÇÕES DOS CARDS
========================================================= */

const cardPositions = [
    { x: -105, y: -125, z: -15, rotate: -4 },
    { x: 115, y: -125, z: 35, rotate: 4 },
    { x: 85, y: 85, z: 55, rotate: 0 },
    { x: -85, y: 85, z: 45, rotate: 0 },
    { x: -205, y: -15, z: -20, rotate: -7 },
    { x: 205, y: -10, z: -10, rotate: 7 }
];


/* =========================================================
   CONFIGURAÇÃO DO DESTAQUE
========================================================= */

const hoverConfig = {
    delay: 1000,
    liftZ: 130,
    scale: 1.04
};


/* =========================================================
   CONTROLE DOS CARDS
========================================================= */

let hoveredCard = null;

const hoverTimers = new Map();

const activeHoverCards = new Set();


/* =========================================================
   INTERAÇÃO COM O MOUSE NO HERO
========================================================= */

if (heroVisual) {

    heroVisual.addEventListener("mousemove", (event) => {

        const rect = heroVisual.getBoundingClientRect();

        const relativeX = event.clientX - rect.left;
        const relativeY = event.clientY - rect.top;

        targetMouseX =
            (relativeX / rect.width) * 2 - 1;

        targetMouseY =
            (relativeY / rect.height) * 2 - 1;

    });


    heroVisual.addEventListener("mouseleave", () => {

        targetMouseX = 0;
        targetMouseY = 0;

    });

}


/* =========================================================
   ENTRADA DO MOUSE NOS CARDS
========================================================= */

cards.forEach((card) => {

    card.addEventListener("mouseenter", () => {

        cards.forEach((otherCard) => {

            if (otherCard !== card) {

                activeHoverCards.delete(otherCard);

                otherCard.style.zIndex = "10";

                otherCard.style.filter =
                    "brightness(1)";

            }

        });


        hoveredCard = card;


        if (hoverTimers.has(card)) {

            clearTimeout(
                hoverTimers.get(card)
            );

        }


        const timer = setTimeout(() => {

            if (hoveredCard !== card) {
                return;
            }

            activeHoverCards.add(card);

            card.style.zIndex = "100";

        }, hoverConfig.delay);


        hoverTimers.set(card, timer);

    });


    card.addEventListener("mouseleave", () => {

        if (hoverTimers.has(card)) {

            clearTimeout(
                hoverTimers.get(card)
            );

            hoverTimers.delete(card);

        }


        activeHoverCards.delete(card);

        card.style.zIndex = "10";

        card.style.filter =
            "brightness(1)";


        if (hoveredCard === card) {

            hoveredCard = null;

        }

    });

});


/* =========================================================
   LERP
========================================================= */

function lerp(current, target, amount) {

    return current +
        (target - current) * amount;

}


/* =========================================================
   ANIMAÇÃO DOS CARDS
========================================================= */

function animateOrbit(timestamp) {

    mouseX = lerp(
        mouseX,
        targetMouseX,
        0.045
    );

    mouseY = lerp(
        mouseY,
        targetMouseY,
        0.045
    );


    orbitTime =
        timestamp *
        orbitConfig.orbitSpeed;


    cards.forEach((card, index) => {

        const base = cardPositions[index];

        if (!base) return;


        const speed =
            parseFloat(card.dataset.speed) || 1;

        const depth =
            parseFloat(card.dataset.depth) || 1;


        const phase =
            orbitTime * speed +
            index * 1.047;


        const orbitX =
            Math.sin(phase) * 12;

        const orbitY =
            Math.cos(phase * 0.85) * 8;


        const orbitZ =
            Math.sin(phase * 0.7) *
            orbitConfig.depth *
            depth;


        const floatY =
            Math.sin(
                timestamp *
                orbitConfig.floatSpeed *
                speed +
                index
            ) *
            orbitConfig.floatAmount;


        const floatX =
            Math.cos(
                timestamp *
                orbitConfig.floatSpeed *
                0.7 +
                index
            ) * 5;


        const mouseOffsetX =
            mouseX *
            orbitConfig.mouseInfluence *
            depth;


        const mouseOffsetY =
            mouseY *
            (
                orbitConfig.mouseInfluence *
                0.45
            ) *
            depth;


        const rotateY =
            mouseX * 8 +
            Math.sin(phase) * 2;


        const rotateX =
            -mouseY * 5 +
            Math.cos(phase) * 1.5;


        const rotateZ =
            base.rotate +
            Math.sin(phase) * 1.5;


        const finalX =
            base.x +
            orbitX +
            floatX +
            mouseOffsetX;


        const finalY =
            base.y +
            orbitY +
            floatY +
            mouseOffsetY;


        let finalZ =
            base.z +
            orbitZ;


        const isActive =
            activeHoverCards.has(card);


        if (isActive) {

            finalZ +=
                hoverConfig.liftZ;

        }


        const finalScale =
            isActive
                ? hoverConfig.scale
                : 1;


        card.style.transform = `
            translate3d(
                calc(-50% + ${finalX}px),
                calc(-50% + ${finalY}px),
                ${finalZ}px
            )
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            rotateZ(${rotateZ}deg)
            scale(${finalScale})
        `;


        card.style.filter =
            isActive
                ? "brightness(1.08)"
                : "brightness(1)";

    });


    requestAnimationFrame(animateOrbit);

}


requestAnimationFrame(animateOrbit);


/* =========================================================
   REVEAL
========================================================= */

const revealElements =
    document.querySelectorAll(".reveal");


if ("IntersectionObserver" in window) {

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "is-visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach((element) => {

        revealObserver.observe(element);

    });

} else {

    revealElements.forEach((element) => {

        element.classList.add(
            "is-visible"
        );

    });

}


/* =========================================================
   02 — DESIGN / EDITOR DE VÍDEO
   ANIMAÇÃO MAIS LENTA
========================================================= */

const creativeStage =
    document.querySelector(".creative-stage");


if (creativeStage) {

    const timelineProgress =
        creativeStage.querySelector(
            ".timeline-progress"
        );

    const timelinePlayhead =
        creativeStage.querySelector(
            ".timeline-playhead"
        );

    const creativeShapes =
        creativeStage.querySelectorAll(
            ".preview-shape"
        );

    const previewPlay =
        creativeStage.querySelector(
            ".preview-play"
        );


    if (timelineProgress) {

        timelineProgress.style.animationDuration =
            "7s";

    }


    if (timelinePlayhead) {

        timelinePlayhead.style.animationDuration =
            "7s";

    }


    creativeShapes.forEach((shape) => {

        shape.style.animationDuration =
            "8s";

    });


    if (previewPlay) {

        previewPlay.style.animationDuration =
            "3.5s";

    }

}


/* =========================================================
   03 — FUNIL
   CONTADORES ANIMADOS
========================================================= */

const funnelVisual =
    document.querySelector(".funnel-visual");


const funnelCounters =
    funnelVisual
        ? [
            ...funnelVisual.querySelectorAll(
                ".counter"
            )
        ]
        : [];


let funnelStarted = false;


function animateFunnelCounters() {

    if (
        funnelStarted ||
        funnelCounters.length === 0
    ) {
        return;
    }


    funnelStarted = true;


    funnelCounters.forEach((counter) => {

        const target =
            Number(counter.dataset.target) || 0;

        const duration = 1800;

        const startTime =
            performance.now();


        function updateCounter(currentTime) {

            const elapsed =
                currentTime -
                startTime;


            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            const currentValue =
                Math.floor(
                    target * eased
                );


            counter.textContent =
                currentValue.toLocaleString(
                    "pt-BR"
                );


            if (progress < 1) {

                requestAnimationFrame(
                    updateCounter
                );

            } else {

                counter.textContent =
                    target.toLocaleString(
                        "pt-BR"
                    );

            }

        }


        requestAnimationFrame(
            updateCounter
        );

    });

}


if (
    funnelVisual &&
    "IntersectionObserver" in window
) {

    const funnelObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        animateFunnelCounters();

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.35
            }
        );


    funnelObserver.observe(
        funnelVisual
    );

} else if (funnelVisual) {

    animateFunnelCounters();

}


/* =========================================================
   06 — WEB DEVELOPMENT
   CÓDIGO DIGITANDO / PAUSANDO / APAGANDO / REPETINDO
========================================================= */

const liveCode =
    document.getElementById(
        "live-code"
    );


const buildPercent =
    document.querySelector(
        ".build-percent"
    );


const codeText = `function criarExperiencia(usuario) {
    const projeto = {
        interface: "intuitiva",
        experiencia: "personalizada",
        desempenho: "otimizado"
    };

    return desenvolver(projeto, usuario);
}`;


let codeAnimationRunning = false;


/* =========================================================
   FUNÇÃO DE ESPERA
========================================================= */

function wait(milliseconds) {

    return new Promise((resolve) => {

        setTimeout(
            resolve,
            milliseconds
        );

    });

}


/* =========================================================
   ANIMAÇÃO PRINCIPAL DO CÓDIGO
========================================================= */

async function startCodeAnimation() {

    if (
        codeAnimationRunning ||
        !liveCode
    ) {
        return;
    }


    codeAnimationRunning = true;


    while (true) {

        liveCode.textContent = "";


        if (buildPercent) {

            buildPercent.textContent =
                "0";

        }


        /* DIGITANDO */

        for (
            let position = 0;
            position < codeText.length;
            position++
        ) {

            liveCode.textContent =
                codeText.slice(
                    0,
                    position + 1
                );


            if (buildPercent) {

                const percentage =
                    Math.floor(
                        (
                            (position + 1) /
                            codeText.length
                        ) * 100
                    );


                buildPercent.textContent =
                    percentage;

            }


            await wait(45);

        }


        /* TERMINOU */

        if (buildPercent) {

            buildPercent.textContent =
                "100";

        }


        await wait(3000);


        /* APAGANDO */

        for (
            let position = codeText.length;
            position >= 0;
            position--
        ) {

            liveCode.textContent =
                codeText.slice(
                    0,
                    position
                );


            if (buildPercent) {

                const percentage =
                    Math.floor(
                        (
                            position /
                            codeText.length
                        ) * 100
                    );


                buildPercent.textContent =
                    percentage;

            }


            await wait(20);

        }


        await wait(1200);

    }

}


/* =========================================================
   INICIA O CÓDIGO QUANDO O BLOCO 06 ENTRA NA TELA
========================================================= */

const codeSection =
    liveCode?.closest(
        ".code-visual"
    ) || liveCode;


if (
    liveCode &&
    "IntersectionObserver" in window
) {

    const codeObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        startCodeAnimation();

                    }

                });

            },
            {
                threshold: 0.25
            }
        );


    codeObserver.observe(
        codeSection
    );

} else if (liveCode) {

    startCodeAnimation();

}


/* =========================================================
   MOBILE MENU
========================================================= */

const menuToggle =
    document.querySelector(
        ".menu-toggle"
    );


const mobileNav =
    document.querySelector(
        ".mobile-nav"
    );


if (
    menuToggle &&
    mobileNav
) {

    menuToggle.addEventListener(
        "click",
        () => {

            const isOpen =
                mobileNav.classList.toggle(
                    "is-open"
                );


            menuToggle.classList.toggle(
                "is-open"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        }
    );


    mobileNav
        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    mobileNav.classList.remove(
                        "is-open"
                    );

                    menuToggle.classList.remove(
                        "is-open"
                    );

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        });

}


/* =========================================================
   FAQ — PERGUNTAS FREQUENTES
========================================================= */

const faqItems =
    document.querySelectorAll(
        ".faq-item"
    );


faqItems.forEach((item) => {

    const question =
        item.querySelector(
            ".faq-question"
        );


    const answer =
        item.querySelector(
            ".faq-answer"
        );


    if (
        !question ||
        !answer
    ) {
        return;
    }


    question.addEventListener(
        "click",
        () => {

            const isOpen =
                question.getAttribute(
                    "aria-expanded"
                ) === "true";


            /* =============================================
               FECHA TODAS AS OUTRAS PERGUNTAS
            ============================================= */

            faqItems.forEach(
                (otherItem) => {

                    const otherQuestion =
                        otherItem.querySelector(
                            ".faq-question"
                        );


                    const otherAnswer =
                        otherItem.querySelector(
                            ".faq-answer"
                        );


                    if (
                        !otherQuestion ||
                        !otherAnswer
                    ) {
                        return;
                    }


                    otherItem.classList.remove(
                        "is-open"
                    );


                    otherQuestion.setAttribute(
                        "aria-expanded",
                        "false"
                    );


                    otherAnswer.hidden =
                        true;

                }
            );


            /* =============================================
               SE ESTAVA FECHADO, ABRE
            ============================================= */

            if (!isOpen) {

                item.classList.add(
                    "is-open"
                );


                question.setAttribute(
                    "aria-expanded",
                    "true"
                );


                answer.hidden =
                    false;

            }

        }
    );

});


/* =========================================================
   SESSÃO ESTRATÉGICA — MODAL / FORMULÁRIO / QUESTIONÁRIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const modal =
            document.getElementById(
                "sessaoModal"
            );


        const modalClose =
            document.getElementById(
                "sessaoModalClose"
            );


        const sessaoForm =
            document.getElementById(
                "sessaoForm"
            );


        const sessaoContinuar =
            document.getElementById(
                "sessaoContinuar"
            );


        const sessaoVoltar =
            document.getElementById(
                "sessaoVoltar"
            );


        const sessaoEnviar =
            document.getElementById(
                "sessaoEnviar"
            );


        const sessaoSuccess =
            document.getElementById(
                "sessaoSuccess"
            );


        const sessaoError =
            document.getElementById(
                "sessaoFormError"
            );


        if (
            !modal ||
            !sessaoForm
        ) {
            return;
        }


        const steps = [
            ...sessaoForm.querySelectorAll(
                ".sessao-form-step"
            )
        ];


        const stepIndicators = [
            ...modal.querySelectorAll(
                "[data-step-indicator]"
            )
        ];


        const formHeader =
            modal.querySelector(
                ".sessao-form-header"
            );


        const stepsContainer =
            modal.querySelector(
                ".sessao-form-steps"
            );


        /* =====================================================
           WEBHOOKS
        ===================================================== */

        const WEBHOOK_DADOS_INICIAIS =
            "https://criadordigital-n8n-webhook.bbw7sv.easypanel.host/webhook/brazilians-leads";


        const WEBHOOK_QUESTIONARIO =
            "https://criadordigital-n8n-webhook.bbw7sv.easypanel.host/webhook/brazilians-questionario";


        let currentStep = 1;

        let previousFocus = null;

        let isSubmittingInitial = false;

        let isSubmittingQuestionnaire = false;

        /* =====================================================
        LEAD ID
        ===================================================== */

        let leadId = sessionStorage.getItem("brazilians_lead_id") || "";


        /* =====================================================
           ERRO DA ETAPA 1
        ===================================================== */

        const initialStep =
            sessaoForm.querySelector(
                '[data-step="1"]'
            );


        const initialError =
            document.createElement(
                "p"
            );


        initialError.className =
            "sessao-form-error";


        initialError.id =
            "sessaoInitialError";


        initialError.setAttribute(
            "role",
            "alert"
        );


        initialError.setAttribute(
            "aria-live",
            "polite"
        );


        const initialActions =
            initialStep?.querySelector(
                ".sessao-form-actions"
            );


        if (initialActions) {

            initialActions.insertAdjacentElement(
                "beforebegin",
                initialError
            );

        }


        /* =====================================================
           ABRIR E FECHAR O MODAL
        ===================================================== */

        function openModal(event) {

            if (event) {
                event.preventDefault();
            }


            if (!modal.hidden) {
                return;
            }


            previousFocus =
                document.activeElement;


            modal.hidden = false;


            document.body.classList.add(
                "sessao-modal-open"
            );


            requestAnimationFrame(() => {

                modal.classList.add(
                    "is-open"
                );


                modalClose?.focus();

            });

        }


        function closeModal() {

            if (modal.hidden) {
                return;
            }


            modal.classList.remove(
                "is-open"
            );


            modal.hidden = true;


            document.body.classList.remove(
                "sessao-modal-open"
            );


            if (
                previousFocus &&
                typeof previousFocus.focus ===
                    "function"
            ) {

                previousFocus.focus();

            }

        }


        document
            .querySelectorAll(
                'a[href="#sessao"]'
            )
            .forEach((link) => {

                link.addEventListener(
                    "click",
                    openModal
                );

            });


        modalClose?.addEventListener(
            "click",
            closeModal
        );


        modal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === modal
                ) {

                    closeModal();

                }

            }
        );


        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape" &&
                    !modal.hidden
                ) {

                    closeModal();

                }

            }
        );


        /* =====================================================
           CONTROLE DAS ETAPAS
        ===================================================== */

        function showStep(stepNumber) {

            currentStep =
                stepNumber;


            steps.forEach((step) => {

                const value =
                    Number(
                        step.dataset.step
                    );


                step.classList.toggle(
                    "is-active",
                    value === stepNumber
                );

            });


            stepIndicators.forEach(
                (indicator) => {

                    const value =
                        Number(
                            indicator.dataset.stepIndicator
                        );


                    indicator.classList.toggle(
                        "is-active",
                        value <= stepNumber
                    );

                }
            );


            clearError();


            const activeStep =
                sessaoForm.querySelector(
                    `.sessao-form-step[data-step="${stepNumber}"]`
                );


            activeStep?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        /* =====================================================
           MENSAGENS DE ERRO
        ===================================================== */

        function showError(message) {

            const target =
                currentStep === 1
                    ? initialError
                    : sessaoError;


            if (!target) {
                return;
            }


            target.textContent =
                message;


            target.classList.add(
                "is-visible"
            );

        }


        function clearError() {

            [
                initialError,
                sessaoError
            ].forEach((element) => {

                if (!element) {
                    return;
                }


                element.textContent =
                    "";


                element.classList.remove(
                    "is-visible"
                );

            });

        }


        /* =====================================================
           VALIDAÇÃO DOS DADOS INICIAIS
        ===================================================== */

        function validateInitialData() {

            clearError();


            const name =
                document.getElementById(
                    "sessaoNome"
                );


            const email =
                document.getElementById(
                    "sessaoEmail"
                );


            const whatsapp =
                document.getElementById(
                    "sessaoWhatsapp"
                );


            const state =
                document.getElementById(
                    "sessaoEstado"
                );


            if (!name?.value.trim()) {

                showError(
                    "Digite seu nome para continuar."
                );


                name?.focus();

                return false;

            }


            if (!email?.value.trim()) {

                showError(
                    "Digite seu e-mail para continuar."
                );


                email?.focus();

                return false;

            }


            if (!email.validity.valid) {

                showError(
                    "Digite um e-mail válido."
                );


                email.focus();

                return false;

            }


            if (!whatsapp?.value.trim()) {

                showError(
                    "Digite seu WhatsApp com o código do país."
                );


                whatsapp?.focus();

                return false;

            }


            if (!state?.value) {

                showError(
                    "Selecione o estado onde você mora."
                );


                state?.focus();

                return false;

            }


            return true;

        }


       /* =====================================================
        CAPTURA DAS UTMs
        ===================================================== */

        function getUTMs() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return {

        utm_source:
            params.get("utm_source") || "",

        utm_medium:
            params.get("utm_medium") || "",

        utm_campaign:
            params.get("utm_campaign") || "",

        utm_content:
            params.get("utm_content") || "",

        utm_term:
            params.get("utm_term") || "",

        utm_site:
            params.get("utm_site") || "",

        utm_id:
            params.get("utm_id") || "",

        fbclid:
            params.get("fbclid") || "",

        gclid:
            params.get("gclid") || ""

    };

}

        /* =====================================================
        ENVIO DOS DADOS INICIAIS
        ===================================================== */

        async function enviarDadosIniciais() {

            const utms =
                getUTMs();


            const payload = {

                body: {

                    fullName:
                        document
                            .getElementById(
                                "sessaoNome"
                            )
                            .value
                            .trim(),


                    email:
                        document
                            .getElementById(
                                "sessaoEmail"
                            )
                            .value
                            .trim(),


                    whatsapp:
                        document
                            .getElementById(
                                "sessaoWhatsapp"
                            )
                            .value
                            .trim(),


                    usState:
                        document
                            .getElementById(
                                "sessaoEstado"
                            )
                            .value,


                    timezone:
                        Intl.DateTimeFormat()
                            .resolvedOptions()
                            .timeZone,


                    ...utms

                }

            };


            const response =
                await fetch(
                    WEBHOOK_DADOS_INICIAIS,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )

                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Erro HTTP ${response.status}`
                );

            }


            /* =============================================
            TENTA LER O ID DEVOLVIDO PELO WEBHOOK
            ============================================= */

            let respostaWebhook = null;

            try {

                respostaWebhook =
                    await response.json();

            } catch (error) {

                console.warn(
                    "O webhook não retornou JSON.",
                    error
                );

            }


            /* =============================================
            PROCURA O LEAD ID NA RESPOSTA
            ============================================= */

            const novoLeadId =
                respostaWebhook?.lead_id ??
                respostaWebhook?.leadId ??
                respostaWebhook?.id ??
                respostaWebhook?.ID ??
                respostaWebhook?.id_do_lead ??
                respostaWebhook?.ID_do_Lead ??
                respostaWebhook?.body?.lead_id ??
                respostaWebhook?.body?.leadId ??
                respostaWebhook?.body?.id ??
                "";


            if (novoLeadId) {

                leadId =
                    String(novoLeadId);


                sessionStorage.setItem(
                    "brazilians_lead_id",
                    leadId
                );


                console.log(
                    "Lead ID recebido:",
                    leadId
                );

            } else {

                console.warn(
                    "O webhook de Dados Iniciais não devolveu um lead_id."
                );

            }


            return response;

        }

        /* =====================================================
           BOTÃO CONTINUAR
        ===================================================== */

        sessaoContinuar?.addEventListener(
            "click",
            async () => {

                if (
                    isSubmittingInitial ||
                    !validateInitialData()
                ) {

                    return;

                }


                isSubmittingInitial =
                    true;


                sessaoContinuar.disabled =
                    true;


                const originalText =
                    sessaoContinuar.innerHTML;


                sessaoContinuar.innerHTML =
                    "<span>Enviando...</span>";


                try {

                    await enviarDadosIniciais();

                    showStep(2);

                } catch (error) {

                    console.error(
                        "Erro ao enviar dados iniciais:",
                        error
                    );


                    showError(
                        "Não foi possível enviar seus dados agora. Tente novamente."
                    );

                } finally {

                    isSubmittingInitial =
                        false;


                    sessaoContinuar.disabled =
                        false;


                    sessaoContinuar.innerHTML =
                        originalText;

                }

            }
        );


        /* =====================================================
           BOTÃO VOLTAR
        ===================================================== */

        sessaoVoltar?.addEventListener(
            "click",
            () => {

                showStep(1);

            }
        );


        /* =====================================================
           CAPTURA DAS RESPOSTAS
        ===================================================== */

        function getRadioValue(name) {

            const selected =
                sessaoForm.querySelector(
                    `input[name="${name}"]:checked`
                );


            return selected
                ? selected.value
                : "";

        }


        function validateQuestions() {

            clearError();


            for (
                let i = 1;
                i <= 7;
                i++
            ) {

                const questionName =
                    `question${i}`;


                if (
                    !getRadioValue(
                        questionName
                    )
                ) {

                    showError(
                        "Responda todas as perguntas obrigatórias antes de enviar sua aplicação."
                    );


                    const firstOption =
                        sessaoForm.querySelector(
                            `input[name="${questionName}"]`
                        );


                    firstOption
                        ?.closest(
                            ".sessao-question"
                        )
                        ?.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });


                    firstOption?.focus({
                        preventScroll: true
                    });


                    return false;

                }

            }


            return true;

        }


        /* =====================================================
           MONTA O PAYLOAD DO QUESTIONÁRIO
        ===================================================== */

        function buildQuestionnairePayload() {

            const utms =
                getUTMs();


            return {

                body: {

                       lead_id:
                       leadId,

                    fullName:
                        document
                            .getElementById(
                                "sessaoNome"
                            )
                            .value
                            .trim(),


                    email:
                        document
                            .getElementById(
                                "sessaoEmail"
                            )
                            .value
                            .trim(),


                    whatsapp:
                        document
                            .getElementById(
                                "sessaoWhatsapp"
                            )
                            .value
                            .trim(),


                    usState:
                        document
                            .getElementById(
                                "sessaoEstado"
                            )
                            .value,


                    briefing: [

                        {
                            question:
                                getRadioValue(
                                    "question1"
                                )
                        },

                        {
                            answer:
                                getRadioValue(
                                    "question2"
                                )
                        },

                        {
                            answer:
                                getRadioValue(
                                    "question3"
                                )
                        },

                        {
                            answer:
                                getRadioValue(
                                    "question4"
                                )
                        },

                        {
                            answer:
                                getRadioValue(
                                    "question5"
                                )
                        },

                        {
                            answer:
                                getRadioValue(
                                    "question6"
                                )
                        },

                        {
                            answer:
                                getRadioValue(
                                    "question7"
                                )
                        }

                    ],


                    Instagram:
                        document
                            .getElementById(
                                "sessaoInstagram"
                            )
                            ?.value
                            .trim() || "",


                    Tiktok:
                        document
                            .getElementById(
                                "sessaoTiktok"
                            )
                            ?.value
                            .trim() || "",


                    Youtube:
                        document
                            .getElementById(
                                "sessaoYoutube"
                            )
                            ?.value
                            .trim() || "",


                    Facebook:
                        document
                            .getElementById(
                                "sessaoFacebook"
                            )
                            ?.value
                            .trim() || "",


                    Linkedin:
                        document
                            .getElementById(
                                "sessaoLinkedin"
                            )
                            ?.value
                            .trim() || "",


                    ...utms

                }

            };

        }


        /* =====================================================
           ENVIO FINAL DO QUESTIONÁRIO
        ===================================================== */

        sessaoForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                if (
                    isSubmittingQuestionnaire ||
                    !validateQuestions()
                ) {

                    return;

                }


                isSubmittingQuestionnaire =
                    true;


                clearError();


                if (sessaoEnviar) {

                    sessaoEnviar.disabled =
                        true;


                    const buttonText =
                        sessaoEnviar.querySelector(
                            ".sessao-button-text"
                        );


                    if (buttonText) {

                        buttonText.textContent =
                            "Enviando aplicação...";

                    } else {

                        sessaoEnviar.textContent =
                            "Enviando aplicação...";

                    }

                }


                try {

                    const payload =
                        buildQuestionnairePayload();



                    const response =
                        await fetch(
                            WEBHOOK_QUESTIONARIO,
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        payload
                                    )

                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            `Erro HTTP ${response.status}`
                        );

                    }


                    sessaoForm.hidden =
                        true;


                    if (stepsContainer) {

                        stepsContainer.hidden =
                            true;

                    }


                    if (formHeader) {

                        formHeader.hidden =
                            true;

                    }


                    if (sessaoSuccess) {

                        sessaoSuccess.hidden =
                            false;


                        sessaoSuccess.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    }


                } catch (error) {

                    console.error(
                        "Erro ao enviar questionário:",
                        error
                    );


                    showError(
                        "Não foi possível enviar sua aplicação agora. Tente novamente em alguns instantes."
                    );


                } finally {

                    isSubmittingQuestionnaire =
                        false;


                    if (
                        sessaoEnviar &&
                        (
                            !sessaoSuccess ||
                            sessaoSuccess.hidden
                        )
                    ) {

                        sessaoEnviar.disabled =
                            false;


                        const buttonText =
                            sessaoEnviar.querySelector(
                                ".sessao-button-text"
                            );


                        if (buttonText) {

                            buttonText.textContent =
                                "Quero minha sessão estratégica";

                        }

                    }

                }

            }
        );

    }
);