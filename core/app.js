document.addEventListener("DOMContentLoaded",()=>{

    loadPage("dashboard");

    document.querySelectorAll(".nav-btn").forEach(button=>{

        button.addEventListener("click",()=>{

            document
                .querySelector(".nav-btn.active")
                .classList
                .remove("active");

            button.classList.add("active");

            loadPage(button.dataset.page);

        });

    });

});
