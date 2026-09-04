/* ================================================================
   FitZone Gym — script.js
   Handles: form validation, localStorage demo storage, redirect,
   and all dataLayer events for GTM / Meta Pixel / GA4 tracking.
   ================================================================ */

window.dataLayer = window.dataLayer || [];

document.addEventListener('DOMContentLoaded', function () {

  /* --------------------------------------------------------------
     EVENT: page_view
     Fires once when the landing page finishes loading.
     -------------------------------------------------------------- */
  window.dataLayer.push({
    event: 'page_view',
    page_path: window.location.pathname,
    page_title: document.title
  });

  /* --------------------------------------------------------------
     EVENT: hero_cta_click
     Fires when the primary hero "Book Free Trial" button is clicked.
     -------------------------------------------------------------- */
  var heroCta = document.getElementById('hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', function () {
      window.dataLayer.push({
        event: 'hero_cta_click',
        cta_label: 'Book Free Trial'
      });
    });
  }

  /* --------------------------------------------------------------
     EVENT: benefits_section_view
     Fires the first time the Benefits section scrolls into view.
     Uses IntersectionObserver, fires only once.
     -------------------------------------------------------------- */
  var benefitsSection = document.getElementById('benefits');
  if (benefitsSection && 'IntersectionObserver' in window) {
    var benefitsObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          window.dataLayer.push({ event: 'benefits_section_view' });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    benefitsObserver.observe(benefitsSection);
  }

  /* --------------------------------------------------------------
     EVENT: offer_cta_click
     Fires when the "Claim My Free Trial" offer button is clicked.
     -------------------------------------------------------------- */
  var offerCta = document.getElementById('offer-cta');
  if (offerCta) {
    offerCta.addEventListener('click', function () {
      window.dataLayer.push({
        event: 'offer_cta_click',
        cta_label: 'Claim My Free Trial'
      });
    });
  }

  /* --------------------------------------------------------------
     EVENT: lead_form_start
     Fires the first time the user interacts with any form field.
     Guarded so it fires only once per page session.
     -------------------------------------------------------------- */
  var leadForm = document.getElementById('leadForm');
  var formStarted = false;

  function trackFormStart() {
    if (!formStarted) {
      formStarted = true;
      window.dataLayer.push({ event: 'lead_form_start' });
    }
  }

  if (leadForm) {
    var formFields = leadForm.querySelectorAll('input, select');
    formFields.forEach(function (field) {
      field.addEventListener('focus', trackFormStart, { once: true });
    });
  }

  /* --------------------------------------------------------------
     FORM VALIDATION + SUBMISSION
     - Validates required fields.
     - Stores submission in localStorage (demo only, no backend).
     - Pushes lead_form_submit, then lead_form_success.
     - Redirects to thank-you.html.
     -------------------------------------------------------------- */
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var fullName = document.getElementById('fullName');
      var email = document.getElementById('email');
      var phone = document.getElementById('phone');
      var fitnessGoal = document.getElementById('fitnessGoal');

      var isValid = true;
      isValid = validateField(fullName, function (v) { return v.trim().length > 0; }, 'Please enter your full name.') && isValid;
      isValid = validateField(email, function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Please enter a valid email address.') && isValid;
      isValid = validateField(phone, function (v) { return /^[0-9+\-\s()]{7,15}$/.test(v); }, 'Please enter a valid phone number.') && isValid;
      isValid = validateField(fitnessGoal, function (v) { return v.trim().length > 0; }, 'Please select a fitness goal.') && isValid;

      if (!isValid) {
        return;
      }

      /* EVENT: lead_form_submit — fires on successful validation */
      window.dataLayer.push({
        event: 'lead_form_submit',
        fitness_goal: fitnessGoal.value
      });

      /* Store submission data locally (demo only — no real backend) */
      var submission = {
        fullName: fullName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        fitnessGoal: fitnessGoal.value,
        submittedAt: new Date().toISOString()
      };

      try {
        var existing = JSON.parse(localStorage.getItem('fitzone_leads') || '[]');
        existing.push(submission);
        localStorage.setItem('fitzone_leads', JSON.stringify(existing));
      } catch (err) {
        console.warn('Could not save lead to localStorage:', err);
      }

      /* EVENT: lead_form_success — fires right before redirect */
      window.dataLayer.push({
        event: 'lead_form_success'
      });

      window.location.href = 'thank-you.html';
    });
  }

  function validateField(field, testFn, message) {
    var errorEl = document.getElementById('error-' + field.id);
    var valid = testFn(field.value);

    if (!valid) {
      field.classList.add('invalid');
      if (errorEl) errorEl.textContent = message;
    } else {
      field.classList.remove('invalid');
      if (errorEl) errorEl.textContent = '';
    }
    return valid;
  }

});
