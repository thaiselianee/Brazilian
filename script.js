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
   MANTIDA EXATAMENTE COMO VOCÊ APROVOU
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
   COM O ESPAÇAMENTO QUE VOCÊ ESCOLHEU
========================================================= */

const cardPositions = [

    // superior esquerdo — atrás
    { x: -105, y: -125, z: -15, rotate: -4 },

    // superior direito — mais à frente
    { x: 115, y: -125, z: 35, rotate: 4 },

    // base direita — frente
    { x: 85, y: 85, z: 55, rotate: 0 },

    // base esquerda — frente
    { x: -85, y: 85, z: 45, rotate: 0 },

    // lateral esquerda — atrás
    { x: -205, y: -15, z: -20, rotate: -7 },

    // lateral direita — atrás
    { x: 205, y: -10, z: -10, rotate: 7 }

];

/* =========================================================
   CONFIGURAÇÃO DO DESTAQUE
========================================================= */

const hoverConfig = {

    /*
       Tempo que o mouse precisa ficar
       sobre o card antes do destaque.

       3000 = 3 segundos
    */

    delay: 1000,


    /*
       Quanto o card vai para frente.

       130 = destaque suave
       160 = mais evidente
       180 = bastante destaque
    */

    liftZ: 130,


    /*
       Pequeno aumento visual.
       O tamanho original do card
       não é alterado permanentemente.
    */

    scale: 1.04

};


/* =========================================================
   CONTROLE DOS CARDS
========================================================= */

/*
   Card que está atualmente em destaque.
*/

let hoveredCard = null;


/*
   Guarda os timers de cada card.
*/

const hoverTimers = new Map();


/*
   Guarda quais cards já estão
   em estado de destaque.
*/

const activeHoverCards = new Set();


/* =========================================================
   INTERAÇÃO COM O MOUSE NO HERO
========================================================= */

