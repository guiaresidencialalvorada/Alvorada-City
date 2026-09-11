'use strict';

/* =========================================================
   GUIA ALVORADA
   Catálogo de Profissionais e Serviços
   ========================================================= */

const people = Array.isArray(window.PROFISSIONAIS)
  ? window.PROFISSIONAIS
  : [];


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

const esc = value =>
  String(value ?? '').replace(
    /[&<>"']/g,
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char])
  );


const norm = value =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();


const services = professional =>
  Array.isArray(professional.servicos)
    ? professional.servicos
    : [];


const demo = professional =>
  professional.demonstracao === true;


const link = professional =>
  'profissional.html?id=' +
  encodeURIComponent(professional.id);


/* =========================================================
   AVATAR
   ========================================================= */

const avatar = professional => {

  const colors = [
    'blue',
    'orange',
    'teal'
  ];

  const color = colors.includes(professional.cor)
    ? professional.cor
    : 'blue';

  return `
    <span
      class="avatar ${color}"
      aria-hidden="true"
    >
      ${esc(professional.iniciais || 'GA')}
    </span>
  `;
};


/* =========================================================
   TAG DEMONSTRAÇÃO
   Mantida apenas para compatibilidade com cadastros antigos.
   ========================================================= */

const tag = professional =>
  demo(professional)
    ? '<span class="tag">Demonstração</span>'
    : '';


/* =========================================================
   TELEFONE / WHATSAPP
   ========================================================= */

function getPhone(professional) {

  let phone = String(
    professional.whatsapp ||
    professional.telefone ||
    ''
  ).replace(/\D/g, '');

  /*
   * Número brasileiro sem código do país.
   */
  if (
    !phone.startsWith('55') &&
    (phone.length === 10 || phone.length === 11)
  ) {
    phone = '55' + phone;
  }

  return phone;
}


function canContact(professional) {

  if (demo(professional)) {
    return false;
  }

  const phone = getPhone(professional);

  return /^55\d{10,11}$/.test(phone);
}


/* =========================================================
   LINK WHATSAPP
   ========================================================= */

function whatsappLink(professional, service = '') {

  const phone = getPhone(professional);

  if (!/^55\d{10,11}$/.test(phone)) {
    return '#';
  }

  let message =
    'Olá! Encontrei seu contato no Guia Alvorada e gostaria de saber mais sobre ';

  if (service) {
    message += `o serviço de ${service}.`;
  } else {
    message += 'seus serviços.';
  }

  message +=
    ' Poderia me informar disponibilidade e condições de atendimento?';

  return (
    'https://wa.me/' +
    phone +
    '?text=' +
    encodeURIComponent(message)
  );
}


/* =========================================================
   REGIÃO / BAIRRO
   ========================================================= */

function locationHtml(professional) {

  const bairro = String(
    professional.bairro || ''
  ).trim();

  if (
    !bairro ||
    norm(bairro) === 'nao informado'
  ) {
    return '';
  }

  return `
    <p class="location">
      ${esc(bairro)}
    </p>
  `;
}


function regionsHtml(professional) {

  const regions =
    Array.isArray(professional.regioes)
      ? professional.regioes.filter(Boolean)
      : [];

  if (!regions.length) {

    return `
      <h3>Região de atendimento</h3>

      <p class="muted">
        Consulte diretamente com o profissional.
      </p>
    `;
  }

  return `
    <h3>Região de atendimento</h3>

    <ul>
      ${regions
        .map(region => `<li>${esc(region)}</li>`)
        .join('')}
    </ul>
  `;
}


/* =========================================================
   CARTÃO DO PROFISSIONAL
   ========================================================= */

