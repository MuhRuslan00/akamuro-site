/* Mobile menu controller. */
(() => {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  if (!header || !toggle || !nav) return;

  /* Toggles mobile menu visibility. */
  const toggleMenu = () => {
    const isOpen = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  };

  /* Closes mobile menu on link click. */
  const closeMenu = () => {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const setActiveLink = (link) => {
    nav.querySelectorAll(".nav__link").forEach((item) => {
      item.classList.toggle("is-active", item === link);
    });
  };

  /* Scrolls to anchor with header offset. */
  const scrollToSection = (link) => {
    if (!link.hash) return false;
    const target = document.querySelector(link.hash);
    if (!target) return false;
    const headerHeight = header.offsetHeight;
    const top =
      target.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: "smooth" });
    return true;
  };

  toggle.addEventListener("click", toggleMenu);
  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      if (scrollToSection(event.target)) {
        event.preventDefault();
      }
      setActiveLink(event.target);
      closeMenu();
    }
  });
})();

/* FAQ accordion controller. */
(() => {
  const items = document.querySelectorAll(".faq__item");
  if (!items.length) return;

  items.forEach((item) => {
    const title = item.querySelector(".faq__title");
    if (!title) return;
    title.addEventListener("click", () => {
      item.classList.toggle("is-open");
    });
  });
})();

/* Form validation controller. */
(() => {
  const form = document.querySelector(".contact__form");
  if (!form) return;

  const fullNameInput = form.querySelector("#full-name");
  const emailInput = form.querySelector("#email");
  const messageInput = form.querySelector("#message");
  const companyInput = form.querySelector("#company");
  const checkbox = form.querySelector("input[type='checkbox']");

  // Правила валидации
  const validationRules = {
    "full-name": {
      required: true,
      validators: [
        {
          test: (value) => value.trim().length >= 2,
          message: "минимум 2 символа"
        },
        {
          test: (value) => /^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value.trim()),
          message: "введите корректное имя"
        },
        {
          test: (value) => value.trim() === value.trim().replace(/^\s+|\s+$/g, ''),
          message: "уберите пробелы в начале/конце"
        }
      ]
    },
    "email": {
      required: true,
      validators: [
        {
          test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
          message: "введите корректный email"
        }
      ]
    },
    "message": {
      required: true,
      validators: [
        {
          test: (value) => value.trim().length >= 10,
          message: "минимум 10 символов"
        },
        {
          test: (value) => value.trim().length <= 1000,
          message: "максимум 1000 символов"
        }
      ]
    },
    "company": {
      required: false,
      validators: [
        {
          test: (value) => !value || value.trim().length >= 2,
          message: "минимум 2 символа"
        }
      ]
    }
  };

  // Функция валидации поля
  function validateField(input) {
    const field = input.closest(".field");
    const existingError = field.querySelector(".field__error");
    const rules = validationRules[input.id];
    
    if (!rules) return true;

    const value = input.value;

    // Проверка на пустое значение для обязательных полей
    if (rules.required && !value.trim()) {
      showError(field, existingError, "это обязательное поле");
      return false;
    }

    // Если поле необязательное и пустое - валидно
    if (!rules.required && !value.trim()) {
      removeError(existingError);
      return true;
    }

    // Проверка по правилам валидации
    for (const validator of rules.validators) {
      if (!validator.test(value)) {
        showError(field, existingError, validator.message);
        return false;
      }
    }

    removeError(existingError);
    return true;
  }

  function showError(field, existingError, message) {
    if (existingError) {
      existingError.textContent = message;
    } else {
      const error = document.createElement("span");
      error.className = "field__error";
      error.textContent = message;
      field.appendChild(error);
    }
  }

  function removeError(existingError) {
    if (existingError) {
      existingError.remove();
    }
  }

  // Добавление обработчиков для всех полей
  [fullNameInput, emailInput, messageInput, companyInput].forEach((input) => {
    if (!input) return;

    input.addEventListener("blur", () => {
      validateField(input);
    });

    input.addEventListener("input", () => {
      const field = input.closest(".field");
      if (field.querySelector(".field__error")) {
        validateField(input);
      }
    });
  });

  // Визуальное отображение состояния чекбокса
  if (checkbox) {
    const checkboxLabel = checkbox.closest(".field_check");
    
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        checkboxLabel.classList.add("is-checked");
        const existingError = checkboxLabel.querySelector(".field__error");
        if (existingError) {
          existingError.remove();
        }
      } else {
        checkboxLabel.classList.remove("is-checked");
      }
    });
  }

  // Валидация при отправке формы
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;
    let firstInvalidField = null;

    // Проверка всех обязательных полей (включая пустые)
    [fullNameInput, emailInput, messageInput].forEach((input) => {
      if (!input) return;
      const fieldValid = validateField(input);
      if (!fieldValid) {
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = input;
        }
      }
    });

    // Проверка необязательного поля company (только если заполнено)
    if (companyInput && companyInput.value.trim()) {
      if (!validateField(companyInput)) {
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = companyInput;
        }
      }
    }

    // Проверка чекбокса
    const checkboxLabel = checkbox.closest(".field_check");
    const existingCheckboxError = checkboxLabel.querySelector(".field__error");
    
    if (checkbox && !checkbox.checked) {
      isValid = false;
      
      if (!existingCheckboxError) {
        const error = document.createElement("span");
        error.className = "field__error";
        error.textContent = "необходимо согласие";
        checkboxLabel.appendChild(error);
      }
      
      if (!firstInvalidField) {
        firstInvalidField = checkbox;
      }
    } else if (existingCheckboxError) {
      existingCheckboxError.remove();
    }

    const submitActions = form.querySelector(".contact__actions");
    const existingSubmitError = submitActions.querySelector(".submit__error");

    // Показать общее сообщение об ошибке под кнопкой при любых проблемах
    if (!isValid) {
      if (!existingSubmitError) {
        const submitError = document.createElement("div");
        submitError.className = "submit__error";
        submitError.textContent = "Проверьте правильность заполнения полей";
        submitActions.appendChild(submitError);
      }
      
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }

    // Удалить сообщение об ошибке если форма валидна
    if (existingSubmitError) {
      existingSubmitError.remove();
    }

    // Если всё валидно - можно отправлять форму
    console.log("Форма валидна, отправка...");
    // Здесь будет логика отправки формы
  });

  // Удалять сообщение об ошибке при начале исправления
  [fullNameInput, emailInput, messageInput, companyInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      const submitActions = form.querySelector(".contact__actions");
      const existingSubmitError = submitActions.querySelector(".submit__error");
      if (existingSubmitError) {
        existingSubmitError.remove();
      }
    });
  });

  if (checkbox) {
    checkbox.addEventListener("change", () => {
      const submitActions = form.querySelector(".contact__actions");
      const existingSubmitError = submitActions.querySelector(".submit__error");
      if (existingSubmitError) {
        existingSubmitError.remove();
      }
    });
  }
})();
