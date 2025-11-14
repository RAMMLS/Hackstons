class OSINTAnalyzer {
  constructor() {
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.getElementById("analysisForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.analyzeUrl();
    });

    document.querySelectorAll(".test-url").forEach((button) => {
      button.addEventListener("click", (e) => {
        const url = e.target.getAttribute("data-url");
        document.getElementById("urlInput").value = url;
        this.analyzeUrl();
      });
    });
  }

  // async analyzeUrl() {
  //   const url = document.getElementById("urlInput").value.trim();

  //   if (!url) {
  //     this.showError("Пожалуйста, введите URL для анализа");
  //     return;
  //   }

  //   this.showLoading();
  //   this.hideResults();

  //   try {
  //     const response = await fetch("/analyze", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ url: url }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     if (data.error) {
  //       throw new Error(data.error);
  //     }

  //     this.displayResults(data);
  //   } catch (error) {
  //     this.showError(`Ошибка при анализе: ${error.message}`);
  //   } finally {
  //     this.hideLoading();
  //   }
  // }

  async analyzeUrl() {
    const url = document.getElementById("urlInput").value.trim();

    if (!url) {
      this.showError("Пожалуйста, введите URL для анализа");
      return;
    }

    this.showLoading();
    this.hideResults();

    try {
      const response = await fetch("/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      // Проверяем статус ответа
      if (!response.ok) {
        // Пытаемся прочитать ошибку из JSON, если есть
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        } catch (e) {
          // Если не удалось распарсить JSON, используем стандартное сообщение
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

      // Проверяем, есть ли ошибка в данных
      if (data.error) {
        throw new Error(data.error);
      }

      this.displayResults(data);
    } catch (error) {
      console.error("Error details:", error);
      this.showError(`Ошибка при анализе: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    document.getElementById("loadingIndicator").classList.remove("d-none");
    document.getElementById("analyzeBtn").disabled = true;
  }

  hideLoading() {
    document.getElementById("loadingIndicator").classList.add("d-none");
    document.getElementById("analyzeBtn").disabled = false;
  }

  showError(message) {
    const resultsSection = document.getElementById("resultsSection");
    resultsSection.innerHTML = `
            <div class="alert alert-danger fade-in" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
    resultsSection.style.display = "block";
  }

  hideResults() {
    document.getElementById("resultsSection").style.display = "none";
  }

  // displayResults(data) {
  //   const resultsSection = document.getElementById("resultsSection");
  //   const verdictClass = this.getVerdictClass(data.final_verdict.category);
  //   const confidencePercent = data.final_verdict.confidence;

  //   resultsSection.innerHTML = `
  //           <div class="card fade-in">
  //               <div class="card-header bg-light">
  //                   <h5 class="card-title mb-0">
  //                       <i class="fas fa-chart-bar me-2"></i>Результаты анализа
  //                   </h5>
  //               </div>
  //               <div class="card-body">
  //                   <div class="row mb-4">
  //                       <div class="col-md-6">
  //                           <h6>Анализируемый URL:</h6>
  //                           <p class="text-break"><strong>${
  //                             data.url
  //                           }</strong></p>
  //                       </div>
  //                       <div class="col-md-6">
  //                           <h6>Финальный вердикт:</h6>
  //                           <span class="verdict-badge ${verdictClass}">
  //                               ${data.final_verdict.category}
  //                           </span>
  //                       </div>
  //                   </div>

  //                   <div class="mb-4">
  //                       <h6>Уверенность анализа: ${confidencePercent}%</h6>
  //                       <div class="confidence-meter">
  //                           <div class="confidence-fill ${verdictClass}"
  //                                style="width: ${confidencePercent}%"></div>
  //                       </div>
  //                   </div>

  //                   <div class="mb-4">
  //                       <h6>Обоснование:</h6>
  //                       <p class="mb-3">${
  //                         data.final_verdict.category_reason
  //                       }</p>
  //                       <div class="mt-2">
  //                           ${this.renderReasons(data.final_verdict.reasons)}
  //                       </div>
  //                   </div>

  //                   <h6 class="mb-3">Детальные проверки:</h6>
  //                   ${this.renderDetailedChecks(data.checks)}
  //               </div>
  //           </div>
  //       `;

  //   resultsSection.style.display = "block";
  // }

  displayResults(data) {
    try {
      const resultsSection = document.getElementById("resultsSection");

      // Проверяем, что данные имеют ожидаемую структуру
      if (!data || !data.final_verdict) {
        throw new Error("Некорректный формат данных от сервера");
      }

      const verdictClass = this.getVerdictClass(data.final_verdict.category);
      const confidencePercent = data.final_verdict.confidence || 0;

      resultsSection.innerHTML = `
            <div class="card fade-in">
                <div class="card-header bg-light">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-chart-bar me-2"></i>Результаты анализа
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6>Анализируемый URL:</h6>
                            <p class="text-break"><strong>${
                              data.url || "Не указан"
                            }</strong></p>
                        </div>
                        <div class="col-md-6">
                            <h6>Финальный вердикт:</h6>
                            <span class="verdict-badge ${verdictClass}">
                                ${data.final_verdict.category || "НЕОПРЕДЕЛЕНО"}
                            </span>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h6>Уверенность анализа: ${confidencePercent}%</h6>
                        <div class="confidence-meter">
                            <div class="confidence-fill ${verdictClass}" 
                                 style="width: ${confidencePercent}%"></div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h6>Обоснование:</h6>
                        <p class="mb-3">${
                          data.final_verdict.category_reason || "Нет информации"
                        }</p>
                        <div class="mt-2">
                            ${this.renderReasons(
                              data.final_verdict.reasons || []
                            )}
                        </div>
                    </div>

                    <h6 class="mb-3">Детальные проверки:</h6>
                    ${this.renderDetailedChecks(data.checks || {})}
                </div>
            </div>
        `;

      resultsSection.style.display = "block";
    } catch (error) {
      console.error("Error displaying results:", error);
      this.showError(`Ошибка отображения результатов: ${error.message}`);
    }
  }

  renderReasons(reasons) {
    return reasons
      .map((reason) => `<div class="mb-1">${reason}</div>`)
      .join("");
  }

  getVerdictClass(category) {
    switch (category) {
      case "OSINT":
        return "verdict-osint";
      case "CSINT":
        return "verdict-csint";
      case "POTENTIALLY_OSINT":
        return "verdict-potential";
      default:
        return "verdict-potential";
    }
  }

  renderDetailedChecks(checks) {
    let html = "";

    // Проверка доступности
    const accessibility = checks.accessibility;
    if (accessibility.http_status) {
      const status = accessibility.http_status;
      const type =
        status === 200 ? "success" : status >= 400 ? "danger" : "warning";
      html += this.renderCheckItem(
        "Доступность сайта",
        type,
        `HTTP статус: ${status}`
      );
    }

    // WHOIS информация
    const whois = checks.whois;
    if (!whois.error) {
      html += this.renderCheckItem(
        "WHOIS информация",
        whois.is_private ? "warning" : "success",
        whois.is_private ? "Приватная регистрация" : "Публичная регистрация"
      );
    }

    // Robots.txt
    const robots = checks.robots;
    html += this.renderCheckItem(
      "Robots.txt",
      robots.exists
        ? robots.allows_crawling
          ? "success"
          : "warning"
        : "warning",
      robots.exists
        ? robots.allows_crawling
          ? "Разрешает сканирование"
          : "Ограничивает сканирование"
        : "Robots.txt не найден"
    );

    // Анализ контента
    const content = checks.content;
    if (!content.error) {
      html += this.renderCheckItem(
        "Анализ контента",
        content.has_login_form ? "warning" : "success",
        content.has_login_form
          ? "Обнаружены формы аутентификации"
          : "Формы аутентификации не обнаружены"
      );
    }

    return html || "<p>Нет данных для отображения</p>";
  }

  renderCheckItem(title, type, description) {
    const typeClass = `check-${type}`;
    const icon = this.getCheckIcon(type);

    return `
            <div class="check-item ${typeClass}">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${icon} ${title}</strong>
                        <div class="text-muted">${description}</div>
                    </div>
                </div>
            </div>
        `;
  }

  getCheckIcon(type) {
    switch (type) {
      case "success":
        return '<i class="fas fa-check-circle text-success"></i>';
      case "warning":
        return '<i class="fas fa-exclamation-triangle text-warning"></i>';
      case "danger":
        return '<i class="fas fa-times-circle text-danger"></i>';
      default:
        return '<i class="fas fa-info-circle text-info"></i>';
    }
  }
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  new OSINTAnalyzer();
});