function personCard(professional) {

  const serviceItems = services(professional)
    .slice(0, 3)
    .map(service => `
      <li>${esc(service.nome)}</li>
    `)
    .join('');

  return `
    <article class="card">

      <div class="card-banner">

        ${avatar(professional)}

        ${tag(professional)}

      </div>

      <div class="card-body">

        <div class="specialty">
          ${esc(professional.categoria)}
        </div>

        <h3>
          ${esc(professional.nome)}
        </h3>

        ${locationHtml(professional)}

        ${
          professional.descricao
            ? `
              <p class="muted">
                ${esc(professional.descricao)}
              </p>
            `
            : ''
        }

        ${
          serviceItems
            ? `
              <ul class="service-list">
                ${serviceItems}
              </ul>
            `
            : ''
        }

        <a
          class="button"
          href="${link(professional)}"
          aria-label="Ver perfil e serviços de ${esc(professional.nome)}"
        >
          Ver perfil e serviços

          <span aria-hidden="true">
            →
          </span>
        </a>

      </div>

    </article>
  `;
}


/* =========================================================
   CARTÃO DO SERVIÇO
   ========================================================= */

function serviceCard(
  professional,
  service,
  index
) {

  return `
    <article class="card service-card">

      <div class="card-body">

        <div class="specialty">
          ${esc(professional.categoria)}
        </div>

        <h3>
          ${esc(service.nome)}
        </h3>

        ${
          service.descricao
            ? `
              <p class="muted">
                ${esc(service.descricao)}
              </p>
            `
            : ''
        }

        <div class="price">

          Sob orçamento

          <small>
            Consulte valores e condições diretamente
            com o profissional.
          </small>

        </div>

        <div class="provider">

          ${avatar(professional)}

          <div>

            <strong>
              ${esc(professional.nome)}
            </strong>

            ${
              professional.bairro &&
              norm(professional.bairro) !== 'nao informado'
                ? `
                  <br>
                  <span class="muted">
                    ${esc(professional.bairro)}
                  </span>
                `
                : ''
            }

          </div>

        </div>

        <a
          class="button secondary"
          href="${link(professional)}#servico-${index}"
        >
          Ver serviço e profissional

          <span aria-hidden="true">
            →
          </span>
        </a>

      </div>

    </article>
  `;
}


/* =========================================================
   MENU RESPONSIVO
   ========================================================= */

const menu =
  document.getElementById('menu-button');

const nav =
  document.getElementById('navigation');


function closeMenu() {

  if (!menu || !nav) {
    return;
  }

  nav.classList.remove('open');

  menu.setAttribute(
    'aria-expanded',
    'false'
  );

  menu.setAttribute(
    'aria-label',
    'Abrir menu'
  );
}


if (menu && nav) {

  menu.addEventListener(
    'click',
    () => {

      const open =
        nav.classList.toggle('open');

      menu.setAttribute(
        'aria-expanded',
        String(open)
      );

      menu.setAttribute(
        'aria-label',
        open
          ? 'Fechar menu'
          : 'Abrir menu'
      );
    }
  );


  document.addEventListener(
    'keydown',
    event => {

      if (event.key === 'Escape') {
        closeMenu();
      }

    }
  );


  document.addEventListener(
    'click',
    event => {

      if (!event.target.closest('header')) {
        closeMenu();
      }

    }
  );

}


/* =========================================================
   IDENTIFICAÇÃO DA PÁGINA
   ========================================================= */

const page =
  document.body.dataset.page || '';


/* =========================================================
   PÁGINAS DE LISTAGEM
   profissionais.html
   servicos.html
   ========================================================= */