if (heroVisual) {

    heroVisual.addEventListener("mousemove", (event) => {

        const rect =
            heroVisual.getBoundingClientRect();


        const relativeX =
            event.clientX - rect.left;


        const relativeY =
            event.clientY - rect.top;


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

cards.forEach((card, index) => {

    card.addEventListener("mouseenter", () => {

        /*
           Se houver outro card em destaque,
           ele volta ao comportamento normal.
        */

        cards.forEach((otherCard) => {

            if (otherCard !== card) {

                activeHoverCards.delete(
                    otherCard
                );

                otherCard.style.zIndex = "10";

                otherCard.style.filter =
                    "brightness(1)";

                otherCard.style.transform =
                    otherCard.style.transform;

            }

        });


        /*
           Guarda esse card como o atual.
        */

        hoveredCard = card;


        /*
           Cancela qualquer timer anterior
           desse card.
        */

        if (hoverTimers.has(card)) {

            clearTimeout(
                hoverTimers.get(card)
            );

        }


        /*
           Começa a contagem dos 3 segundos.
        */

        const timer =
            setTimeout(() => {

                /*
                   Só ativa se o mouse
                   ainda estiver nesse card.
                */

                if (hoveredCard !== card) {
                    return;
                }


                /*
                   Ativa o destaque.
                */

                activeHoverCards.add(
                    card
                );


                /*
                   Coloca o card acima
                   dos demais.
                */

                card.style.zIndex = "100";


            }, hoverConfig.delay);


        hoverTimers.set(
            card,
            timer
        );

    });


    /* =====================================================
       SAÍDA DO MOUSE DO CARD
    ===================================================== */

    card.addEventListener("mouseleave", () => {

        /*
           Cancela o timer dos 3 segundos.
        */

        if (hoverTimers.has(card)) {

            clearTimeout(
                hoverTimers.get(card)
            );

            hoverTimers.delete(
                card
            );

        }


        /*
           Remove o estado de destaque.
        */

        activeHoverCards.delete(
            card
        );


        /*
           Volta para a camada normal.
        */

        card.style.zIndex = "10";


        /*
           Remove o destaque visual.
        */

        card.style.filter =
            "brightness(1)";


        /*
           Se era o card atual,
           libera a seleção.
        */

        if (hoveredCard === card) {

            hoveredCard = null;

        }

    });

});


/* =========================================================
   LERP
========================================================= */

function lerp(
    current,
    target,
    amount
) {

    return current +
        (target - current) * amount;

}


/* =========================================================
   ANIMAÇÃO DOS CARDS
========================================================= */

function animateOrbit(timestamp) {

    /*
       Suaviza o movimento do mouse.
    */

    mouseX =
        lerp(
            mouseX,
            targetMouseX,
            0.045
        );


    mouseY =
        lerp(
            mouseY,
            targetMouseY,
            0.045
        );


    orbitTime =
        timestamp *
        orbitConfig.orbitSpeed;


    cards.forEach((card, index) => {

        const base =
            cardPositions[index];


        if (!base) return;


        const speed =
            parseFloat(
                card.dataset.speed
            ) || 1;


        const depth =
            parseFloat(
                card.dataset.depth
            ) || 1;


        /*
           Fase individual
           de cada card.
        */

        const phase =
            orbitTime * speed +
            index * 1.047;


        /* =================================================
           MOVIMENTO ORBITAL
        ================================================= */

        const orbitX =
            Math.sin(phase) * 12;


        const orbitY =
            Math.cos(
                phase * 0.85
            ) * 8;


        let orbitZ =
            Math.sin(
                phase * 0.7
            ) *
            orbitConfig.depth *
            depth;


        /* =================================================
           FLUTUAÇÃO
        ================================================= */

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


        /* =================================================
           MOVIMENTO DO MOUSE
        ================================================= */

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


        /* =================================================
           ROTAÇÃO 3D
        ================================================= */

        const rotateY =
            mouseX * 8 +
            Math.sin(phase) * 2;


        const rotateX =
            -mouseY * 5 +
            Math.cos(phase) * 1.5;


        const rotateZ =
            base.rotate +
            Math.sin(phase) * 1.5;


        /* =================================================
           POSIÇÃO FINAL
        ================================================= */

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


        /* =================================================
           DESTAQUE APÓS 3 SEGUNDOS
        ================================================= */

        const isActive =
            activeHoverCards.has(card);


        if (isActive) {

            /*
               O card continua com todo o
               movimento de flutuação.

               A única diferença é que
               ele fica mais para frente.
            */

            finalZ +=
                hoverConfig.liftZ;

        }


        /* =================================================
           ESCALA
        ================================================= */

        const finalScale =
            isActive
                ? hoverConfig.scale
                : 1;


        /* =================================================
           TRANSFORMAÇÃO 3D
        ================================================= */

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


        /* =================================================
           DESTAQUE VISUAL
        ================================================= */

        if (isActive) {

            card.style.filter =
                "brightness(1.08)";

        } else {

            card.style.filter =
                "brightness(1)";

        }

    });


    requestAnimationFrame(
        animateOrbit
    );

}


/* =========================================================
   INICIA ANIMAÇÃO
========================================================= */

requestAnimationFrame(
    animateOrbit
);


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

            mobileNav.classList.toggle(
                "is-open"
            );

            menuToggle.classList.toggle(
                "is-open"
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

                }
            );

        });

}



