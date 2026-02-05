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

  // Validation rules
  const validationRules = {
    "full-name": {
      required: true,
      validators: [
        {
          test: (value) => value.trim().length >= 2,
          message: "minimum 2 characters"
        },
        {
          test: (value) => /^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value.trim()),
          message: "enter a valid name"
        },
        {
          test: (value) => value.trim() === value.trim().replace(/^\s+|\s+$/g, ''),
          message: "remove leading/trailing spaces"
        }
      ]
    },
    "email": {
      required: true,
      validators: [
        {
          test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
          message: "enter a valid email"
        }
      ]
    },
    "message": {
      required: true,
      validators: [
        {
          test: (value) => value.trim().length >= 10,
          message: "minimum 10 characters"
        },
        {
          test: (value) => value.trim().length <= 1000,
          message: "maximum 1000 characters"
        }
      ]
    },
    "company": {
      required: false,
      validators: [
        {
          test: (value) => !value || value.trim().length >= 2,
          message: "minimum 2 characters"
        }
      ]
    }
  };

  // Field validation function
  function validateField(input) {
    const field = input.closest(".field");
    const existingError = field.querySelector(".field__error");
    const rules = validationRules[input.id];
    
    if (!rules) return true;

    const value = input.value;

    // Check for empty value in required fields
    if (rules.required && !value.trim()) {
      showError(field, existingError, "this field is required");
      return false;
    }

    // If field is optional and empty - valid
    if (!rules.required && !value.trim()) {
      removeError(existingError);
      return true;
    }

    // Check validation rules
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

  // Add event handlers for all fields
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

  // Visual display of checkbox state
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

  // Form submission validation
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;
    let firstInvalidField = null;

    // Check all required fields (including empty ones)
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

    // Check optional company field (only if filled)
    if (companyInput && companyInput.value.trim()) {
      if (!validateField(companyInput)) {
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = companyInput;
        }
      }
    }

    // Checkbox validation
    const checkboxLabel = checkbox.closest(".field_check");
    const existingCheckboxError = checkboxLabel.querySelector(".field__error");
    
    if (checkbox && !checkbox.checked) {
      isValid = false;
      
      if (!existingCheckboxError) {
        const error = document.createElement("span");
        error.className = "field__error";
        error.textContent = "agreement required";
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

    // Show general error message below submit button for any issues
    if (!isValid) {
      if (!existingSubmitError) {
        const submitError = document.createElement("div");
        submitError.className = "submit__error";
        submitError.textContent = "Please check the form fields";
        submitActions.appendChild(submitError);
      }
      
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }

    // Remove error message if form is valid
    if (existingSubmitError) {
      existingSubmitError.remove();
    }

    // Form is valid - ready to submit
    console.log("Form is valid, submitting...");
    // Form submission logic will be here
  });

  // Remove error message when user starts correcting
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