if (page !== 'perfil') {

  const input =
    document.getElementById('busca');

  const select =
    document.getElementById('categoria');

  const output =
    document.getElementById('resultados');

  const counter =
    document.getElementById('contador');


  if (
    input &&
    select &&
    output
  ) {

    /* =====================================================
       CATEGORIAS
       ===================================================== */

    const categories = [
      ...new Set(
        people
          .map(person => person.categoria)
          .filter(Boolean)
      )
    ];


    categories
      .sort(
        (a, b) =>
          a.localeCompare(
            b,
            'pt-BR'
          )
      )
      .forEach(category => {

        select.add(
          new Option(
            category,
            category
          )
        );

      });


    /* =====================================================
       BUSCA INTELIGENTE
       ===================================================== */

    function professionalSearchText(
      professional
    ) {

      return norm([
        professional.nome,
        professional.categoria,
        professional.bairro,
        professional.descricao,
        professional.sobre,

        ...services(professional)
          .flatMap(service => [
            service.nome,
            service.descricao
          ])

      ].join(' '));
    }


    function serviceSearchText(
      professional,
      service
    ) {

      return norm([
        professional.nome,
        professional.categoria,
        professional.bairro,
        professional.descricao,
        professional.sobre,
        service.nome,
        service.descricao
      ].join(' '));
    }


    /* =====================================================
       RENDERIZAÇÃO
       ===================================================== */

    function render() {

      const query =
        norm(input.value);

      const category =
        select.value;

      const cards = [];


      people
        .filter(
          professional =>
            !category ||
            professional.categoria === category
        )
        .forEach(professional => {


          /* PROFISSIONAIS */

          if (page === 'profissionais') {

            const searchable =
              professionalSearchText(
                professional
              );

            if (
              !query ||
              searchable.includes(query)
            ) {

              cards.push(
                personCard(professional)
              );

            }

          }


          /* SERVIÇOS */

          else {

            services(professional)
              .forEach(
                (service, index) => {

                  const searchable =
                    serviceSearchText(
                      professional,
                      service
                    );

                  if (
                    !query ||
                    searchable.includes(query)
                  ) {

                    cards.push(
                      serviceCard(
                        professional,
                        service,
                        index
                      )
                    );

                  }

                }
              );

          }

        });


      /* CONTADOR */

      if (counter) {

        counter.textContent =
          cards.length +
          ' ' +
          (
            cards.length === 1
              ? 'resultado'
              : 'resultados'
          );

      }


      /* RESULTADOS */

      if (cards.length) {

        output.innerHTML =
          cards.join('');

      } else {

        output.innerHTML = `
          <div class="empty">

            <h2>
              Nenhum resultado encontrado
            </h2>

            <p>
              Tente pesquisar outro serviço,
              profissional ou remova os filtros.
            </p>

            <button
              class="button secondary"
              id="limpar"
              type="button"
            >
              Limpar filtros
            </button>

          </div>
        `;


        document
          .getElementById('limpar')
          ?.addEventListener(
            'click',
            () => {

              input.value = '';

              select.value = '';

              render();

              input.focus();

            }
          );

      }

    }


    /* =====================================================
       EVENTOS
       ===================================================== */

    input.addEventListener(
      'input',
      render
    );

    select.addEventListener(
      'change',
      render
    );


    /* PRIMEIRA EXIBIÇÃO */

    render();

  }

}


/* =========================================================
   PÁGINA INDIVIDUAL
   profissional.html
   ========================================================= */