/* =========================================================
   CORPO INTEIRO — JS REFINADO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    /* REVEAL DOS SERVIÇOS */
    const corpoReveal = document.querySelectorAll(
        ".corpo-section .reveal"
    );

    if (reducedMotion || !("IntersectionObserver" in window)) {
        corpoReveal.forEach((element) => {
            element.classList.add("is-visible");
        });
    } else {
        const corpoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        corpoReveal.forEach((element) => corpoObserver.observe(element));
    }

    /* CONTADORES DO FUNIL */
    const counters = document.querySelectorAll(
        ".corpo-section .counter"
    );

    const animateCounter = (element) => {
        const target = Number(element.dataset.target);
        if (!Number.isFinite(target)) return;

        if (reducedMotion) {
            element.textContent = target.toLocaleString("pt-BR");
            return;
        }

        const duration = 1500;
        const start = performance.now();

        const update = (currentTime) => {
            const progress = Math.min((currentTime - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            element.textContent = Math.floor(target * eased)
                .toLocaleString("pt-BR");

            if (progress < 1) requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    };

    if ("IntersectionObserver" in window) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = "true";
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach((counter) => counterObserver.observe(counter));
    } else {
        counters.forEach(animateCounter);
    }

    /* WEB DEVELOPMENT — DIGITAÇÃO */
    const codeElement = document.querySelector("#live-code");

    if (codeElement) {
        const codeText = `const app = {

  init() {
    console.log("Sistema online");
  },

  strategy: "active",
  traffic: "connected",
  funnel: "optimized",
  automation: true

};

app.init();`;

        if (reducedMotion) {
            codeElement.textContent = codeText;
        } else {
            let index = 0;
            let typingStarted = false;
            let resetTimer;

            const typeCode = () => {
                if (index >= codeText.length) {
                    resetTimer = setTimeout(() => {
                        codeElement.textContent = "";
                        index = 0;
                        typeCode();
                    }, 3000);

                    return;
                }

                codeElement.textContent = codeText.slice(0, index + 1);

                const character = codeText[index++];
                let speed = 28;

                if (character === "\n") speed = 180;
                if (character === " ") speed = 12;

                setTimeout(typeCode, speed);
            };

            const startTyping = () => {
                if (typingStarted) return;
                typingStarted = true;
                typeCode();
            };

            if ("IntersectionObserver" in window) {
                const codeObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            startTyping();
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.35 });

                codeObserver.observe(codeElement);
            } else {
                startTyping();
            }

            window.addEventListener("pagehide", () => clearTimeout(resetTimer), {
                once: true
            });
        }
    }

    /* BUILDING OPERATION — PORCENTAGEM */
    const buildPercent = document.querySelector(".build-percent");
    const buildWindow = document.querySelector(".code-window");

    if (buildPercent && !reducedMotion) {
        let buildStarted = false;
        let intervalId;
        let restartTimer;

        const startBuild = () => {
            if (buildStarted) return;
            buildStarted = true;

            let value = 0;

            intervalId = setInterval(() => {
                value += 1;
                buildPercent.textContent = value;

                if (value >= 100) {
                    clearInterval(intervalId);

                    restartTimer = setTimeout(() => {
                        value = 0;
                        buildPercent.textContent = value;
                        buildStarted = false;
                        startBuild();
                    }, 2500);
                }
            }, 35);
        };

        if (buildWindow && "IntersectionObserver" in window) {
            const buildObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        startBuild();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.35 });

            buildObserver.observe(buildWindow);
        } else {
            startBuild();
        }

        window.addEventListener("pagehide", () => {
            clearInterval(intervalId);
            clearTimeout(restartTimer);
        }, { once: true });
    } else if (buildPercent) {
        buildPercent.textContent = "100";
    }

    /* AUTOMAÇÃO — INTERAÇÃO DOS NODES */
    const automationNodes = document.querySelectorAll(
        ".corpo-section .automation-node"
    );

    automationNodes.forEach((node) => {
        node.addEventListener("mouseenter", () => {
            automationNodes.forEach((other) => {
                other.style.opacity = other === node ? "1" : ".72";
            });
        });

        node.addEventListener("mouseleave", () => {
            automationNodes.forEach((other) => {
                other.style.opacity = "1";
            });
        });

        node.addEventListener("focusin", () => {
            automationNodes.forEach((other) => {
                other.style.opacity = other === node ? "1" : ".72";
            });
        });

        node.addEventListener("focusout", () => {
            automationNodes.forEach((other) => {
                other.style.opacity = "1";
            });
        });
    });
});



/* =========================================================
   FAQ — ABRIR E FECHAR PERGUNTAS
========================================================= */

document.querySelectorAll(".faq-section").forEach((section) => {
    const questions = section.querySelectorAll(".faq-question");

    questions.forEach((button) => {
        button.addEventListener("click", () => {
            const answerId = button.getAttribute("aria-controls");
            const answer = document.getElementById(answerId);
            const item = button.closest(".faq-item");

            if (!answer || !item) return;

            const isOpen =
                button.getAttribute("aria-expanded") === "true";

            // Fecha todas as respostas do FAQ.
            questions.forEach((otherButton) => {
                const otherAnswerId =
                    otherButton.getAttribute("aria-controls");

                const otherAnswer =
                    document.getElementById(otherAnswerId);

                const otherItem =
                    otherButton.closest(".faq-item");

                otherButton.setAttribute("aria-expanded", "false");

                if (otherAnswer) {
                    otherAnswer.hidden = true;
                }

                if (otherItem) {
                    otherItem.classList.remove("is-open");
                }
            });

            // Abre a pergunta clicada, se ela estava fechada.
            if (!isOpen) {
                button.setAttribute("aria-expanded", "true");
                answer.hidden = false;
                item.classList.add("is-open");
            }
        });
    });
});
