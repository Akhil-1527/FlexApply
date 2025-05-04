document.addEventListener("DOMContentLoaded", () => {
    fetch("scripts/plans.json")
      .then(res => res.json())
      .then(data => {
        const pricingPlans = data.plans;
        const container = document.getElementById("pricing-section");
        if (!container) return;
  
        pricingPlans.forEach(plan => {
          const card = document.createElement("div");
          card.className = "price-card" + (plan.highlighted ? " highlighted" : "");
  
          card.innerHTML = `
            ${plan.highlighted ? '<span class="popular-badge">Most Popular</span>' : ''}
            <div class="price-header">
              <h3>${plan.title}</h3>
              <div class="price-amount">
                <span class="price">${plan.price}</span>
                <span class="period">${plan.period}</span>
              </div>
              <p class="price-desc">${plan.description}</p>
            </div>
            <div class="price-features">
              <ul class="feature-list">
                ${plan.features.map(f => `<li>${f}</li>`).join("")}
              </ul>
            </div>
            <div class="price-action">
              <a href="#form" class="btn btn-primary btn-block${plan.highlighted ? ' pulse-button' : ''}">Get Started</a>
            </div>
          `;
  
          container.appendChild(card);
        });
      })
      .catch(err => console.error("Failed to load pricing plans:", err));
  });
  