else {

  const root =
    document.getElementById('perfil');

  const params =
    new URLSearchParams(
      window.location.search
    );

  const professionalId =
    params.get('id');


  const professional =
    people.find(
      person =>
        String(person.id) ===
        String(professionalId)
    );


  /* =======================================================
     PROFISSIONAL NÃO ENCONTRADO
     ======================================================= */

  if (!professional) {

    if (root) {

      root.innerHTML = `
        <div class="empty">

          <h1>
            Profissional não encontrado
          </h1>

          <p>
            Este perfil não está disponível
            no momento.
          </p>

          <a
            class="button"
            href="profissionais.html"
          >
            Ver profissionais
          </a>

        </div>
      `;

    }

  }


  /* =======================================================
     PERFIL ENCONTRADO
     ======================================================= */

  else if (root) {

    document.title =
      professional.nome +
      ' | Guia Alvorada';


    const contactAvailable =
      canContact(professional);


    const professionalServices =
      services(professional);


    /* =====================================================
       SERVIÇOS DO PERFIL
       ===================================================== */

    const servicesHtml =
      professionalServices.length

        ? professionalServices
            .map(
              (service, index) => `

                <article
                  class="profile-service"
                  id="servico-${index}"
                >

                  <h3>
                    ${esc(service.nome)}
                  </h3>

                  ${
                    service.descricao
                      ? `
                        <p>
                          ${esc(service.descricao)}
                        </p>
                      `
                      : ''
                  }

                  <div class="price">
                    Sob orçamento
                  </div>


                  ${
                    contactAvailable
                      ? `
                        <a
                          class="button secondary"
                          href="${whatsappLink(
                            professional,
                            service.nome
                          )}"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Consultar este serviço
                          pelo WhatsApp
                        </a>
                      `
                      : ''
                  }

                </article>

              `
            )
            .join('')

        : `
            <p class="muted">
              Nenhum serviço detalhado
              foi informado.
            </p>
          `;


    /* =====================================================
       PERFIL
       ===================================================== */

    root.innerHTML = `

      <div class="breadcrumb">

        <a href="profissionais.html">
          Profissionais
        </a>

        <span>/</span>

        <span>
          ${esc(professional.categoria)}
        </span>

      </div>


      ${
        demo(professional)
          ? `
            <div class="demo-note">

              Perfil demonstrativo.

              Os dados apresentados
              neste perfil são exemplos.

            </div>
          `
          : ''
      }


      <section class="profile-hero">

        ${avatar(professional)}

        <div>

          <span class="tag">
            ${esc(professional.categoria)}
          </span>

          <h1>
            ${esc(professional.nome)}
          </h1>

          ${
            professional.bairro &&
            norm(professional.bairro) !==
              'nao informado'

              ? `
                <p>
                  ${esc(professional.bairro)}

                  ${
                    professional.atendimento
                      ? ` · ${esc(
                          professional.atendimento
                        )}`
                      : ''
                  }
                </p>
              `

              : professional.atendimento

                ? `
                  <p>
                    ${esc(
                      professional.atendimento
                    )}
                  </p>
                `

                : ''
          }

        </div>

      </section>


      <div class="profile-layout">


        <!-- CONTEÚDO PRINCIPAL -->

        <div>


          <section class="panel">

            <h2>
              Conheça o profissional
            </h2>

            <p class="muted">

              ${
                esc(
                  professional.sobre ||
                  professional.descricao ||
                  'Informações profissionais disponíveis no Guia Alvorada.'
                )
              }

            </p>

          </section>


          <section class="panel">

            <h2>
              Serviços oferecidos
            </h2>

            <div class="profile-services">

              ${servicesHtml}

            </div>

          </section>


        </div>


        <!-- CONTATO -->

        <aside class="panel contact">

          <h2>
            Vamos conversar?
          </h2>

          <p class="muted">
            Informe o serviço que precisa,
            sua localização e quando pretende
            realizar o trabalho.
          </p>


          ${
            contactAvailable

              ? `
                <a
                  class="button"
                  href="${whatsappLink(
                    professional
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Conversar pelo WhatsApp
                </a>
              `

              : `
                <p class="contact-note">

                  ${
                    demo(professional)
                      ? 'Este é um perfil de demonstração e não possui contato disponível.'
                      : 'Contato direto não disponível neste perfil.'
                  }

                </p>
              `
          }


          ${regionsHtml(professional)}


          <small>

            Confirme diretamente com o
            profissional a disponibilidade,
            área de atendimento, valores,
            materiais, deslocamento e demais
            condições antes da contratação.

          </small>


          <a
            class="button secondary"
            style="margin-top:22px"
            href="profissionais.html"
          >
            Ver outros profissionais
          </a>

        </aside>


      </div>
    `;


    /* =====================================================
       SCROLL PARA SERVIÇO
       ===================================================== */

    if (window.location.hash) {

      requestAnimationFrame(
        () => {

          const element =
            document.getElementById(
              window.location.hash.slice(1)
            );

          element?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

        }
      );

    }

  }

}
